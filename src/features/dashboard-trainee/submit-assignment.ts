import { submitAssignmentAction } from "@/app/(dashboard)/dashboard/trainee/actions";
import type { SubmitAssignmentInput as DashboardSubmitAssignmentInput } from "@/server/schemas/dashboard-write.schema";

// TODO(wave-4): replace with a real call once dashboard.service exposes a
// trainee assignment read and a mutation pipeline exists. Must stay
// idempotent on `idempotencyKey` (.claude/rules/00-non-negotiables.md rules
// 1 and 2) and rely on AssignmentSubmission's
// `@@unique([assignmentId, traineeId])` (prisma/schema.prisma) as the
// duplicate-safety mechanism — never a read-then-write check-then-act. The
// schema's own comment says re-submitting before the deadline updates the
// existing row, so the real implementation is an upsert keyed on that
// constraint, not a plain insert.
//
// Deliberately NOT a server action and does NOT touch the database. It only
// throws, so assignment-submission-form.tsx can exercise the real
// disabled/pending/idempotency-key wiring without ever faking success.
export type SubmitAssignmentInput = DashboardSubmitAssignmentInput;

export async function submitAssignmentSubmission(input: SubmitAssignmentInput) {
  const result = await submitAssignmentAction(input);
  if (!result.ok) throw new Error(result.error);
  return result;
}
