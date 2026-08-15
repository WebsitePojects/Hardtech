import { createHash, randomBytes } from "node:crypto";

import { Prisma } from "@/../generated/prisma/client";
import type { PaymentMethod } from "@/../generated/prisma/enums";

import { enrollmentPaymentRepository } from "@/server/repositories/enrollment-payment.repository";
import { enrollmentRepository } from "@/server/repositories/enrollment.repository";
import { mediaAssetRepository } from "@/server/repositories/media-asset.repository";
import { destroyAsset, isStorageConfigured, uploadAsset, type StoredAsset } from "@/server/storage/cloudinary";

/**
 * Cloudinary folder for enrollment payment proof screenshots. Kept separate
 * from `CERTIFICATE_FOLDER` (certificate-issue.service.ts) — a different
 * asset class, a different retention story.
 */
const PROOF_FOLDER = "hardtech/enrollment-proofs";

export interface EnrollmentServiceInput {
  idempotencyKey: string;
  programIds: string[];
  trainee: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
  };
  paymentMethod: PaymentMethod;
  /** Raw proof-of-payment bytes, received by the Server Action from the
   *  multipart FormData. Uploaded to Cloudinary here, server-side — never
   *  stored inline as a base64 data: URI (see the 2026-08-15 fix this type
   *  replaced: `proofImageUrl: string` used to carry the data: URI itself,
   *  which the admin queue's list query then dragged along on every load). */
  proof: {
    bytes: Buffer;
    mimeType: string;
  };
}

export interface EnrollmentServiceResult {
  paymentId: string;
  referenceCode: string;
  totalAmount: string;
  enrollmentIds: string[];
}

function passwordHash(password: string): string {
  return createHash("sha256").update(password).digest("hex");
}

function referenceCode(): string {
  return `HT-ENR-${randomBytes(4).toString("hex").toUpperCase()}`;
}

/**
 * Deterministic Cloudinary public_id leaf for one enrollment's proof image,
 * derived from the idempotency key (same shape as
 * certificate-issue.service.ts's `certificatePublicIdFor`). Deterministic on
 * purpose: a genuine concurrent retry that slips past the `findByIdempotencyKey`
 * pre-check re-uploads to the SAME object (`uploadAsset`'s `overwrite: true`
 * whenever a `publicId` is supplied) instead of littering an orphan under a
 * fresh random id.
 *
 * Sanitized because `idempotencyKey` is client-minted (per
 * .claude/rules/00-non-negotiables.md, "minted client-side when the /enroll
 * wizard mounts") and is only schema-validated as a non-empty string up to
 * 200 chars — it is not guaranteed to be safe as a Cloudinary public_id
 * segment on its own.
 */
function proofPublicIdFor(idempotencyKey: string): string {
  return `enroll-${idempotencyKey.replace(/[^a-zA-Z0-9_-]/g, "_")}`;
}

function toServiceResult(payment: {
  id: string;
  referenceCode: string;
  totalAmount: Prisma.Decimal;
  enrollments: { id: string }[];
}): EnrollmentServiceResult {
  return {
    paymentId: payment.id,
    referenceCode: payment.referenceCode,
    totalAmount: payment.totalAmount.toString(),
    enrollmentIds: payment.enrollments.map((enrollment) => enrollment.id),
  };
}

