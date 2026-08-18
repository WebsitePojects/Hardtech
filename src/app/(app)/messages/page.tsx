import { MessagingShell } from "@/features/messaging/messaging-shell";

// This route calls the not-yet-built messaging.service contract (backend
// paused for this wave — src/server/services/messaging.service.ts does not
// exist and this builder does not create it, per its brief). Mirrors exactly
// how src/app/(app)/forum/page.tsx documented the same situation during its
// own wave: "Cannot find module '@/server/services/messaging.service'" from
// `npx tsc --noEmit` is an EXPECTED compile error for this file, not a
// defect in this slice — the shape below is what the real service needs to
// satisfy (src/features/messaging/types.ts `MessagingServiceContract`):
//   listConversations(userId): Promise<ConversationSummary[]>
//   searchConversations(userId, query): Promise<ConversationSummary[]>
//   getUnreadTotal(userId): Promise<number>   -- not called here; navbar's job
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
    <div data-messaging-canvas className="fixed inset-0 z-[90000] overflow-hidden bg-surface">
      <MessagingShell conversations={conversations} currentUserId={session.userId} search={search} />
    </div>
  );
}
