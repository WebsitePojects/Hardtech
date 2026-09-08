import type { EvaluationRating, MediaResourceType, ModuleFileType, Prisma, SessionType, SubmissionType, UserRole } from "@/../generated/prisma/client";
import { createHash } from "node:crypto";
import { db } from "@/server/db";
import { assignmentRepository } from "@/server/repositories/assignment.repository";
import { assignmentSubmissionRepository } from "@/server/repositories/assignment-submission.repository";
import { authorRatingRepository } from "@/server/repositories/author-rating.repository";
import { auditLogRepository } from "@/server/repositories/audit-log.repository";
import { certificateRequestRepository } from "@/server/repositories/certificate-request.repository";
import { enrollmentPaymentRepository } from "@/server/repositories/enrollment-payment.repository";
import { enrollmentRepository } from "@/server/repositories/enrollment.repository";
import { evaluationRepository } from "@/server/repositories/evaluation.repository";
import { mediaAssetRepository } from "@/server/repositories/media-asset.repository";
import { moduleRepository } from "@/server/repositories/module.repository";
import { trainingSessionRepository } from "@/server/repositories/training-session.repository";
import { verifiedActor } from "@/server/services/actor-verification.service";
import { issueCertificate } from "@/server/services/certificate-issue.service";

type Result = { ok: true } | { ok: false; error: string };

const SESSION_INTENT_ACTION = "training_session_publish";
const MODULE_INTENT_ACTION = "module_publish";

/**
 * TrainingSession and Module predate durable idempotency columns. Until a
 * schema migration can add them, serialize a given actor/key with a
 * transaction-scoped PostgreSQL advisory lock and persist the completed
 * intent in the audit log. This covers both the zero-row and replay paths;
 * neither mutation relies on a process-local lock.
 */
async function lockIntent(tx: Prisma.TransactionClient, actorId: string, action: string, idempotencyKey: string) {
  await tx.$executeRaw`
    SELECT pg_advisory_xact_lock(hashtextextended(${`${action}:${actorId}:${idempotencyKey}`}, 0))
  `;
}

function intentFingerprint(values: unknown[]): string {
  return createHash("sha256").update(JSON.stringify(values)).digest("hex");
}

function phCalendarDate(date: string): Date | null {
  const [year, month, day] = date.split("-").map(Number);
  const value = new Date(Date.UTC(year, month - 1, day));
  return value.getUTCFullYear() === year && value.getUTCMonth() === month - 1 && value.getUTCDate() === day
    ? value
    : null;
}

/**
 * Re-verifies the caller against the database instead of trusting the
 * argument (.claude/rules/00-non-negotiables.md #5). A demoted or suspended
 * actor's still-validly-signed session cookie must not be enough to act.
 */
function verifiedAdmin(actorId: string, actorRole: UserRole): Promise<boolean> {
  return verifiedActor(actorId, actorRole, ["ADMIN"]);
}

function verifiedTrainer(actorId: string, actorRole: UserRole): Promise<boolean> {
  return verifiedActor(actorId, actorRole, ["TRAINER"]);
}

function verifiedTrainee(actorId: string, actorRole: UserRole): Promise<boolean> {
  return verifiedActor(actorId, actorRole, ["TRAINEE"]);
}

