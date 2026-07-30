"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createReplySchema } from "./forum.schema";
import { createReply } from "./mutations/create-reply";
import { useGuardedMutation } from "./use-guarded-mutation";

/**
 * Reply composer at the bottom of a post's reply thread (mobile-01.md #29
 * shows the sign-in-gated equivalent for guests; this renders for signed-in
 * viewers). Guards: Reply button disabled until the body passes validation
 * and again while pending; handler early-return via useGuardedMutation.
 * `idempotencyKey` is minted once per composer mount (one reply intent),
 * not per submit attempt, so a retry after a dropped response replays
 * instead of creating a second reply.
 */
export function ReplyForm({ postId }: { postId: string }) {
  const [idempotencyKey] = useState(() => crypto.randomUUID());
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { isPending, run } = useGuardedMutation(createReply, "Replying isn't wired up yet.");

  async function handleSubmit() {
    if (isPending) return;
    const parsed = createReplySchema.safeParse({ idempotencyKey, postId, body });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Write a reply first.");
      return;
    }
    setError(null);
    await run(parsed.data);
  }

  return (
    <div className="space-y-2 rounded-2xl border border-glass-border p-4">
      <label htmlFor="reply-body" className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
        <MessageCircle className="size-4" aria-hidden /> Write a reply
      </label>
      <Textarea
        id="reply-body"
        value={body}
        onChange={(event) => setBody(event.target.value)}
        placeholder="Share your reply..."
        disabled={isPending}
      />
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <div className="flex justify-end">
        <Button type="button" disabled={isPending || body.trim().length === 0} onClick={() => void handleSubmit()}>
          {isPending ? "Posting…" : "Post Reply"}
        </Button>
      </div>
    </div>
  );
}
