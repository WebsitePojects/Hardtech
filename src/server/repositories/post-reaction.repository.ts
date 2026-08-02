import { db } from "@/server/db";
import type { Prisma, ReactionType } from "@/../generated/prisma/client";

/**
 * Pure data access for PostReaction. The compound-unique
 * (postId, userId, type) constraint is what makes the toggle idempotent —
 * see .claude/rules/00-non-negotiables.md rule 2. Mutations belong to
 * whichever service ends up owning the vote toggle (not built this wave);
 * this file only serves the reads forum.service.ts needs to show the
 * viewer's own reaction state without an N+1.
 */
export const postReactionRepository = {
  toggle(
    data: { postId: string; userId: string; type: ReactionType },
    client: Prisma.TransactionClient = db,
  ) {
    return client.$queryRaw<{ inserted: number; deleted: number }[]>`
      WITH existing AS MATERIALIZED (
        SELECT "id" FROM "PostReaction"
        WHERE "postId" = ${data.postId} AND "userId" = ${data.userId} AND "type" = ${data.type}::"ReactionType"
      ), inserted AS (
        INSERT INTO "PostReaction" ("id", "postId", "userId", "type", "createdAt")
        VALUES (gen_random_uuid()::text, ${data.postId}, ${data.userId}, ${data.type}::"ReactionType", NOW())
        ON CONFLICT ("postId", "userId", "type") DO NOTHING RETURNING "id"
      ), deleted AS (
        DELETE FROM "PostReaction" WHERE "id" IN (SELECT "id" FROM existing) RETURNING "id"
      )
      SELECT (SELECT count(*)::int FROM inserted) AS inserted,
             (SELECT count(*)::int FROM deleted) AS deleted
    `;
  },
  /** One row per (postId, type) the given user has reacted to, across a batch of posts. */
  findManyByUserAndPostIds(userId: string, postIds: string[]) {
    if (postIds.length === 0) return Promise.resolve([]);
    return db.postReaction.findMany({
      where: { userId, postId: { in: postIds } },
      select: { postId: true, type: true },
    });
  },

  findManyByUserAndPostId(userId: string, postId: string) {
    return db.postReaction.findMany({
      where: { userId, postId },
      select: { type: true },
    });
  },

  createMany(
    rows: { postId: string; userId: string; type: ReactionType }[],
  ) {
    return db.postReaction.createMany({ data: rows, skipDuplicates: true });
  },

  create(data: Prisma.PostReactionUncheckedCreateInput, client: Prisma.TransactionClient = db) {
    return client.postReaction.create({ data });
  },

  delete(userId: string, postId: string, type: ReactionType, client: Prisma.TransactionClient = db, createdBefore?: Date) {
    return client.postReaction.deleteMany({ where: { userId, postId, type, ...(createdBefore ? { createdAt: { lte: createdBefore } } : {}) } });
  },
};
