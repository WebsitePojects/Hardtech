// Data contract shared by the messaging UI, server actions, and service layer.
// Keep this file free of imports from `@/server/**`; it must compile standalone.

export type ConversationParticipant = {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  avatarUrl: string | null;
};

export type ConversationSummary = {
  id: string;
  participants: ConversationParticipant[];
  lastMessage: { body: string; sentAt: Date; senderId: string } | null;
  unreadCount: number;
  updatedAt: Date;
};

export type MessageAttachmentKind = "IMAGE" | "VIDEO" | "FILE";

export type MessageAttachment = {
  id: string;
  url: string;
  mimeType: string;
  bytes: number;
  kind: MessageAttachmentKind;
};

export type MessageView = {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  attachments: MessageAttachment[];
  sentAt: Date;
  deliveredAt: Date | null;
  readAt: Date | null;
};

/**
 * Input shape for the eventual `sendMessage` service call. `senderId` is
 * deliberately absent here — the server derives it from the session, never
 * from client input (rule 4: never trust a client-sent identity).
 * `idempotencyKey` is minted once per send intent (non-negotiables rule 1),
 * not regenerated on retry.
 */
export type SendMessageInput = {
  idempotencyKey: string;
  conversationId: string;
  body: string;
  attachmentIds: string[];
};

/**
 * The seven service functions used by the messaging UI. Client-triggered
 * writes flow through `src/app/(app)/messages/actions.ts`; server-side reads
 * flow through `@/server/services/messaging.service`.
 */
export type MessagingServiceContract = {
  listConversations(userId: string): Promise<ConversationSummary[]>;
  searchConversations(userId: string, query: string): Promise<ConversationSummary[]>;
  getOrCreateDirectConversation(userId: string, otherUserId: string): Promise<ConversationSummary>;
  listMessages(conversationId: string, userId: string): Promise<MessageView[]>;
  sendMessage(input: SendMessageInput & { senderId: string }): Promise<MessageView>;
  markConversationRead(conversationId: string, userId: string): Promise<{ updated: number }>;
  getUnreadTotal(userId: string): Promise<number>;
};

/** Generic action-result envelope, matching the shape `useGuardedMutation` (forum feature) already expects. */
export type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string };
