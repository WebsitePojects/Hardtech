"use client";

import { useState } from "react";
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
  const [idempotencyKey] = useState(() => crypto.randomUUID());
  const { isPending, run } = useGuardedMutation(toggleBookmark, "We could not update your bookmark.");

  return (
    <button
      type="button"
      disabled={isPending}
      aria-pressed={isBookmarked}
      aria-busy={isPending}
      aria-label={isBookmarked ? "Remove bookmark" : "Bookmark this post"}
      onClick={() => void run({ idempotencyKey, postId })}
      className="inline-flex items-center rounded-md p-1 text-muted-foreground transition-colors hover:bg-glass-hover hover:text-foreground disabled:opacity-60"
    >
      <Bookmark
        className={cn("size-3.5", isBookmarked && "fill-primary text-primary", isPending && "animate-pulse")}
        aria-hidden
      />
    </button>
  );
}
