import { notFound } from "next/navigation";

import { Footer } from "@/components/layout/footer";
import { MessagingShell } from "@/features/messaging/messaging-shell";
import type { ConversationSummary } from "@/features/messaging/types";

// `listMessages` is called with the viewer id so the service can enforce
// participant scope before returning thread contents.
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
    <>
      <div className="px-4 pt-20 pb-4 sm:px-6 sm:pt-24">
        <MessagingShell
          conversations={conversations}
          currentUserId={session.userId}
          search={search}
          activeConversation={activeConversation}
          messages={messages}
        />
      </div>
      <Footer />
    </>
  );
}
