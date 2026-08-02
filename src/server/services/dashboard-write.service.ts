import type { EvaluationRating, SubmissionType, UserRole } from "@/../generated/prisma/client";
import { assignmentRepository } from "@/server/repositories/assignment.repository";
import { assignmentSubmissionRepository } from "@/server/repositories/assignment-submission.repository";
import { authorRatingRepository } from "@/server/repositories/author-rating.repository";
import { auditLogRepository } from "@/server/repositories/audit-log.repository";
import { certificateRequestRepository } from "@/server/repositories/certificate-request.repository";
import { enrollmentPaymentRepository } from "@/server/repositories/enrollment-payment.repository";
import { enrollmentRepository } from "@/server/repositories/enrollment.repository";
import { evaluationRepository } from "@/server/repositories/evaluation.repository";

type Result = { ok: true } | { ok: false; error: string };

function hasRole(role: UserRole, expected: UserRole): boolean {
  return role === expected;
}

export async function evaluateTrainee(input: {
  trainerId: string; trainerRole: UserRole; traineeId: string; skill: string;
  rating: EvaluationRating; notes: string; idempotencyKey: string;
}): Promise<Result> {
  if (!hasRole(input.trainerRole, "TRAINER")) return { ok: false, error: "Not authorized." };
  if (input.trainerId === input.traineeId) return { ok: false, error: "You cannot rate yourself." };
  const enrollment = await enrollmentRepository.findByTraineeAndTrainer(input.traineeId, input.trainerId);
  if (!enrollment) return { ok: false, error: "Trainee is not assigned to you." };

  await auditLogRepository.transaction(async (tx) => {
    await authorRatingRepository.upsert(tx, input.traineeId, input.trainerId, input.rating === "CERTIFIED" ? 5 : input.rating === "COMPETENT" ? 4 : 3);
    const updated = await evaluationRepository.updateActive(tx, enrollment.id, input.trainerId, input.rating, input.skill, input.notes);
    if (updated === 0) await evaluationRepository.create(tx, enrollment.id, input.trainerId, input.rating, input.skill, input.notes);
  });
  return { ok: true };
}

export async function createAssignment(input: {
  trainerId: string; trainerRole: UserRole; title: string; instructions: string;
  dueDate: string; dueTime: string; allowedSubmissionTypes: SubmissionType[]; idempotencyKey: string;
}): Promise<Result> {
  if (!hasRole(input.trainerRole, "TRAINER")) return { ok: false, error: "Not authorized." };
  const batch = await assignmentRepository.findBatchByTrainerId(input.trainerId);
  if (!batch) return { ok: false, error: "No training batch is assigned to you." };
  const dueDate = new Date(input.dueDate);
  if (Number.isNaN(dueDate.getTime())) return { ok: false, error: "Invalid due date." };
  try {
    await assignmentRepository.create({
    batchId: batch.id, trainerId: input.trainerId, title: input.title, instructions: input.instructions,
    dueDate, dueTime: input.dueTime, allowedSubmissionTypes: input.allowedSubmissionTypes, idempotencyKey: input.idempotencyKey,
    });
  } catch (error) {
    if (!(typeof error === "object" && error !== null && "code" in error && error.code === "P2002")) return { ok: false, error: "Unable to create assignment." };
    const existing = await assignmentRepository.findByIdempotencyKey(input.idempotencyKey);
    if (!existing) return { ok: false, error: "Unable to create assignment." };
  }
  return { ok: true };
}

export async function submitAssignment(input: {
  traineeId: string; traineeRole: UserRole; assignmentId: string; submissionLink: string; idempotencyKey: string;
}): Promise<Result> {
  if (!hasRole(input.traineeRole, "TRAINEE")) return { ok: false, error: "Not authorized." };
  const assignment = await assignmentRepository.findById(input.assignmentId);
  if (!assignment) return { ok: false, error: "Assignment not found." };
  const enrollment = await enrollmentRepository.findByTraineeAndBatch(input.traineeId, assignment.batchId);
  if (!enrollment) return { ok: false, error: "Assignment is not available to you." };
  await assignmentSubmissionRepository.upsert(input.assignmentId, input.traineeId, input.submissionLink);
  return { ok: true };
}

async function transitionCertificate(adminId: string, role: UserRole, id: string, next: "APPROVED" | "REJECTED", reason?: string): Promise<Result> {
  if (!hasRole(role, "ADMIN")) return { ok: false, error: "Not authorized." };
  const changed = await auditLogRepository.transaction(async (tx) => {
    const count = await certificateRequestRepository.transition(tx, id, next, adminId, reason);
    if (count !== 1) return false;
    await auditLogRepository.create(tx, { category: "CERTIFICATE", action: next === "APPROVED" ? "approve" : "reject", description: reason ?? null, referenceId: id, actorUserId: adminId });
    return true;
  });
  return changed ? { ok: true } : { ok: false, error: "Certificate request is no longer pending." };
}

export const approveCertificate = (input: { adminId: string; adminRole: UserRole; certificateRequestId: string }) => transitionCertificate(input.adminId, input.adminRole, input.certificateRequestId, "APPROVED");
export const rejectCertificate = (input: { adminId: string; adminRole: UserRole; certificateRequestId: string; reason?: string }) => transitionCertificate(input.adminId, input.adminRole, input.certificateRequestId, "REJECTED", input.reason);

async function transitionPayment(adminId: string, role: UserRole, id: string, next: "VERIFIED" | "REJECTED", reason?: string): Promise<Result> {
  if (!hasRole(role, "ADMIN")) return { ok: false, error: "Not authorized." };
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
