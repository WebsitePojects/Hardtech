// TODO(wave-3): replace with a real call once auth and the mutation pipeline
// exist. Not a toggle, but still duplicate-safe per
// .claude/rules/00-non-negotiables.md rule 2: `idempotencyKey` is minted once
// per compose-dialog open (see use-new-post-dialog.ts) so a retry after a
// dropped response replays the same post instead of creating a second one.
//
// Trainee posts require approval (desktop-01.md guideline 5) — ForumPost.
// status defaults to PENDING_APPROVAL and only an admin transitions it via a
// conditional UPDATE guarded on current state (wave 3, not here). This stub
// never writes a row at all.
import type { ForumCategory } from "@/../generated/prisma/enums";

export interface CreatePostInput {
  idempotencyKey: string;
  title: string;
  body: string;
  category: ForumCategory;
  hashtags: string[];
  communityId?: string;
}

export async function createPost(input: CreatePostInput): Promise<never> {
  void input;
  throw new Error(
    "TODO(wave-3): posting is not implemented yet. This build stops at the disabled/pending guard on purpose.",
  );
}
