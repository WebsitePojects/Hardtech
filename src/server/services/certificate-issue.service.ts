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

type IssueResult =
  | { ok: true; publicId: string; alreadyIssued: boolean }
  | { ok: false; error: string };

/** Cloudinary public_id for a certificate code. Deterministic on purpose:
 *  the same code always maps to the same asset, which is what makes a retry a
 *  replace rather than a duplicate. */
export function certificatePublicIdFor(certificateCode: string): string {
  return `${CERTIFICATE_FOLDER}/${certificateCode}`;
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
export async function issueCertificate(certificateRequestId: string): Promise<IssueResult> {
  if (!isStorageConfigured()) {
    return { ok: false, error: "File storage is not configured." };
  }

  const request = await certificateRequestRepository.findForIssuance(certificateRequestId);
  if (!request) return { ok: false, error: "Certificate request not found." };

  // Fail closed: only an approved request may produce a document. A pending or
  // rejected one must never yield a printable certificate.
  if (request.status !== "APPROVED") {
    return { ok: false, error: "Certificate request is not approved." };
  }

  if (request.certificatePublicId) {
    return { ok: true, publicId: request.certificatePublicId, alreadyIssued: true };
  }

  const { bytes } = await renderCertificate({
    recipientName: fullName(request.enrollment.trainee),
    programName: request.enrollment.program.name,
    programHours: null,
    completedAt: request.completedAt,
    certificateCode: request.certificateCode,
  });

  const publicId = certificatePublicIdFor(request.certificateCode);

  const asset = await uploadAsset({
    bytes,
    folder: CERTIFICATE_FOLDER,
    publicId,
    resourceType: "image",
  });

  const attached = await certificateRequestRepository.attachAsset(request.id, asset.publicId);

  if (attached === 0) {
    // A concurrent issuance won. Ours uploaded to the SAME deterministic
    // public_id, so it overwrote identical bytes rather than creating an
    // orphan — nothing to clean up, and the winner's handle is authoritative.
    return { ok: true, publicId: asset.publicId, alreadyIssued: true };
  }

  return { ok: true, publicId: asset.publicId, alreadyIssued: false };
}

/**
 * Re-run issuance for approved requests whose asset never landed.
 *
 * Bounded by `limit` so a backlog cannot turn into an unbounded burst of
 * uploads. Returns a per-row outcome; the caller decides whether to alert.
 */
export async function reissuePendingCertificates(
  limit = 25,
): Promise<{ attempted: number; issued: number; failed: string[] }> {
  const rows = await certificateRequestRepository.findAwaitingIssuance(limit);
  const failed: string[] = [];
  let issued = 0;

  for (const row of rows) {
    const result = await issueCertificate(row.id);
    if (result.ok && !result.alreadyIssued) issued += 1;
    if (!result.ok) failed.push(row.id);
  }

  return { attempted: rows.length, issued, failed };
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
