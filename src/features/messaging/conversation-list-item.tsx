import Link from "next/link";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import {
  conversationDisplayName,
  otherParticipants,
  participantInitials,
} from "./conversation-helpers";
import { formatRelativeTime } from "./relative-time";
import { UnreadBadge } from "./unread-badge";
import type { ConversationSummary } from "./types";

/**
 * One row in the conversation list: participant avatar + name, truncated
 * last-message preview, relative timestamp, unread indicator. Presentational
 * — all interactivity (navigation) is a plain `<Link>`, so this never needs
 * "use client".
 */
export function ConversationListItem({
  conversation,
  currentUserId,
  isActive = false,
}: {
  conversation: ConversationSummary;
  currentUserId: string;
  isActive?: boolean;
}) {
  const others = otherParticipants(conversation, currentUserId);
  const primary = others[0];
  const name = conversationDisplayName(conversation, currentUserId);
  const hasUnread = conversation.unreadCount > 0;
  const isOwnLastMessage = conversation.lastMessage?.senderId === currentUserId;

  return (
    <Link
      href={`/messages/${conversation.id}`}
      data-active={isActive}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "flex min-w-0 items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-glass-hover",
        isActive && "bg-glass",
      )}
    >
      <Avatar>
        <AvatarFallback className="bg-primary/15 font-semibold text-primary">
          {primary ? participantInitials(primary) : "?"}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <span
            className={cn(
              "min-w-0 truncate font-sub text-sm text-foreground",
              hasUnread ? "font-semibold" : "font-medium",
            )}
          >
            {name}
          </span>
          {conversation.lastMessage ? (
            <span className="shrink-0 text-[11px] text-muted-foreground">
              {formatRelativeTime(conversation.lastMessage.sentAt)}
            </span>
          ) : null}
        </div>
        <div className="flex min-w-0 items-center justify-between gap-2">
          <p
            className={cn(
              "min-w-0 flex-1 truncate text-xs",
              hasUnread ? "text-foreground/80" : "text-muted-foreground",
            )}
          >
            {conversation.lastMessage
              ? `${isOwnLastMessage ? "You: " : ""}${conversation.lastMessage.body}`
              : "No messages yet"}
          </p>
          <UnreadBadge count={conversation.unreadCount} className="shrink-0" />
        </div>
      </div>
    </Link>
  );
}
