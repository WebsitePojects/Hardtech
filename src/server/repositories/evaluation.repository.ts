import { db } from "@/server/db";

/** Pure data access for Evaluation. */
export const evaluationRepository = {
  /** Active (non-revoked) evaluations a trainer has given — feeds the trainer Overview stat. */
  countActiveByTrainerId(trainerId: string) {
    return db.evaluation.count({ where: { trainerId, revokedAt: null } });
  },

  findActiveByEnrollmentId(enrollmentId: string) {
    return db.evaluation.findFirst({
      where: { enrollmentId, revokedAt: null },
      orderBy: { evaluatedAt: "desc" },
    });
  },

  /**
   * Active (non-revoked) evaluations across several enrollments in one
   * query — feeds a trainer's own trainee-roster "Trained" badge
   * (desktop-02.md #16) without a per-trainee follow-up read.
   */
  findManyActiveByEnrollmentIds(enrollmentIds: string[]) {
    if (enrollmentIds.length === 0) return Promise.resolve([]);
    return db.evaluation.findMany({
      where: { enrollmentId: { in: enrollmentIds }, revokedAt: null },
    });
  },
};
