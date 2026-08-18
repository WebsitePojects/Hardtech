import { randomUUID } from "node:crypto";

import type { Prisma } from "@/../generated/prisma/client";
import { db } from "@/server/db";

type ParticipantView = {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  avatarUrl: string | null;
};

type ConversationSummary = {
  id: string;
  participants: ParticipantView[];
  lastMessage: { body: string; sentAt: Date; senderId: string } | null;
  unreadCount: number;
  updatedAt: Date;
};

type MessageAttachmentKind = "IMAGE" | "VIDEO" | "FILE";

type MessageAttachmentView = {
  id: string;
  url: string;
  mimeType: string;
  bytes: number;
  kind: MessageAttachmentKind;
};

type MessageView = {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  attachments: MessageAttachmentView[];
  sentAt: Date;
  deliveredAt: Date | null;
  readAt: Date | null;
};

type SendMessageInput = {
  idempotencyKey: string;
  conversationId: string;
  body: string;
  attachmentIds: string[];
  senderId: string;
};

type WriteResult<T> = { ok: true; data: T } | { ok: false; error: string };
type DbClient = typeof db | Prisma.TransactionClient;

const MAX_CONVERSATIONS = 50;
const MAX_MESSAGES = 50;
const MAX_UNREAD_ROWS = 1000;
const MAX_ATTACHMENTS = 5;
const MAX_ID_LENGTH = 255;
const MAX_BODY_LENGTH = 4000;
const MAX_SEARCH_LENGTH = 100;
const NOT_AVAILABLE = "That conversation is not available.";
const SEND_FAILED = "We could not send your message.";

const conversationSelect = {
  id: true,
  lastMessageAt: true,
  participants: {
    select: {
      userId: true,
      unreadCount: true,
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          role: true,
        },
      },
    },
  },
  messages: {
    where: { isDeleted: false },
    orderBy: { createdAt: "desc" },
    take: 1,
    select: {
      body: true,
      createdAt: true,
      senderId: true,
    },
  },
} satisfies Prisma.ConversationSelect;

type ConversationRow = Prisma.ConversationGetPayload<{ select: typeof conversationSelect }>;

const messageSelect = {
  id: true,
  conversationId: true,
  senderId: true,
  body: true,
  createdAt: true,
  deliveredAt: true,
  readAt: true,
  attachments: {
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      url: true,
      format: true,
      resourceType: true,
      bytes: true,
    },
  },
} satisfies Prisma.MessageSelect;

type MessageRow = Prisma.MessageGetPayload<{ select: typeof messageSelect }>;

function cleanId(value: string): string | null {
  const trimmed = value.trim();
  if (trimmed.length === 0 || trimmed.length > MAX_ID_LENGTH) return null;
  return trimmed;
}

function cleanBody(value: string): string | null {
  const trimmed = value.trim();
  if (trimmed.length > MAX_BODY_LENGTH) return null;
  return trimmed;
}

function directKeyFor(userA: string, userB: string): string {
  return [userA, userB].sort().join(":");
}

function attachmentKind(resourceType: MessageRow["attachments"][number]["resourceType"]): MessageAttachmentKind {
  if (resourceType === "IMAGE") return "IMAGE";
  if (resourceType === "VIDEO") return "VIDEO";
  return "FILE";
}

function mimeTypeFor(asset: MessageRow["attachments"][number]): string {
  if (asset.resourceType === "IMAGE") return asset.format ? `image/${asset.format}` : "image/*";
  if (asset.resourceType === "VIDEO") return asset.format ? `video/${asset.format}` : "video/*";
  return asset.format ? `application/${asset.format}` : "application/octet-stream";
}

function toConversationSummary(row: ConversationRow, viewerId: string): ConversationSummary {
  const viewer = row.participants.find((participant) => participant.userId === viewerId);
  return {
    id: row.id,
    participants: row.participants.map((participant) => ({
      id: participant.user.id,
      firstName: participant.user.firstName,
      lastName: participant.user.lastName,
      role: participant.user.role,
      avatarUrl: null,
    })),
    lastMessage: row.messages[0]
      ? {
          body: row.messages[0].body,
          sentAt: row.messages[0].createdAt,
          senderId: row.messages[0].senderId,
        }
      : null,
    unreadCount: viewer?.unreadCount ?? 0,
    updatedAt: row.lastMessageAt,
  };
}

function toMessageView(row: MessageRow): MessageView {
  return {
    id: row.id,
    conversationId: row.conversationId,
    senderId: row.senderId,
    body: row.body,
    sentAt: row.createdAt,
    deliveredAt: row.deliveredAt,
    readAt: row.readAt,
    attachments: row.attachments.map((asset) => ({
      id: asset.id,
      url: asset.url ?? "",
      mimeType: mimeTypeFor(asset),
      bytes: asset.bytes,
      kind: attachmentKind(asset.resourceType),
    })),
  };
}

