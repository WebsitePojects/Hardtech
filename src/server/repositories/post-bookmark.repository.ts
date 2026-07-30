import { db } from "@/server/db";

/** Pure data access for PostBookmark. See post-reaction.repository.ts's header note on scope. */
export const postBookmarkRepository = {
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
};
