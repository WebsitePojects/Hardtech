import { z } from "zod";

export const idempotencyKeySchema = z.string().trim().min(1).max(200);
export const idSchema = z.string().trim().min(1).max(200);
export const evaluationRatingSchema = z.enum(["CERTIFIED", "COMPETENT", "NEEDS_IMPROVEMENT"]);
export const submissionTypeSchema = z.enum(["IMAGE", "VIDEO", "DOCUMENT"]);
export const sessionTypeSchema = z.enum(["LECTURE", "HANDS_ON", "WORKSHOP", "ASSESSMENT"]);
export const moduleFileTypeSchema = z.enum(["PDF", "MP4", "DOCX"]);

const philippineCalendarDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use a calendar date.");
const clockTimeSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use 24-hour time.");

export const evaluateTraineeSchema = z.object({
  idempotencyKey: idempotencyKeySchema,
  traineeId: idSchema,
  skill: z.string().trim().min(1).max(200),
  rating: evaluationRatingSchema,
  notes: z.string().trim().max(5000),
});

export const createAssignmentSchema = z.object({
  idempotencyKey: idempotencyKeySchema,
  batchId: idSchema,
  title: z.string().trim().min(1).max(200),
  instructions: z.string().trim().min(1).max(10000),
  dueDate: z.string().trim().min(1).max(100),
  dueTime: z.string().trim().min(1).max(50),
  allowedSubmissionTypes: z.array(submissionTypeSchema).min(1).max(3),
});

export const createTrainingSessionSchema = z.object({
  idempotencyKey: idempotencyKeySchema,
  batchId: idSchema,
  title: z.string().trim().min(1).max(200),
  sessionType: sessionTypeSchema,
  // Date-only values are interpreted as Philippine calendar dates. The
  // service stores a UTC date-only representation so server time zones never
  // shift the calendar day.
  sessionDate: philippineCalendarDateSchema,
  startTime: clockTimeSchema,
  location: z.string().trim().max(200),
});

export const publishModuleSchema = z.object({
  idempotencyKey: idempotencyKeySchema,
  batchId: idSchema,
  mediaAssetId: idSchema,
  title: z.string().trim().min(1).max(200),
  fileType: moduleFileTypeSchema,
  unitNumber: z.number().int().min(1).max(10000),
});

export const setEnrollmentProgressSchema = z.object({
  idempotencyKey: idempotencyKeySchema,
  enrollmentId: idSchema,
  progressPercent: z.number().int().min(0).max(100),
});

export const completeEnrollmentSchema = z.object({
  idempotencyKey: idempotencyKeySchema,
  enrollmentId: idSchema,
});

export const submitAssignmentSchema = z.object({
  idempotencyKey: idempotencyKeySchema,
  assignmentId: idSchema,
  mediaAssetId: idSchema,
});

export const announcementWriteSchema = z.object({
  idempotencyKey: idempotencyKeySchema,
  title: z.string().trim().min(1).max(200),
  body: z.string().trim().min(1).max(10000),
  type: z.enum(["UPDATE", "NOTICE", "INFO"]),
  pinned: z.boolean(),
});

export const deleteAnnouncementSchema = z.object({ announcementId: idSchema });

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
export type CreateTrainingSessionInput = z.infer<typeof createTrainingSessionSchema>;
export type PublishModuleInput = z.infer<typeof publishModuleSchema>;
export type SetEnrollmentProgressInput = z.infer<typeof setEnrollmentProgressSchema>;
export type CompleteEnrollmentInput = z.infer<typeof completeEnrollmentSchema>;
export type SubmitAssignmentInput = z.infer<typeof submitAssignmentSchema>;
