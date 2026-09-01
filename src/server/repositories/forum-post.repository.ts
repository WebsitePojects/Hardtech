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
  async currentTimestamp() {
    const rows = await db.$queryRaw<{ now: Date }[]>`SELECT clock_timestamp() AS now`;
    return rows[0]?.now ?? new Date();
  },
  transaction<T>(callback: (client: Prisma.TransactionClient) => Promise<T>) {
    return db.$transaction(callback);
  },
  findMany(
    where: Prisma.ForumPostWhereInput,
    orderBy: Prisma.ForumPostOrderByWithRelationInput[],
  ) {
    return db.forumPost.findMany({ where, orderBy, include: withAuthor });
  },

  findById(id: string) {
    return db.forumPost.findUnique({ where: { id }, include: withAuthor });
  },

  findByIdempotencyKey(idempotencyKey: string, client: Prisma.TransactionClient = db) {
    return client.forumPost.findUnique({ where: { idempotencyKey }, include: withAuthor });
  },

  create(data: Prisma.ForumPostUncheckedCreateInput, client: Prisma.TransactionClient = db) {
    return client.forumPost.create({ data });
  },

  updatePendingToPublished(
    id: string,
    moderatorId: string,
    client: Prisma.TransactionClient = db,
  ) {
    return client.forumPost.updateMany({
      where: { id, status: "PENDING_APPROVAL" },
      data: { status: "PUBLISHED", approvedAt: new Date(), approvedByUserId: moderatorId },
    });
  },

  updatePendingToRejected(id: string, client: Prisma.TransactionClient = db) {
    return client.forumPost.updateMany({
      where: { id, status: "PENDING_APPROVAL" },
      data: { status: "REJECTED" },
    });
  },

  findPendingWithAuthor() {
    return db.forumPost.findMany({
      where: { status: "PENDING_APPROVAL" },
      include: { author: true },
      orderBy: { createdAt: "asc" },
    });
  },

  incrementCounter(
    id: string,
    counter: "upvoteCount" | "helpfulCount" | "insightfulCount" | "bookmarkCount" | "reportCount" | "replyCount",
    delta: 1 | -1,
    client: Prisma.TransactionClient = db,
  ) {
    return client.forumPost.update({ where: { id }, data: { [counter]: { increment: delta } } });
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

  /**
   * Most-replied posts for one status, id/title/replyCount only — the right
   * rail "top questions" module never needs the body. Covered by the
   * existing @@index([replyCount]); `limit` is clamped by the caller
   * (forum.service.ts) before it reaches here.
   */
  findTopByReplyCount(status: PostStatus, limit: number) {
    return db.forumPost.findMany({
      where: { status },
      orderBy: { replyCount: "desc" },
      take: limit,
      select: { id: true, title: true, replyCount: true },
    });
  },

  /**
   * Hashtag usage counts across posts of one status created since `since`,
   * most-used first. `String[]` columns can't be unnested through Prisma's
   * query builder, so this is raw SQL — parameterized via tagged-template
   * interpolation only (.claude/rules/50-database.md), never string
   * concatenation. Filters on (status, createdAt), served by the compound
   * index added in migration 20260831120000_forum_post_status_created_at_index.
   */
  async groupHashtagsSince(status: PostStatus, since: Date, limit: number) {
    // COUNT(*)::int rather than the default int8/bigint: Postgres' bigint
    // return type serializes inconsistently across driver adapters (some
    // hand back a JS `bigint`, some a numeric string), and a hashtag's post
    // count on this table can never realistically exceed the int4 range, so
    // casting in SQL sidesteps the ambiguity entirely rather than coercing
    // an untyped value after the fact.
    return db.$queryRaw<{ tag: string; postCount: number }[]>`
      SELECT tag, COUNT(*)::int AS "postCount"
      FROM "ForumPost", unnest("hashtags") AS tag
      WHERE "status" = ${status}::"PostStatus"
        AND "createdAt" >= ${since}
      GROUP BY tag
      ORDER BY "postCount" DESC
      LIMIT ${limit}
    `;
  },
};
