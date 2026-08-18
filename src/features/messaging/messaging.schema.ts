// Zod schemas for the /messages mutation boundary, mirroring the
// src/features/forum/forum.schema.ts precedent: defined in this feature
// folder since there is no server action here yet for it to guard. Parse,
// never cast (.claude/rules/00-non-negotiables.md rule 4) — the eventual
// server action re-validates with this same schema server-side; this copy
// guards the client submit path so the UI never fires an obviously-invalid
// request.
import { z } from "zod";

import { MAX_ATTACHMENTS_PER_MESSAGE } from "./file-validation";

export const sendMessageSchema = z
  .object({
    idempotencyKey: z.string().min(1),
    conversationId: z.string().min(1),
    body: z.string().trim().max(4000),
    attachmentIds: z.array(z.string().min(1)).max(MAX_ATTACHMENTS_PER_MESSAGE).default([]),
  })
  .refine((value) => value.body.length > 0 || value.attachmentIds.length > 0, {
    message: "Write a message or attach a file.",
    path: ["body"],
  });
export type SendMessageInput = z.infer<typeof sendMessageSchema>;

export const markConversationReadSchema = z.object({
  conversationId: z.string().min(1),
});
export type MarkConversationReadInput = z.infer<typeof markConversationReadSchema>;

export const getOrCreateConversationSchema = z.object({
  otherUserId: z.string().min(1),
});
export type GetOrCreateConversationInput = z.infer<typeof getOrCreateConversationSchema>;
