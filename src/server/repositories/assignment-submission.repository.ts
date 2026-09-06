import { db } from "@/server/db";
import type { Prisma } from "@/../generated/prisma/client";

export type LockedEligibleAssignment = {
  id: string;
  allowedSubmissionTypes: string[];
};

/** Pure data access for AssignmentSubmission. */
export const assignmentSubmissionRepository = {
  /**
   * Locks the assignment while proving an ACTIVE enrollment in its batch.
   * Serializing writes per assignment gives same-intent replays a stable
   * winner and ensures a fresh re-submission cannot interleave midway through
   * replacing the prior asset.
   */
  findAndLockEligibleAssignment(
    tx: Prisma.TransactionClient,
    assignmentId: string,
    traineeId: string,
  ) {
    return tx.$queryRaw<LockedEligibleAssignment[]>`
      SELECT a.id, a."allowedSubmissionTypes"
      FROM "Assignment" a
      WHERE a.id = ${assignmentId}
        AND EXISTS (
          SELECT 1
          FROM "Enrollment" e
          WHERE e."batchId" = a."batchId"
            AND e."traineeId" = ${traineeId}
            AND e.status = 'ACTIVE'
        )
      FOR UPDATE
    `;
  },

  findByIdempotencyKey(tx: Prisma.TransactionClient, idempotencyKey: string) {
    return tx.assignmentSubmission.findUnique({ where: { idempotencyKey } });
  },

  findByAssignmentAndTrainee(
    tx: Prisma.TransactionClient,
    assignmentId: string,
    traineeId: string,
  ) {
    return tx.assignmentSubmission.findUnique({
      where: { assignmentId_traineeId: { assignmentId, traineeId } },
    });
  },

  create(
    tx: Prisma.TransactionClient,
    data: { assignmentId: string; traineeId: string; idempotencyKey: string; submissionLink: string },
  ) {
    return tx.assignmentSubmission.create({ data });
  },

  replaceForNewIntent(
    tx: Prisma.TransactionClient,
    id: string,
    idempotencyKey: string,
    submissionLink: string,
  ) {
    return tx.assignmentSubmission.update({
      where: { id },
      data: { idempotencyKey, submissionLink, submittedAt: new Date() },
    });
  },
  /**
   * One trainee's own submissions across several assignments, in one query
   * — feeds "Assignments" (desktop-02.md #24), where each assignment card
   * needs to know whether *this* trainee has already submitted.
   */
  findManyByTraineeIdAndAssignmentIds(traineeId: string, assignmentIds: string[]) {
    if (assignmentIds.length === 0) return Promise.resolve([]);
    return db.assignmentSubmission.findMany({
      where: { traineeId, assignmentId: { in: assignmentIds } },
      include: {
        mediaAsset: {
          select: { url: true, resourceType: true, purgeState: true },
        },
      },
    });
  },
};
