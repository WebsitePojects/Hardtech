import { db } from "@/server/db";

/** Pure data access for Module. */
export const moduleRepository = {
  countByTrainerId(trainerId: string) {
    return db.module.count({ where: { trainerId } });
  },

  countByProgramId(programId: string) {
    return db.module.count({ where: { programId } });
  },

  findManyByProgramId(programId: string) {
    return db.module.findMany({
      where: { programId },
      orderBy: [{ unitNumber: "asc" }, { createdAt: "asc" }],
    });
  },

  /** Every module a trainer has uploaded — feeds the trainer's own Modules list (desktop-02.md #21). */
  findManyByTrainerId(trainerId: string) {
    return db.module.findMany({
      where: { trainerId },
      orderBy: [{ unitNumber: "asc" }, { createdAt: "asc" }],
    });
  },
};
