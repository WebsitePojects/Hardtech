import { db } from "@/server/db";
import type { Prisma, PostStatus, ForumCategory } from "@/../generated/prisma/client";

/**
 * Pure data access for ForumPost. Which statuses are visible to which caller
 * is a business rule that lives in forum.service.ts (fail-closed to
 * PUBLISHED for every non-moderator read) — this file just runs the query
 * the service asks for.
 */

const withAuthor = {
  author: true,
  community: { select: { id: true, slug: true, name: true } },
} satisfies Prisma.ForumPostInclude;

export const forumPostRepository = {
  findMany(
    where: Prisma.ForumPostWhereInput,
    orderBy: Prisma.ForumPostOrderByWithRelationInput[],
  ) {
    return db.forumPost.findMany({ where, orderBy, include: withAuthor });
  },

  findById(id: string) {
    return db.forumPost.findUnique({ where: { id }, include: withAuthor });
  },

  /** Post counts per author, scoped to one status — batched to avoid an N+1 per author. */
  async countGroupByAuthor(authorIds: string[], status: PostStatus) {
    if (authorIds.length === 0) return new Map<string, number>();
    const rows = await db.forumPost.groupBy({
      by: ["authorId"],
      where: { authorId: { in: authorIds }, status },
      _count: { _all: true },
    });
    return new Map(rows.map((row) => [row.authorId, row._count._all]));
  },

  countByStatus(status: PostStatus) {
    return db.forumPost.count({ where: { status } });
  },

  /** Post counts per category, scoped to one status. */
  async countGroupByCategory(status: PostStatus) {
    const rows = await db.forumPost.groupBy({
      by: ["category"],
      where: { status, category: { not: null } },
      _count: { _all: true },
    });
    const counts = new Map<ForumCategory, number>();
    for (const row of rows) {
      if (row.category) counts.set(row.category, row._count._all);
    }
    return counts;
  },

  /** Reply counts per community, summed from ForumPost.replyCount in one aggregate query. */
  async sumReplyCountGroupByCommunity(status: PostStatus, communityIds: string[]) {
    if (communityIds.length === 0) return new Map<string, number>();
    const rows = await db.forumPost.groupBy({
      by: ["communityId"],
      where: { status, communityId: { in: communityIds } },
      _sum: { replyCount: true },
    });
    const counts = new Map<string, number>();
    for (const row of rows) {
      if (row.communityId) counts.set(row.communityId, row._sum.replyCount ?? 0);
    }
    return counts;
  },

  async sumViewCount(status: PostStatus) {
    const result = await db.forumPost.aggregate({
      where: { status },
      _sum: { viewCount: true },
    });
    return result._sum.viewCount ?? 0;
  },

  /** Distinct post authors for a status — one half of the forum's "Members" count. */
  async findDistinctAuthorIds(status: PostStatus) {
    const rows = await db.forumPost.findMany({
      where: { status },
      select: { authorId: true },
      distinct: ["authorId"],
    });
    return rows.map((row) => row.authorId);
  },
};
