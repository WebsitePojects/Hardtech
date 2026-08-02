import { z } from "zod";

export const idempotencyKeySchema = z.string().trim().min(1).max(200);
export const idSchema = z.string().trim().min(1).max(200);
export const evaluationRatingSchema = z.enum(["CERTIFIED", "COMPETENT", "NEEDS_IMPROVEMENT"]);
export const submissionTypeSchema = z.enum(["IMAGE", "VIDEO", "DOCUMENT"]);

export const evaluateTraineeSchema = z.object({
  idempotencyKey: idempotencyKeySchema,
  traineeId: idSchema,
  skill: z.string().trim().min(1).max(200),
  rating: evaluationRatingSchema,
  notes: z.string().trim().max(5000),
});

export const createAssignmentSchema = z.object({
  idempotencyKey: idempotencyKeySchema,
  title: z.string().trim().min(1).max(200),
  instructions: z.string().trim().min(1).max(10000),
  dueDate: z.string().trim().min(1).max(100),
  dueTime: z.string().trim().min(1).max(50),
  allowedSubmissionTypes: z.array(submissionTypeSchema).min(1).max(3),
});

export const submitAssignmentSchema = z.object({
  idempotencyKey: idempotencyKeySchema,
  assignmentId: idSchema,
  submissionLink: z.string().trim().url().max(2000),
});

export const certificateTransitionSchema = z.object({
  certificateRequestId: idSchema,
  reason: z.string().trim().max(2000).optional(),
});

export const paymentTransitionSchema = z.object({
  paymentId: idSchema,
  reason: z.string().trim().max(2000).optional(),
});

export type EvaluateTraineeInput = z.infer<typeof evaluateTraineeSchema>;
export type CreateAssignmentInput = z.infer<typeof createAssignmentSchema>;
export type SubmitAssignmentInput = z.infer<typeof submitAssignmentSchema>;
