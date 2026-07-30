import { db } from "@/server/db";
import type { EnrollmentStatus, Prisma } from "@/../generated/prisma/client";

const withProgramAndBatch = {
  program: true,
  batch: { include: { trainer: true } },
} satisfies Prisma.EnrollmentInclude;

/** Pure data access for Enrollment. */
export const enrollmentRepository = {
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
