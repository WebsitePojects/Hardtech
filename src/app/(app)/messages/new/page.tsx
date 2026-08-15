import { redirect } from "next/navigation";
import { z } from "zod";

// Same expected-missing-module situation as ../page.tsx — see that file's
// header comment. `getOrCreateDirectConversation` is assumed idempotent per
// (userId, otherUserId) — a unique constraint on the participant pair, not a
// read-then-write — which is what makes it safe to call from a plain GET
// navigation like this one (non-negotiables rule 2: every mutating path is
// duplicate-safe). Landing here twice for the same two users must resolve to
// the same conversation, never create a second one.
import { requireSession } from "@/server/auth/session";
import { getOrCreateDirectConversation } from "@/server/services/messaging.service";

const newConversationParamsSchema = z.object({
  to: z.string().min(1),
});

interface NewConversationPageProps {
  searchParams: Promise<{ to?: string }>;
}

/**
 * Entry point for "message this person" links (src/features/forum/author-row.tsx
 * links here as `/messages/new?to={userId}`). Resolves or creates the direct
 * conversation server-side, then redirects into it — no client state, no
 * intermediate UI, matching how a mailto-style "message" link should behave.
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

  const conversation = await getOrCreateDirectConversation(session.userId, parsed.data.to);
  redirect(`/messages/${conversation.id}`);
}
