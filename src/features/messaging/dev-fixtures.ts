/**
 * DEV-ONLY sample data and simulated upload helpers for local messaging UI
 * checks.
 *
 * Never import this module from a real route (`src/app/**\/page.tsx`) or
 * from any component that ships to production — it exists purely so this
 * builder can screenshot the UI against realistic data before handing off.
 */
import type { ConversationSummary, MessageAttachment, MessageView } from "./types";

const now = Date.now();
const minutesAgo = (m: number) => new Date(now - m * 60_000);

export const DEV_CURRENT_USER_ID = "user-you";

const alicia = { id: "user-alicia", firstName: "Alicia", lastName: "Reyes", role: "TRAINER", avatarUrl: null };
const marco = { id: "user-marco", firstName: "Marco", lastName: "Dela Cruz", role: "TRAINEE", avatarUrl: null };
const jun = { id: "user-jun", firstName: "Jun", lastName: "Santos", role: "ADMIN", avatarUrl: null };
const you = { id: DEV_CURRENT_USER_ID, firstName: "You", lastName: "", role: "TRAINEE", avatarUrl: null };

export const DEV_CONVERSATIONS: ConversationSummary[] = [
  {
    id: "conv-alicia",
    participants: [you, alicia],
    lastMessage: {
      body: "Sure — bring the board in Thursday and I'll walk you through the diagnostic steps again.",
      sentAt: minutesAgo(6),
      senderId: alicia.id,
    },
    unreadCount: 2,
    updatedAt: minutesAgo(6),
  },
  {
    id: "conv-marco",
    participants: [you, marco],
    lastMessage: {
      body: "Thanks for the notes on the networking module!",
      sentAt: minutesAgo(190),
      senderId: marco.id,
    },
    unreadCount: 0,
    updatedAt: minutesAgo(190),
  },
  {
    id: "conv-jun",
    participants: [you, jun],
    lastMessage: {
      body: "Your enrollment for the Desktop Repair track has been approved.",
      sentAt: minutesAgo(60 * 26),
      senderId: jun.id,
    },
    unreadCount: 1,
    updatedAt: minutesAgo(60 * 26),
  },
];

const attachmentFixture: MessageAttachment = {
  id: "attach-1",
  url: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=480&q=75",
  mimeType: "image/jpeg",
  bytes: 842_000,
  kind: "IMAGE",
};

export const DEV_MESSAGES: Record<string, MessageView[]> = {
  "conv-alicia": [
    {
      id: "msg-1",
      conversationId: "conv-alicia",
      senderId: you.id,
      body: "Hi Ms. Reyes, the motherboard is still not posting after I reseated the RAM.",
      attachments: [],
      sentAt: minutesAgo(40),
      deliveredAt: minutesAgo(40),
      readAt: minutesAgo(38),
    },
    {
      id: "msg-2",
      conversationId: "conv-alicia",
      senderId: alicia.id,
      body: "Did you check the CMOS battery? That's the usual culprit on that board revision.",
      attachments: [],
      sentAt: minutesAgo(35),
      deliveredAt: minutesAgo(35),
      readAt: minutesAgo(34),
    },
    {
      id: "msg-3",
      conversationId: "conv-alicia",
      senderId: you.id,
      body: "Just tested it, reads 2.8V so it should be fine. Here's the board.",
      attachments: [attachmentFixture],
      sentAt: minutesAgo(20),
      deliveredAt: minutesAgo(20),
      readAt: minutesAgo(18),
    },
    {
      id: "msg-4",
      conversationId: "conv-alicia",
      senderId: alicia.id,
      body: "Sure — bring the board in Thursday and I'll walk you through the diagnostic steps again.",
      attachments: [],
      sentAt: minutesAgo(6),
      deliveredAt: minutesAgo(6),
      readAt: null,
    },
  ],
  "conv-marco": [
    {
      id: "msg-5",
      conversationId: "conv-marco",
      senderId: marco.id,
      body: "Thanks for the notes on the networking module!",
      attachments: [],
      sentAt: minutesAgo(190),
      deliveredAt: minutesAgo(190),
      readAt: minutesAgo(185),
    },
  ],
  "conv-jun": [
    {
      id: "msg-6",
      conversationId: "conv-jun",
      senderId: jun.id,
      body: "Your enrollment for the Desktop Repair track has been approved.",
      attachments: [],
      sentAt: minutesAgo(60 * 26),
      deliveredAt: minutesAgo(60 * 26),
      readAt: null,
    },
  ],
};

/** Simulated `listConversations` — resolves after a tick, like a real fetch would. */
export async function devListConversations(): Promise<ConversationSummary[]> {
  await new Promise((resolve) => setTimeout(resolve, 0));
  return DEV_CONVERSATIONS;
}

/** Simulated `listMessages` — resolves after a tick. */
export async function devListMessages(conversationId: string): Promise<MessageView[]> {
  await new Promise((resolve) => setTimeout(resolve, 0));
  return DEV_MESSAGES[conversationId] ?? [];
}

/**
 * Simulated upload with progress for local UI checks.
 */
export function devSimulateUpload(
  file: File,
  onProgress: (percent: number) => void,
): { promise: Promise<MessageAttachment>; cancel: () => void } {
  let cancelled = false;
  const promise = new Promise<MessageAttachment>((resolve, reject) => {
    let percent = 0;
    const tick = () => {
      if (cancelled) {
        reject(new Error("cancelled"));
        return;
      }
      percent = Math.min(100, percent + 20 + Math.random() * 20);
      onProgress(Math.round(percent));
      if (percent >= 100) {
        resolve({
          id: `dev-upload-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          url: URL.createObjectURL(file),
          mimeType: file.type,
          bytes: file.size,
          kind: file.type.startsWith("image/") ? "IMAGE" : file.type.startsWith("video/") ? "VIDEO" : "FILE",
        });
        return;
      }
      setTimeout(tick, 180);
    };
    setTimeout(tick, 180);
  });
  return { promise, cancel: () => (cancelled = true) };
}
