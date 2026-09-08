import { db } from "@/server/db";
import { createHash } from "node:crypto";
import type { Prisma, PostStatus, ReactionType } from "@/../generated/prisma/client";

/** Pure data access for Reply. */
export const replyRepository = {
  findManyByPostId(postId: string) {
    return db.reply.findMany({
      where: { postId },
      include: { author: true },
      orderBy: { createdAt: "asc" },
    });
  },

  /** Total replies attached to posts in a given status — used for forum-wide stats. */
  countOnPostsWithStatus(status: PostStatus) {
    return db.reply.count({ where: { post: { status } } });
  },

  /** Distinct reply authors for a status — the other half of the forum's "Members" count. */
  async findDistinctAuthorIds(status: PostStatus) {
    const rows = await db.reply.findMany({
      where: { post: { status } },
      select: { authorId: true },
      distinct: ["authorId"],
    });
    return rows.map((row) => row.authorId);
  },

  createMany(data: Prisma.ReplyCreateManyInput[]) {
    return db.reply.createMany({ data });
  },

  create(data: Prisma.ReplyUncheckedCreateInput, client: Prisma.TransactionClient = db) {
    return client.reply.create({ data });
  },

  findByIdempotencyKey(idempotencyKey: string, client: Prisma.TransactionClient = db) {
    return client.reply.findUnique({ where: { idempotencyKey } });
  },

  findById(id: string, client: Prisma.TransactionClient = db) {
    return client.reply.findUnique({ where: { id } });
  },

  incrementCounter(
    id: string,
    counter: "upvoteCount" | "helpfulCount" | "insightfulCount",
    delta: 1 | -1,
    client: Prisma.TransactionClient = db,
  ) {
    return client.reply.update({ where: { id }, data: { [counter]: { increment: delta } } });
  },

  createReaction(
    data: Prisma.ReplyReactionUncheckedCreateInput,
    client: Prisma.TransactionClient = db,
  ) {
    return client.replyReaction.create({ data });
  },

  async toggleReaction(
    data: { replyId: string; userId: string; type: ReactionType; idempotencyKey?: string },
    client: Prisma.TransactionClient = db,
  ) {
    if (data.idempotencyKey) {
      const intentId = `idem_${createHash("sha256").update(`reply-reaction:${data.userId}:${data.idempotencyKey}`).digest("hex")}`;
      return client.$queryRaw<{ inserted: number; deleted: number }[]>`
        WITH existing AS MATERIALIZED (
          SELECT "id" FROM "ReplyReaction"
          WHERE "replyId" = ${data.replyId} AND "userId" = ${data.userId} AND "type" = ${data.type}::"ReactionType"
        ), inserted AS (
          INSERT INTO "ReplyReaction" ("id", "replyId", "userId", "type", "createdAt")
          SELECT ${intentId}, ${data.replyId}, ${data.userId}, ${data.type}::"ReactionType", NOW()
          WHERE NOT EXISTS (SELECT 1 FROM existing)
          ON CONFLICT ("replyId", "userId", "type") DO NOTHING
          RETURNING "id"
        ), deleted AS (
          DELETE FROM "ReplyReaction"
          WHERE "id" IN (SELECT "id" FROM existing) AND "id" <> ${intentId}
          RETURNING "id"
        )
        SELECT (SELECT count(*)::int FROM inserted) AS inserted,
               (SELECT count(*)::int FROM deleted) AS deleted
      `;
    }
    return client.$queryRaw<{ inserted: number; deleted: number }[]>`
      WITH existing AS MATERIALIZED (
        SELECT "id" FROM "ReplyReaction"
        WHERE "replyId" = ${data.replyId} AND "userId" = ${data.userId} AND "type" = ${data.type}::"ReactionType"
      ), inserted AS (
        INSERT INTO "ReplyReaction" ("id", "replyId", "userId", "type", "createdAt")
        VALUES (gen_random_uuid()::text, ${data.replyId}, ${data.userId}, ${data.type}::"ReactionType", NOW())
        ON CONFLICT ("replyId", "userId", "type") DO NOTHING RETURNING "id"
      ), deleted AS (
        DELETE FROM "ReplyReaction" WHERE "id" IN (SELECT "id" FROM existing) RETURNING "id"
      )
      SELECT (SELECT count(*)::int FROM inserted) AS inserted,
             (SELECT count(*)::int FROM deleted) AS deleted
    `;
  },

  deleteReaction(
    userId: string,
    replyId: string,
    type: ReactionType,
    client: Prisma.TransactionClient = db,
    createdBefore?: Date,
  ) {
    return client.replyReaction.deleteMany({ where: { userId, replyId, type, ...(createdBefore ? { createdAt: { lte: createdBefore } } : {}) } });
  },
};
