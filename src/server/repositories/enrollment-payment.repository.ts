import { db } from "@/server/db";
import { Prisma, type EnrollmentPaymentStatus } from "@/../generated/prisma/client";

/** Pure data access for EnrollmentPayment. */
export const enrollmentPaymentRepository = {
  countByStatus(status: EnrollmentPaymentStatus) {
    return db.enrollmentPayment.count({ where: { status } });
  },

  /** Sum of verified payment totals within [since, now) — feeds "Revenue (MTD)". */
  async sumAmountByStatusSince(status: EnrollmentPaymentStatus, since: Date) {
    const result = await db.enrollmentPayment.aggregate({
      where: { status, verifiedAt: { gte: since } },
      _sum: { totalAmount: true },
    });
    return result._sum.totalAmount ?? 0;
  },

  /**
   * The admin "Enrollments & Payment Verification" pending queue
   * (desktop-02.md #3): every SUBMITTED payment with the trainee and every
   * program it covers (one payment can fund 1-3 programs in a single
   * checkout). One query — trainee and enrollments/programs are `include`d,
   * never fetched per row.
   */
  findManySubmittedWithDetails() {
    return db.enrollmentPayment.findMany({
      where: { status: "SUBMITTED" },
      include: {
        trainee: true,
        enrollments: { include: { program: true } },
      },
      orderBy: { submittedAt: "asc" },
    });
  },

  /**
   * One row per calendar month with at least one payment of `status`
   * verified since `since` — feeds the admin "Revenue Trend" chart
   * (desktop-02.md #11). Same raw-SQL-for-date-truncation rationale as
   * `enrollmentRepository.countByMonthSince`. `totalAmount` is summed in
   * Postgres as `numeric` (not float) and rewrapped as `Prisma.Decimal`
   * here so no caller ever does float arithmetic on money
   * (.claude/rules/40-prisma-7.md, .claude/rules/00-non-negotiables.md rule 4).
   */
  async sumAmountByMonthSince(status: EnrollmentPaymentStatus, since: Date) {
    const rows = await db.$queryRaw<{ month: Date; total: string }[]>`
      SELECT date_trunc('month', "verifiedAt") AS month, COALESCE(SUM("totalAmount"), 0)::numeric AS total
      FROM "EnrollmentPayment"
      WHERE "status" = ${status} AND "verifiedAt" >= ${since}
      GROUP BY 1
      ORDER BY 1
    `;
    return rows.map((row) => ({ month: row.month, total: new Prisma.Decimal(row.total) }));
  },
};