export async function evaluateTrainee(input: {
  trainerId: string; trainerRole: UserRole; traineeId: string; skill: string;
  rating: EvaluationRating; notes: string; idempotencyKey: string;
}): Promise<Result> {
  if (!(await verifiedTrainer(input.trainerId, input.trainerRole))) return { ok: false, error: "Not authorized." };
  if (input.trainerId === input.traineeId) return { ok: false, error: "You cannot rate yourself." };
  const fingerprint = evaluationIntentFingerprint(input);

  try {
    const result = await auditLogRepository.transaction(async (tx) => {
      // Locking the enrollment, rather than only an existing Evaluation,
      // serializes the zero-row case too. It also re-proves assignment inside
      // the mutation transaction instead of relying on an earlier read.
      const enrollments = await evaluationRepository.findAndLockAssignedEnrollment(
        tx,
        input.traineeId,
        input.trainerId,
      );
      if (enrollments.length !== 1) return "NOT_ASSIGNED" as const;
      const enrollmentId = enrollments[0].id;

      const priorIntent = await evaluationRepository.findIntentByKey(tx, input.idempotencyKey);
      if (priorIntent) {
        return priorIntent.enrollmentId === enrollmentId && priorIntent.trainerId === input.trainerId && priorIntent.fingerprint === fingerprint
          ? "REPLAY" as const
          : "CONFLICT" as const;
      }

      // The unique key on EvaluationIntent is the durable duplicate guard.
      // If a same-key request reached this point on a different enrollment at
      // the same instant, its unique violation rolls this whole transaction
      // back; the catch below reads the winning intent and safely replays it.
      const intent = await evaluationRepository.createIntent(tx, {
        idempotencyKey: input.idempotencyKey,
        enrollmentId,
        trainerId: input.trainerId,
        fingerprint,
      });

      const active = await evaluationRepository.findActiveAndLock(tx, enrollmentId, input.trainerId);
      const evaluation = active.length === 1
        ? await evaluationRepository.updateActive(tx, active[0].id, input.rating, input.skill, input.notes)
        : await evaluationRepository.create(tx, enrollmentId, input.trainerId, input.rating, input.skill, input.notes);

      await evaluationRepository.attachIntentToEvaluation(tx, intent.id, evaluation.id);
      await authorRatingRepository.upsert(
        tx,
        input.traineeId,
        input.trainerId,
        input.rating === "CERTIFIED" ? 5 : input.rating === "COMPETENT" ? 4 : 3,
      );
      await auditLogRepository.create(tx, {
        category: "USER",
        action: "evaluate",
        description: null,
        referenceId: intent.id,
        actorUserId: input.trainerId,
      });
      return "APPLIED" as const;
    });

    if (result === "NOT_ASSIGNED") return { ok: false, error: "Trainee is not assigned to you." };
    if (result === "CONFLICT") return { ok: false, error: "Unable to evaluate trainee." };
    return { ok: true };
  } catch (error) {
    if (!isUniqueViolation(error)) return { ok: false, error: "Unable to evaluate trainee." };

    // A concurrent same-key attempt lost only at the database constraint.
    // Re-read the winner after its transaction commits; a different request
    // may never turn into a success merely because it reused somebody else's
    // intent key.
    const winner = await evaluationRepository.findIntentByKey(db, input.idempotencyKey);
    if (
      winner
      && winner.trainerId === input.trainerId
      && winner.fingerprint === fingerprint
    ) {
      return { ok: true };
    }
    return { ok: false, error: "Unable to evaluate trainee." };
  }
}

function evaluationIntentFingerprint(input: {
  trainerId: string; traineeId: string; skill: string; rating: EvaluationRating; notes: string;
}): string {
  return createHash("sha256")
    .update(JSON.stringify([input.trainerId, input.traineeId, input.skill, input.rating, input.notes]))
    .digest("hex");
}

function isUniqueViolation(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === "P2002";
}

export async function createTrainingSession(input: {
  trainerId: string; trainerRole: UserRole; batchId: string; title: string;
  sessionType: SessionType; sessionDate: string; startTime: string; location: string;
  idempotencyKey: string;
}): Promise<Result> {
  if (!(await verifiedTrainer(input.trainerId, input.trainerRole))) return { ok: false, error: "Not authorized." };
  const sessionDate = phCalendarDate(input.sessionDate);
  if (!sessionDate) return { ok: false, error: "Invalid session date." };
  const fingerprint = intentFingerprint([
    input.batchId, input.title, input.sessionType, input.sessionDate, input.startTime, input.location,
  ]);

  try {
    const result = await db.$transaction(async (tx) => {
      // The batch lock re-proves current ownership in the same transaction
      // that writes the session, including after a trainer handoff.
      const batches = await trainingSessionRepository.findAndLockBatchByIdAndTrainerId(tx, input.batchId, input.trainerId);
      if (batches.length !== 1) return "NOT_OWNED" as const;

      await lockIntent(tx, input.trainerId, SESSION_INTENT_ACTION, input.idempotencyKey);
      const prior = await tx.auditLog.findFirst({
        where: { actorUserId: input.trainerId, category: "CALENDAR", action: `${SESSION_INTENT_ACTION}:${input.idempotencyKey}` },
        select: { description: true },
      });
      if (prior) return prior.description === fingerprint ? "REPLAY" as const : "CONFLICT" as const;

      const session = await trainingSessionRepository.create(tx, {
        batchId: batches[0].id,
        trainerId: input.trainerId,
        title: input.title,
        sessionType: input.sessionType,
        sessionDate,
        startTime: input.startTime,
        location: input.location || null,
      });
      await auditLogRepository.create(tx, {
        category: "CALENDAR",
        action: `${SESSION_INTENT_ACTION}:${input.idempotencyKey}`,
        description: fingerprint,
        referenceId: session.id,
        actorUserId: input.trainerId,
      });
      return "APPLIED" as const;
    });
    if (result === "NOT_OWNED") return { ok: false, error: "Selected batch is not assigned to you." };
    if (result === "CONFLICT") return { ok: false, error: "Unable to publish session." };
    return { ok: true };
  } catch {
    return { ok: false, error: "Unable to publish session." };
  }
}

