import { db } from "@/server/db";
import type { Prisma } from "@/../generated/prisma/client";

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

  unassignTrainee(tx: Prisma.TransactionClient, enrollmentId: string, batchId: string) {
    return tx.enrollment.updateMany({ where: { id: enrollmentId, batchId }, data: { batchId: null } });
  },
};
