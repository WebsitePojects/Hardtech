import { db } from "@/server/db";
import type { CertificateStatus, Prisma } from "@/../generated/prisma/client";

/** Pure data access for CertificateRequest. */
export const certificateRequestRepository = {
  transition(tx: Prisma.TransactionClient, id: string, next: CertificateStatus, adminId: string, reason?: string) { return tx.certificateRequest.updateMany({ where: { id, status: "PENDING" }, data: next === "APPROVED" ? { status: next, approvedAt: new Date(), approvedByUserId: adminId } : { status: next, rejectionReason: reason ?? null } }).then((result) => result.count); },
  /** Everything the renderer needs to print one certificate. */
  findForIssuance(id: string) {
    return db.certificateRequest.findUnique({
      where: { id },
      select: {
        id: true,
        certificateCode: true,
        certificatePublicId: true,
        status: true,
        completedAt: true,
        enrollment: {
          select: {
            trainee: { select: { firstName: true, lastName: true, timezone: true } },
            program: { select: { name: true, durationLabel: true } },
          },
        },
      },
    });
  },

  /** Public lookup by the code printed on the paper. Returns only what a
   *  verification page may disclose — never the internal id, the approver, or
   *  anything about the trainee beyond the name on the certificate itself. */
  findPublicByCode(certificateCode: string) {
    return db.certificateRequest.findUnique({
      where: { certificateCode },
      select: {
        certificateCode: true,
        status: true,
        completedAt: true,
        approvedAt: true,
        certificatePublicId: true,
        enrollment: {
          select: {
            trainee: { select: { firstName: true, lastName: true } },
            program: { select: { name: true } },
          },
        },
      },
    });
  },

  /**
   * Attach the stored asset to an approved certificate.
   *
   * Conditional on `certificatePublicId IS NULL` so a retry that races with a
   * completed first attempt loses harmlessly instead of overwriting a good
   * handle — the same conditional-UPDATE shape the status transitions use.
   * Returns the number of rows changed: 1 on the winning attempt, 0 when the
   * asset was already attached.
   */
  attachAsset(id: string, certificatePublicId: string) {
    return db.certificateRequest
      .updateMany({
        where: { id, status: "APPROVED", certificatePublicId: null },
        data: { certificatePublicId },
      })
      .then((result) => result.count);
  },

  /** Approved certificates whose asset never landed — the recovery queue.
   *  The row itself is the work item, so an issuance that dies mid-flight is
   *  still discoverable after a restart rather than lost (rule 7). */
  findAwaitingIssuance(limit: number) {
    const normalizedLimit = Number.isFinite(limit) ? Math.trunc(limit) : 1;
    return db.certificateRequest.findMany({
      where: { status: "APPROVED", certificatePublicId: null },
      select: { id: true },
      orderBy: { approvedAt: "asc" },
      take: Math.min(Math.max(normalizedLimit, 1), 25),
    });
  },

  countByStatus(status: CertificateStatus) {
    return db.certificateRequest.count({ where: { status } });
  },

  /** Includes the enrollment's batch/trainer so callers can show "Trainer: X" (desktop-02.md #9). */
  findManyByStatus(status: CertificateStatus) {
    return db.certificateRequest.findMany({
      where: { status },
      include: {
        enrollment: {
          include: { trainee: true, program: true, batch: { include: { trainer: true } } },
        },
      },
      orderBy: { requestedAt: "desc" },
    });
  },

  /** The most recent certificate request tied to one enrollment, for a trainee's own Credentials page. */
  findLatestByEnrollmentId(enrollmentId: string) {
    return db.certificateRequest.findFirst({
      where: { enrollmentId },
      orderBy: { requestedAt: "desc" },
    });
  },
};
