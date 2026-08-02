import { approveForumPostAction, rejectForumPostAction } from "@/app/(dashboard)/dashboard/admin/actions";

export async function approveForumPost(input: { postId: string }) {
  const result = await approveForumPostAction(input);
  if (!result.ok) throw new Error(result.error);
  return result;
}

export async function rejectForumPost(input: { postId: string }) {
  const result = await rejectForumPostAction(input);
  if (!result.ok) throw new Error(result.error);
  return result;
}
