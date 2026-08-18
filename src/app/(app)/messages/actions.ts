"use server";

import { getSession } from "@/server/auth/session";
import { sendMessage, markConversationRead, getOrCreateDirectConversation } from "@/server/services/messaging.service";
import { sendMessageSchema, markConversationReadSchema } from "@/features/messaging/messaging.schema";

export async function sendMessageAction(input: unknown) {
  const session = await getSession();
  if (!session) return { ok: false as const, error: "Not authorized." };
  const parsed = sendMessageSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "Invalid message." };
  try { return { ok: true as const, data: await sendMessage({ ...parsed.data, senderId: session.userId }) }; }
  catch { return { ok: false as const, error: "Unable to send message." }; }
}

export async function markConversationReadAction(input: unknown) {
  const session = await getSession();
  if (!session) return { ok: false as const, error: "Not authorized." };
  const parsed = markConversationReadSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "Invalid conversation." };
  return { ok: true as const, data: await markConversationRead(parsed.data.conversationId, session.userId) };
}

export async function getOrCreateDirectConversationAction(input: unknown) {
  const session = await getSession();
  if (!session || typeof input !== "object" || input === null || !("otherUserId" in input) || typeof input.otherUserId !== "string") return { ok: false as const, error: "Not authorized." };
  try { return { ok: true as const, data: await getOrCreateDirectConversation(session.userId, input.otherUserId) }; }
  catch { return { ok: false as const, error: "Unable to open conversation." }; }
}
