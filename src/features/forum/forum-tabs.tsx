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
  // Resolve every tab's href here, on the server, instead of forwarding
  // `buildHref` itself. `ForumTabs` is a Server Component but `FluidTabs`
  // (src/components/ui/fluid-tabs.tsx) is "use client", and a function prop
  // cannot cross that boundary — passing `buildHref` straight through threw
  // "Functions cannot be passed directly to Client Components" at render
  // time in production (HTTP 500 on `/forum`), even though `tsc`, `eslint`,
  // `npm run build`, and the whole test suite all passed cleanly, because
  // none of them render the component tree. The hrefs are fully known here,
  // so hand FluidTabs plain, serializable strings instead of a callback.
  const tabs = TABS.map((tab) => ({ ...tab, href: buildHref(tab.value) }));

  return <FluidTabs mode="link" tabs={tabs} active={active} />;
}
