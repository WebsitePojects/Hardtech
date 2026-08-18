import { FluidTabs } from "@/components/ui/fluid-tabs";
import type { ForumTab } from "./types";

const TABS: { value: ForumTab; label: string }[] = [
  { value: "all", label: "All Posts" },
  { value: "trending", label: "Trending" },
  { value: "communities", label: "Communities" },
  { value: "bookmarks", label: "Bookmarks" },
];

/**
 * "All Posts / Trending / Communities / Bookmarks" tab group
 * (desktop-01.md #11, desktop-02.md #28-31, mobile-01.md #24). Delegates to
 * the shared `FluidTabs` primitive in `mode="link"`: tabs stay `next/link`s
 * so the active tab is a URL state (?tab=), not client state — a shared link
 * is shareable/bookmarkable and survives a full reload. `FluidTabs` owns the
 * horizontal-scroll and sliding-indicator behaviour.
 */
export function ForumTabs({
  active,
  buildHref,
}: {
  active: ForumTab;
  buildHref: (tab: ForumTab) => string;
}) {
  return (
    <FluidTabs mode="link" tabs={TABS} active={active} buildHref={buildHref} />
  );
}
