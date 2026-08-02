import { db } from "@/server/db";
import type { EvaluationRating, Prisma } from "@/../generated/prisma/client";

/** Pure data access for Evaluation. */
export const evaluationRepository = {
  updateActive(tx: Prisma.TransactionClient, enrollmentId: string, trainerId: string, rating: EvaluationRating, skillArea: string, notes: string) { return tx.evaluation.updateMany({ where: { enrollmentId, trainerId, revokedAt: null }, data: { rating, skillArea, notes, evaluatedAt: new Date() } }).then((result) => result.count); },
  create(tx: Prisma.TransactionClient, enrollmentId: string, trainerId: string, rating: EvaluationRating, skillArea: string, notes: string) { return tx.evaluation.create({ data: { enrollmentId, trainerId, rating, skillArea, notes } }); },
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
