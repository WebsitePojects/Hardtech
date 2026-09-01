// This layout was rebuilt from a client-supplied reference image (a
// social-feed structure: welcome banner → composer → post feed, with a
// Top Contributors / Top Questions / Popular Hashtags right rail) at the
// client's EXPLICIT direction, superseding docs/screens/desktop-01.md #11,
// desktop-02.md #28-31, and mobile-01.md #24-27 for THIS route only. Do not
// "restore fidelity" to the old three-column category-rail layout — that
// spec is intentionally obsolete here. See .claude/lessons.md and the
// per-component docstrings in src/features/forum/ for what changed and why.
import Link from "next/link";
import { LogIn } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Footer } from "@/components/layout/footer";
import { ActiveFilters } from "@/features/forum/active-filters";
import { ForumTabs } from "@/features/forum/forum-tabs";
import { ForumToolbar } from "@/features/forum/forum-toolbar";
import { PostCard } from "@/features/forum/post-card";
import { PostComposer } from "@/features/forum/post-composer";
import { RightRail } from "@/features/forum/right-rail";
import { WelcomeBanner } from "@/features/forum/welcome-banner";
import { categoryLabel } from "@/features/forum/category-meta";
import { CommunitiesBrowser } from "@/features/communities/communities-browser";
import type { CommunityTopic, ForumCategory } from "@/../generated/prisma/enums";
import type { ForumSort, ForumTab } from "@/features/forum/types";

const VALID_TOPICS: CommunityTopic[] = [
  "MOBILE_REPAIR",
  "DESKTOP_REPAIR",
  "NETWORKING",
  "TROUBLESHOOTING",
];
function parseTopic(value: string | undefined): CommunityTopic | undefined {
  return VALID_TOPICS.includes(value as CommunityTopic) ? (value as CommunityTopic) : undefined;
}

// Server component route: parse query filters fail-closed, then read forum
// data through services so Prisma access remains behind the service layer.
import { getSession } from "@/server/auth/session";
import { getDashboardUser } from "@/server/services/dashboard.service";
import {
  getForumStats,
  getLeaderboard,
  getPopularHashtags,
  getTopQuestions,
  listCommunities,
  listPosts,
} from "@/server/services/forum.service";

export const metadata = {
  title: "Community Forum | HardTech IT Corp",
};

interface ForumPageSearchParams {
  tab?: string;
  category?: string;
  sort?: string;
  search?: string;
  region?: string;
  topic?: string;
}

interface ForumPageProps {
  searchParams: Promise<ForumPageSearchParams>;
}

const VALID_TABS: ForumTab[] = ["all", "trending", "communities", "bookmarks"];
const VALID_SORTS: ForumSort[] = ["newest", "most_active", "most_viewed", "most_reactions"];
const VALID_CATEGORIES: ForumCategory[] = [
  "GENERAL_DISCUSSION",
  "QA_HELP",
  "RESOURCES_TIPS",
  "TROUBLESHOOTING",
  "CAREER_JOBS",
  "ANNOUNCEMENTS",
];

function toServiceSort(tab: ForumTab): "recent" | "trending" {
  return tab === "trending" ? "trending" : "recent";
}

function matchesSearch(post: Awaited<ReturnType<typeof listPosts>>[number], search: string | undefined) {
  if (!search) return true;
  const normalizedSearch = search.toLowerCase();
  return (
    post.title.toLowerCase().includes(normalizedSearch) ||
    post.body.toLowerCase().includes(normalizedSearch) ||
    post.hashtags.some((tag) => tag.toLowerCase().includes(normalizedSearch)) ||
    `${post.author.firstName} ${post.author.lastName}`.toLowerCase().includes(normalizedSearch)
  );
}

