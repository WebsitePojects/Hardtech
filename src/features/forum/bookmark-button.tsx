"use client";

import { useRef } from "react";
import { Bookmark } from "lucide-react";

import { cn } from "@/lib/utils";
import { toggleBookmark } from "./mutations/toggle-bookmark";
import { useGuardedMutation } from "./use-guarded-mutation";

/**
 * Bookmark toggle (desktop-01.md #11-13 footer icon row, desktop-02.md #28
 * "MY BOOKMARKS" rail). Guards: disabled prop, isPending visual state,
 * early-return inside useGuardedMutation. Never flips the filled/unfilled
 * icon optimistically — bookmarking is a toggle idempotent per (user, post)
 * (PostBookmark's compound unique constraint), and this stub never actually
 * writes, so the icon only reflects the last-known server state passed in
 * via `isBookmarked`.
 */
export function BookmarkButton({
  postId,
  isBookmarked,
}: {
  postId: string;
  isBookmarked: boolean;
}) {
  const inFlightIdempotencyKey = useRef<string | null>(null);
  const { isPending, run } = useGuardedMutation(toggleBookmark, "We could not update your bookmark.");

  const handleClick = async () => {
    if (isPending || inFlightIdempotencyKey.current) return;

    const idempotencyKey = crypto.randomUUID();
    inFlightIdempotencyKey.current = idempotencyKey;
    try {
      await run({ idempotencyKey, postId });
    } finally {
      if (inFlightIdempotencyKey.current === idempotencyKey) {
        inFlightIdempotencyKey.current = null;
      }
    }
  };

  return (
    <button
      type="button"
      disabled={isPending}
      aria-pressed={isBookmarked}
      aria-busy={isPending}
      aria-label={isBookmarked ? "Remove bookmark" : "Bookmark this post"}
      onClick={() => void handleClick()}
      className="inline-flex items-center rounded-md p-1 text-muted-foreground transition-colors hover:bg-glass-hover hover:text-foreground disabled:opacity-60"
    >
      <Bookmark
        className={cn("size-3.5", isBookmarked && "fill-primary text-primary", isPending && "animate-pulse motion-reduce:animate-none")}
        aria-hidden
      />
    </button>
  );
}
