import { db } from "@/server/db";
import type { Prisma, PostStatus } from "@/../generated/prisma/client";

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
};
