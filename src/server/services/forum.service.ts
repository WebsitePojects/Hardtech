import { forumPostRepository } from "@/server/repositories/forum-post.repository";
import { replyRepository } from "@/server/repositories/reply.repository";
import { postReactionRepository } from "@/server/repositories/post-reaction.repository";
import { postBookmarkRepository } from "@/server/repositories/post-bookmark.repository";
import { authorRatingRepository } from "@/server/repositories/author-rating.repository";
import { communityRepository } from "@/server/repositories/community.repository";
import { communityMembershipRepository } from "@/server/repositories/community-membership.repository";
import { userRepository } from "@/server/repositories/user.repository";
import {
  forumCategorySchema,
  forumSortSchema,
  idSchema,
  slugSchema,
} from "@/server/schemas/forum.schema";
import type {
  ForumCategory,
  ForumPost,
  User,
  MembershipStatus,
  CommunityTopic,
  CommunityVisibility,
  UserRole,
  UserStatus,
  Prisma,
} from "@/../generated/prisma/client";

/**
 * The forum + communities read surface (docs/contracts/wave-2-app.md, DATA-2).
 * The FORUM builder codes against these exact exports in parallel, so the
 * signatures below are load-bearing — do not rename or reshape them.
 *
 * Fail-closed rule (.claude/rules/00-non-negotiables.md rule 3): every read
 * in this file that touches ForumPost hardcodes `status: "PUBLISHED"`. There
 * is no parameter anywhere in this module that can widen that — a
 * moderation/queue view of PENDING_APPROVAL or REJECTED posts is simply not
 * something this module can produce, by construction, regardless of who
 * calls it. If a future wave needs a moderator queue, that is a distinct,
 * explicitly role-gated function, not a parameter bolted onto these.
 */

// ---------------------------------------------------------------------------
// Exported result types
// ---------------------------------------------------------------------------

export type ForumAuthorSummary = {
  id: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: UserStatus;
  /** Published post count — the "N posts" line under the author's name. */
  postCount: number;
  /** Null when nobody has rated this author yet (no "★" row to render). */
  ratingAverage: number | null;
  ratingCount: number;
};

export type ForumPostCounts = {
  upvote: number;
  helpful: number;
  insightful: number;
  view: number;
  reply: number;
  bookmark: number;
};

export type ViewerPostState = {
  hasUpvoted: boolean;
  hasMarkedHelpful: boolean;
  hasMarkedInsightful: boolean;
  hasBookmarked: boolean;
};

export type PostListItem = {
  id: string;
  title: string;
  /** Full body. The card-view "excerpt" truncation is a presentation concern — left to the UI. */
  body: string;
  category: ForumCategory | null;
  communityId: string | null;
  communitySlug: string | null;
  communityName: string | null;
  hashtags: string[];
  isPinned: boolean;
  isTrending: boolean;
  createdAt: Date;
  author: ForumAuthorSummary;
  counts: ForumPostCounts;
  /** Null when the caller didn't pass viewerId — never guess at "not reacted". */
  viewer: ViewerPostState | null;
};

export type ReplyItem = {
  id: string;
  body: string;
  parentReplyId: string | null;
  createdAt: Date;
  author: ForumAuthorSummary;
  counts: { upvote: number; helpful: number; insightful: number };
};

export type PostDetail = PostListItem & {
  replies: ReplyItem[];
};

export type CommunityListItem = {
  id: string;
  slug: string;
  name: string;
  region: string;
  description: string;
  primaryTopic: CommunityTopic | null;
  visibility: CommunityVisibility;
  memberCount: number;
  /** Replies on published posts in this community. */
  replyCount: number;
  /** Null when not a member (or no viewerId given) — distinct from a real PENDING/REJECTED/APPROVED row. */
  viewerMembershipStatus: MembershipStatus | null;
};

export type CommunityDetail = CommunityListItem & {
  rules: string[];
  posts: PostListItem[];
};

export type LeaderboardEntry = {
  userId: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  ratingAverage: number;
  ratingCount: number;
};

export type ForumStats = {
  totalPosts: number;
  totalReplies: number;
  totalViews: number;
  /** Distinct users who have authored a published post or a reply. */
  memberCount: number;
  categoryCounts: Record<ForumCategory, number>;
};

// ---------------------------------------------------------------------------
// Internal hydration helpers (batched — no per-card N+1)
// ---------------------------------------------------------------------------

function roundToOneDecimal(value: number): number {
  return Math.round(value * 10) / 10;
}

