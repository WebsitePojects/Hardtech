import { redirect } from "next/navigation";
import { z } from "zod";

import { requireSession } from "@/server/auth/session";
import { NewConversationForm } from "@/features/messaging/new-conversation-form";

const newConversationParamsSchema = z.object({
  to: z.string().min(1),
});

interface NewConversationPageProps {
  searchParams: Promise<{ to?: string }>;
}

/**
 * Entry point for "message this person" links (src/features/forum/author-row.tsx
 * links here as `/messages/new?to={userId}`).
 *
 * This used to call the messaging service's get-or-create-conversation write
 * directly during render and redirect straight into the new thread. That made
 * a GET request mutating: Next prefetches on hover, and a hover, a crawler,
 * or a reload all created a Conversation + ConversationParticipant rows for a
 * thread the user never chose to start. Fixed per .claude/lessons.md 2026-08-16 "GET
 * routes must not create conversations" — any route named `new`, `preview`,
 * or `confirm` may authenticate and validate on GET, but creation belongs
 * behind an explicit user action. This page now only does that: it checks
 * the session and validates `to`, then hands off to <NewConversationForm>,
 * whose confirm button is the thing that actually triggers the write via a
 * Server Action (src/features/messaging/mutations/get-or-create-conversation.ts).
 */
export default async function NewConversationPage(props: NewConversationPageProps) {
  const searchParams = await props.searchParams;
  const session = await requireSession();

  // Fail closed (rule 3): a missing/malformed `to` never falls through to
  // some default conversation — it bounces to the inbox.
  const parsed = newConversationParamsSchema.safeParse(searchParams);
  if (!parsed.success) {
    redirect("/messages");
  }

  // A user cannot message themselves — the one guard author-row.tsx cannot
  // enforce on its own since it has no "is this the viewer" context yet
  // (see that file's header comment for the known gap). This route is the
  // server-side backstop regardless of which client ever links here.
  if (parsed.data.to === session.userId) {
    redirect("/messages");
  }

  // No mutation here — just render the confirmation. The write, and its own
  // server-side session/authorization re-check (rule 5: a client component
  // calling an action is not a trust boundary), live behind the button.
  return <NewConversationForm targetUserId={parsed.data.to} error={null} />;
}
