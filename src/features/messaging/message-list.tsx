"use client";

import { useEffect, useRef } from "react";

import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageBubble } from "./message-bubble";
import { markConversationRead } from "./mutations/mark-conversation-read";
import { useGuardedMutation } from "./use-guarded-mutation";
import type { MessageView } from "./types";
import type { OptimisticSendStatus } from "./message-status";

/**
 * Scrollable thread of message bubbles. Owns two client-only behaviors that
 * a server component can't: auto-scroll to the newest message, and marking
 * the conversation read once the thread is actually open (fires once per
 * conversationId mount — not on every render, and guarded the same way every
 * other mutating call in this app is via `useGuardedMutation`, so a failure
 * here shows nothing worse than a toast and the unread count simply not
 * clearing yet).
 */
export function MessageList({
  conversationId,
  messages,
  currentUserId,
  pendingMessages = [],
}: {
  conversationId: string;
  messages: MessageView[];
  currentUserId: string;
  /** Optimistic, not-yet-confirmed sends the composer is tracking locally, appended after the confirmed history. */
  pendingMessages?: { message: MessageView; status: OptimisticSendStatus }[];
}) {
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const { run: markRead } = useGuardedMutation(markConversationRead);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length, pendingMessages.length]);

  useEffect(() => {
    void markRead({ conversationId });
    // Only when the viewer actually switches conversations, not on every
    // message-list update within the same thread.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  return (
    <ScrollArea className="min-h-0 min-w-0 flex-1">
      <div className="flex w-full min-w-0 flex-col gap-3 p-4">
        {messages.length === 0 && pendingMessages.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            No messages yet. Say hello.
          </p>
        ) : (
          <>
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} isOwn={message.senderId === currentUserId} />
            ))}
            {pendingMessages.map(({ message, status }) => (
              <MessageBubble key={message.id} message={message} isOwn optimisticStatus={status} />
            ))}
          </>
        )}
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}
