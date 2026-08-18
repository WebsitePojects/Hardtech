"use server";

import { refresh, updateTag } from "next/cache";

import { requireSession } from "@/server/auth/session";
import {
  getOrCreateDirectConversation,
  markConversationRead,
  sendMessage,
} from "@/server/services/messaging.service";
import {
  getOrCreateConversationSchema,
  markConversationReadSchema,
  sendMessageSchema,
} from "@/features/messaging/messaging.schema";
import type { ConversationSummary, MessageView } from "@/features/messaging/types";

type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string };

const GENERIC_MESSAGE_ERROR = "We could not update messages. Try again.";

export async function sendMessageAction(rawInput: unknown): Promise<ActionResult<MessageView>> {
  const parsed = sendMessageSchema.safeParse(rawInput);
  if (!parsed.success) return { ok: false, error: "Write a message or attach a file." };

  const session = await requireSession();
  const result = await sendMessage({ ...parsed.data, senderId: session.userId });
  if (!result.ok) return result;

  updateTag("messages");
  refresh();
  return result;
}

export async function markConversationReadAction(
  rawInput: unknown,
): Promise<ActionResult<{ updated: number }>> {
  const parsed = markConversationReadSchema.safeParse(rawInput);
  if (!parsed.success) return { ok: false, error: GENERIC_MESSAGE_ERROR };

  const session = await requireSession();
  const result = await markConversationRead(parsed.data.conversationId, session.userId);
  if (result.updated > 0) {
    updateTag("messages");
    refresh();
  }
  return { ok: true, data: result };
}

export async function getOrCreateDirectConversationAction(
  rawInput: unknown,
): Promise<ActionResult<ConversationSummary>> {
  const parsed = getOrCreateConversationSchema.safeParse(rawInput);
  if (!parsed.success) return { ok: false, error: GENERIC_MESSAGE_ERROR };

  const session = await requireSession();
  try {
    const conversation = await getOrCreateDirectConversation(session.userId, parsed.data.otherUserId);
    updateTag("messages");
    refresh();
    return { ok: true, data: conversation };
  } catch {
    return { ok: false, error: GENERIC_MESSAGE_ERROR };
  }
}
