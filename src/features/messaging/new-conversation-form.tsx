"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { MessageCircle, ShieldCheck } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { getOrCreateConversationSchema } from "./messaging.schema";
import { getOrCreateConversation } from "./mutations/get-or-create-conversation";

type NewConversationFormProps = {
  targetUserId: string | null;
  error: string | null;
};

type ConversationResult = Awaited<ReturnType<typeof getOrCreateConversation>>;

function isConversationResult(value: ConversationResult): value is Extract<ConversationResult, { ok: true }> {
  return value.ok === true && typeof value.data.id === "string" && value.data.id.length > 0;
}

export function NewConversationForm({ targetUserId, error }: NewConversationFormProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const parsed = getOrCreateConversationSchema.safeParse({ otherUserId: targetUserId ?? "" });
  const canSubmit = error === null && parsed.success && !isPending;

  async function handleConfirm() {
    if (isPending) return;
    if (!parsed.success) {
      setSubmitError("Choose a person before starting a message.");
      return;
    }

    setSubmitError(null);
    setIsPending(true);
    try {
      const result = await getOrCreateConversation(parsed.data);
      if (isConversationResult(result)) {
        router.push(`/messages/${encodeURIComponent(result.data.id)}`);
        return;
      }
      setSubmitError(result.error);
    } catch {
      setSubmitError("We could not update messages. Try again.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-xl items-center justify-center">
      <Card className="w-full border-glass-border bg-glass-panel shadow-[var(--glow-sm)]">
        <CardHeader>
          <div className="mb-2 flex size-10 items-center justify-center rounded-full bg-primary/15 text-primary">
            <MessageCircle className="size-5" aria-hidden />
          </div>
          <CardTitle>Start a message</CardTitle>
          <CardDescription>Confirm before opening this conversation.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Messages are only created after you choose to continue.
          </p>
          {error ? (
            <p
              role="alert"
              className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {error}
            </p>
          ) : (
            <p className="flex items-start gap-2 rounded-lg border border-glass-border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
              Your session is checked again on the server before the conversation opens.
            </p>
          )}
          {submitError ? (
            <p role="alert" aria-live="polite" className="text-sm text-destructive">
              {submitError}
            </p>
          ) : null}
        </CardContent>
        <CardFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button asChild type="button" variant="outline" disabled={isPending}>
            <Link href="/messages">Back to Messages</Link>
          </Button>
          <Button type="button" disabled={!canSubmit} aria-busy={isPending} onClick={() => void handleConfirm()}>
            {isPending ? "Opening..." : "Continue"}
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
