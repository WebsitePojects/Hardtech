import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * Small numeric pill shared by the navbar chat icon and each conversation
 * row. Only rendered when `count > 0` (a badge for zero unread is noise, not
 * information) — callers should conditionally render this component rather
 * than passing 0 and expecting it to hide itself, so a caller forgetting the
 * check fails loudly instead of shipping an empty pill.
 */
export function UnreadBadge({ count, className }: { count: number; className?: string }) {
  if (count <= 0) return null;

  return (
    <Badge
      className={cn(
        // h-4/min-w-4, not h-4.5/min-w-4.5: Tailwind's default spacing scale
        // has no 4.5 step, so a class by that name generates zero CSS while
        // tailwind-merge still (correctly, by name pattern) drops Badge's
        // real base `h-5` in favor of it — leaving no height rule at all.
        // Exact "arbitrary value computes to nothing" pattern documented in
        // .claude/lessons.md; caught by inspecting the rendered class list,
        // not by eyeballing a screenshot where a collapsed badge still shows
        // a few px of padding and can look present at a glance.
        "h-4 min-w-4 rounded-full border-transparent bg-primary px-1 text-[10px] font-semibold text-primary-foreground",
        className,
      )}
      aria-label={`${count} unread ${count === 1 ? "message" : "messages"}`}
    >
      {count > 99 ? "99+" : count}
    </Badge>
  );
}
