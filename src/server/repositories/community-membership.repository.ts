import { db } from "@/server/db";

/** Pure data access for CommunityMembership. */
export const communityMembershipRepository = {
  /** APPROVED member counts per community, across a batch of community ids — avoids an N+1. */
  async countApprovedGroupByCommunity(communityIds: string[]) {
    if (communityIds.length === 0) return new Map<string, number>();
    const rows = await db.communityMembership.groupBy({
      by: ["communityId"],
      where: { communityId: { in: communityIds }, status: "APPROVED" },
      _count: { _all: true },
    });
    return new Map(rows.map((row) => [row.communityId, row._count._all]));
  },

  countApprovedByCommunityId(communityId: string) {
    return db.communityMembership.count({
      where: { communityId, status: "APPROVED" },
    });
  },

  /** This viewer's membership row for a batch of communities, so the UI can render
   * Join / Pending / Member without an N+1. */
  findManyByUserAndCommunityIds(userId: string, communityIds: string[]) {
    if (communityIds.length === 0) return Promise.resolve([]);
    return db.communityMembership.findMany({
      where: { userId, communityId: { in: communityIds } },
      select: { communityId: true, status: true, role: true },
    });
  },

  findByUserAndCommunityId(userId: string, communityId: string) {
    return db.communityMembership.findUnique({
      where: { communityId_userId: { communityId, userId } },
    });
  },
};