async function hydrateAuthorExtras(authors: User[]): Promise<Map<string, ForumAuthorSummary>> {
  const uniqueAuthors = new Map(authors.map((author) => [author.id, author]));
  const ids = Array.from(uniqueAuthors.keys());
  const [postCounts, ratings] = await Promise.all([
    forumPostRepository.countGroupByAuthor(ids, "PUBLISHED"),
    authorRatingRepository.aggregateForRatedUserIds(ids),
  ]);
  const result = new Map<string, ForumAuthorSummary>();
  for (const [id, author] of uniqueAuthors) {
    const rating = ratings.get(id);
    result.set(id, {
      id: author.id,
      firstName: author.firstName,
      lastName: author.lastName,
      role: author.role,
      status: author.status,
      postCount: postCounts.get(id) ?? 0,
      ratingAverage: rating && rating.count > 0 ? roundToOneDecimal(rating.average) : null,
      ratingCount: rating?.count ?? 0,
    });
  }
  return result;
}

function toCounts(post: ForumPost): ForumPostCounts {
  return {
    upvote: post.upvoteCount,
    helpful: post.helpfulCount,
    insightful: post.insightfulCount,
    view: post.viewCount,
    reply: post.replyCount,
    bookmark: post.bookmarkCount,
  };
}

async function hydrateViewerStates(
  postIds: string[],
  viewerId: string | undefined,
): Promise<Map<string, ViewerPostState>> {
  const map = new Map<string, ViewerPostState>();
  if (!viewerId || postIds.length === 0) return map;
  const parsedViewer = idSchema.safeParse(viewerId);
  if (!parsedViewer.success) return map; // fail closed: bad viewer id => no viewer overlay, not a crash

  const [reactions, bookmarks] = await Promise.all([
    postReactionRepository.findManyByUserAndPostIds(parsedViewer.data, postIds),
    postBookmarkRepository.findManyByUserAndPostIds(parsedViewer.data, postIds),
  ]);
  const bookmarkedIds = new Set(bookmarks.map((row) => row.postId));
  for (const postId of postIds) {
    map.set(postId, {
      hasUpvoted: false,
      hasMarkedHelpful: false,
      hasMarkedInsightful: false,
      hasBookmarked: bookmarkedIds.has(postId),
    });
  }
  for (const reaction of reactions) {
    const state = map.get(reaction.postId);
    if (!state) continue;
    if (reaction.type === "UPVOTE") state.hasUpvoted = true;
    else if (reaction.type === "HELPFUL") state.hasMarkedHelpful = true;
    else if (reaction.type === "INSIGHTFUL") state.hasMarkedInsightful = true;
  }
  return map;
}

type PostRow = Awaited<ReturnType<typeof forumPostRepository.findMany>>[number];

async function toPostListItems(
  posts: PostRow[],
  viewerId: string | undefined,
): Promise<PostListItem[]> {
  if (posts.length === 0) return [];
  const [authorMap, viewerMap] = await Promise.all([
    hydrateAuthorExtras(posts.map((post) => post.author)),
    hydrateViewerStates(posts.map((post) => post.id), viewerId),
  ]);
  return posts.map((post) => {
    const author = authorMap.get(post.authorId);
    if (!author) {
      // Should be unreachable: ForumPost.author is Restrict-on-delete, so a
      // published post always has a resolvable author row.
      throw new Error(`forum.service: post ${post.id} has no resolvable author`);
    }
    return {
      id: post.id,
      title: post.title,
      body: post.body,
      category: post.category,
      communityId: post.communityId,
      communitySlug: post.community?.slug ?? null,
      communityName: post.community?.name ?? null,
      hashtags: post.hashtags,
      isPinned: post.isPinned,
      isTrending: post.isTrending,
      createdAt: post.createdAt,
      author,
      counts: toCounts(post),
      viewer: viewerMap.get(post.id) ?? null,
    };
  });
}

// ---------------------------------------------------------------------------
// Posts
// ---------------------------------------------------------------------------

