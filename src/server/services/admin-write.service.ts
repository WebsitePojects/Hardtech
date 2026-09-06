import type { UserRole, UserStatus } from "@/../generated/prisma/client";
import { auditLogRepository } from "@/server/repositories/audit-log.repository";
import { batchRepository } from "@/server/repositories/batch.repository";
import { enrollmentRepository } from "@/server/repositories/enrollment.repository";
import { paymentMethodRepository } from "@/server/repositories/payment-method.repository";
import { programRepository } from "@/server/repositories/program.repository";
import { trainerProfileRepository } from "@/server/repositories/trainer-profile.repository";
import { userRepository } from "@/server/repositories/user.repository";
import { verifiedActor } from "@/server/services/actor-verification.service";

type Result = { ok: true } | { ok: false; error: string };
const roles = new Set<UserRole>(["TRAINEE", "TRAINER", "ADMIN"]);
const statuses = new Set<UserStatus>(["ACTIVE", "PENDING", "SUSPENDED"]);

function isAdmin(actorId: string, actorRole: UserRole): Promise<boolean> {
  return verifiedActor(actorId, actorRole, ["ADMIN"]);
}

async function targetExists(targetId: string): Promise<boolean> {
  return (await userRepository.findById(targetId)) !== null;
}

export async function updateUserRole(input: { actorId: string; actorRole: UserRole; userId: string; role: UserRole }): Promise<Result> {
  if (!roles.has(input.role)) return { ok: false, error: "Unrecognized user role." };
  if (!(await isAdmin(input.actorId, input.actorRole))) return { ok: false, error: "Not authorized." };
  if (input.actorId === input.userId && input.role !== "ADMIN") return { ok: false, error: "You cannot demote yourself." };
  if (!(await targetExists(input.userId))) return { ok: false, error: "User not found." };

  const changed = await auditLogRepository.transaction(async (tx) => {
    const result = await userRepository.updateRoleIfNot(tx, input.userId, input.role);
    if (result.count !== 1) return false;
    await auditLogRepository.create(tx, { category: "USER", action: "role_update", description: `Role changed to ${input.role}.`, referenceId: input.userId, actorUserId: input.actorId });
    return true;
  });
  return changed ? { ok: true } : { ok: true };
}

export async function updateUserStatus(input: { actorId: string; actorRole: UserRole; userId: string; status: UserStatus }): Promise<Result> {
  if (!statuses.has(input.status)) return { ok: false, error: "Unrecognized user status." };
  if (!(await isAdmin(input.actorId, input.actorRole))) return { ok: false, error: "Not authorized." };
  if (input.actorId === input.userId && input.status !== "ACTIVE") return { ok: false, error: "You cannot deactivate yourself." };
  if (!(await targetExists(input.userId))) return { ok: false, error: "User not found." };

  const changed = await auditLogRepository.transaction(async (tx) => {
    const result = await userRepository.updateStatusIfNot(tx, input.userId, input.status);
    if (result.count < 1) return false;
    await auditLogRepository.create(tx, { category: "USER", action: "status_update", description: `Status changed to ${input.status}.`, referenceId: input.userId, actorUserId: input.actorId });
    return true;
  });
  return changed ? { ok: true } : { ok: true };
}

export async function updateUserProgram(input: { actorId: string; actorRole: UserRole; userId: string; programId: string }): Promise<Result> {
  if (!(await isAdmin(input.actorId, input.actorRole))) return { ok: false, error: "Not authorized." };
  const [actor, target, program] = await Promise.all([userRepository.findById(input.actorId), userRepository.findById(input.userId), programRepository.findByShortName(input.programId)]);
  if (!actor || !target) return { ok: false, error: "User or program not found." };
  if (!program) return { ok: false, error: "Program not found." };
  const latestEnrollment = target.role === "TRAINEE" ? await enrollmentRepository.findLatestByTraineeId(input.userId) : null;

  // A program can only land on a TRAINER's profile or a TRAINEE's latest
  // enrollment. Neither slot existing is a genuine failure, decided here —
  // once a slot is confirmed to exist, the conditional UPDATE below can only
  // report count 0 because the row is already at the requested program (a
  // harmless replay), matching every sibling mutation's contract.
  const hasAssignableSlot = target.role === "TRAINER" || (target.role === "TRAINEE" && latestEnrollment !== null);
  if (!hasAssignableSlot) return { ok: false, error: "User has no assignable program." };

  await auditLogRepository.transaction(async (tx) => {
    const result = target.role === "TRAINER"
      ? await trainerProfileRepository.updatePrimaryProgram(tx, input.userId, program.id)
      : latestEnrollment
        ? await enrollmentRepository.updateProgram(tx, latestEnrollment.id, program.id)
        : { count: 0 };
    if (result.count !== 1) return;
    await auditLogRepository.create(tx, { category: "USER", action: "program_update", description: `Program changed to ${program.shortName}.`, referenceId: input.userId, actorUserId: input.actorId });
  });
  return { ok: true };
}

