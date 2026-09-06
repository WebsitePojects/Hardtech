import { certificateRequestRepository } from "@/server/repositories/certificate-request.repository";
import { renderCertificate } from "@/server/certificates/certificate-render.service";
import { destroyAsset, isStorageConfigured, uploadAsset } from "@/server/storage/cloudinary";

/**
 * Issues the actual certificate document for an approved request.
 *
 * Deliberately NOT part of the approval transaction. Approval is a database
 * state change that must commit quickly; rendering and uploading is a network
 * round trip to a third party. Holding a Postgres transaction open across that
 * call would pin a connection for the duration of someone else's outage.
 *
 * The split means a request can be APPROVED with no asset yet. That is a
 * legitimate intermediate state, and it is recoverable rather than lost:
 * `findAwaitingIssuance` finds exactly those rows, so a crash between commit
 * and upload leaves a discoverable work item instead of a silently missing
 * certificate (non-negotiable rule 7 — no fire-and-forget side effects).
 *
 * Idempotency comes from two places working together:
 *   - the Cloudinary public_id is derived from the certificate code, so a
 *     retry overwrites the same asset instead of littering duplicates;
 *   - `attachAsset` is a conditional UPDATE guarded on the column still being
 *     NULL, so a retry racing a completed attempt loses harmlessly.
 */

export const CERTIFICATE_FOLDER = "hardtech/certificates";

export type CertificateIssueResult =
  | { ok: true; publicId: string; alreadyIssued: boolean }
  | { ok: false; error: string };

export const CERTIFICATE_RECOVERY_BATCH_SIZE = 25;

type CertificateIssueDependencies = {
  isStorageConfigured: typeof isStorageConfigured;
  findForIssuance: typeof certificateRequestRepository.findForIssuance;
  attachAsset: typeof certificateRequestRepository.attachAsset;
  renderCertificate: typeof renderCertificate;
  uploadAsset: typeof uploadAsset;
};

const productionIssueDependencies: CertificateIssueDependencies = {
  isStorageConfigured,
  findForIssuance: certificateRequestRepository.findForIssuance,
  attachAsset: certificateRequestRepository.attachAsset,
  renderCertificate,
  uploadAsset,
};

const inFlightIssues = new Map<string, Promise<CertificateIssueResult>>();

/**
 * The public_id LEAF for a certificate code — deliberately without the folder.
 *
 * Cloudinary concatenates `folder` and `public_id`, so passing a leaf that
 * already contains the folder produces
 * `hardtech/certificates/hardtech/certificates/CRT-1004`. Keep the folder in
 * exactly one place: the `folder` option.
 *
 * Deterministic on purpose — the same code always maps to the same asset,
 * which is what makes a retry a replace rather than a duplicate.
 */
export function certificatePublicIdFor(certificateCode: string): string {
  return certificateCode;
}

function fullName(trainee: { firstName: string; lastName: string }): string {
  return `${trainee.firstName} ${trainee.lastName}`.trim();
}

/**
 * Render and store the certificate for one approved request.
 *
 * Safe to call repeatedly. Returns `alreadyIssued` when the row already
 * carried an asset, so a caller can distinguish "nothing to do" from "issued
 * just now" without treating the replay as a failure.
 */
export async function issueCertificate(
  certificateRequestId: string,
  dependencies: CertificateIssueDependencies = productionIssueDependencies,
): Promise<CertificateIssueResult> {
  const inFlight = inFlightIssues.get(certificateRequestId);
  if (inFlight) return inFlight;

  const run = issueCertificateOnce(certificateRequestId, dependencies);
  inFlightIssues.set(certificateRequestId, run);
  try {
    return await run;
  } finally {
    if (inFlightIssues.get(certificateRequestId) === run) inFlightIssues.delete(certificateRequestId);
  }
}

