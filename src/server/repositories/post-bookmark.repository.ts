import { db } from "@/server/db";
import { createHash } from "node:crypto";
import type { Prisma } from "@/../generated/prisma/client";

/** Pure data access for PostBookmark. See post-reaction.repository.ts's header note on scope. */
export const postBookmarkRepository = {
  async toggle(data: { postId: string; userId: string; idempotencyKey?: string }, client: Prisma.TransactionClient = db) {
    if (data.idempotencyKey) {
      const intentId = `idem_${createHash("sha256").update(`post-bookmark:${data.userId}:${data.idempotencyKey}`).digest("hex")}`;
      return client.$queryRaw<{ inserted: number; deleted: number }[]>`
        WITH existing AS MATERIALIZED (
          SELECT "id" FROM "PostBookmark"
          WHERE "userId" = ${data.userId} AND "postId" = ${data.postId}
        ), inserted AS (
          INSERT INTO "PostBookmark" ("id", "userId", "postId", "createdAt")
          SELECT ${intentId}, ${data.userId}, ${data.postId}, NOW()
          WHERE NOT EXISTS (SELECT 1 FROM existing)
          ON CONFLICT ("userId", "postId") DO NOTHING
          RETURNING "id"
        ), deleted AS (
          DELETE FROM "PostBookmark"
          WHERE "id" IN (SELECT "id" FROM existing) AND "id" <> ${intentId}
          RETURNING "id"
        )
        SELECT (SELECT count(*)::int FROM inserted) AS inserted,
               (SELECT count(*)::int FROM deleted) AS deleted
      `;
    }
    return client.$queryRaw<{ inserted: number; deleted: number }[]>`
      WITH existing AS MATERIALIZED (
        SELECT "id" FROM "PostBookmark"
        WHERE "userId" = ${data.userId} AND "postId" = ${data.postId}
      ), inserted AS (
        INSERT INTO "PostBookmark" ("id", "userId", "postId", "createdAt")
        VALUES (gen_random_uuid()::text, ${data.userId}, ${data.postId}, NOW())
        ON CONFLICT ("userId", "postId") DO NOTHING RETURNING "id"
      ), deleted AS (
        DELETE FROM "PostBookmark" WHERE "id" IN (SELECT "id" FROM existing) RETURNING "id"
      )
      SELECT (SELECT count(*)::int FROM inserted) AS inserted,
             (SELECT count(*)::int FROM deleted) AS deleted
    `;
  },
  findManyByUserId(userId: string) {
    return db.postBookmark.findMany({
      where: { userId },
      select: { postId: true },
      orderBy: { createdAt: "desc" },
    });
  },

  /** Which of a batch of posts the given user has bookmarked — avoids an N+1. */
  findManyByUserAndPostIds(userId: string, postIds: string[]) {
    if (postIds.length === 0) return Promise.resolve([]);
    return db.postBookmark.findMany({
      where: { userId, postId: { in: postIds } },
      select: { postId: true },
    });
  },

  create(data: Prisma.PostBookmarkUncheckedCreateInput, client: Prisma.TransactionClient = db) {
    return client.postBookmark.create({ data });
  },

  delete(userId: string, postId: string, client: Prisma.TransactionClient = db, createdBefore?: Date) {
    return client.postBookmark.deleteMany({ where: { userId, postId, ...(createdBefore ? { createdAt: { lte: createdBefore } } : {}) } });
  },
};