function sortPosts(posts: Awaited<ReturnType<typeof listPosts>>, sort: ForumSort) {
  const sortedPosts = [...posts];
  if (sort === "newest") {
    return sortedPosts.sort((first, second) => second.createdAt.getTime() - first.createdAt.getTime());
  }
  if (sort === "most_active") {
    return sortedPosts.sort((first, second) => second.counts.reply - first.counts.reply);
  }
  if (sort === "most_viewed") {
    return sortedPosts.sort((first, second) => second.counts.view - first.counts.view);
  }
  if (sort === "most_reactions") {
    return sortedPosts.sort((first, second) => {
      const secondReactions = second.counts.upvote + second.counts.helpful + second.counts.insightful;
      const firstReactions = first.counts.upvote + first.counts.helpful + first.counts.insightful;
      return secondReactions - firstReactions;
    });
  }
  return [];
}

// Fail closed (.claude/rules/00-non-negotiables.md rule 3): an unrecognized
// tab/sort/category query value falls back to the default, it never passes
// an arbitrary string through to the service.
function parseTab(value: string | undefined): ForumTab {
  return VALID_TABS.includes(value as ForumTab) ? (value as ForumTab) : "all";
}
function parseSort(value: string | undefined): ForumSort {
  return VALID_SORTS.includes(value as ForumSort) ? (value as ForumSort) : "newest";
}
function parseCategory(value: string | undefined): ForumCategory | undefined {
  return VALID_CATEGORIES.includes(value as ForumCategory) ? (value as ForumCategory) : undefined;
}

/**
 * "First Last" -> "FL". Falls back to a single "?" rather than throwing
 * or rendering blank when a name is empty — a session can theoretically
 * outlive the user row it points at (see the fail-closed dashboardUser
 * check below), and an empty avatar circle reads as broken.
 */
function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return `${first}${last}`.toUpperCase() || "?";
}

/**
 * Honest, tab-aware empty-state copy. "No posts yet" is true for an empty
 * "All Posts" tab but false and misleading for an empty Bookmarks tab (the
 * forum has posts; this viewer just hasn't bookmarked one) or a search with
 * zero matches (posts exist; none matched) — each case states the actual
 * reason the list is empty instead of one generic sentence for all of them.
 */
function feedEmptyStateCopy({
  tab,
  category,
  search,
}: {
  tab: ForumTab;
  category?: ForumCategory;
  search?: string;
}): string {
  if (tab === "bookmarks") {
    return "You haven't bookmarked anything yet. Save a post from its engagement bar to find it here.";
  }
  if (search) {
    return category
      ? `No posts match "${search}" in ${categoryLabel(category)}.`
      : `No posts match "${search}".`;
  }
  if (category) {
    return `No posts in ${categoryLabel(category)} yet.`;
  }
  if (tab === "trending") {
    return "Nothing is trending yet.";
  }
  return "No posts yet. Be the first to start a conversation.";
}