async function issueCertificateOnce(
  certificateRequestId: string,
  dependencies: CertificateIssueDependencies,
): Promise<CertificateIssueResult> {
  if (!dependencies.isStorageConfigured()) {
    return { ok: false, error: "File storage is not configured." };
  }

  const request = await dependencies.findForIssuance(certificateRequestId);
  if (!request) return { ok: false, error: "Certificate request not found." };

  // Fail closed: only an approved request may produce a document. A pending or
  // rejected one must never yield a printable certificate.
  if (request.status !== "APPROVED") {
    return { ok: false, error: "Certificate request is not approved." };
  }

  if (request.certificatePublicId) {
    return { ok: true, publicId: request.certificatePublicId, alreadyIssued: true };
  }

  try {
    const { bytes } = await dependencies.renderCertificate({
      recipientName: fullName(request.enrollment.trainee),
      programName: request.enrollment.program.name,
      programHours: null,
      completedAt: request.completedAt,
      traineeTimeZone: request.enrollment.trainee.timezone,
      certificateCode: request.certificateCode,
    });

    const publicId = certificatePublicIdFor(request.certificateCode);
    const asset = await dependencies.uploadAsset({
      bytes,
      folder: CERTIFICATE_FOLDER,
      publicId,
      resourceType: "image",
    });

    const attached = await dependencies.attachAsset(request.id, asset.publicId);
    if (attached === 0) {
      // A second process may have issued the same request. Both target the
      // deterministic public id, while the conditional attachment makes one
      // database state transition the durable winner.
      return { ok: true, publicId: asset.publicId, alreadyIssued: true };
    }
    return { ok: true, publicId: asset.publicId, alreadyIssued: false };
  } catch {
    // Do not persist a handle or expose a provider error when rendering or
    // storage fails. The unchanged APPROVED/null row remains discoverable by
    // the next bounded recovery run.
    return { ok: false, error: "Certificate issuance failed." };
  }
}

/**
 * Re-run issuance for approved requests whose asset never landed.
 *
 * Bounded by `limit` so a backlog cannot turn into an unbounded burst of
 * uploads. Returns a per-row outcome; the caller decides whether to alert.
 */
export async function reissuePendingCertificates(
  input: { limit?: number } = {},
  dependencies: {
    findAwaitingIssuance: typeof certificateRequestRepository.findAwaitingIssuance;
    issueCertificate: typeof issueCertificate;
  } = {
    findAwaitingIssuance: certificateRequestRepository.findAwaitingIssuance,
    issueCertificate,
  },
): Promise<{ attempted: number; issued: number; alreadyIssued: number; failed: number }> {
  const requestedLimit = input.limit ?? CERTIFICATE_RECOVERY_BATCH_SIZE;
  const normalizedLimit = Number.isFinite(requestedLimit) ? Math.trunc(requestedLimit) : 1;
  const limit = Math.min(Math.max(normalizedLimit, 1), CERTIFICATE_RECOVERY_BATCH_SIZE);
  const rows = await dependencies.findAwaitingIssuance(limit);
  let alreadyIssued = 0;
  let failed = 0;
  let issued = 0;

  for (const row of rows) {
    try {
      const result = await dependencies.issueCertificate(row.id);
      if (!result.ok) failed += 1;
      else if (result.alreadyIssued) alreadyIssued += 1;
      else issued += 1;
    } catch {
      // A dependency failure must not abort the rest of the batch or make the
      // failed request disappear. The row was never attached, so it remains
      // in the APPROVED/null recovery queue.
      failed += 1;
    }
  }

  return { attempted: rows.length, issued, alreadyIssued, failed };
}

/**
 * Remove a certificate's stored asset.
 *
 * Called when the owning row is deleted, so storage does not accumulate files
 * nothing references. Idempotent: `destroyAsset` treats an already-absent
 * asset as success, because the goal state is "the file is gone".
 */
export async function revokeCertificateAsset(publicId: string): Promise<boolean> {
  if (!isStorageConfigured()) return false;
  return destroyAsset(publicId, "image");
}
