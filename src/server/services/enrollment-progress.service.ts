import { randomUUID } from "node:crypto";

import type { UserRole } from "@/../generated/prisma/enums";
import { db } from "@/server/db";
import { auditLogRepository } from "@/server/repositories/audit-log.repository";
import { enrollmentRepository } from "@/server/repositories/enrollment.repository";
import { verifiedActor } from "@/server/services/actor-verification.service";

/**
 * The middle of the training lifecycle: advancing a trainee through a program
 * and completing it.
 *
 * Before this existed the lifecycle stopped dead after payment verification —
 * `progressPercent` and `EnrollmentStatus.COMPLETED` were in the schema, and
 * nothing in the codebase ever wrote either. A trainee could never finish, so
 * no certificate could ever legitimately be requested.
 *
 * Completion is the interesting transition, because it has a side effect: it
 * creates the CertificateRequest an admin later approves. That side effect
 * must fire exactly once even if two trainers click at the same instant, so
 * the status change is a conditional UPDATE and the request is created in the
 * same transaction as the winning update (non-negotiable rule 2).
 */

type Result = { ok: true } | { ok: false; error: string };

/** Only the trainer who owns the batch, or an admin, may move a trainee. A
 *  trainer must not be able to advance someone else's trainee. */
async function canManage(
  actorId: string,
  actorRole: UserRole,
  batchTrainerId: string | null,
): Promise<boolean> {
  if (await verifiedActor(actorId, actorRole, ["ADMIN"])) return true;
  if (!(await verifiedActor(actorId, actorRole, ["TRAINER"]))) return false;
  return batchTrainerId !== null && batchTrainerId === actorId;
}

/**
 * Human-readable, unique, and not guessable from a neighbouring code.
 *
 * Sequential codes would let anyone holding one certificate enumerate others
 * on the public verification page. The random segment is what prevents that;
 * the year is there so the code reads sensibly on paper.
 */
export function generateCertificateCode(now = new Date()): string {
  const random = randomUUID().replace(/-/g, "").slice(0, 10).toUpperCase();
  return `HT-CERT-${now.getUTCFullYear()}-${random}`;
}

/** Move a trainee's completion percentage. Clamped and validated by the
 *  caller's schema; this re-clamps because a service must not trust its
 *  caller either. */
export async function setEnrollmentProgress(input: {
  actorId: string;
  actorRole: UserRole;
  enrollmentId: string;
  progressPercent: number;
}): Promise<Result> {
  const percent = Math.trunc(input.progressPercent);
  if (!Number.isFinite(percent) || percent < 0 || percent > 100) {
    return { ok: false, error: "Progress must be between 0 and 100." };
  }

  const enrollment = await enrollmentRepository.findForCompletion(input.enrollmentId);
  if (!enrollment) return { ok: false, error: "Enrollment not found." };
  if (!(await canManage(input.actorId, input.actorRole, enrollment.batch?.trainerId ?? null))) {
    return { ok: false, error: "Not authorized." };
  }
  if (enrollment.status !== "ACTIVE") {
    return { ok: false, error: "Only an active enrollment can be updated." };
  }

  const batchId = enrollment.batch?.id;
  if (!batchId) return { ok: false, error: "Enrollment is not assigned to a batch." };

  const changed = await enrollmentRepository.setProgress(
    input.enrollmentId,
    batchId,
    input.actorRole === "TRAINER" ? input.actorId : null,
    percent,
  );
  if (changed === 0) {
    const current = await enrollmentRepository.findForCompletion(input.enrollmentId);
    if (current?.status === "ACTIVE" && current.batch?.id === batchId && current.progressPercent === percent) return { ok: true };
    return { ok: false, error: "Enrollment is no longer available to update." };
  }
  // A no-op replay (already at this percentage) is success, not failure —
  // matching every other admin mutation's contract.
  return { ok: true };
}

/**
 * Complete an enrollment and request the trainee's certificate.
 *
 * The certificate request is created in the same transaction as the winning
 * status change, so a completed enrollment always has exactly one request and
 * a losing concurrent attempt creates none.
 */
export async function completeEnrollment(input: {
  actorId: string;
  actorRole: UserRole;
  enrollmentId: string;
}): Promise<Result> {
  const enrollment = await enrollmentRepository.findForCompletion(input.enrollmentId);
  if (!enrollment) return { ok: false, error: "Enrollment not found." };

  if (!(await canManage(input.actorId, input.actorRole, enrollment.batch?.trainerId ?? null))) {
    return { ok: false, error: "Not authorized." };
  }

  if (enrollment.status === "COMPLETED") {
    // Already terminal. Treat as success so a double-click or retry does not
    // surface an error for work that is genuinely done.
    return { ok: true };
  }
  if (enrollment.status !== "ACTIVE") {
    return { ok: false, error: "Only an active enrollment can be completed." };
  }
  if (enrollment.progressPercent !== 100) {
    return { ok: false, error: "Enrollment progress must be 100% before completion." };
  }
  const batchId = enrollment.batch?.id;
  if (!batchId) return { ok: false, error: "Enrollment is not assigned to a batch." };

  const completedAt = new Date();

  const changed = await db.$transaction(async (tx) => {
    const count = await enrollmentRepository.complete(
      tx,
      input.enrollmentId,
      batchId,
      input.actorRole === "TRAINER" ? input.actorId : null,
    );
    if (count !== 1) return false;

    // Only the winning transaction reaches here, so exactly one request is
    // ever created for an enrollment.
    if (enrollment.certificateRequests.length === 0) {
      await tx.certificateRequest.create({
        data: {
          enrollmentId: input.enrollmentId,
          certificateCode: generateCertificateCode(completedAt),
          completedAt,
        },
      });
    }

    await auditLogRepository.create(tx, {
      category: "ENROLLMENT",
      action: "complete",
      description: null,
      referenceId: input.enrollmentId,
      actorUserId: input.actorId,
    });

    return true;
  });

  if (changed) return { ok: true };

  // A concurrent or sequential replay can lose the conditional transition
  // only because the winning request already completed this enrollment.
  const current = await enrollmentRepository.findForCompletion(input.enrollmentId);
  return current?.status === "COMPLETED"
    ? { ok: true }
    : { ok: false, error: "Enrollment is no longer active." };
}
