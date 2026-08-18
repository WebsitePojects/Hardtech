import { formatCompletionDate } from "@/server/certificates/certificate-render.service";
import { certificateCodeSchema } from "@/server/schemas/certificate.schema";
import { db } from "@/server/db";

/**
 * Public, unauthenticated certificate lookup backing the QR verification page.
 *
 * Two rules shape what this returns:
 *
 * 1. **Only APPROVED certificates verify.** A pending or rejected request must
 *    read as "not verified" — otherwise a rejected trainee could print a paper
 *    whose QR appears to confirm it. Fail closed on any status that is not
 *    exactly APPROVED (rule 3).
 *
 * 2. **Unknown and invalid resolve identically to rejected.** Returning null
 *    for every non-verifying case means the page cannot be used to enumerate
 *    which codes exist or to learn a request's internal state.
 *
 * The shape returned is the minimum a verifier needs. No internal id, no
 * approver, no email, no enrollment — a public endpoint should disclose the
 * fact of the credential, not the record behind it (rule 6).
 */

export type PublicCertificate = {
  recipientName: string;
  programName: string;
  completedOn: string;
  certificateCode: string;
};

export async function getPublicCertificate(
  rawCode: string,
): Promise<PublicCertificate | null> {
  const parsed = certificateCodeSchema.safeParse(rawCode);
  if (!parsed.success) return null;

  const record = await db.certificateRequest.findUnique({
    where: { certificateCode: parsed.data },
    select: {
      certificateCode: true,
      status: true,
      completedAt: true,
      enrollment: {
        select: {
          trainee: { select: { firstName: true, lastName: true, timezone: true } },
          program: { select: { name: true } },
        },
      },
    },
  });
  if (!record) return null;
  if (record.status !== "APPROVED") return null;

  const { firstName, lastName } = record.enrollment.trainee;

  return {
    recipientName: `${firstName} ${lastName}`.trim(),
    programName: record.enrollment.program.name,
    completedOn: formatCompletionDate(record.completedAt, record.enrollment.trainee.timezone),
    certificateCode: record.certificateCode,
  };
}
