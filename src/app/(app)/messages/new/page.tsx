import { z } from "zod";

import { Footer } from "@/components/layout/footer";
import { NewConversationForm } from "@/features/messaging/new-conversation-form";
import { requireSession } from "@/server/auth/session";

const newConversationParamsSchema = z.object({
  to: z.string().trim().min(1).max(255),
});

interface NewConversationPageProps {
  searchParams: Promise<{ to?: string }>;
}

export default async function NewConversationPage(props: NewConversationPageProps) {
  const searchParams = await props.searchParams;
  const session = await requireSession();
  const parsed = newConversationParamsSchema.safeParse(searchParams);
  const targetUserId = parsed.success ? parsed.data.to : null;
  const error =
    targetUserId === null
      ? "Choose a person before starting a message."
      : targetUserId === session.userId
        ? "You cannot start a message with yourself."
        : null;

  return (
    <>
      <div className="px-4 pt-20 pb-4 sm:px-6 sm:pt-24">
        <NewConversationForm targetUserId={error ? null : targetUserId} error={error} />
      </div>
      <Footer />
    </>
  );
}
