import { db } from "@/server/db";
import type { ReactionType } from "@/../generated/prisma/client";

/**
 * Pure data access for PostReaction. The compound-unique
 * (postId, userId, type) constraint is what makes the toggle idempotent —
 * see .claude/rules/00-non-negotiables.md rule 2. Mutations belong to
 * whichever service ends up owning the vote toggle (not built this wave);
 * this file only serves the reads forum.service.ts needs to show the
 * viewer's own reaction state without an N+1.
 */
export const postReactionRepository = {
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
};
