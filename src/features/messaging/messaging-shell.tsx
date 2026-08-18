import { cn } from "@/lib/utils";
import { ConversationList } from "./conversation-list";
import { EmptyThreadState } from "./empty-thread-state";
import { ThreadView } from "./thread-view";
import type { ConversationSummary, MessageView } from "./types";

/**
 * Two-pane messaging layout, mirroring how the forum route composes a page
 * out of presentational pieces (src/app/(app)/forum/page.tsx). Responsive
 * collapse is route-driven, not client state: at `lg` and up both panes
 * always show; below `lg`, having an `activeConversation` hides the list
 * pane and shows the thread (with its own back link to `/messages`) — so
 * `/messages` on mobile shows the list, `/messages/[id]` shows the thread,
 * exactly matching what each URL represents.
 */
export function MessagingShell({
  conversations,
  currentUserId,
  search,
  activeConversation,
  messages,
}: {
  conversations: ConversationSummary[];
  currentUserId: string;
  search: string;
  activeConversation?: ConversationSummary;
  messages?: MessageView[];
}) {
  return (
    <div className="flex h-full min-h-0 w-full overflow-hidden bg-surface">
      <div
        className={cn(
          "w-full min-w-0 shrink-0 border-glass-border bg-surface-secondary/30 lg:w-[340px] lg:border-r",
          activeConversation ? "hidden lg:block" : "block",
        )}
      >
        <ConversationList
          conversations={conversations}
          currentUserId={currentUserId}
          activeConversationId={activeConversation?.id}
          search={search}
        />
      </div>

      <div className={cn("min-w-0 flex-1 bg-surface", activeConversation ? "flex" : "hidden lg:flex")}>
        {activeConversation ? (
          <ThreadView conversation={activeConversation} messages={messages ?? []} currentUserId={currentUserId} />
        ) : (
          <EmptyThreadState />
        )}
      </div>
    </div>
  );
}
