"use server";

import { togglePostReactionAction } from "@/app/(app)/forum/actions";
import type { ReactionType } from "@/../generated/prisma/enums";

export interface VoteOnPostInput {
  idempotencyKey: string;
  postId: string;
  reactionType: ReactionType;
}

export async function voteOnPost(input: VoteOnPostInput) {
  return togglePostReactionAction(input);
}
