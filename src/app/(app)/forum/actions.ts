"use server";

import { updateTag } from "next/cache";

import { getSession } from "@/server/auth/session";
import {
  createForumPostSchema,
  createForumReplySchema,
  moderateForumPostSchema,
  reportForumPostSchema,
  togglePostBookmarkSchema,
  togglePostReactionSchema,
  toggleReplyReactionSchema,
} from "@/server/schemas/forum-write.schema";
import {
  approveForumPost,
  createForumPost,
  createForumReply,
  rejectForumPost,
  reportForumPost,
  togglePostBookmark,
  togglePostReaction,
  toggleReplyReaction,
} from "@/server/services/forum-write.service";

type ActionResult = { ok: true } | { ok: false; error: string };

export async function createPostAction(rawInput: unknown): Promise<ActionResult> {
  const parsed = createForumPostSchema.safeParse(rawInput);
  if (!parsed.success) return { ok: false, error: "Check the post details and try again." };
  const session = await getSession();
  if (!session) return { ok: false, error: "Please sign in to post." };
  const result = await createForumPost(parsed.data, session.userId);
  if (result.ok) updateTag("forum");
  return result;
}

export async function createReplyAction(rawInput: unknown): Promise<ActionResult> {
  const parsed = createForumReplySchema.safeParse(rawInput);
  if (!parsed.success) return { ok: false, error: "Write a reply first." };
  const session = await getSession();
  if (!session) return { ok: false, error: "Please sign in to reply." };
  const result = await createForumReply(parsed.data, session.userId);
  if (result.ok) updateTag("forum");
  return result;
}

export async function togglePostReactionAction(rawInput: unknown): Promise<ActionResult> {
  const parsed = togglePostReactionSchema.safeParse(rawInput);
  if (!parsed.success) return { ok: false, error: "That reaction is not valid." };
  const session = await getSession();
  if (!session) return { ok: false, error: "Please sign in to react." };
  const result = await togglePostReaction(parsed.data.postId, session.userId, parsed.data.reactionType);
  if (result.ok) updateTag("forum");
  return result;
}

export async function toggleReplyReactionAction(rawInput: unknown): Promise<ActionResult> {
  const parsed = toggleReplyReactionSchema.safeParse(rawInput);
  if (!parsed.success) return { ok: false, error: "That reaction is not valid." };
  const session = await getSession();
  if (!session) return { ok: false, error: "Please sign in to react." };
  const result = await toggleReplyReaction(parsed.data.replyId, session.userId, parsed.data.reactionType);
  if (result.ok) updateTag("forum");
  return result;
}

export async function toggleBookmarkAction(rawInput: unknown): Promise<ActionResult> {
  const parsed = togglePostBookmarkSchema.safeParse(rawInput);
  if (!parsed.success) return { ok: false, error: "That post is not valid." };
  const session = await getSession();
  if (!session) return { ok: false, error: "Please sign in to bookmark posts." };
  const result = await togglePostBookmark(parsed.data.postId, session.userId);
  if (result.ok) updateTag("forum");
  return result;
}

export async function reportPostAction(rawInput: unknown): Promise<ActionResult> {
  const parsed = reportForumPostSchema.safeParse(rawInput);
  if (!parsed.success) return { ok: false, error: "Choose a report reason and try again." };
  const session = await getSession();
  if (!session) return { ok: false, error: "Please sign in to report posts." };
  const result = await reportForumPost(parsed.data.postId, session.userId, parsed.data.reason, parsed.data.note);
  if (result.ok) updateTag("forum");
  return result;
}

export async function approveForumPostAction(rawInput: unknown): Promise<ActionResult> {
  const parsed = moderateForumPostSchema.safeParse(rawInput);
  if (!parsed.success) return { ok: false, error: "That post is not valid." };
  const session = await getSession();
  if (!session) return { ok: false, error: "Please sign in to moderate posts." };
  const result = await approveForumPost({ postId: parsed.data.postId, moderatorId: session.userId, moderatorRole: session.role });
  if (result.ok) updateTag("forum");
  return result;
}

export async function rejectForumPostAction(rawInput: unknown): Promise<ActionResult> {
  const parsed = moderateForumPostSchema.safeParse(rawInput);
  if (!parsed.success) return { ok: false, error: "That post is not valid." };
  const session = await getSession();
  if (!session) return { ok: false, error: "Please sign in to moderate posts." };
  const result = await rejectForumPost({ postId: parsed.data.postId, moderatorId: session.userId, moderatorRole: session.role });
  if (result.ok) updateTag("forum");
  return result;
}
