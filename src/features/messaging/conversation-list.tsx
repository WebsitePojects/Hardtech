import { MessageSquareOff } from "lucide-react";

import { ScrollArea } from "@/components/ui/scroll-area";
import { MessagingBackButton } from "./messaging-back-button";
import { ConversationListItem } from "./conversation-list-item";
import { ConversationSearch } from "./conversation-search";
import type { ConversationSummary } from "./types";

/**
 * Left pane: search + the list of conversations. Server-renderable itself —
 * only `ConversationSearch` inside it is a client component.
 */
export function ConversationList({
  conversations,
  currentUserId,
  activeConversationId,
  search,
}: {
  conversations: ConversationSummary[];
  currentUserId: string;
  activeConversationId?: string;
  search: string;
}) {
  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col gap-3 overflow-hidden p-3">
      <div className="flex items-center gap-2 px-1">
        <MessagingBackButton label="Back to previous page" />
        <div className="min-w-0">
          <p className="font-sub text-sm font-semibold text-foreground">Messages</p>
          <p className="text-[11px] text-muted-foreground">Your conversations</p>
        </div>
      </div>
      <ConversationSearch basePath="/messages" search={search} />

      {conversations.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 px-4 py-12 text-center text-sm text-muted-foreground">
          <MessageSquareOff className="size-8 text-muted-foreground/60" aria-hidden />
          {search ? (
            <p>No conversations match &ldquo;{search}&rdquo;.</p>
          ) : (
            <p>No conversations yet. Start one from a forum post.</p>
          )}
        </div>
      ) : (
        // min-w-0 on ScrollArea itself AND its direct child: Radix's
        // ScrollAreaPrimitive.Viewport sizes its rendered child to that
        // child's own intrinsic content width unless explicitly constrained,
        // so a row containing a long, normally-truncating string (the last-
        // message preview) can silently blow the whole column out to fit the
        // untruncated text — the truncated ellipsis and the unread badge
        // both end up rendered far outside the visible, clipped column
        // instead of "missing". Caught by reading getBoundingClientRect() on
        // the badge (width>0, but positioned past the sidebar's right edge),
        // not by eyeballing a screenshot of an apparently-empty spot.
        <ScrollArea className="conversation-list-scroll min-h-0 min-w-0 flex-1 overflow-hidden">
          <div className="flex w-full min-w-0 max-w-full flex-col gap-0.5 pr-2">
            {conversations.map((conversation) => (
              <ConversationListItem
                key={conversation.id}
                conversation={conversation}
                currentUserId={currentUserId}
                isActive={conversation.id === activeConversationId}
              />
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
