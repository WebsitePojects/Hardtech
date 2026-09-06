import { db } from "@/server/db";
import type { Prisma } from "@/../generated/prisma/client";

const DASHBOARD_LIST_LIMIT = 100;

/** Pure data access for Batch. */
export const batchRepository = {
  findById(id: string) {
    return db.batch.findUnique({
      where: { id },
      select: { id: true, programId: true, code: true },
    });
  },

  /** A trainer's earliest-created batch — used as their "primary" batch on the Overview page. */
  findFirstByTrainerId(trainerId: string) {
    return db.batch.findFirst({
      where: { trainerId },
      select: { id: true, code: true, program: { select: { shortName: true } } },
      orderBy: { createdAt: "asc" },
    });
  },

  findManyByTrainerId(trainerId: string) {
    return db.batch.findMany({
      where: { trainerId },
      select: { id: true, code: true, program: { select: { shortName: true } } },
      orderBy: { createdAt: "asc" },
      take: DASHBOARD_LIST_LIMIT,
    });
  },

  findManyWithProgramAndTrainer() {
    return db.batch.findMany({
      select: {
        id: true,
        programId: true,
        code: true,
        trainer: { select: { firstName: true, lastName: true } },
      },
      orderBy: { createdAt: "asc" },
      take: DASHBOARD_LIST_LIMIT,
    });
  },

  assignActiveEnrollment(tx: Prisma.TransactionClient, enrollmentId: string, batchId: string, programId: string) {
    return tx.enrollment.updateMany({
      where: { id: enrollmentId, status: "ACTIVE", batchId: null, programId },
      data: { batchId },
    });
  },

  unassignTrainee(tx: Prisma.TransactionClient, enrollmentId: string, batchId: string) {
    return tx.enrollment.updateMany({ where: { id: enrollmentId, batchId }, data: { batchId: null } });
  },
};
