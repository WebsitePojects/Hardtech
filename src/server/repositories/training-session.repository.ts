import { db } from "@/server/db";
import type { Prisma, SessionType } from "@/../generated/prisma/client";

/** Pure data access for TrainingSession. */
export const trainingSessionRepository = {
  /** Locks the batch that authorizes a session publish. The ownership test is
   * evaluated while locked so a concurrent handoff cannot slip between the
   * check and the insert. */
  findAndLockBatchByIdAndTrainerId(tx: Prisma.TransactionClient, batchId: string, trainerId: string) {
    return tx.$queryRaw<{ id: string }[]>`
      SELECT id FROM "Batch"
      WHERE id = ${batchId} AND "trainerId" = ${trainerId}
      FOR UPDATE
    `;
  },

  create(tx: Prisma.TransactionClient, data: {
    batchId: string; trainerId: string; title: string; sessionType: SessionType;
    sessionDate: Date; startTime: string; location: string | null;
  }) {
    return tx.trainingSession.create({ data });
  },
  findUpcomingByTrainerId(trainerId: string, from: Date) {
    return db.trainingSession.findMany({
      where: { trainerId, sessionDate: { gte: from } },
      orderBy: [{ sessionDate: "asc" }, { startTime: "asc" }],
    });
  },

  findUpcomingByBatchId(batchId: string, from: Date) {
    return db.trainingSession.findMany({
      where: { batchId, sessionDate: { gte: from } },
      orderBy: [{ sessionDate: "asc" }, { startTime: "asc" }],
    });
  },

  countUpcomingByTrainerId(trainerId: string, from: Date) {
    return db.trainingSession.count({ where: { trainerId, sessionDate: { gte: from } } });
  },

  countUpcomingByBatchId(batchId: string, from: Date) {
    return db.trainingSession.count({ where: { batchId, sessionDate: { gte: from } } });
  },

  /** Every session for a trainer, past and future — feeds the trainer's own Calendar view (desktop-02.md #15). */
  findManyByTrainerId(trainerId: string) {
    return db.trainingSession.findMany({
      where: { trainerId },
      orderBy: [{ sessionDate: "asc" }, { startTime: "asc" }],
    });
  },
};
