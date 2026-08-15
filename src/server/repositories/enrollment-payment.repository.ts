import { db } from "@/server/db";
import { randomBytes } from "node:crypto";

import { Prisma, type EnrollmentPaymentStatus, type PaymentMethod } from "@/../generated/prisma/client";
import { mediaAssetRepository } from "@/server/repositories/media-asset.repository";

/** Pure data access for EnrollmentPayment. */
export const enrollmentPaymentRepository = {
  findById(id: string) { return db.enrollmentPayment.findUnique({ where: { id } }); },
  transition(tx: Prisma.TransactionClient, id: string, next: EnrollmentPaymentStatus, adminId: string, reason?: string) { return tx.enrollmentPayment.updateMany({ where: { id, status: "SUBMITTED" }, data: next === "VERIFIED" ? { status: next, verifiedAt: new Date(), verifiedByUserId: adminId, rejectionReason: null } : { status: next, rejectedAt: new Date(), rejectionReason: reason ?? null } }).then((result) => result.count); },
  /**
   * Creates the payment + its 1-3 Enrollment rows, and — in the SAME
   * transaction — attaches the already-uploaded proof `MediaAsset` (see
   * enrollment.service.ts, which uploads to Cloudinary and reserves/confirms
   * the MediaAsset row before calling this) to the new payment via
   * `mediaAssetRepository.attachToOwner`. Attaching inside this transaction,
   * rather than as a follow-up call, is what makes "payment exists" and
   * "asset is attached" atomic: a crash between the two would otherwise leave
   * an ACTIVE, uploaded asset that no payment row ever references.
   */
  createWithEnrollments(input: {
    traineeId: string;
    idempotencyKey: string;
    referenceCode: string;
    paymentMethod: PaymentMethod;
    totalAmount: Prisma.Decimal;
    proofImageUrl: string;
    mediaAssetId: string;
    programs: Array<{ id: string; priceAmount: Prisma.Decimal }>;
  }) {
    return db.$transaction(async (tx) => {
      const payment = await tx.enrollmentPayment.create({
        data: {
          trainee: { connect: { id: input.traineeId } },
          idempotencyKey: input.idempotencyKey,
          referenceCode: input.referenceCode,
          paymentMethod: input.paymentMethod,
          totalAmount: input.totalAmount,
          proofImageUrl: input.proofImageUrl,
          enrollments: {
            create: input.programs.map((program) => ({
              enrollmentRef: `ENR-${randomReference()}`,
              trainee: { connect: { id: input.traineeId } },
              program: { connect: { id: program.id } },
              amount: program.priceAmount,
              status: "PENDING_VERIFICATION",
            })),
          },
        },
        include: { enrollments: true },
      });
      await mediaAssetRepository.attachToOwner(input.mediaAssetId, { enrollmentPaymentId: payment.id }, tx);
      return payment;
    });
  },

  findByIdempotencyKey(idempotencyKey: string) {
    return db.enrollmentPayment.findUnique({ where: { idempotencyKey }, include: { enrollments: true } });
  },

  /**
   * Single-row read of one payment's proof image URL — the admin detail
   * modal a moderator opens to actually look at one proof. `select`, not
   * `include`, so this is the ONLY query that carries the image: the list
   * query (`findManySubmittedWithDetails` below) deliberately does not, per
   * .claude/rules/50-database.md ("a verification endpoint returns the fact,
   * not the record" — here inverted: the list returns the fact of pending
   * items, this single-row read returns the record).
   */
  findProofImageUrl(paymentId: string): Promise<string | null> {
    return db.enrollmentPayment
      .findUnique({ where: { id: paymentId }, select: { proofImageUrl: true } })
      .then((row) => row?.proofImageUrl ?? null);
  },

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
   * checkout). One query — trainee and enrollments/programs are joined,
   * never fetched per row.
   *
   * `select`, not `include` (.claude/rules/50-database.md, "select only the
   * columns needed"): the previous `include` dragged `proofImageUrl` — which
   * used to hold a base64 data: URI — onto every row of every load of this
   * list. This list never needs the image; `findProofImageUrl` above serves
   * the one-row detail read the admin's "view proof" action actually needs.
   */
  findManySubmittedWithDetails() {
    return db.enrollmentPayment.findMany({
      where: { status: "SUBMITTED" },
      select: {
        id: true,
        totalAmount: true,
        paymentMethod: true,
        referenceCode: true,
        submittedAt: true,
        trainee: { select: { id: true, firstName: true, lastName: true } },
        enrollments: { select: { program: { select: { shortName: true } } } },
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

function randomReference(): string {
  return randomBytes(8).toString("hex").toUpperCase();
}
