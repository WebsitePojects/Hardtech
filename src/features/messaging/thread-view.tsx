import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { otherParticipants, participantDisplayName, participantInitials } from "./conversation-helpers";
import { Composer } from "./composer";
import { MessageList } from "./message-list";
import type { ConversationSummary, MessageView } from "./types";

/**
 * Right pane: header (other participant + mobile back button), the message
 * thread, and the composer. Server-renderable — the two genuinely
 * interactive children (`MessageList` for scroll/read-tracking, `Composer`
 * for the send flow) are the only client components underneath it.
 */
export function ThreadView({
  conversation,
  messages,
  currentUserId,
}: {
  conversation: ConversationSummary;
  messages: MessageView[];
  currentUserId: string;
}) {
  const others = otherParticipants(conversation, currentUserId);
  const primary = others[0];

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col">
      <div className="flex items-center gap-3 border-b border-glass-border p-3">
        <Link
          href="/messages"
          className="text-muted-foreground hover:text-foreground lg:hidden"
          aria-label="Back to conversations"
        >
          <ArrowLeft className="size-5" aria-hidden />
        </Link>
        <Avatar size="sm">
          <AvatarFallback className="bg-primary/15 font-semibold text-primary">
            {primary ? participantInitials(primary) : "?"}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate font-sub text-sm font-semibold text-foreground">
            {primary ? participantDisplayName(primary) : "Unknown"}
          </p>
          {primary ? <p className="truncate text-[11px] text-muted-foreground">{primary.role}</p> : null}
        </div>
      </div>

      <MessageList conversationId={conversation.id} messages={messages} currentUserId={currentUserId} />
      <Composer conversationId={conversation.id} />
    </div>
  );
}