export async function removeUser(input: { actorId: string; actorRole: UserRole; userId: string }): Promise<Result> {
  if (!(await isAdmin(input.actorId, input.actorRole))) return { ok: false, error: "Not authorized." };
  if (input.actorId === input.userId) return { ok: false, error: "You cannot remove yourself." };
  if (!(await targetExists(input.userId))) return { ok: false, error: "User not found." };
  const changed = await auditLogRepository.transaction(async (tx) => {
    const result = await userRepository.suspend(tx, input.userId);
    if (result.count !== 1) return false;
    await auditLogRepository.create(tx, { category: "USER", action: "remove", description: "User suspended instead of deleted to preserve dependent records.", referenceId: input.userId, actorUserId: input.actorId });
    return true;
  });
  return changed ? { ok: true } : { ok: true };
}

export async function removeAssignedTrainee(input: { actorId: string; actorRole: UserRole; enrollmentId: string; batchId: string }): Promise<Result> {
  if (!(await isAdmin(input.actorId, input.actorRole))) return { ok: false, error: "Not authorized." };
  const changed = await auditLogRepository.transaction(async (tx) => {
    const result = await batchRepository.unassignTrainee(tx, input.enrollmentId, input.batchId);
    if (result.count !== 1) return false;
    await auditLogRepository.create(tx, { category: "ENROLLMENT", action: "trainee_unassigned", description: "Trainee removed from trainer batch.", referenceId: input.enrollmentId, actorUserId: input.actorId });
    return true;
  });
  return changed ? { ok: true } : { ok: false, error: "Trainee is no longer assigned to this batch." };
}

/** Assign an active enrollment to a batch in the same program. */
export async function assignEnrollmentToBatch(input: { actorId: string; actorRole: UserRole; enrollmentId: string; batchId: string }): Promise<Result> {
  if (!(await isAdmin(input.actorId, input.actorRole))) return { ok: false, error: "Not authorized." };

  const [enrollment, batch] = await Promise.all([
    enrollmentRepository.findForBatchAssignment(input.enrollmentId),
    batchRepository.findById(input.batchId),
  ]);
  if (!enrollment) return { ok: false, error: "Enrollment not found." };
  if (!batch) return { ok: false, error: "Batch not found." };
  if (enrollment.programId !== batch.programId) return { ok: false, error: "Enrollment and batch programs must match." };
  if (enrollment.batchId === batch.id) return { ok: true };
  if (enrollment.batchId !== null) return { ok: false, error: "Enrollment is already assigned to another batch." };
  if (enrollment.status !== "ACTIVE") return { ok: false, error: "Only active enrollments can be assigned." };

  const changed = await auditLogRepository.transaction(async (tx) => {
    const result = await batchRepository.assignActiveEnrollment(tx, input.enrollmentId, input.batchId, batch.programId);
    if (result.count !== 1) return false;
    await auditLogRepository.create(tx, {
      category: "ENROLLMENT",
      action: "batch_assign",
      description: `Enrollment assigned to batch ${batch.code}.`,
      referenceId: input.enrollmentId,
      actorUserId: input.actorId,
    });
    return true;
  });
  if (changed) return { ok: true };

  const current = await enrollmentRepository.findForBatchAssignment(input.enrollmentId);
  if (current?.batchId === input.batchId) return { ok: true };
  return { ok: false, error: current?.batchId ? "Enrollment is already assigned to another batch." : "Enrollment is no longer eligible for assignment." };
}

export async function savePaymentMethod(input: { actorId: string; actorRole: UserRole; method: "GCASH" | "MAYA" | "BANK_TRANSFER" | "CARD"; displayName: string; accountNumber: string | null; accountName: string | null; bankName: string | null; note: string | null; isEnabled: boolean }): Promise<Result> {
  if (!(await isAdmin(input.actorId, input.actorRole))) return { ok: false, error: "Not authorized." };
  try {
    const changed = await auditLogRepository.transaction(async (tx) => {
      const existing = await tx.paymentMethodConfig.findUnique({ where: { method: input.method }, select: { id: true } });
      if (!existing) {
        const row = await paymentMethodRepository.create(tx, { method: input.method, displayName: input.displayName, accountNumber: input.accountNumber, accountName: input.accountName, bankName: input.bankName, note: input.note, isEnabled: input.isEnabled, updatedBy: { connect: { id: input.actorId } } });
        await auditLogRepository.create(tx, { category: "PAYMENT", action: "payment_method_save", description: `Payment method ${input.displayName} saved.`, referenceId: row.id, actorUserId: input.actorId });
        return true;
      }
      const result = await paymentMethodRepository.updateIfChanged(tx, { method: input.method, displayName: input.displayName, accountNumber: input.accountNumber, accountName: input.accountName, bankName: input.bankName, note: input.note, isEnabled: input.isEnabled, updatedByUserId: input.actorId });
      if (result.count !== 1) return false;
      await auditLogRepository.create(tx, { category: "PAYMENT", action: "payment_method_save", description: `Payment method ${input.displayName} saved.`, referenceId: existing.id, actorUserId: input.actorId });
      return true;
    });
    return changed ? { ok: true } : { ok: true };
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") return { ok: true };
    return { ok: false, error: "Unable to save payment method." };
  }
}
