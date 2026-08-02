import { approveCertificateAction, rejectCertificateAction } from "@/app/(dashboard)/dashboard/admin/actions";
// Certificate Approvals (desktop-02.md #9) is the same shape: approve/
// reject must be a conditional UPDATE guarded on the row's current status —
//   UPDATE "CertificateRequest" SET status = 'APPROVED'
//   WHERE id = $1 AND status = 'PENDING'
// so two moderators acting on the same request cannot both fire the
// approval side effects. No client-minted idempotency key needed; the
// guard is the conditional UPDATE keyed on `certificateRequestId`.

export interface ApproveCertificateInput {
  certificateRequestId: string;
}

export interface RejectCertificateInput {
  certificateRequestId: string;
  reason: string;
}

export async function approveCertificate(input: ApproveCertificateInput) {
  const result = await approveCertificateAction(input);
  if (!result.ok) throw new Error(result.error);
  return result;
}

export async function rejectCertificate(input: RejectCertificateInput) {
  const result = await rejectCertificateAction(input);
  if (!result.ok) throw new Error(result.error);
  return result;
}
