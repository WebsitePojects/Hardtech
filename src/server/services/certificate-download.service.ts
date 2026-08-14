import type { UserRole } from "@/../generated/prisma/enums";
import { db } from "@/server/db";
import { renderCertificate } from "@/server/certificates/certificate-render.service";

/**
 * Authorized retrieval of the printable certificate.
 *
 * Two rules:
 *
 * 1. **Only an APPROVED request yields a document.** A pending or rejected
 *    one must not render, or a trainee could download a certificate the
 *    admin never granted (rule 3, fail closed).
 *
 * 2. **Only the owner or an admin may fetch it.** A trainer is deliberately
 *    excluded: they mark training complete, but the issued credential is
 *    between the trainee and the institution.
 *
 * Returns null for every non-permitted case so the route can answer 404
 * uniformly and never reveal which codes exist.
 */

export async function getIssuedCertificateForViewer(input: {
  certificateCode: string;
  viewerId: string;
  viewerRole: UserRole;
}): Promise<{ svg: string; fileName: string } | null> {
  const record = await db.certificateRequest.findUnique({
    where: { certificateCode: input.certificateCode },
    select: {
      certificateCode: true,
      status: true,
      completedAt: true,
      enrollment: {
        select: {
          traineeId: true,
          trainee: { select: { firstName: true, lastName: true } },
          program: { select: { name: true } },
        },
      },
    },
  });

  if (!record) return null;
  if (record.status !== "APPROVED") return null;

  const isOwner = record.enrollment.traineeId === input.viewerId;
  const isAdmin = input.viewerRole === "ADMIN";
  if (!isOwner && !isAdmin) return null;

  const { firstName, lastName } = record.enrollment.trainee;

  const { svg } = await renderCertificate({
    recipientName: `${firstName} ${lastName}`.trim(),
    programName: record.enrollment.program.name,
    programHours: null,
    completedAt: record.completedAt,
    certificateCode: record.certificateCode,
  });

  return { svg, fileName: `${record.certificateCode}.svg` };
}