export async function listPosts(opts: {
  category?: ForumCategory;
  communityId?: string;
  sort?: "recent" | "trending";
  bookmarkedBy?: string;
  viewerId?: string;
}): Promise<PostListItem[]> {
  // Fail closed on every optional filter: an unrecognized value denies rather
  // than silently widening to "no filter" (rule 3).
  if (opts.category !== undefined && !forumCategorySchema.safeParse(opts.category).success) {
    return [];
  }
  if (opts.communityId !== undefined && !idSchema.safeParse(opts.communityId).success) {
    return [];
  }
  const sortParsed = forumSortSchema.safeParse(opts.sort ?? "recent");
  const sort = sortParsed.success ? sortParsed.data : "recent";

  let postIdFilter: string[] | undefined;
  if (opts.bookmarkedBy !== undefined) {
    const parsedBookmarkedBy = idSchema.safeParse(opts.bookmarkedBy);
    if (!parsedBookmarkedBy.success) return [];
    const bookmarks = await postBookmarkRepository.findManyByUserId(parsedBookmarkedBy.data);
    postIdFilter = bookmarks.map((row) => row.postId);
    if (postIdFilter.length === 0) return [];
  }

  const where: Prisma.ForumPostWhereInput = {
    status: "PUBLISHED",
    ...(opts.category ? { category: opts.category } : {}),
    ...(opts.communityId ? { communityId: opts.communityId } : {}),
    ...(postIdFilter ? { id: { in: postIdFilter } } : {}),
  };

  const orderBy: Prisma.ForumPostOrderByWithRelationInput[] =
    sort === "trending"
      ? [{ isTrending: "desc" }, { viewCount: "desc" }, { createdAt: "desc" }]
      : [{ isPinned: "desc" }, { createdAt: "desc" }];

  const posts = await forumPostRepository.findMany(where, orderBy);
  return toPostListItems(posts, opts.viewerId);
}

export async function getPostById(id: string, viewerId?: string): Promise<PostDetail | null> {
  const parsedId = idSchema.safeParse(id);
  if (!parsedId.success) return null;

  const post = await forumPostRepository.findById(parsedId.data);
  if (!post || post.status !== "PUBLISHED") return null; // fail closed: pending/rejected never leak here

  const replies = await replyRepository.findManyByPostId(post.id);
  const [authorMap, viewerMap] = await Promise.all([
    hydrateAuthorExtras([post.author, ...replies.map((reply) => reply.author)]),
    hydrateViewerStates([post.id], viewerId),
  ]);

  const author = authorMap.get(post.authorId);
  if (!author) {
    throw new Error(`forum.service: post ${post.id} has no resolvable author`);
  }

  const replyItems: ReplyItem[] = replies.map((reply) => {
    const replyAuthor = authorMap.get(reply.authorId);
    if (!replyAuthor) {
      throw new Error(`forum.service: reply ${reply.id} has no resolvable author`);
    }
    return {
      id: reply.id,
      body: reply.body,
      parentReplyId: reply.parentReplyId,
      createdAt: reply.createdAt,
      author: replyAuthor,
      counts: {
        upvote: reply.upvoteCount,
        helpful: reply.helpfulCount,
        insightful: reply.insightfulCount,
      },
    };
  });

  return {
    id: post.id,
    title: post.title,
    body: post.body,
    category: post.category,
    communityId: post.communityId,
    communitySlug: post.community?.slug ?? null,
    communityName: post.community?.name ?? null,
    hashtags: post.hashtags,
    isPinned: post.isPinned,
    isTrending: post.isTrending,
    createdAt: post.createdAt,
    author,
    counts: toCounts(post),
    viewer: viewerMap.get(post.id) ?? null,
    replies: replyItems,
  };
}

export async function listTrendingPosts(limit: number): Promise<PostListItem[]> {
  const safeLimit = Number.isInteger(limit) && limit > 0 ? Math.min(limit, 50) : 5;
  const posts = await forumPostRepository.findMany({ status: "PUBLISHED", isTrending: true }, [
    { viewCount: "desc" },
    { createdAt: "desc" },
  ]);
  return toPostListItems(posts.slice(0, safeLimit), undefined);
}

// ---------------------------------------------------------------------------
// Communities
// ---------------------------------------------------------------------------

