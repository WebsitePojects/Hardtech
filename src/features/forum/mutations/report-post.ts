// TODO(wave-3): replace with a real call once auth and the mutation pipeline
// exist. PostReport carries a compound unique constraint on
// [postId, reporterId] so a repeat-click of "Report" by the same user cannot
// file duplicates — wave 3 relies on that constraint, never a
// read-then-write check-then-act. See .claude/rules/00-non-negotiables.md
// rules 1 and 2.
//
// Deliberately NOT a server action and does NOT touch the database. It only
// throws, so the report dialog in this wave exercises the real
// disabled/pending/idempotency-key wiring without faking a filed report.
import type { ReportReason } from "@/../generated/prisma/enums";

export interface ReportPostInput {
  idempotencyKey: string;
  postId: string;
  reason: ReportReason;
  note?: string;
}

export async function reportPost(input: ReportPostInput): Promise<never> {
  void input;
  throw new Error(
    "TODO(wave-3): reporting is not implemented yet. This build stops at the disabled/pending guard on purpose.",
  );
}
