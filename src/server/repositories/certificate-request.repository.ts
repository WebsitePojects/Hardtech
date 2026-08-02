import { db } from "@/server/db";
import type { CertificateStatus, Prisma } from "@/../generated/prisma/client";

/** Pure data access for CertificateRequest. */
export const certificateRequestRepository = {
  transition(tx: Prisma.TransactionClient, id: string, next: CertificateStatus, adminId: string, reason?: string) { return tx.certificateRequest.updateMany({ where: { id, status: "PENDING" }, data: next === "APPROVED" ? { status: next, approvedAt: new Date(), approvedByUserId: adminId } : { status: next, rejectionReason: reason ?? null } }).then((result) => result.count); },
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
