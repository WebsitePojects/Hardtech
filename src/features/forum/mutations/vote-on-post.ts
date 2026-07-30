// TODO(wave-3): replace with a real call once auth and the mutation pipeline
// exist. Upvote/Helpful/Insightful are TOGGLES per (user, post, reactionType)
// — prisma/schema.prisma's PostReaction carries a compound unique constraint
// on [postId, userId, type] specifically so wave 3 can rely on that
// constraint (insert-or-delete on conflict) instead of a read-then-write
// check-then-act, per .claude/rules/00-non-negotiables.md rules 1 and 2.
//
// Deliberately NOT a server action and does NOT touch the database. It only
// throws, so every reaction button in this wave can exercise the real
// disabled/pending/idempotency-key wiring without faking a vote landing.
import type { ReactionType } from "@/../generated/prisma/enums";

export interface VoteOnPostInput {
  idempotencyKey: string;
  postId: string;
  reactionType: ReactionType;
}

export async function voteOnPost(input: VoteOnPostInput): Promise<never> {
  // Intentionally unused: this stub never reaches the database. Referenced
  // via `void` (rather than an underscore-prefixed name) to keep the real
  // parameter shape visible for wave 3 without an unused-var warning.
  void input;
  throw new Error(
    "TODO(wave-3): voting is not implemented yet. This build stops at the disabled/pending guard on purpose.",
  );
}
