import { db } from "@/server/db";
import { Prisma, type EnrollmentStatus } from "@/../generated/prisma/client";

const withProgramAndBatch = {
  program: true,
  batch: { include: { trainer: true } },
} satisfies Prisma.EnrollmentInclude;

/** Pure data access for Enrollment. */
export const enrollmentRepository = {
  findByTraineeAndTrainer(traineeId: string, trainerId: string) { return db.enrollment.findFirst({ where: { traineeId, batch: { trainerId } }, orderBy: { createdAt: "desc" } }); },
  findByTraineeAndBatch(traineeId: string, batchId: string) { return db.enrollment.findFirst({ where: { traineeId, batchId } }); },
  findLatestByTraineeId(traineeId: string) { return db.enrollment.findFirst({ where: { traineeId }, orderBy: { createdAt: "desc" } }); },
  transitionByPayment(tx: Prisma.TransactionClient, paymentId: string, status: EnrollmentStatus, reason?: string) { return tx.enrollment.updateMany({ where: { paymentId, status: "PENDING_VERIFICATION" }, data: { status, rejectionReason: reason ?? null } }); },
  updateProgram(tx: Prisma.TransactionClient, enrollmentId: string, programId: string) { return tx.enrollment.updateMany({ where: { id: enrollmentId, programId: { not: programId } }, data: { programId } }); },

  /**
   * Move a trainee's progress. Only an ACTIVE enrollment advances — a
   * completed or rejected one is terminal, so the guard lives in the WHERE
   * clause rather than in a read-then-write the caller could race.
   *
   * Returns rows changed: 0 means the enrollment was not ACTIVE, or already
   * sat at exactly this percentage (an idempotent replay).
   */
  setProgress(enrollmentId: string, progressPercent: number) {
    return db.enrollment
      .updateMany({
        where: { id: enrollmentId, status: "ACTIVE", progressPercent: { not: progressPercent } },
        data: { progressPercent },
      })
      .then((result) => result.count);
  },

  /**
   * ACTIVE -> COMPLETED, inside the caller's transaction.
   *
   * Conditional on the current status so two trainers clicking "complete" at
   * the same moment cannot both win — exactly one gets count 1, and only that
   * one goes on to create the certificate request. This is the
   * state-transition half of non-negotiable rule 2.
   */
  complete(tx: Prisma.TransactionClient, enrollmentId: string) {
    return tx.enrollment
      .updateMany({
        where: { id: enrollmentId, status: "ACTIVE" },
        data: { status: "COMPLETED", progressPercent: 100 },
      })
      .then((result) => result.count);
  },

  /** The fields needed to decide whether an enrollment may be completed and
   *  to build its certificate request. */
  findForCompletion(enrollmentId: string) {
    return db.enrollment.findUnique({
      where: { id: enrollmentId },
      select: {
        id: true,
        status: true,
        progressPercent: true,
        traineeId: true,
        batch: { select: { trainerId: true } },
        certificateRequests: { select: { id: true }, take: 1 },
      },
    });
  },
  findProgramsByIds(programIds: string[]) {
    return db.program.findMany({ where: { id: { in: programIds } }, select: { id: true, priceAmount: true } });
  },

  async findOrCreateApplicant(input: { email: string; firstName: string; lastName: string; phone: string; passwordHash: string }) {
    try {
      return await db.user.create({
        data: { ...input, role: "TRAINEE", status: "PENDING" },
        select: { id: true },
      });
    } catch (error) {
      if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== "P2002") throw error;
      const existing = await db.user.findUnique({ where: { email: input.email }, select: { id: true } });
      if (!existing) throw new Error("Applicant could not be resolved.");
      return existing;
    }
  },

  findManyByTraineeId(traineeId: string) {
    return db.enrollment.findMany({
      where: { traineeId },
      include: withProgramAndBatch,
      orderBy: { createdAt: "desc" },
    });
  },

  /** Includes the linked payment so callers can read its verification status (e.g. a "Paid" badge). */
  findManyByBatchId(batchId: string) {
    return db.enrollment.findMany({
      where: { batchId },
      include: { trainee: true, payment: true },
    });
  },

  countByStatus(status: EnrollmentStatus) {
    return db.enrollment.count({ where: { status } });
  },

  countByBatchId(batchId: string) {
    return db.enrollment.count({ where: { batchId } });
  },

  /** Active-enrollment count per program — feeds the admin "Program Mix" donut. */
  async countGroupByProgram(status: EnrollmentStatus) {
    const rows = await db.enrollment.groupBy({
      by: ["programId"],
      where: { status },
      _count: { _all: true },
    });
    return rows.map((row) => ({ programId: row.programId, count: row._count._all }));
  },

  /**
   * One row per calendar month with at least one Enrollment created since
   * `since` — feeds the admin "Enrollments by Month" chart
   * (desktop-02.md #11). Prisma's `groupBy` cannot group by a truncated
   * date expression, so this is raw SQL; `since` is passed as a bound
   * parameter through Prisma's tagged-template `$queryRaw`, never
   * string-concatenated (.claude/rules/00-non-negotiables.md rule 4).
   */
  countByMonthSince(since: Date) {
    return db.$queryRaw<{ month: Date; count: number }[]>`
      SELECT date_trunc('month', "createdAt") AS month, COUNT(*)::int AS count
      FROM "Enrollment"
      WHERE "createdAt" >= ${since}
      GROUP BY 1
      ORDER BY 1
    `;
  },
};
