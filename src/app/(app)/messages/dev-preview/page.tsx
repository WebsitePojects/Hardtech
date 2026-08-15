// TEMPORARY — used only to Playwright-screenshot the messaging UI against
// dev-fixtures.ts while the real service/actions modules don't exist yet.
// Deleted before this slice is handed off; never linked from anywhere real.
import { Toaster } from "@/components/ui/sonner";
import { MessagingShell } from "@/features/messaging/messaging-shell";
import { DEV_CONVERSATIONS, DEV_CURRENT_USER_ID, DEV_MESSAGES } from "@/features/messaging/dev-fixtures";

export default async function DevPreviewPage({ searchParams }: { searchParams: Promise<{ conv?: string }> }) {
  const resolvedSearchParams = await searchParams;
  const activeId = resolvedSearchParams?.conv;
  const activeConversation = activeId ? DEV_CONVERSATIONS.find((c) => c.id === activeId) : undefined;
  const messages = activeId ? (DEV_MESSAGES[activeId] ?? []) : [];

  return (
    <div data-messaging-canvas className="fixed inset-0 z-[90000] overflow-hidden bg-surface">
      <MessagingShell
        conversations={DEV_CONVERSATIONS}
        currentUserId={DEV_CURRENT_USER_ID}
        search=""
        activeConversation={activeConversation}
        messages={messages}
      />
      <Toaster />
    </div>
  );
}