function moduleAssetMatches(fileType: ModuleFileType, asset: { resourceType: MediaResourceType; format: string | null }): boolean {
  const format = asset.format?.toLowerCase();
  switch (fileType) {
    case "PDF": return asset.resourceType === "RAW" && format === "pdf";
    case "DOCX": return asset.resourceType === "RAW" && format === "docx";
    case "MP4": return asset.resourceType === "VIDEO" && format === "mp4";
    default: {
      const _exhaustive: never = fileType;
      return _exhaustive;
    }
  }
}

export async function publishModule(input: {
  trainerId: string; trainerRole: UserRole; batchId: string; mediaAssetId: string;
  title: string; fileType: ModuleFileType; unitNumber: number; idempotencyKey: string;
}): Promise<Result> {
  if (!(await verifiedTrainer(input.trainerId, input.trainerRole))) return { ok: false, error: "Not authorized." };
  const fingerprint = intentFingerprint([
    input.batchId, input.mediaAssetId, input.title, input.fileType, input.unitNumber,
  ]);

  try {
    const result = await db.$transaction(async (tx) => {
      // As with sessions, lock the current batch row before any replay check:
      // a former trainer cannot publish or replay after ownership changes.
      const batches = await moduleRepository.findAndLockBatchByIdAndTrainerId(tx, input.batchId, input.trainerId);
      if (batches.length !== 1) return "NOT_OWNED" as const;

      await lockIntent(tx, input.trainerId, MODULE_INTENT_ACTION, input.idempotencyKey);
      const prior = await tx.auditLog.findFirst({
        where: { actorUserId: input.trainerId, category: "MODULE", action: `${MODULE_INTENT_ACTION}:${input.idempotencyKey}` },
        select: { description: true },
      });
      if (prior) return prior.description === fingerprint ? "REPLAY" as const : "CONFLICT" as const;

      // Only a provider-authenticated ACTIVE module upload can be attached.
      // This deliberately does not call the browser confirmation endpoint:
      // that endpoint is optimistic and never authoritative.
      const asset = await tx.mediaAsset.findFirst({
        where: {
          id: input.mediaAssetId,
          uploadedByUserId: input.trainerId,
          folder: "hardtech/modules",
          purgeState: "ACTIVE",
          moduleId: null,
        },
        select: { id: true, resourceType: true, format: true, url: true, bytes: true },
      });
      if (!asset || !asset.url) return "NOT_READY" as const;
      if (!moduleAssetMatches(input.fileType, asset)) return "WRONG_TYPE" as const;

      // The module and its MediaAsset ownership link commit atomically. A
      // failed conditional attach rolls the newly created row back, so no
      // dangling material can ever become visible.
      const publishedModule = await moduleRepository.create(tx, {
        programId: batches[0].programId,
        trainerId: input.trainerId,
        title: input.title,
        fileType: input.fileType,
        unitNumber: input.unitNumber,
        fileUrl: asset.url,
        fileSizeBytes: asset.bytes,
      });
      const attached = await tx.mediaAsset.updateMany({
        where: { id: asset.id, purgeState: "ACTIVE", moduleId: null },
        data: { moduleId: publishedModule.id },
      });
      if (attached.count !== 1) throw new ModulePublishConflictError();

      await auditLogRepository.create(tx, {
        category: "MODULE",
        action: `${MODULE_INTENT_ACTION}:${input.idempotencyKey}`,
        description: fingerprint,
        referenceId: publishedModule.id,
        actorUserId: input.trainerId,
      });
      return "APPLIED" as const;
    });
    if (result === "NOT_OWNED") return { ok: false, error: "Selected batch is not assigned to you." };
    if (result === "NOT_READY") return { ok: false, error: "The uploaded file is still being verified. Try publishing again shortly." };
    if (result === "WRONG_TYPE") return { ok: false, error: "The uploaded file does not match the selected module type." };
    if (result === "CONFLICT") return { ok: false, error: "Unable to publish module." };
    return { ok: true };
  } catch {
    return { ok: false, error: "Unable to publish module." };
  }
}

class ModulePublishConflictError extends Error {}

