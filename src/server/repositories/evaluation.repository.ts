import { db } from "@/server/db";
import type { EvaluationRating, Prisma } from "@/../generated/prisma/client";

type EvaluationReadClient = Prisma.TransactionClient | typeof db;

/** Pure data access for Evaluation. */
export const evaluationRepository = {
  /**
   * Serializes every evaluation mutation for one enrollment. A row lock on
   * the enrollment exists even before its first Evaluation is created, so two
   * first-time writes cannot both observe an empty active set.
   */
  findAndLockAssignedEnrollment(
    tx: Prisma.TransactionClient,
    traineeId: string,
    trainerId: string,
  ) {
    return tx.$queryRaw<{ id: string }[]>`
      SELECT e.id
      FROM "Enrollment" e
      JOIN "Batch" b ON b.id = e."batchId"
      WHERE e."traineeId" = ${traineeId}
        AND b."trainerId" = ${trainerId}
      ORDER BY e."createdAt" DESC
      LIMIT 1
      FOR UPDATE OF e
    `;
  },
  findIntentByKey(client: EvaluationReadClient, idempotencyKey: string) {
    return client.evaluationIntent.findUnique({ where: { idempotencyKey } });
  },
  createIntent(
    tx: Prisma.TransactionClient,
    data: { idempotencyKey: string; enrollmentId: string; trainerId: string; fingerprint: string },
  ) {
    return tx.evaluationIntent.create({ data });
  },
  attachIntentToEvaluation(tx: Prisma.TransactionClient, intentId: string, evaluationId: string) {
    return tx.evaluationIntent.update({ where: { id: intentId }, data: { evaluationId } });
  },
  findActiveAndLock(tx: Prisma.TransactionClient, enrollmentId: string, trainerId: string) {
    return tx.$queryRaw<{ id: string }[]>`
      SELECT id FROM "Evaluation"
      WHERE "enrollmentId" = ${enrollmentId}
        AND "trainerId" = ${trainerId}
        AND "revokedAt" IS NULL
      FOR UPDATE
    `;
  },
  updateActive(tx: Prisma.TransactionClient, id: string, rating: EvaluationRating, skillArea: string, notes: string) {
    return tx.evaluation.update({ where: { id }, data: { rating, skillArea, notes, evaluatedAt: new Date() } });
  },
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
