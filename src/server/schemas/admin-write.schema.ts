import { z } from "zod";

const userId = z.string().trim().min(1);
const idempotencyKey = z.string().uuid().optional();
const role = z.enum(["TRAINEE", "TRAINER", "ADMIN"]);
const status = z.enum(["ACTIVE", "PENDING", "SUSPENDED"]);
const paymentMethod = z.enum(["GCASH", "MAYA", "BANK_TRANSFER", "CARD"]);

export const updateUserRoleSchema = z.object({ userId, role, idempotencyKey });
export const updateUserProgramSchema = z.object({ userId, programId: z.string().trim().min(1), idempotencyKey });
export const updateUserStatusSchema = z.object({ userId, status, idempotencyKey });
export const removeUserSchema = z.object({ userId, idempotencyKey });
export const removeAssignedTraineeSchema = z.object({ enrollmentId: userId, batchId: userId, idempotencyKey });
export const savePaymentMethodSchema = z.object({
  method: paymentMethod,
  displayName: z.string().trim().min(1),
  accountNumber: z.string().trim().nullable(),
  accountName: z.string().trim().nullable(),
  bankName: z.string().trim().nullable(),
  note: z.string().trim().nullable(),
  isEnabled: z.boolean(),
  idempotencyKey,
});
