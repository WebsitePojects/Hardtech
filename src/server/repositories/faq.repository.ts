import { db } from "@/server/db";

/** Pure data access for Faq. */
export const faqRepository = {
  findAllOrdered() {
    return db.faq.findMany({ orderBy: { sortOrder: "asc" } });
  },
};