export default async function ForumPage(props: ForumPageProps) {
  const searchParams = await props.searchParams;
  const tab = parseTab(searchParams.tab);
  const category = parseCategory(searchParams.category);
  const sort = parseSort(searchParams.sort);
  const search = searchParams.search?.trim() || undefined;
  const region = searchParams.region?.trim() || undefined;
  const topic = parseTopic(searchParams.topic);

  const session = await getSession();

  const [servicePosts, stats, leaderboard, topQuestions, popularHashtags, dashboardUser] = await Promise.all([
    tab === "communities"
      ? Promise.resolve([])
      : listPosts({
          category,
          sort: toServiceSort(tab),
          bookmarkedBy: tab === "bookmarks" ? session?.userId : undefined,
          viewerId: session?.userId,
        }),
    getForumStats(),
    getLeaderboard(),
    getTopQuestions(5),
    getPopularHashtags(8),
    session ? getDashboardUser(session.userId) : Promise.resolve(null),
  ]);

  const posts = sortPosts(
    servicePosts.filter((post) => matchesSearch(post, search)),
    sort,
  );
  const communities = tab === "communities" ? await listCommunities(session?.userId) : [];

  const buildTabHref = (nextTab: ForumTab) => {
    const params = new URLSearchParams();
    if (nextTab !== "all") params.set("tab", nextTab);
    if (category) params.set("category", category);
    if (sort !== "newest") params.set("sort", sort);
    if (search) params.set("search", search);
    const query = params.toString();
    return query ? `/forum?${query}` : "/forum";
  };

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 pt-24 pb-16 sm:px-6 sm:pt-28">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          <div className="min-w-0 flex-1 space-y-5">
            <WelcomeBanner
              isSignedIn={session !== null}
              totalPosts={stats.totalPosts}
              memberCount={stats.memberCount}
            />

            {session && dashboardUser ? (
              <PostComposer
                firstName={dashboardUser.name.split(" ")[0] || "there"}
                initials={initialsFromName(dashboardUser.name)}
              />
            ) : (
              <div
                id="composer"
                className="flex scroll-mt-24 flex-col items-start gap-3 rounded-2xl border border-dashed border-glass-border bg-surface-card p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <span className="text-sm text-muted-foreground">
                  Sign in to ask a question or share a fix with the community.
                </span>
                <Button asChild variant="outline" className="w-full shrink-0 sm:w-auto">
                  <Link href="/login">
                    <LogIn className="size-4" aria-hidden /> Sign in
                  </Link>
                </Button>
              </div>
            )}

            <div className="space-y-3">
              <ForumTabs active={tab} buildHref={buildTabHref} />

              {tab !== "communities" ? (
                <ForumToolbar
                  basePath="/forum"
                  search={search}
                  sort={sort}
                  activeCategory={category}
                  searchParamsForNav={{ tab: tab === "all" ? undefined : tab, category, search }}
                />
              ) : null}

              <ActiveFilters
                category={category}
                clearHref={buildTabHref(tab)}
                removeCategoryHref={buildTabHref(tab)}
              />
            </div>

            {tab === "communities" ? (
              <CommunitiesBrowser
                communities={communities}
                basePath="/forum"
                search={search}
                region={region}
                topic={topic}
                searchParamsForNav={{ tab: "communities", category, sort }}
                showRequestButton
              />
            ) : (
              <>
                {tab === "bookmarks" && !session ? null : (
                  <p className="text-sm text-muted-foreground">
                    {posts.length} {posts.length === 1 ? "post" : "posts"}
                    {category ? ` · ${categoryLabel(category)}` : ""}
                  </p>
                )}

                {tab === "bookmarks" && !session ? (
                  // Distinct from the generic empty state: without a session,
                  // `listPosts` never received a `bookmarkedBy` filter (there
                  // is no viewer to scope it to), so `posts` here is every
                  // post, not zero — showing them under a "Bookmarks" header
                  // would be wrong, not just unhelpful.
                  <div className="rounded-2xl border border-dashed border-glass-border p-8 text-center text-sm text-muted-foreground">
                    <Link href="/login" className="text-primary hover:underline">
                      Sign in
                    </Link>{" "}
                    to see your bookmarked posts.
                  </div>
                ) : posts.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-glass-border p-8 text-center text-sm text-muted-foreground">
                    {feedEmptyStateCopy({ tab, category, search })}
                  </div>
                ) : (
                  /* Flows with the page deliberately. This was a capped
                     sub-scroller: max-h + overflow-y-auto + overscroll-contain
                     + data-lenis-prevent. overscroll-contain's whole job is to
                     BLOCK scroll chaining, so reaching the last post dead-ended
                     the wheel instead of handing scroll back to the page — you
                     had to move the pointer off the feed to keep going.
                     Chaining out of a natively-scrolled box into Lenis-driven
                     page scroll is unreliable enough that bounding the feed is
                     not worth it. An unbounded list cannot trap scroll at all.
                     tabIndex/data-lenis-prevent went with it: a non-scrollable
                     div has no business being a tab stop. */
                  <div className="space-y-4">
                    {posts.map((post) => (
                      <PostCard key={post.id} post={post} />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          <RightRail leaderboard={leaderboard} topQuestions={topQuestions} popularHashtags={popularHashtags} />
        </div>
      </div>
      <Footer />
    </>
  );
}
