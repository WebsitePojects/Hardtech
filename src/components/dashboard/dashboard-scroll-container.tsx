import { cn } from "@/lib/utils";

export type DashboardScrollContainerProps = {
  children: React.ReactNode;
  className?: string;
};

/**
 * Horizontal-scroll wrapper for content wider than the mobile viewport.
 * docs/screens/mobile-05.md "Mobile layout rules": "Tables that are wider
 * than the viewport scroll horizontally rather than reflowing to stacked
 * cards" (User Management's USER/EMAIL/ROLE -> PROGRAM/STATUS/ACTIONS
 * column groups paged into view by horizontal swipe, thin scrollbar track
 * visible under the table).
 *
 * shadcn's own `Table` (src/components/ui/table.tsx) already wraps itself
 * in an `overflow-x-auto` container, so this is for any *other* wide
 * dashboard content that isn't a `<table>` — e.g. the Trainer Management
 * per-trainer stat rows, or a future grid — that wave-3 wants the same
 * horizontal-scroll behaviour for without re-deriving it.
 */
export function DashboardScrollContainer({
  children,
  className,
}: DashboardScrollContainerProps) {
  return (
    <div
      className={cn(
        "w-full overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch]",
        className
      )}
    >
      {children}
    </div>
  );
}
