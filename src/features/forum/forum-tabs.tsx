import Link from "next/link";

import { cn } from "@/lib/utils";
import type { ForumTab } from "./types";

const TABS: { value: ForumTab; label: string }[] = [
  { value: "all", label: "All Posts" },
  { value: "trending", label: "Trending" },
  { value: "communities", label: "Communities" },
  { value: "bookmarks", label: "Bookmarks" },
];

/**
 * "All Posts / Trending / Communities / Bookmarks" tab group
 * (desktop-01.md #11, desktop-02.md #28-31, mobile-01.md #24). Server-
 * rendered links so the active tab is a URL state (?tab=), not client state
 * — a shared link is shareable/bookmarkable and survives a full reload.
 * Horizontally scrollable on mobile per mobile-01.md's "Bookma…" truncation.
 */
export function ForumTabs({
  active,
  buildHref,
}: {
  active: ForumTab;
  buildHref: (tab: ForumTab) => string;
}) {
  return (
    <div
      role="tablist"
      className="flex w-full gap-1 overflow-x-auto rounded-lg bg-muted p-[3px] [scrollbar-width:none]"
    >
      {TABS.map((tab) => (
        <Link
          key={tab.value}
          href={buildHref(tab.value)}
          role="tab"
          aria-selected={active === tab.value}
          className={cn(
            "shrink-0 rounded-md px-3 py-1 text-sm font-medium whitespace-nowrap transition-colors",
            active === tab.value
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
