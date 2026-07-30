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
export interface SubmitAssignmentInput {
  idempotencyKey: string;
  assignmentId: string;
  submissionLink: string;
}

export async function submitAssignmentSubmission(input: SubmitAssignmentInput): Promise<never> {
  // Intentionally unused: this stub never reaches the database. Referenced
  // via `void` (rather than an underscore-prefixed name) to keep the real
  // parameter shape visible for wave 4 without an unused-var warning.
  void input;
  throw new Error(
    "TODO(wave-4): assignment submission is not implemented yet. " +
      "This build stops at the disabled/pending guard on purpose.",
  );
}