async function findConversationForViewer(
  conversationId: string,
  viewerId: string,
  client: DbClient = db,
): Promise<ConversationSummary | null> {
  const row = await client.conversation.findFirst({
    where: {
      id: conversationId,
      participants: { some: { userId: viewerId } },
    },
    select: conversationSelect,
  });
  return row ? toConversationSummary(row, viewerId) : null;
}

async function findMessageForViewer(
  messageId: string,
  viewerId: string,
  client: DbClient = db,
): Promise<MessageView | null> {
  const row = await client.message.findFirst({
    where: {
      id: messageId,
      conversation: { participants: { some: { userId: viewerId } } },
      isDeleted: false,
    },
    select: messageSelect,
  });
  return row ? toMessageView(row) : null;
}

async function userCanMessage(userId: string, client: DbClient = db): Promise<boolean> {
  const user = await client.user.findFirst({
    where: { id: userId, status: "ACTIVE" },
    select: { id: true },
  });
  return Boolean(user);
}

export async function listConversations(userId: string): Promise<ConversationSummary[]> {
  const actorId = cleanId(userId);
  if (!actorId) return [];

  const rows = await db.conversation.findMany({
    where: { participants: { some: { userId: actorId } } },
    orderBy: { lastMessageAt: "desc" },
    take: MAX_CONVERSATIONS,
    select: conversationSelect,
  });
  return rows.map((row) => toConversationSummary(row, actorId));
}

export async function searchConversations(userId: string, query: string): Promise<ConversationSummary[]> {
  const actorId = cleanId(userId);
  const term = query.trim().slice(0, MAX_SEARCH_LENGTH);
  if (!actorId || term.length === 0) return [];

  const rows = await db.conversation.findMany({
    where: {
      participants: { some: { userId: actorId } },
      AND: [
        {
          participants: {
            some: {
              userId: { not: actorId },
              user: {
                OR: [
                  { firstName: { contains: term, mode: "insensitive" } },
                  { lastName: { contains: term, mode: "insensitive" } },
                ],
              },
            },
          },
        },
      ],
    },
    orderBy: { lastMessageAt: "desc" },
    take: MAX_CONVERSATIONS,
    select: conversationSelect,
  });
  return rows.map((row) => toConversationSummary(row, actorId));
}

export async function getOrCreateDirectConversation(
  userId: string,
  otherUserId: string,
): Promise<ConversationSummary> {
  const actorId = cleanId(userId);
  const recipientId = cleanId(otherUserId);
  if (!actorId || !recipientId || actorId === recipientId) throw new Error(NOT_AVAILABLE);

  const conversationId = await db.$transaction(async (tx) => {
    const [actorAllowed, recipientAllowed] = await Promise.all([
      userCanMessage(actorId, tx),
      userCanMessage(recipientId, tx),
    ]);
    if (!actorAllowed || !recipientAllowed) throw new Error(NOT_AVAILABLE);

    const directKey = directKeyFor(actorId, recipientId);
    const createdConversationId = randomUUID();
    await tx.$executeRaw`
      INSERT INTO "Conversation" ("id", "directKey", "lastMessageAt", "createdAt", "updatedAt")
      VALUES (${createdConversationId}, ${directKey}, NOW(), NOW(), NOW())
      ON CONFLICT ("directKey") DO NOTHING
    `;

    const conversation = await tx.conversation.findUnique({
      where: { directKey },
      select: { id: true },
    });
    if (!conversation) throw new Error(NOT_AVAILABLE);

    await tx.conversationParticipant.createMany({
      data: [
        { id: randomUUID(), conversationId: conversation.id, userId: actorId },
        { id: randomUUID(), conversationId: conversation.id, userId: recipientId },
      ],
      skipDuplicates: true,
    });
    return conversation.id;
  });

  const summary = await findConversationForViewer(conversationId, actorId);
  if (!summary) throw new Error(NOT_AVAILABLE);
  return summary;
}

export async function listMessages(conversationId: string, userId: string): Promise<MessageView[]> {
  const threadId = cleanId(conversationId);
  const actorId = cleanId(userId);
  if (!threadId || !actorId) return [];

  const participant = await db.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId: threadId, userId: actorId } },
    select: { id: true },
  });
  if (!participant) return [];

  const rows = await db.message.findMany({
    where: { conversationId: threadId, isDeleted: false },
    orderBy: { createdAt: "desc" },
    take: MAX_MESSAGES,
    select: messageSelect,
  });
  return rows.reverse().map(toMessageView);
}

