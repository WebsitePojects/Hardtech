"use client";

import { useState } from "react";
import { CheckCircle2, Lightbulb, ThumbsUp } from "lucide-react";

import { cn } from "@/lib/utils";
import type { ReactionType } from "@/../generated/prisma/enums";
import { voteOnPost } from "./mutations/vote-on-post";
import { useGuardedMutation } from "./use-guarded-mutation";

function renderReactionIcon(reactionType: ReactionType, isPending: boolean) {
  const className = cn("size-3.5", isPending && "animate-pulse motion-reduce:animate-none");

  switch (reactionType) {
    case "UPVOTE":
      return <ThumbsUp className={className} aria-hidden />;
    case "HELPFUL":
      return <CheckCircle2 className={className} aria-hidden />;
    case "INSIGHTFUL":
      return <Lightbulb className={className} aria-hidden />;
    default: {
      const _exhaustive: never = reactionType;
      void _exhaustive;
      return null;
    }
  }
}

/**
 * One reaction toggle (upvote / helpful / insightful) on a post card or the
 * post detail page (desktop-01.md #11-13 footer icon row). Guards:
 *   - disabled: the `disabled={isPending}` prop below
 *   - pending state: `isPending` swaps in a muted/animated icon treatment
 *   - handler early-return: inside useGuardedMutation.run
 * Reactions are TOGGLES idempotent per (user, post, type) — see
 * mutations/vote-on-post.ts — so this never optimistically flips the count;
 * it only reflects what the (stub, always-failing) call actually did.
 */
export function ReactionButton({
  label,
  count,
  postId,
  reactionType,
}: {
  label: string;
  count: number;
  postId: string;
  reactionType: ReactionType;
}) {
  const [idempotencyKey] = useState(() => crypto.randomUUID());
  const { isPending, run } = useGuardedMutation(voteOnPost, "We could not update your reaction.");
  const icon = renderReactionIcon(reactionType, isPending);

  if (!icon) {
    return null;
  }

  return (
    <button
      type="button"
      disabled={isPending}
      aria-label={label}
      aria-busy={isPending}
      onClick={() =>
        void run({
          idempotencyKey,
          postId,
          reactionType,
        })
      }
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-glass-hover hover:text-foreground disabled:opacity-60",
      )}
    >
      {icon}
      {count}
    </button>
  );
}