export async function createAssignment(input: {
  trainerId: string; trainerRole: UserRole; batchId: string; title: string; instructions: string;
  dueDate: string; dueTime: string; allowedSubmissionTypes: SubmissionType[]; idempotencyKey: string;
}): Promise<Result> {
  if (!(await verifiedTrainer(input.trainerId, input.trainerRole))) return { ok: false, error: "Not authorized." };
  const dueDate = new Date(input.dueDate);
  if (Number.isNaN(dueDate.getTime())) return { ok: false, error: "Invalid due date." };
  try {
    const created = await db.$transaction(async (tx) => {
      const batches = await assignmentRepository.findAndLockBatchByIdAndTrainerId(tx, input.batchId, input.trainerId);
      if (batches.length !== 1) return false;
      await assignmentRepository.create(tx, {
        batchId: batches[0].id, trainerId: input.trainerId, title: input.title, instructions: input.instructions,
        dueDate, dueTime: input.dueTime, allowedSubmissionTypes: input.allowedSubmissionTypes, idempotencyKey: input.idempotencyKey,
      });
      return true;
    });
    if (!created) return { ok: false, error: "Selected batch is not assigned to you." };
  } catch (error) {
    if (!(typeof error === "object" && error !== null && "code" in error && error.code === "P2002")) return { ok: false, error: "Unable to create assignment." };
    const existing = await assignmentRepository.findByIdempotencyKey(input.idempotencyKey);
    if (!existing) return { ok: false, error: "Unable to create assignment." };
  }
  return { ok: true };
}

export async function submitAssignment(input: {
  traineeId: string; traineeRole: UserRole; assignmentId: string; mediaAssetId: string; idempotencyKey: string;
}): Promise<Result> {
  if (!(await verifiedTrainee(input.traineeId, input.traineeRole))) return { ok: false, error: "Not authorized." };

  try {
    const result = await db.$transaction(async (tx) => {
      const assignments = await assignmentSubmissionRepository.findAndLockEligibleAssignment(
        tx,
        input.assignmentId,
        input.traineeId,
      );
      if (assignments.length !== 1) return { ok: false, error: "Assignment is not available to you." } as const;

      // The idempotency key is checked under the assignment lock before the
      // supplied asset. A retry cannot replace the original intent with a
      // different file; a distinct key is the explicit re-submission signal.
      const priorIntent = await assignmentSubmissionRepository.findByIdempotencyKey(tx, input.idempotencyKey);
      if (priorIntent) {
        if (priorIntent.assignmentId === input.assignmentId && priorIntent.traineeId === input.traineeId) {
          return { ok: true } as const;
        }
        return { ok: false, error: "Unable to submit assignment." } as const;
      }

      const asset = await mediaAssetRepository.findActiveUnattachedAssignmentSubmissionAsset(
        tx,
        input.mediaAssetId,
        input.traineeId,
      );
      if (!asset) return { ok: false, error: "Unable to submit assignment." } as const;

      const submissionType = submissionTypeForResource(asset.resourceType);
      if (!submissionType || !assignments[0].allowedSubmissionTypes.includes(submissionType)) {
        return { ok: false, error: "This file type is not accepted for this assignment." } as const;
      }

      const priorSubmission = await assignmentSubmissionRepository.findByAssignmentAndTrainee(
        tx,
        input.assignmentId,
        input.traineeId,
      );
      const submission = priorSubmission
        ? await assignmentSubmissionRepository.replaceForNewIntent(
            tx,
            priorSubmission.id,
            input.idempotencyKey,
            asset.url ?? "",
          )
        : await assignmentSubmissionRepository.create(tx, {
            assignmentId: input.assignmentId,
            traineeId: input.traineeId,
            idempotencyKey: input.idempotencyKey,
            submissionLink: asset.url ?? "",
          });

      // A replacement must release its old object through the same deletion
      // outbox before the unique 1:1 attachment can move to the new object.
      // Everything is in this transaction: a failed attach rolls this release
      // and the submission update back together.
      if (priorSubmission) {
        await mediaAssetRepository.markPendingForOwner({ assignmentSubmissionId: submission.id }, tx);
      }
      const attached = await mediaAssetRepository.attachToOwner(
        asset.id,
        { assignmentSubmissionId: submission.id },
        tx,
      );
      if (attached !== 1) throw new AssignmentSubmissionConflictError();

      return { ok: true } as const;
    });
    return result;
  } catch (error) {
    if (error instanceof AssignmentSubmissionConflictError) {
      return { ok: false, error: "Unable to submit assignment." };
    }
    // A race on either database uniqueness guard is safe to replay by
    // inspecting the stored intent on the next request; this response never
    // reports false success for an ambiguous, different-key write.
    return { ok: false, error: "Unable to submit assignment." };
  }
}

