// TODO(wave-3): replace with a real call once auth and the mutation pipeline
// exist. Not a toggle, but still duplicate-safe per
// .claude/rules/00-non-negotiables.md rule 2: `idempotencyKey` is minted once
// per reply-composer mount (see reply-form.tsx) so a retry after a dropped
// response replays the same reply instead of creating a second one.
export interface CreateReplyInput {
  idempotencyKey: string;
  postId: string;
  body: string;
  parentReplyId?: string;
}

export async function createReply(input: CreateReplyInput): Promise<never> {
  void input;
  throw new Error(
    "TODO(wave-3): replying is not implemented yet. This build stops at the disabled/pending guard on purpose.",
  );
}
