import { db } from "@/server/db";

/** Pure data access for Batch. */
export const batchRepository = {
  findById(id: string) {
    return db.batch.findUnique({ where: { id }, include: { program: true, trainer: true } });
  },

  /** A trainer's earliest-created batch — used as their "primary" batch on the Overview page. */
  findFirstByTrainerId(trainerId: string) {
    return db.batch.findFirst({
      where: { trainerId },
      include: { program: true },
      orderBy: { createdAt: "asc" },
    });
  },
};
