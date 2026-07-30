import { db } from "@/server/db";

/** Pure data access for AssignmentSubmission. */
export const assignmentSubmissionRepository = {
  /**
   * One trainee's own submissions across several assignments, in one query
   * — feeds "Assignments" (desktop-02.md #24), where each assignment card
   * needs to know whether *this* trainee has already submitted.
   */
  findManyByTraineeIdAndAssignmentIds(traineeId: string, assignmentIds: string[]) {
    if (assignmentIds.length === 0) return Promise.resolve([]);
    return db.assignmentSubmission.findMany({
      where: { traineeId, assignmentId: { in: assignmentIds } },
    });
  },
};
