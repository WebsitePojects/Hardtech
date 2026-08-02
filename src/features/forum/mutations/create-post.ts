"use server";

import { createPostAction } from "@/app/(app)/forum/actions";
import type { CreateForumPostInput } from "@/server/schemas/forum-write.schema";

export type CreatePostInput = CreateForumPostInput;

export async function createPost(input: CreatePostInput) {
  return createPostAction(input);
}
