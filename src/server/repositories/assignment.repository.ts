import { db } from "@/server/db";
import type { Prisma, SubmissionType } from "@/../generated/prisma/client";

const DASHBOARD_LIST_LIMIT = 100;

/** Pure data access for Assignment. No eligibility/business rules — see .claude/rules/10-architecture.md. */
export const assignmentRepository = {
  /** Holds the batch row through the assignment insert so it cannot change
   * hands after authorization but before the write. */
  findAndLockBatchByIdAndTrainerId(tx: Prisma.TransactionClient, batchId: string, trainerId: string) {
    return tx.$queryRaw<{ id: string }[]>`
      SELECT id FROM "Batch"
      WHERE id = ${batchId} AND "trainerId" = ${trainerId}
      FOR UPDATE
    `;
  },
  findById(id: string) { return db.assignment.findUnique({ where: { id } }); },
  create(tx: Prisma.TransactionClient, data: { batchId: string; trainerId: string; title: string; instructions: string; dueDate: Date; dueTime: string; allowedSubmissionTypes: SubmissionType[]; idempotencyKey: string }) { return tx.assignment.create({ data }); },
  findByIdempotencyKey(idempotencyKey: string) { return db.assignment.findUnique({ where: { idempotencyKey } }); },
  /** Every assignment a trainer has posted — feeds the trainer's own Assignments list (desktop-02.md #19-20). */
  findManyByTrainerId(trainerId: string) {
    return db.assignment.findMany({
      where: { trainerId },
      orderBy: { dueDate: "asc" },
      take: DASHBOARD_LIST_LIMIT,
    });
  },

  /**
   * Assignments posted to any of the given batches — feeds a trainee's own
   * Assignments list (desktop-02.md #24), scoped by the service layer to
   * the batch(es) the viewer is actually enrolled in.
   */
  findManyByBatchIds(batchIds: string[]) {
    if (batchIds.length === 0) return Promise.resolve([]);
    return db.assignment.findMany({
      where: { batchId: { in: batchIds } },
      orderBy: { dueDate: "asc" },
      take: DASHBOARD_LIST_LIMIT,
    });
  },
};
