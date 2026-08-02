import { db } from "@/server/db";
import type { SubmissionType } from "@/../generated/prisma/client";

/** Pure data access for Assignment. No eligibility/business rules — see .claude/rules/10-architecture.md. */
export const assignmentRepository = {
  findBatchByTrainerId(trainerId: string) { return db.batch.findFirst({ where: { trainerId }, orderBy: { createdAt: "asc" } }); },
  findById(id: string) { return db.assignment.findUnique({ where: { id } }); },
  create(data: { batchId: string; trainerId: string; title: string; instructions: string; dueDate: Date; dueTime: string; allowedSubmissionTypes: SubmissionType[] }) { return db.assignment.create({ data }); },
  /** Every assignment a trainer has posted — feeds the trainer's own Assignments list (desktop-02.md #19-20). */
  findManyByTrainerId(trainerId: string) {
    return db.assignment.findMany({
      where: { trainerId },
      orderBy: { dueDate: "asc" },
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
    });
  },
};
