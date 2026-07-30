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
};
