import { db } from "@/server/db";

/** Pure data access for Testimonial. */
export const testimonialRepository = {
  findAllOrdered() {
    return db.testimonial.findMany({ orderBy: { sortOrder: "asc" } });
  },
};
