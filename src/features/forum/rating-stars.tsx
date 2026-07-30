import { Star } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * "★★★★☆ 4.8 (4)" star row seen on every post card and leaderboard entry
 * (desktop-01.md #11-13, desktop-02.md #28). Stars fill up to the rounded
 * average; the numeric average and review count render after it.
 */
export function RatingStars({
  average,
  count,
  size = "sm",
}: {
  average: number | null;
  count: number;
  size?: "sm" | "md";
}) {
  const starSize = size === "sm" ? "size-3.5" : "size-4";

  if (average === null) {
    return <span className="text-sm text-muted-foreground">No ratings yet</span>;
  }

  const filled = Math.round(average);

  return (
    <span className="inline-flex items-center gap-1 text-sm">
      <span className="flex items-center gap-0.5" aria-hidden>
        {Array.from({ length: 5 }, (_, index) => (
          <Star
            key={index}
            className={cn(
              starSize,
              index < filled ? "fill-brand-orange text-brand-orange" : "text-muted-foreground/40",
            )}
          />
        ))}
      </span>
      <span className="text-foreground">
        {average.toFixed(1)} <span className="text-muted-foreground">({count})</span>
      </span>
    </span>
  );
}
