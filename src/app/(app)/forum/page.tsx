import Link from "next/link";
import { LogIn } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/layout/footer";
import { ActiveFilters } from "@/features/forum/active-filters";
import { ForumTabs } from "@/features/forum/forum-tabs";
import { ForumToolbar } from "@/features/forum/forum-toolbar";
import { LeftRail } from "@/features/forum/left-rail";
import { NewPostDialog } from "@/features/forum/new-post-dialog";
import { PostCard } from "@/features/forum/post-card";
import { RightRail } from "@/features/forum/right-rail";
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

// This page calls the wave-2 forum.service contract (owned by DATA-2, built
// in parallel — docs/contracts/wave-2-app.md). Until that file lands,
// "Cannot find module '@/server/services/forum.service'" and
// "Cannot find module '@/server/auth/session'" are expected compile errors,
// not bugs in this route. Expected shapes:
//   listPosts({ tab, category?, sort?, search?, currentUserId? }): Promise<ForumPostSummary[]>
//   listCommunities({ search?, region?, topic? }): Promise<CommunitySummary[]>
//   listTrendingPosts(limit = 5): Promise<Pick<ForumPostSummary, "id" | "title">[]>
//   getLeaderboard(limit = 5): Promise<LeaderboardEntry[]>
//   getForumStats(): Promise<ForumStats>
//   getSession(): Promise<{ userId: string; role: UserRole } | null>
import { getSession } from "@/server/auth/session";
import {
  getForumStats,
  getLeaderboard,
  listCommunities,
  listPosts,
  listTrendingPosts,
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

export default async function ForumPage(props: ForumPageProps) {
  const searchParams = await props.searchParams;
  const tab = parseTab(searchParams.tab);
  const category = parseCategory(searchParams.category);
  const sort = parseSort(searchParams.sort);
  const search = searchParams.search?.trim() || undefined;
  const region = searchParams.region?.trim() || undefined;
  const topic = parseTopic(searchParams.topic);

  const session = await getSession();

  const [servicePosts, stats, trendingPosts, leaderboard] = await Promise.all([
    tab === "communities"
      ? Promise.resolve([])
      : listPosts({
          category,
          sort: toServiceSort(tab),
          bookmarkedBy: tab === "bookmarks" ? session?.userId : undefined,
          viewerId: session?.userId,
        }),
    getForumStats(),
    listTrendingPosts(5),
    getLeaderboard(),
  ]);

  const posts = sortPosts(
    servicePosts.filter((post) => matchesSearch(post, search)),
    sort,
  );
  const communities = tab === "communities" ? await listCommunities(session?.userId) : [];

  const bookmarkedPosts = posts.filter((post) => post.viewer?.hasBookmarked ?? false);

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
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <Badge variant="outline" className="border-primary/40 text-primary">
              Community
            </Badge>
            <h1 className="font-heading text-3xl font-bold text-foreground sm:text-4xl">
              Community <span className="text-primary">Forum</span>
            </h1>
            <p className="text-muted-foreground">
              Discuss, share knowledge, and grow together with the HardTech community
            </p>
          </div>
          {session ? (
            <NewPostDialog />
          ) : (
            <Button asChild variant="outline">
              <Link href="/login">
                <LogIn className="size-4" aria-hidden /> Sign in to Post
              </Link>
            </Button>
          )}
        </div>

        <div className="flex flex-col gap-6 lg:flex-row">
          <LeftRail
            activeCategory={category}
            totalPosts={stats.totalPosts}
            stats={stats}
            searchParamsForFilters={{ tab: tab === "all" ? undefined : tab, sort, search }}
          />

          <div className="min-w-0 flex-1 space-y-4">
            {tab !== "communities" ? (
              <ForumToolbar
                basePath="/forum"
                search={search}
                sort={sort}
                activeCategory={category}
                searchParamsForNav={{ tab: tab === "all" ? undefined : tab, category, search }}
              />
            ) : null}

            <ForumTabs active={tab} buildHref={buildTabHref} />

            <ActiveFilters
              category={category}
              clearHref={buildTabHref(tab)}
              removeCategoryHref={buildTabHref(tab)}
            />

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
                <p className="text-sm text-muted-foreground">
                  {posts.length} {posts.length === 1 ? "post" : "posts"}
                  {category ? ` · ${categoryLabel(category)}` : ""}
                </p>

                {tab === "bookmarks" && !session ? (
                  <div className="rounded-2xl border border-dashed border-glass-border p-8 text-center text-sm text-muted-foreground">
                    <Link href="/login" className="text-primary hover:underline">
                      Sign in
                    </Link>{" "}
                    to see your bookmarked posts.
                  </div>
                ) : (tab === "bookmarks" ? bookmarkedPosts : posts).length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-glass-border p-8 text-center text-sm text-muted-foreground">
                    No posts yet.
                  </div>
                ) : (
                  <div
                    className="max-h-[min(68dvh,52rem)] space-y-4 overflow-y-auto overscroll-contain pr-2"
                    tabIndex={0}
                    data-lenis-prevent
                    aria-label="Forum posts"
                  >
                    {(tab === "bookmarks" ? bookmarkedPosts : posts).map((post) => (
                      <PostCard key={post.id} post={post} />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          <RightRail
            trendingPosts={trendingPosts}
            bookmarkedPosts={bookmarkedPosts}
            leaderboard={leaderboard}
          />
        </div>
      </div>
      <Footer />
    </>
  );
}