class AssignmentSubmissionConflictError extends Error {}

function submissionTypeForResource(resourceType: MediaResourceType): SubmissionType | null {
  switch (resourceType) {
    case "IMAGE":
      return "IMAGE";
    case "VIDEO":
      return "VIDEO";
    case "RAW":
      return "DOCUMENT";
    default: {
      const _exhaustive: never = resourceType;
      void _exhaustive;
      return null;
    }
  }
}

async function transitionCertificate(adminId: string, role: UserRole, id: string, next: "APPROVED" | "REJECTED", reason?: string): Promise<Result> {
  if (!(await verifiedAdmin(adminId, role))) return { ok: false, error: "Not authorized." };
  const changed = await auditLogRepository.transaction(async (tx) => {
    const count = await certificateRequestRepository.transition(tx, id, next, adminId, reason);
    if (count !== 1) return false;
    await auditLogRepository.create(tx, { category: "CERTIFICATE", action: next === "APPROVED" ? "approve" : "reject", description: reason ?? null, referenceId: id, actorUserId: adminId });
    return true;
  });
  if (!changed) return { ok: false, error: "Certificate request is no longer pending." };

  if (next === "APPROVED") {
    // Render and upload AFTER the transaction commits, never inside it — the
    // upload is a network round trip to Cloudinary and must not hold a
    // Postgres connection open for its duration.
    //
    // A failure here is not an approval failure. The approval is real and
    // committed; only the document is missing, and the row is still
    // discoverable via findAwaitingIssuance (status APPROVED, publicId NULL),
    // so `reissuePendingCertificates` can complete it later. Reporting failure
    // to the admin would be wrong — it would invite a second approval attempt
    // against a request that is no longer PENDING, which now correctly fails.
    const issued = await issueCertificate(id);
    if (!issued.ok) {
      console.error(
        `[certificate] approved ${id} but issuance failed: ${issued.error}. Awaiting retry.`,
      );
    }
  }

  return { ok: true };
}

export const approveCertificate = (input: { adminId: string; adminRole: UserRole; certificateRequestId: string }) => transitionCertificate(input.adminId, input.adminRole, input.certificateRequestId, "APPROVED");
export const rejectCertificate = (input: { adminId: string; adminRole: UserRole; certificateRequestId: string; reason?: string }) => transitionCertificate(input.adminId, input.adminRole, input.certificateRequestId, "REJECTED", input.reason);

async function transitionPayment(adminId: string, role: UserRole, id: string, next: "VERIFIED" | "REJECTED", reason?: string): Promise<Result> {
  // Authorization is the gate: it must run before any resource-specific
  // lookup, so an unauthorized caller sees only the generic error and can
  // never distinguish "id doesn't exist" from "id exists" from "id is
  // mine" by error string (.claude/rules/00-non-negotiables.md #5). The
  // self-transaction conflict below is real business logic, evaluated only
  // once the caller is a verified admin.
  if (!(await verifiedAdmin(adminId, role))) return { ok: false, error: "Not authorized." };
  const payment = await enrollmentPaymentRepository.findById(id);
  if (!payment) return { ok: false, error: "Payment not found." };
  if (payment.traineeId === adminId) return { ok: false, error: "You cannot verify your own payment." };
  const changed = await auditLogRepository.transaction(async (tx) => {
    const count = await enrollmentPaymentRepository.transition(tx, id, next, adminId, reason);
    if (count !== 1) return false;
    await enrollmentRepository.transitionByPayment(tx, id, next === "VERIFIED" ? "ACTIVE" : "REJECTED", reason);
    await auditLogRepository.create(tx, { category: "PAYMENT", action: next === "VERIFIED" ? "verify" : "reject", description: reason ?? null, referenceId: id, actorUserId: adminId });
    return true;
  });
  return changed ? { ok: true } : { ok: false, error: "Payment is no longer pending." };
}

export const verifyPayment = (input: { adminId: string; adminRole: UserRole; paymentId: string }) => transitionPayment(input.adminId, input.adminRole, input.paymentId, "VERIFIED");
export const rejectPayment = (input: { adminId: string; adminRole: UserRole; paymentId: string; reason?: string }) => transitionPayment(input.adminId, input.adminRole, input.paymentId, "REJECTED", input.reason);
