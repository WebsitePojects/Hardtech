import { db } from "@/server/db";

/** Pure data access for Community. */
export const communityRepository = {
  findAll() {
    return db.community.findMany({ orderBy: { name: "asc" } });
  },

  findBySlug(slug: string) {
    return db.community.findUnique({ where: { slug } });
  },

  findById(id: string) {
    return db.community.findUnique({ where: { id } });
  },
  createRequest(data: { requesterId: string; name: string; region: string; description: string; idempotencyKey: string }) {
    return db.communityRequest.create({ data });
  },
  findRequestByIdempotencyKey(idempotencyKey: string) {
    return db.communityRequest.findUnique({ where: { idempotencyKey } });
  },
  findRequestByRequesterAndName(requesterId: string, name: string, region: string) {
    return db.communityRequest.findUnique({ where: { requesterId_name_region: { requesterId, name, region } } });
  },
  transitionRequest(id: string, expected: "PENDING", next: "APPROVED" | "REJECTED", reviewerId: string, rejectionReason: string | null) {
    return db.communityRequest.updateMany({ where: { id, status: expected }, data: { status: next, reviewedAt: new Date(), reviewedById: reviewerId, rejectionReason } });
  },
};
