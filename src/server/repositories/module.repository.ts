import { db } from "@/server/db";
import type { ModuleFileType, Prisma } from "@/../generated/prisma/client";

/** Pure data access for Module. */
export const moduleRepository = {
  /** Locks a trainer-owned batch and returns its program context. */
  findAndLockBatchByIdAndTrainerId(tx: Prisma.TransactionClient, batchId: string, trainerId: string) {
    return tx.$queryRaw<{ id: string; programId: string }[]>`
      SELECT id, "programId" FROM "Batch"
      WHERE id = ${batchId} AND "trainerId" = ${trainerId}
      FOR UPDATE
    `;
  },

  create(tx: Prisma.TransactionClient, data: {
    programId: string; trainerId: string; title: string; fileType: ModuleFileType;
    unitNumber: number; fileUrl: string; fileSizeBytes: number;
  }) {
    return tx.module.create({ data });
  },

  countByTrainerId(trainerId: string) {
    return db.module.count({ where: { trainerId } });
  },

  countByProgramId(programId: string) {
    return db.module.count({ where: { programId } });
  },

  findManyByProgramId(programId: string) {
    return db.module.findMany({
      where: { programId },
      include: {
        mediaAsset: { select: { url: true, purgeState: true } },
      },
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
