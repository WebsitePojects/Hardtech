"use client";

import { useState } from "react";
import { CheckCircle2, Lightbulb, ThumbsUp } from "lucide-react";

import type { ReactionType } from "@/../generated/prisma/enums";
import { cn } from "@/lib/utils";
import { toggleReplyReactionAction } from "@/app/(app)/forum/actions";
import { useGuardedMutation } from "./use-guarded-mutation";

function iconFor(type: ReactionType, pending: boolean) {
  const className = cn("size-3.5", pending && "animate-pulse");
  switch (type) {
    case "UPVOTE":
      return <ThumbsUp className={className} aria-hidden />;
    case "HELPFUL":
      return <CheckCircle2 className={className} aria-hidden />;
    case "INSIGHTFUL":
      return <Lightbulb className={className} aria-hidden />;
    default: {
      const exhaustive: never = type;
      void exhaustive;
      return null;
    }
  }
}

export function ReplyReactionButton({ replyId, type, count, label }: {
  replyId: string;
  type: ReactionType;
  count: number;
  label: string;
}) {
  const [idempotencyKey] = useState(() => crypto.randomUUID());
  const { isPending, run } = useGuardedMutation(toggleReplyReactionAction, "We could not update your reaction.");
  return (
    <button
      type="button"
      disabled={isPending}
      aria-label={label}
      aria-busy={isPending}
      onClick={() => {
        if (isPending) return;
        void run({ idempotencyKey, replyId, reactionType: type });
      }}
      className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 transition-colors hover:bg-glass-hover hover:text-foreground disabled:opacity-60"
    >
      {iconFor(type, isPending)} {count}
    </button>
  );
}
