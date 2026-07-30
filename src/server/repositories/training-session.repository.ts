import { db } from "@/server/db";

/** Pure data access for TrainingSession. */
export const trainingSessionRepository = {
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
