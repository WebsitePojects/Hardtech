import { db } from "@/server/db";
import type { CertificateStatus } from "@/../generated/prisma/client";

/** Pure data access for CertificateRequest. */
export const certificateRequestRepository = {
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
