"use server";

import { createReplyAction } from "@/app/(app)/forum/actions";
import type { CreateForumReplyInput } from "@/server/schemas/forum-write.schema";

export type CreateReplyInput = CreateForumReplyInput;

export async function createReply(input: CreateReplyInput) {
  return createReplyAction(input);
}