export async function listCommunities(viewerId?: string): Promise<CommunityListItem[]> {
  const communities = await communityRepository.findAll();
  const ids = communities.map((community) => community.id);
  const [memberCounts, replyCounts] = await Promise.all([
    communityMembershipRepository.countApprovedGroupByCommunity(ids),
    forumPostRepository.sumReplyCountGroupByCommunity("PUBLISHED", ids),
  ]);

  let viewerMemberships = new Map<string, MembershipStatus>();
  if (viewerId !== undefined) {
    const parsedViewer = idSchema.safeParse(viewerId);
    if (parsedViewer.success) {
      const rows = await communityMembershipRepository.findManyByUserAndCommunityIds(
        parsedViewer.data,
        ids,
      );
      viewerMemberships = new Map(rows.map((row) => [row.communityId, row.status]));
    }
  }

  return communities.map((community) => ({
    id: community.id,
    slug: community.slug,
    name: community.name,
    region: community.region,
    description: community.description,
    primaryTopic: community.primaryTopic,
    visibility: community.visibility,
    memberCount: memberCounts.get(community.id) ?? 0,
    replyCount: replyCounts.get(community.id) ?? 0,
    viewerMembershipStatus: viewerMemberships.get(community.id) ?? null,
  }));
}

export async function getCommunityBySlug(
  slug: string,
  viewerId?: string,
): Promise<CommunityDetail | null> {
  const parsedSlug = slugSchema.safeParse(slug);
  if (!parsedSlug.success) return null;

  const community = await communityRepository.findBySlug(parsedSlug.data);
  if (!community) return null;

  const [memberCount, posts] = await Promise.all([
    communityMembershipRepository.countApprovedByCommunityId(community.id),
    forumPostRepository.findMany({ status: "PUBLISHED", communityId: community.id }, [
      { isPinned: "desc" },
      { createdAt: "desc" },
    ]),
  ]);

  let viewerMembershipStatus: MembershipStatus | null = null;
  if (viewerId !== undefined) {
    const parsedViewer = idSchema.safeParse(viewerId);
    if (parsedViewer.success) {
      const membership = await communityMembershipRepository.findByUserAndCommunityId(
        parsedViewer.data,
        community.id,
      );
      viewerMembershipStatus = membership?.status ?? null;
    }
  }

  const postItems = await toPostListItems(posts, viewerId);
  const replyCount = postItems.reduce((total, post) => total + post.counts.reply, 0);

  return {
    id: community.id,
    slug: community.slug,
    name: community.name,
    region: community.region,
    description: community.description,
    primaryTopic: community.primaryTopic,
    visibility: community.visibility,
    memberCount,
    replyCount,
    viewerMembershipStatus,
    rules: community.rules,
    posts: postItems,
  };
}

// ---------------------------------------------------------------------------
// Leaderboard + stats
// ---------------------------------------------------------------------------

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  const ratings = await authorRatingRepository.aggregateAll();
  if (ratings.length === 0) return [];

  const users = await userRepository.findManyByIds(ratings.map((row) => row.ratedUserId));
  const userMap = new Map(users.map((user) => [user.id, user]));

  const entries: LeaderboardEntry[] = [];
  for (const row of ratings) {
    const user = userMap.get(row.ratedUserId);
    if (!user) continue; // fail closed: never surface a rating with no resolvable user
    entries.push({
      userId: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      ratingAverage: roundToOneDecimal(row.average),
      ratingCount: row.count,
    });
  }

  return entries.sort(
    (a, b) => b.ratingAverage - a.ratingAverage || b.ratingCount - a.ratingCount,
  );
}

export async function getForumStats(): Promise<ForumStats> {
  const [totalPosts, totalReplies, totalViews, postAuthorIds, replyAuthorIds, categoryCountRows] =
    await Promise.all([
      forumPostRepository.countByStatus("PUBLISHED"),
      replyRepository.countOnPostsWithStatus("PUBLISHED"),
      forumPostRepository.sumViewCount("PUBLISHED"),
      forumPostRepository.findDistinctAuthorIds("PUBLISHED"),
      replyRepository.findDistinctAuthorIds("PUBLISHED"),
      forumPostRepository.countGroupByCategory("PUBLISHED"),
    ]);
  const memberCount = new Set([...postAuthorIds, ...replyAuthorIds]).size;
  const categoryCounts: Record<ForumCategory, number> = {
    GENERAL_DISCUSSION: categoryCountRows.get("GENERAL_DISCUSSION") ?? 0,
    QA_HELP: categoryCountRows.get("QA_HELP") ?? 0,
    RESOURCES_TIPS: categoryCountRows.get("RESOURCES_TIPS") ?? 0,
    TROUBLESHOOTING: categoryCountRows.get("TROUBLESHOOTING") ?? 0,
    CAREER_JOBS: categoryCountRows.get("CAREER_JOBS") ?? 0,
    ANNOUNCEMENTS: categoryCountRows.get("ANNOUNCEMENTS") ?? 0,
  };
  return { totalPosts, totalReplies, totalViews, memberCount, categoryCounts };
}
