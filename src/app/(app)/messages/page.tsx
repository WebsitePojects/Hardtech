import { Footer } from "@/components/layout/footer";
import { MessagingShell } from "@/features/messaging/messaging-shell";

// Server component route: authenticate the viewer, then read conversations
// through the messaging service so repository access stays out of the UI.
import { requireSession } from "@/server/auth/session";
import { listConversations, searchConversations } from "@/server/services/messaging.service";

export const metadata = {
  title: "Messages | HardTech IT Corp",
};

interface MessagesPageProps {
  searchParams: Promise<{ search?: string }>;
}

export default async function MessagesPage(props: MessagesPageProps) {
  const searchParams = await props.searchParams;
  const search = searchParams.search?.trim() ?? "";
  const session = await requireSession();

  const conversations = search
    ? await searchConversations(session.userId, search)
    : await listConversations(session.userId);

  return (
    <>
      <div className="px-4 pt-20 pb-4 sm:px-6 sm:pt-24">
        <MessagingShell conversations={conversations} currentUserId={session.userId} search={search} />
      </div>
      <Footer />
    </>
  );
}
