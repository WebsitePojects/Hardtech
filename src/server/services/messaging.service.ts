import type { MessageAttachmentKind, ConversationSummary, MessageView, SendMessageInput } from "@/features/messaging/types";
import { messagingRepository } from "@/server/repositories/messaging.repository";
import { Prisma } from "@/../generated/prisma/client";
import { activeActor } from "@/server/services/actor-verification.service";
import { checkRateLimit } from "@/server/auth/rate-limit";

// Rule 2 ("unique constraint + out-of-transaction recovery"): the code lives on
// `.code`, not in the stringified error, so recovery must type-check the error
// class and inspect `.code` directly rather than substring-matching toString().
const isUniqueViolation = (error: unknown): boolean => error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";

async function consumeWriteBudget(actorId: string, operation: string): Promise<boolean> {
  try {
    return (await checkRateLimit(`enroll:messages-${operation}:${actorId}`)).allowed;
  } catch {
    return false;
  }
}

const directKey = (a: string, b: string) => [a, b].sort().join(":");
const kind = (resourceType: string, format: string | null): MessageAttachmentKind => format?.startsWith("image/") || resourceType === "image" ? "IMAGE" : format?.startsWith("video/") || resourceType === "video" ? "VIDEO" : "FILE";
type ConversationRow = { id: string; lastMessageAt: Date; participants: Array<{ userId: string; unreadCount: number; user: { id: string; firstName: string; lastName: string; role: string } }>; messages: Array<{ body: string; createdAt: Date; senderId: string }> };
type MessageRow = { id: string; conversationId: string; senderId: string; body: string; isDeleted: boolean; createdAt: Date; deliveredAt: Date | null; readAt: Date | null; attachments: Array<{ id: string; url: string | null; format: string | null; bytes: number; resourceType: string }> };

function summary(row: ConversationRow, userId: string): ConversationSummary {
  return { id: row.id, participants: row.participants.map((p) => ({ id: p.user.id, firstName: p.user.firstName, lastName: p.user.lastName, role: p.user.role, avatarUrl: null })), lastMessage: row.messages[0] ? { body: row.messages[0].body, sentAt: row.messages[0].createdAt, senderId: row.messages[0].senderId } : null, unreadCount: row.participants.find((p) => p.userId === userId)?.unreadCount ?? 0, updatedAt: row.lastMessageAt };
}

function message(row: MessageRow): MessageView {
  return { id: row.id, conversationId: row.conversationId, senderId: row.senderId, body: row.isDeleted ? "Message removed" : row.body, sentAt: row.createdAt, deliveredAt: row.deliveredAt, readAt: row.readAt, attachments: row.attachments.map((a) => ({ id: a.id, url: a.url ?? "", mimeType: a.format ?? "application/octet-stream", bytes: a.bytes, kind: kind(a.resourceType, a.format) })) };
}

export async function listConversations(userId: string) { return (await messagingRepository.listForUser(userId)).map((row) => summary(row, userId)); }
export async function searchConversations(userId: string, query: string) { return (await messagingRepository.listForUser(userId, query.trim().slice(0, 80))).map((row) => summary(row, userId)); }
export async function getOrCreateDirectConversation(userId: string, otherUserId: string) {
  if (!otherUserId || userId === otherUserId) throw new Error("INVALID_RECIPIENT");
  if (!(await activeActor(userId)) || !(await activeActor(otherUserId))) throw new Error("NOT_AUTHORIZED");
  if (!(await consumeWriteBudget(userId, "conversation"))) throw new Error("RATE_LIMITED");
  const key = directKey(userId, otherUserId);
  const current = await messagingRepository.findDirect(key);
  if (current) return summary(current, userId);
  try { return summary(await messagingRepository.createDirect(key, userId, otherUserId), userId); } catch (error) { if (!isUniqueViolation(error)) throw error; const winner = await messagingRepository.findDirect(key); if (!winner) throw new Error("CONVERSATION_UNAVAILABLE"); return summary(winner, userId); }
}
export async function listMessages(conversationId: string, userId: string) { return (await messagingRepository.listMessages(conversationId, userId)).map(message); }
export async function sendMessage(input: SendMessageInput & { senderId: string }) {
  if (!(await activeActor(input.senderId))) throw new Error("NOT_AUTHORIZED");
  const replay = await messagingRepository.findMessageByIdempotencyKey(input.idempotencyKey, input.senderId);
  if (replay) return message(replay);
  if (!(await consumeWriteBudget(input.senderId, "send"))) throw new Error("RATE_LIMITED");
  try { return message(await messagingRepository.createMessage(input)); } catch (error) { if (isUniqueViolation(error)) { const retry = await messagingRepository.findMessageByIdempotencyKey(input.idempotencyKey, input.senderId); if (retry) return message(retry); } throw error; }
}
export async function markConversationRead(conversationId: string, userId: string) {
  if (!(await activeActor(userId))) return { updated: 0 };
  if (!(await consumeWriteBudget(userId, "read"))) return { updated: 0 };
  return { updated: (await messagingRepository.markRead(conversationId, userId)).count };
}
export async function getUnreadTotal(userId: string) { return (await messagingRepository.unreadTotal(userId))._sum.unreadCount ?? 0; }