export async function sendMessage(input: SendMessageInput): Promise<WriteResult<MessageView>> {
  const actorId = cleanId(input.senderId);
  const conversationId = cleanId(input.conversationId);
  const idempotencyKey = cleanId(input.idempotencyKey);
  const body = cleanBody(input.body);
  const attachmentIds = [...new Set(input.attachmentIds.map((id) => id.trim()))];
  if (
    !actorId ||
    !conversationId ||
    !idempotencyKey ||
    body === null ||
    attachmentIds.length !== input.attachmentIds.length ||
    attachmentIds.length > MAX_ATTACHMENTS ||
    (body.length === 0 && attachmentIds.length === 0)
  ) {
    return { ok: false, error: SEND_FAILED };
  }

  try {
    const messageId = await db.$transaction(async (tx) => {
      const existing = await tx.message.findUnique({
        where: { idempotencyKey },
        select: { id: true, conversationId: true, senderId: true },
      });
      if (existing) {
        if (existing.conversationId !== conversationId || existing.senderId !== actorId) {
          throw new Error(SEND_FAILED);
        }
        return existing.id;
      }

      const participants = await tx.conversationParticipant.findMany({
        where: { conversationId },
        select: { userId: true },
        take: 3,
      });
      if (!participants.some((participant) => participant.userId === actorId)) {
        throw new Error(SEND_FAILED);
      }
      const recipientIds = participants
        .filter((participant) => participant.userId !== actorId)
        .map((participant) => participant.userId);
      if (recipientIds.length !== 1) throw new Error(SEND_FAILED);

      if (attachmentIds.length > 0) {
        const assets = await tx.mediaAsset.findMany({
          where: {
            id: { in: attachmentIds },
            uploadedByUserId: actorId,
            purgeState: "ACTIVE",
            messageId: null,
          },
          select: { id: true },
          take: MAX_ATTACHMENTS,
        });
        if (assets.length !== attachmentIds.length) throw new Error(SEND_FAILED);
      }

      const createdId = randomUUID();
      const inserted = await tx.$queryRaw<{ id: string }[]>`
        INSERT INTO "Message" ("id", "conversationId", "senderId", "body", "idempotencyKey", "createdAt")
        VALUES (${createdId}, ${conversationId}, ${actorId}, ${body}, ${idempotencyKey}, NOW())
        ON CONFLICT ("idempotencyKey") DO NOTHING
        RETURNING "id"
      `;

      const insertedId = inserted[0]?.id;
      if (!insertedId) {
        const replay = await tx.message.findUnique({
          where: { idempotencyKey },
          select: { id: true, conversationId: true, senderId: true },
        });
        if (!replay || replay.conversationId !== conversationId || replay.senderId !== actorId) {
          throw new Error(SEND_FAILED);
        }
        return replay.id;
      }

      if (attachmentIds.length > 0) {
        const attached = await tx.mediaAsset.updateMany({
          where: {
            id: { in: attachmentIds },
            uploadedByUserId: actorId,
            purgeState: "ACTIVE",
            messageId: null,
          },
          data: { messageId: insertedId },
        });
        if (attached.count !== attachmentIds.length) throw new Error(SEND_FAILED);
      }

      await tx.conversation.update({
        where: { id: conversationId },
        data: { lastMessageAt: new Date() },
        select: { id: true },
      });
      await tx.conversationParticipant.updateMany({
        where: { conversationId },
        data: { lastMessageAt: new Date() },
      });
      await tx.conversationParticipant.updateMany({
        where: { conversationId, userId: { in: recipientIds } },
        data: { unreadCount: { increment: 1 } },
      });

      return insertedId;
    });

    const message = await findMessageForViewer(messageId, actorId);
    if (!message) return { ok: false, error: SEND_FAILED };
    return { ok: true, data: message };
  } catch {
    return { ok: false, error: SEND_FAILED };
  }
}

export async function markConversationRead(
  conversationId: string,
  userId: string,
): Promise<{ updated: number }> {
  const threadId = cleanId(conversationId);
  const actorId = cleanId(userId);
  if (!threadId || !actorId) return { updated: 0 };

  return db.$transaction(async (tx) => {
    const latest = await tx.message.findFirst({
      where: { conversationId: threadId, isDeleted: false },
      orderBy: { createdAt: "desc" },
      select: { id: true },
    });

    const changed = await tx.conversationParticipant.updateMany({
      where: { conversationId: threadId, userId: actorId, unreadCount: { gt: 0 } },
      data: {
        unreadCount: 0,
        lastReadAt: new Date(),
        lastReadMessageId: latest?.id ?? null,
      },
    });
    if (changed.count !== 1) return { updated: 0 };

    await tx.message.updateMany({
      where: { conversationId: threadId, senderId: { not: actorId }, readAt: null },
      data: { readAt: new Date(), deliveryState: "SEEN" },
    });

    return { updated: 1 };
  });
}

export async function getUnreadTotal(userId: string): Promise<number> {
  const actorId = cleanId(userId);
  if (!actorId) return 0;

  const rows = await db.conversationParticipant.findMany({
    where: { userId: actorId, unreadCount: { gt: 0 } },
    select: { unreadCount: true },
    orderBy: { lastMessageAt: "desc" },
    take: MAX_UNREAD_ROWS,
  });
  return rows.reduce((sum, row) => sum + row.unreadCount, 0);
}
