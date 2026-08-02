"use server";

import { toggleBookmarkAction } from "@/app/(app)/forum/actions";

export interface ToggleBookmarkInput {
  idempotencyKey: string;
  postId: string;
}

export async function toggleBookmark(input: ToggleBookmarkInput) {
  return toggleBookmarkAction(input);
}
