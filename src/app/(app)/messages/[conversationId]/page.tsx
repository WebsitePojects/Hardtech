import { notFound } from "next/navigation";

import { MessagingShell } from "@/features/messaging/messaging-shell";
import type { ConversationSummary } from "@/features/messaging/types";

// Same expected-missing-module situation as ../page.tsx — see that file's
// header comment. This route additionally assumes `listMessages` scopes to
// the viewer (rule 5: server-side authorization on every route) and returns
// `null`/throws for a conversationId the caller isn't a participant in,
// which is treated as `notFound()` below rather than leaking whether the id
// exists at all.
import { requireSession } from "@/server/auth/session";
import { listConversations, listMessages, searchConversations } from "@/server/services/messaging.service";

interface ConversationPageProps {
  params: Promise<{ conversationId: string }>;
  searchParams: Promise<{ search?: string }>;
}

export default async function ConversationPage(props: ConversationPageProps) {
  const { conversationId } = await props.params;
  const searchParams = await props.searchParams;
  const search = searchParams.search?.trim() ?? "";
  const session = await requireSession();

  // The active thread must resolve independent of the search box: a search
  // query narrowing the LEFT list must never 404 a conversation that simply
  // doesn't match it. `allConversations` (unfiltered) proves membership;
  // `conversations` (possibly filtered) is only what the list pane renders.
  const [allConversations, filteredConversations, messages] = await Promise.all([
    listConversations(session.userId),
    search ? searchConversations(session.userId, search) : Promise.resolve(null),
    listMessages(conversationId, session.userId),
  ]);
  const conversations = filteredConversations ?? allConversations;

  const activeConversation = (allConversations as ConversationSummary[]).find(
    (conversation) => conversation.id === conversationId,
  );
  if (!activeConversation) {
    notFound();
  }

  return (
    <div data-messaging-canvas className="fixed inset-0 z-[90000] overflow-hidden bg-surface">
      <MessagingShell
        conversations={conversations}
        currentUserId={session.userId}
        search={search}
        activeConversation={activeConversation}
        messages={messages}
      />
    </div>
  );
}
