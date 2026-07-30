// Zod schemas for every /forum and /forum/[id] mutation boundary. Defined in
// this feature folder, not src/server/schemas/, mirroring the wave-1 /enroll
// precedent — that directory belongs to AUTH/DATA-2 in this wave and there is
// no server action here yet for it to guard. Parse, never cast, per
// .claude/rules/00-non-negotiables.md rule 4.
import { z } from "zod";

import { FORUM_CATEGORIES, REACTION_TYPES, REPORT_REASONS } from "./types";

export const voteInputSchema = z.object({
  idempotencyKey: z.string().min(1),
  postId: z.string().min(1),
  reactionType: z.enum(REACTION_TYPES),
});
export type VoteInput = z.infer<typeof voteInputSchema>;

export const bookmarkInputSchema = z.object({
  idempotencyKey: z.string().min(1),
  postId: z.string().min(1),
});
export type BookmarkInput = z.infer<typeof bookmarkInputSchema>;

export const reportInputSchema = z.object({
  idempotencyKey: z.string().min(1),
  postId: z.string().min(1),
  reason: z.enum(REPORT_REASONS),
  note: z.string().trim().max(1000).optional(),
});
export type ReportInput = z.infer<typeof reportInputSchema>;

export const createPostSchema = z.object({
  idempotencyKey: z.string().min(1),
  title: z.string().trim().min(5, { message: "Title must be at least 5 characters." }).max(200),
  body: z.string().trim().min(20, { message: "Body must be at least 20 characters." }).max(10000),
  category: z.enum(FORUM_CATEGORIES),
  hashtags: z.array(z.string().trim().min(1)).max(10).default([]),
  communityId: z.string().min(1).optional(),
});
export type CreatePostInput = z.infer<typeof createPostSchema>;

export const createReplySchema = z.object({
  idempotencyKey: z.string().min(1),
  postId: z.string().min(1),
  body: z.string().trim().min(1, { message: "Reply cannot be empty." }).max(5000),
  parentReplyId: z.string().min(1).optional(),
});
export type CreateReplyInput = z.infer<typeof createReplySchema>;
