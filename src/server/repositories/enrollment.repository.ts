import { db } from "@/server/db";
import { Prisma, type EnrollmentStatus } from "@/../generated/prisma/client";

const DASHBOARD_LIST_LIMIT = 100;

const traineeDashboardEnrollmentSelect = {
  id: true,
  programId: true,
  batchId: true,
  status: true,
  progressPercent: true,
  startDate: true,
  program: { select: { shortName: true } },
  batch: {
    select: {
      id: true,
      code: true,
      trainer: { select: { firstName: true, lastName: true } },
    },
  },
} satisfies Prisma.EnrollmentSelect;

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
  setProgress(enrollmentId: string, batchId: string, trainerId: string | null, progressPercent: number) {
    return db.enrollment
      .updateMany({
        where: {
          id: enrollmentId,
          batchId,
          status: "ACTIVE",
          progressPercent: { not: progressPercent },
          ...(trainerId ? { batch: { trainerId } } : {}),
        },
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
  complete(tx: Prisma.TransactionClient, enrollmentId: string, batchId: string, trainerId: string | null) {
    return tx.enrollment
      .updateMany({
        where: {
          id: enrollmentId,
          batchId,
          status: "ACTIVE",
          progressPercent: 100,
          ...(trainerId ? { batch: { trainerId } } : {}),
        },
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
        batch: { select: { id: true, trainerId: true } },
        certificateRequests: { select: { id: true }, take: 1 },
      },
    });
  },
  findForBatchAssignment(enrollmentId: string) {
    return db.enrollment.findUnique({
      where: { id: enrollmentId },
      select: { id: true, status: true, batchId: true, programId: true },
    });
  },
  findProgramsByIds(programIds: string[]) {
    return db.program.findMany({
      where: { id: { in: programIds } },
      select: { id: true, priceAmount: true },
      take: Math.min(programIds.length, DASHBOARD_LIST_LIMIT),
    });
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
      select: traineeDashboardEnrollmentSelect,
      orderBy: { createdAt: "desc" },
      take: DASHBOARD_LIST_LIMIT,
    });
  },

  /** Includes only the linked payment status and trainee display fields. */
  findManyByBatchId(batchId: string) {
    return db.enrollment.findMany({
      where: { batchId },
      select: {
        id: true,
        traineeId: true,
        programId: true,
        batchId: true,
        status: true,
        progressPercent: true,
        trainee: { select: { id: true, firstName: true, lastName: true, email: true } },
        payment: { select: { id: true, status: true } },
      },
      orderBy: { createdAt: "asc" },
      take: DASHBOARD_LIST_LIMIT,
    });
  },

  findManyByTrainerId(trainerId: string) {
    return db.enrollment.findMany({
      where: { batch: { trainerId } },
      select: {
        id: true,
        status: true,
        progressPercent: true,
        trainee: { select: { id: true, firstName: true, lastName: true, email: true } },
        payment: { select: { status: true } },
      },
      orderBy: { createdAt: "asc" },
      take: DASHBOARD_LIST_LIMIT,
    });
  },

  findManyActiveUnassigned() {
    return db.enrollment.findMany({
      where: { status: "ACTIVE", batchId: null },
      select: {
        id: true,
        programId: true,
        trainee: { select: { firstName: true, lastName: true } },
        program: { select: { shortName: true } },
      },
      orderBy: { createdAt: "asc" },
      take: DASHBOARD_LIST_LIMIT,
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