export async function submitEnrollment(input: EnrollmentServiceInput): Promise<EnrollmentServiceResult> {
  // Idempotency-first: check for a prior submission under this key BEFORE
  // touching Cloudinary. A retry (double-click, client timeout-and-resend)
  // must cost zero uploads, not one wasted overwrite of the same object —
  // this is the same guarantee the catch-P2002 replay path below already
  // gave, just moved earlier so it also short-circuits the network call.
  const alreadySubmitted = await enrollmentPaymentRepository.findByIdempotencyKey(input.idempotencyKey);
  if (alreadySubmitted) return toServiceResult(alreadySubmitted);

  const normalizedEmail = input.trainee.email.trim().toLowerCase();
  const programs = await enrollmentRepository.findProgramsByIds(input.programIds);
  if (programs.length !== input.programIds.length) throw new Error("One or more programs are unavailable.");

  const uniqueProgramIds = new Set(input.programIds);
  if (uniqueProgramIds.size !== input.programIds.length) throw new Error("Duplicate programs are not allowed.");

  const totalAmount = programs.reduce(
    (total, program) => total.add(program.priceAmount),
    new Prisma.Decimal(0),
  );
  const user = await enrollmentRepository.findOrCreateApplicant({
    email: normalizedEmail,
    firstName: input.trainee.firstName.trim(),
    lastName: input.trainee.lastName.trim(),
    phone: input.trainee.phone.trim(),
    passwordHash: passwordHash(input.trainee.password),
  });

  // Fail closed: an unconfigured storage layer must refuse to run rather than
  // silently accept an enrollment with no verifiable proof behind it
  // (.claude/rules/00-non-negotiables.md rule 3; same posture as
  // certificate-issue.service.ts's isStorageConfigured() check).
  if (!isStorageConfigured()) throw new Error("File storage is not configured.");

  const publicId = proofPublicIdFor(input.idempotencyKey);
  const asset = await uploadAsset({
    bytes: input.proof.bytes,
    folder: PROOF_FOLDER,
    publicId,
    resourceType: "image",
  });

  // Register the upload in the MediaAsset outbox (media-asset.repository.ts)
  // so it is tracked and — if it never ends up attached to a payment below —
  // eligible for cleanup rather than a silent Cloudinary leak.
  //
  // `publicId` is deterministic per idempotencyKey (see proofPublicIdFor), so
  // a genuine concurrent double-fire that slipped past the pre-check above
  // races on TWO unique constraints, not one: `MediaAsset.publicId` here,
  // and `EnrollmentPayment.idempotencyKey` below. uploadAsset's own race is
  // harmless (overwrite: true — both calls land the SAME Cloudinary object),
  // but `mediaAssetRepository.reserve` is a plain insert, so the loser of
  // THIS race must reuse the winner's row rather than fail outright.
  const mediaAssetId = await reserveOrReuseProofAsset(asset, user.id);

  try {
    const created = await enrollmentPaymentRepository.createWithEnrollments({
      traineeId: user.id,
      idempotencyKey: input.idempotencyKey,
      referenceCode: referenceCode(),
      paymentMethod: input.paymentMethod,
      totalAmount,
      proofImageUrl: asset.url,
      mediaAssetId,
      programs: programs.map((program) => ({ id: program.id, priceAmount: program.priceAmount })),
    });
    return toServiceResult(created);
  } catch (error) {
    if (!isUniqueViolation(error)) throw error;

    // A genuine concurrent double-fire slipped past the pre-check above and
    // lost the race to create the EnrollmentPayment row (`idempotencyKey` is
    // unique). Because Postgres blocks a conflicting INSERT until the
    // winning transaction commits or rolls back, by the time we observe THIS
    // conflict the winner's transaction — create + attachToOwner, both in
    // one $transaction — has already committed. So: re-read the MediaAsset
    // fresh rather than assuming. If it is still unattached, nobody's
    // payment will ever reference it (this MediaAsset row, whether we
    // reserved it or reused someone else's per reserveOrReuseProofAsset
    // above, has no other route to a payment once the one payment for this
    // idempotencyKey is already settled) — it is an orphan that will never
    // flow through the normal markPendingForOwner -> purge-worker path, so
    // it needs its own explicit best-effort cleanup right here. If it IS
    // attached, that attach belongs to the legitimate winner and must be
    // left alone — destroying it would delete the winning payment's proof.
    const currentAsset = await mediaAssetRepository.findById(mediaAssetId);
    if (currentAsset && currentAsset.enrollmentPaymentId === null) {
      try {
        await destroyAsset(asset.publicId, "image");
      } catch {
        // Best-effort only. The orphaned MediaAsset row stays
        // ACTIVE-but-unattached in Postgres either way; it is a known,
        // narrow gap (documented here, not silently swallowed) rather than
        // something this synchronous request path can guarantee cleanup of.
      }
    }

    const existing = await enrollmentPaymentRepository.findByIdempotencyKey(input.idempotencyKey);
    if (!existing) throw new Error("Enrollment could not be replayed.");
    return toServiceResult(existing);
  }
}

/**
 * Reserve+confirm a MediaAsset row for a just-uploaded proof, or — if a
 * concurrent request for the same idempotencyKey already reserved the same
 * deterministic publicId first — reuse that row's id instead of failing.
 * See the race explanation at this function's call site.
 */
async function reserveOrReuseProofAsset(asset: StoredAsset, uploadedByUserId: string): Promise<string> {
  try {
    const reserved = await mediaAssetRepository.reserve({
      publicId: asset.publicId,
      // "IMAGE", the Prisma MediaResourceType enum value — distinct from the
      // "image" Cloudinary resource-type string passed to uploadAsset above
      // (same distinction media-upload.service.ts's toDbResourceType makes).
      resourceType: "IMAGE",
      folder: PROOF_FOLDER,
      uploadedByUserId,
    });
    await mediaAssetRepository.confirm(reserved.id, {
      url: asset.url,
      bytes: asset.bytes,
      format: asset.format,
      width: asset.width,
      height: asset.height,
      durationSec: null,
    });
    return reserved.id;
  } catch (error) {
    if (!isUniqueViolation(error)) throw error;
    const existing = await mediaAssetRepository.findByPublicId(asset.publicId);
    if (!existing) throw error;
    return existing.id;
  }
}

function isUniqueViolation(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}
