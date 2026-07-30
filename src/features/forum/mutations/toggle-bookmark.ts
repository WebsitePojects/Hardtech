// TODO(wave-3): replace with a real call once auth and the mutation pipeline
// exist. Bookmark is a TOGGLE per (user, post) — PostBookmark carries a
// compound unique constraint on [userId, postId] so wave 3 must implement
// this as an insert-or-delete on that constraint, never a read-then-write
// check-then-act. See .claude/rules/00-non-negotiables.md rules 1 and 2.
//
// Deliberately NOT a server action and does NOT touch the database. It only
// throws — the bookmark button in this wave exercises the real
// disabled/pending/idempotency-key wiring without ever lying about success.
export interface ToggleBookmarkInput {
  idempotencyKey: string;
  postId: string;
}

export async function toggleBookmark(input: ToggleBookmarkInput): Promise<never> {
  void input;
  throw new Error(
    "TODO(wave-3): bookmarking is not implemented yet. This build stops at the disabled/pending guard on purpose.",
  );
}
