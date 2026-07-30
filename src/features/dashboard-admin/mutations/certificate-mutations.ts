// TODO(wave-4): see enrollment-mutations.ts for the pattern this follows.
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

export async function approveCertificate(input: ApproveCertificateInput): Promise<never> {
  void input;
  throw new Error(
    "TODO(wave-4): certificate approval is not implemented yet. " +
      "This build stops at the disabled/pending guard on purpose.",
  );
}

export async function rejectCertificate(input: RejectCertificateInput): Promise<never> {
  void input;
  throw new Error(
    "TODO(wave-4): certificate rejection is not implemented yet. " +
      "This build stops at the disabled/pending guard on purpose.",
  );
}
