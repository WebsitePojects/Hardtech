import { db } from "@/server/db";
import type { Prisma } from "@/../generated/prisma/client";

/** Pure data access for AuthorRating. */
export const authorRatingRepository = {
  upsert(tx: Prisma.TransactionClient, ratedUserId: string, raterUserId: string, stars: number) { return tx.authorRating.upsert({ where: { ratedUserId_raterUserId: { ratedUserId, raterUserId } }, create: { ratedUserId, raterUserId, stars }, update: { stars } }); },
  /** Average stars + review count per rated user, across a batch of user ids. */
  async aggregateForRatedUserIds(ratedUserIds: string[]) {
    if (ratedUserIds.length === 0) return new Map<string, { average: number; count: number }>();
    const rows = await db.authorRating.groupBy({
      by: ["ratedUserId"],
      where: { ratedUserId: { in: ratedUserIds } },
      _avg: { stars: true },
      _count: { _all: true },
    });
    return new Map(
      rows.map((row) => [
        row.ratedUserId,
        { average: row._avg.stars ?? 0, count: row._count._all },
      ]),
    );
  },

  /** Every rated user's average + count, for the leaderboard — no id list needed. */
  async aggregateAll() {
    const rows = await db.authorRating.groupBy({
      by: ["ratedUserId"],
      _avg: { stars: true },
      _count: { _all: true },
    });
    return rows.map((row) => ({
      ratedUserId: row.ratedUserId,
      average: row._avg.stars ?? 0,
      count: row._count._all,
    }));
  },

  findByRatedAndRater(ratedUserId: string, raterUserId: string) {
    return db.authorRating.findUnique({
      where: { ratedUserId_raterUserId: { ratedUserId, raterUserId } },
    });
  },
};
