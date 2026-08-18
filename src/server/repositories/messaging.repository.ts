import { db } from "@/server/db";

const include = {
  participants: { include: { user: { select: { id: true, firstName: true, lastName: true, role: true } } } },
  messages: { where: { isDeleted: false }, orderBy: { createdAt: "desc" as const }, take: 1 },
} as const;

export const messagingRepository = {
  listForUser(userId: string, query?: string) {
    return db.conversation.findMany({
      where: { participants: { some: { userId, ...(query ? { conversation: { participants: { some: { user: { OR: [{ firstName: { contains: query, mode: "insensitive" } }, { lastName: { contains: query, mode: "insensitive" } }] } } } } } : {}) } } },
      include,
      orderBy: { lastMessageAt: "desc" },
    });
  },
  findByIdForUser(conversationId: string, userId: string) { return db.conversation.findFirst({ where: { id: conversationId, participants: { some: { userId } } }, include }); },
  findDirect(directKey: string) { return db.conversation.findUnique({ where: { directKey }, include }); },
  createDirect(directKey: string, userId: string, otherUserId: string) { return db.conversation.create({ data: { directKey, participants: { create: [{ userId }, { userId: otherUserId }] } }, include }); },
  listMessages(conversationId: string, userId: string) { return db.message.findMany({ where: { conversationId, conversation: { participants: { some: { userId } } } }, include: { attachments: true }, orderBy: { createdAt: "asc" } }); },
  findMessageByIdempotencyKey(idempotencyKey: string, senderId: string) { return db.message.findFirst({ where: { idempotencyKey, senderId }, include: { attachments: true } }); },
  createMessage(input: { conversationId: string; senderId: string; body: string; idempotencyKey: string; attachmentIds: string[] }) {
    return db.$transaction(async (tx) => {
      const membership = await tx.conversationParticipant.findFirst({ where: { conversationId: input.conversationId, userId: input.senderId } });
      if (!membership) throw new Error("NOT_AUTHORIZED");
      const attachmentIds = [...new Set(input.attachmentIds)];
      if (attachmentIds.length > 0) {
        const ownedAssets = await tx.mediaAsset.findMany({ where: { id: { in: attachmentIds }, uploadedByUserId: input.senderId, messageId: null, purgeState: "ACTIVE" }, select: { id: true } });
        if (ownedAssets.length !== attachmentIds.length) throw new Error("INVALID_ATTACHMENT");
      }
      const recipients = await tx.conversationParticipant.findMany({ where: { conversationId: input.conversationId, userId: { not: input.senderId } } });
      const message = await tx.message.create({ data: { conversationId: input.conversationId, senderId: input.senderId, body: input.body, idempotencyKey: input.idempotencyKey, attachments: { connect: attachmentIds.map((id) => ({ id })) } }, include: { attachments: true } });
      await tx.conversation.update({ where: { id: input.conversationId }, data: { lastMessageAt: message.createdAt } });
      for (const recipient of recipients) await tx.conversationParticipant.update({ where: { id: recipient.id }, data: { unreadCount: { increment: 1 }, lastMessageAt: message.createdAt } });
      await tx.conversationParticipant.update({ where: { id: membership.id }, data: { lastMessageAt: message.createdAt } });
      return message;
    });
  },
  markRead(conversationId: string, userId: string) { return db.conversationParticipant.updateMany({ where: { conversationId, userId }, data: { unreadCount: 0, lastReadAt: new Date() } }); },
  unreadTotal(userId: string) { return db.conversationParticipant.aggregate({ where: { userId }, _sum: { unreadCount: true } }); },
};
