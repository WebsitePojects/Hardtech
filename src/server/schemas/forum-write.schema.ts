import { z } from "zod";

const id = z.string().trim().min(1).max(200);
const idempotencyKey = z.string().trim().min(1).max(200);
const category = z.enum([
  "GENERAL_DISCUSSION",
  "QA_HELP",
  "RESOURCES_TIPS",
  "TROUBLESHOOTING",
  "CAREER_JOBS",
  "ANNOUNCEMENTS",
]);
const reactionType = z.enum(["UPVOTE", "HELPFUL", "INSIGHTFUL"]);
const reportReason = z.enum(["SPAM", "HARASSMENT", "MISINFORMATION", "OFF_TOPIC", "OTHER"]);

export const createForumPostSchema = z.object({
  idempotencyKey,
  title: z.string().trim().min(1).max(200),
  body: z.string().trim().min(1).max(10000),
  category: category.optional(),
  hashtags: z.array(z.string().trim().min(1).max(50)).max(20),
  communityId: id.optional(),
});

export const createForumReplySchema = z.object({
  idempotencyKey,
  postId: id,
  body: z.string().trim().min(1).max(10000),
  parentReplyId: id.optional(),
});

export const togglePostReactionSchema = z.object({
  idempotencyKey,
  postId: id,
  reactionType,
});

export const toggleReplyReactionSchema = z.object({
  idempotencyKey,
  replyId: id,
  reactionType,
});

export const togglePostBookmarkSchema = z.object({ idempotencyKey, postId: id });

export const reportForumPostSchema = z.object({
  postId: id,
  reason: reportReason,
  note: z.string().trim().max(2000).optional(),
});

export const moderateForumPostSchema = z.object({ postId: id });

export type CreateForumPostInput = z.infer<typeof createForumPostSchema>;
export type CreateForumReplyInput = z.infer<typeof createForumReplySchema>;
export type TogglePostReactionInput = z.infer<typeof togglePostReactionSchema>;
export type ToggleReplyReactionInput = z.infer<typeof toggleReplyReactionSchema>;
export type TogglePostBookmarkInput = z.infer<typeof togglePostBookmarkSchema>;
export type ReportForumPostInput = z.infer<typeof reportForumPostSchema>;
