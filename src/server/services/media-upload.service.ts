import { randomUUID } from "node:crypto";

import type { z } from "zod";

import type { UserRole } from "@/../generated/prisma/enums";
import type { MediaAsset, MediaResourceType } from "@/../generated/prisma/client";

import { verifiedActor } from "@/server/services/actor-verification.service";
import {
  mediaAssetRepository,
  type MediaAssetConfirmFacts,
  type MediaAssetOwnerRef,
} from "@/server/repositories/media-asset.repository";
import {
  createSignedUploadTicket,
  type CloudinaryWebhookPayload,
  type SignedUploadTicket,
  type UploadResourceType,
} from "@/server/storage/signed-upload";
import { assertWithinSizeLimit, FileTooLargeError, maxBytesFor } from "@/server/storage/cloudinary";
import {
  allowedFormatsForMime,
  resourceTypeForMime,
  type confirmUploadRequestSchema,
  type signUploadRequestSchema,
} from "@/server/schemas/media.schema";

/**
 * Business rules for the upload lifecycle: who may ask for a signature, what
 * they may upload it as, and how a confirmed asset gets bound to the row
 * that owns it. Pure decisions in, typed results out — no `req`/`res`, no
 * Cloudinary SDK, no React (.claude/rules/10-architecture.md: "a service
 * never touches req/res or React").
 *
 * Every rejection returns the same generic message. None of these functions
 * is a public lookup — role, ownership, kind/mime mismatch and size-limit
 * failures are all folded into one string so a caller cannot use error text
 * to enumerate what exists or who owns what.
 */

type UploadKind = z.infer<typeof signUploadRequestSchema>["kind"];

const NOT_AUTHORIZED = "Not authorized.";
const UNSUPPORTED_FILE_TYPE = "That file type is not supported here.";

/**
 * The four upload destinations. GALLERY_PHOTO's and ANNOUNCEMENT_MEDIA's own
 * kinds each map 1:1 to a category; POST_ATTACHMENT and REPLY_ATTACHMENT
 * share FORUM because both are forum inline attachments living in the same
 * folder under the same permission rule ("any authenticated, non-suspended
 * user"). Kept as one table and read from both directions — kind ->
 * category at ticket-request time, owner-shape -> category at attach time —
 * so the folder and the allowed-role list for a given destination are
 * defined exactly once (DRY: the same two facts, reused, not duplicated).
 */
type MediaCategory = "MODULE" | "GALLERY" | "ANNOUNCEMENT" | "ASSIGNMENT" | "FORUM" | "MESSAGE";

const FOLDER_BY_CATEGORY: Record<MediaCategory, string> = {
  MODULE: "hardtech/modules",
  GALLERY: "hardtech/gallery",
  ANNOUNCEMENT: "hardtech/announcements",
  ASSIGNMENT: "hardtech/assignment-submissions",
  FORUM: "hardtech/forum",
  MESSAGE: "hardtech/messages",
};

const ALLOWED_ROLES_BY_CATEGORY: Record<MediaCategory, readonly UserRole[]> = {
  MODULE: ["TRAINER", "ADMIN"],
  GALLERY: ["ADMIN"],
  ANNOUNCEMENT: ["ADMIN"],
  ASSIGNMENT: ["TRAINEE"],
  FORUM: ["TRAINEE", "TRAINER", "ADMIN"],
  MESSAGE: ["TRAINEE", "TRAINER", "ADMIN"],
};

/**
 * Which Cloudinary resource types a kind may resolve to, independent of the
 * category table above (this is a mime-type policy, only relevant at
 * ticket-request time, not at attach time). GALLERY_PHOTO is a photo, not a
 * document — the "GALLERY_PHOTO that resolves to raw is rejected" example in
 * the brief this service was built against. MODULE_FILE is the most
 * permissive because training material is legitimately a video, a slide
 * deck, or a document. This is a product/business call, not a value read off
 * a schema, so it lives here rather than in resourceTypeForMime.
 */
const ALLOWED_RESOURCE_TYPES_BY_KIND: Record<UploadKind, readonly UploadResourceType[]> = {
  MODULE_FILE: ["image", "video", "raw"],
  GALLERY_PHOTO: ["image"],
  ANNOUNCEMENT_MEDIA: ["image", "video"],
  ASSIGNMENT_SUBMISSION: ["image", "video", "raw"],
  POST_ATTACHMENT: ["image", "raw"],
  REPLY_ATTACHMENT: ["image", "raw"],
  MESSAGE_ATTACHMENT: ["image", "video", "raw"],
};

/**
 * Per-kind byte ceiling override, applied IN ADDITION TO (never instead of)
 * the global per-resource-type plan ceiling in cloudinary.ts —
 * `requestUploadTicket` enforces the smaller of the two. Only
 * MESSAGE_ATTACHMENT has one: the messaging spec caps every attachment at
 * 10 MB regardless of kind (a video included), tighter than the global
 * 100 MB video ceiling. No entry here means "use the global ceiling as-is."
 */
const MAX_BYTES_OVERRIDE_BY_KIND: Partial<Record<UploadKind, number>> = {
  MESSAGE_ATTACHMENT: 10 * 1024 * 1024,
};

/** A signed direct upload must name a signed Cloudinary preset whose
 * `max_file_size` equals this cap. The request-level signature pins the
 * preset name, while the preset is the provider-side size enforcement point.
 * One preset per kind keeps MESSAGE_ATTACHMENT's 10 MB ceiling intact even
 * when other video uploads may use the plan-wide video maximum. */
function uploadPresetForKind(kind: UploadKind): string {
  const envName = `CLOUDINARY_DIRECT_UPLOAD_PRESET_${kind}`;
  const value = process.env[envName]?.trim();
  if (!value || !/^[A-Za-z0-9_-]{1,255}$/.test(value)) {
    throw new Error(`Direct upload preset is not configured: ${envName}`);
  }
  return value;
}

function maxBytesForKind(kind: UploadKind, resourceType: UploadResourceType): number {
  return Math.min(maxBytesFor(resourceType), MAX_BYTES_OVERRIDE_BY_KIND[kind] ?? Number.POSITIVE_INFINITY);
}

function categoryForKind(kind: UploadKind): MediaCategory | null {
  switch (kind) {
    case "MODULE_FILE":
      return "MODULE";
    case "GALLERY_PHOTO":
      return "GALLERY";
    case "ANNOUNCEMENT_MEDIA":
      return "ANNOUNCEMENT";
    case "ASSIGNMENT_SUBMISSION":
      return "ASSIGNMENT";
    case "POST_ATTACHMENT":
      return "FORUM";
    case "REPLY_ATTACHMENT":
      return "FORUM";
    case "MESSAGE_ATTACHMENT":
      return "MESSAGE";
    default: {
      // Fail closed on any kind this switch does not recognise (rule 3) —
      // and if the schema's kind union ever grows, this line stops
      // compiling instead of silently falling through.
      const _exhaustive: never = kind;
      void _exhaustive;
      return null;
    }
  }
}

function categoryForOwner(owner: MediaAssetOwnerRef): MediaCategory {
  if ("moduleId" in owner) return "MODULE";
  if ("galleryPhotoId" in owner) return "GALLERY";
  if ("announcementId" in owner) return "ANNOUNCEMENT";
  if ("assignmentSubmissionId" in owner) return "ASSIGNMENT";
  if ("messageId" in owner) return "MESSAGE";
  return "FORUM"; // postId or replyId
}

function ownerMatches(asset: MediaAsset, owner: MediaAssetOwnerRef): boolean {
  if ("moduleId" in owner) return asset.moduleId === owner.moduleId;
  if ("galleryPhotoId" in owner) return asset.galleryPhotoId === owner.galleryPhotoId;
  if ("announcementId" in owner) return asset.announcementId === owner.announcementId;
  if ("postId" in owner) return asset.postId === owner.postId;
  if ("replyId" in owner) return asset.replyId === owner.replyId;
  if ("enrollmentPaymentId" in owner) return asset.enrollmentPaymentId === owner.enrollmentPaymentId;
  if ("assignmentSubmissionId" in owner) return asset.assignmentSubmissionId === owner.assignmentSubmissionId;
  return asset.messageId === owner.messageId;
}

/** Cloudinary-facing lowercase resource type -> the Prisma enum stored on
 *  the row. The reverse mapping (DB -> Cloudinary) belongs to whichever
 *  layer calls `destroyAsset`, not here — see media-purge.service.ts. */
function toDbResourceType(resourceType: UploadResourceType): MediaResourceType {
  if (resourceType === "video") return "VIDEO";
  if (resourceType === "raw") return "RAW";
  return "IMAGE";
}

function uploadWebhookUrl(): string {
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return `${origin}/api/uploads/webhook`;
}

/**
 * Extensions Cloudinary can plausibly append to a `resource_type: "raw"`
 * object's public_id, derived directly from `MIME_ALLOWLIST` in
 * media.schema.ts (the only mime types this app ever signs a raw upload
 * ticket for). Anchors the tail-matching below to a closed set instead of
 * "any non-empty string after a dot" — the original version of this check
 * accepted `${expected}.anything`, which is a real gap flagged in this
 * project's own audit notes: a claimed public_id of, say,
 * `${expected}.exe` or `${expected}.php` matched just as happily as
 * `${expected}.pdf`. The extension itself carries no security property on
 * its own (Cloudinary decides content type from the bytes it received, not
 * this suffix) — bounding it is about keeping the match precise to what
 * this app's own allowlist could actually have produced, not about
 * blocking any particular file type.
 */
const RAW_UPLOAD_EXTENSIONS = ["pdf", "doc", "docx"] as const;

/**
 * Whether `claimedPublicId` could plausibly be the object Cloudinary
 * created for the ticket this server signed.
 *
 * An exact match of `${folder}/${mintedPublicId}` covers image and video:
 * Cloudinary reports back exactly that string. A match of
 * `${folder}/${mintedPublicId}.<ext>` for `<ext>` in `RAW_UPLOAD_EXTENSIONS`
 * additionally covers `resource_type: "raw"`, which folds the file's
 * extension into the object's own identity and never reports a separate
 * `format` (2026-08-14 lesson — a live probe confirmed a PDF comes back as
 * `<folder>/<mintedId>.pdf`). Anything else — a different folder, a
 * different id, no extension separator, or an extension outside the closed
 * set above — is rejected.
 *
 * This is the entire tamper-protection boundary for confirmUpload: it is
 * what stops a client from pointing a valid ticket's confirmation at some
 * other Cloudinary object, so on anything it cannot positively match it
 * must reject, never default to permissive (rule 3: fail closed).
 */
export function isAuthenticReturnedPublicId(
  claimedPublicId: string,
  folder: string,
  mintedPublicId: string,
): boolean {
  const expected = `${folder}/${mintedPublicId}`;
  if (claimedPublicId === expected) return true;
  return RAW_UPLOAD_EXTENSIONS.some((ext) => claimedPublicId === `${expected}.${ext}`);
}

/**
 * A signed webhook can only be associated with a reservation when the
 * provider's object is exactly the requested leaf, optionally with the one
 * extension Cloudinary places on a raw public id. This deliberately accepts
 * a disallowed extension too: it is still our object and must be placed in
 * the purge outbox rather than left unreachable. Format policy is checked
 * separately against the signed reservation below.
 */
function isProviderOwnedReturnedPublicId(
  claimedPublicId: string,
  folder: string,
  mintedPublicId: string,
  format: string,
): boolean {
  const expected = `${folder}/${mintedPublicId}`;
  return claimedPublicId === expected || claimedPublicId === `${expected}.${format}`;
}

function expectedFormatsForReservedAsset(asset: MediaAsset): readonly string[] | null {
  if (asset.purgeState !== "RESERVED" || !asset.format || asset.bytes < 1) return null;
  const formats = asset.format.split(",");
  if (formats.length === 0 || formats.some((format) => !/^[a-z0-9]{1,16}$/.test(format))) return null;
  return formats;
}

/**
 * Strip a known folder prefix and any single trailing `.<ext>` Cloudinary
 * may have appended, to recover the bare id this server originally minted
 * (see `requestUploadTicket`: always a `randomUUID()`, which never contains
 * a `.`). Used only by the webhook path below to find a row that is still
 * RESERVED — i.e. one `confirmUpload` has not yet promoted to its
 * authoritative id — so the notification's own lookup does not depend on
 * `confirmUpload` having already run. Bounded to this registry's small
 * fixed folder set; never a scan, never an Admin API call (see
 * cloudinary.ts's Admin API budget note).
 */
function candidateMintedIdFromFolder(claimedPublicId: string): string | null {
  for (const folder of Object.values(FOLDER_BY_CATEGORY)) {
    const prefix = `${folder}/`;
    if (!claimedPublicId.startsWith(prefix)) continue;
    const withoutFolder = claimedPublicId.slice(prefix.length);
    const dotIndex = withoutFolder.indexOf(".");
    return dotIndex > 0 ? withoutFolder.slice(0, dotIndex) : withoutFolder;
  }
  return null;
}

// ---------------------------------------------------------------------------
// requestUploadTicket
// ---------------------------------------------------------------------------

export type RequestUploadTicketInput = z.infer<typeof signUploadRequestSchema> & {
  actorId: string;
  actorRole: UserRole;
};

export type RequestUploadTicketResult =
  | { ok: true; ticket: SignedUploadTicket; mediaAssetId: string }
  | { ok: false; error: string };

/**
 * Issue a signed, time-boxed permission slip for a direct-to-Cloudinary
 * upload, and record the reservation before handing it out.
 *
 * Order matters and is fixed, not incidental:
 *   1. authorize (kind -> category -> allowed roles), before anything else
 *      resolves — this project has already shipped one enumeration-oracle
 *      bug from checking a resource before the gate; there is no resource
 *      here to leak, but the ordering stays consistent with confirmUpload
 *      and attachUpload, which do look one up.
 *   2. resolve and validate the mime type against the kind
 *   3. enforce the byte ceiling BEFORE any row is written or any signature
 *      is minted, so a rejection costs nothing and reads as a sentence the
 *      caller can act on
 *   4. derive the folder and mint the public_id server-side — never from
 *      client input
 *   5. reserve the row, THEN mint the ticket. Reversing this order would let
 *      a client walk away with a valid signature that references no row in
 *      Postgres — an unreclaimable orphan the moment the upload lands.
 */
export async function requestUploadTicket(
  input: RequestUploadTicketInput,
): Promise<RequestUploadTicketResult> {
  const category = categoryForKind(input.kind);
  if (!category) return { ok: false, error: NOT_AUTHORIZED };

  const allowed = await verifiedActor(input.actorId, input.actorRole, ALLOWED_ROLES_BY_CATEGORY[category]);
  if (!allowed) return { ok: false, error: NOT_AUTHORIZED };

  const resourceType = resourceTypeForMime(input.mimeType);
  if (!resourceType) return { ok: false, error: UNSUPPORTED_FILE_TYPE };
  if (!ALLOWED_RESOURCE_TYPES_BY_KIND[input.kind].includes(resourceType)) {
    return { ok: false, error: UNSUPPORTED_FILE_TYPE };
  }

  const allowedFormats = allowedFormatsForMime(input.mimeType);
  if (!allowedFormats) return { ok: false, error: UNSUPPORTED_FILE_TYPE };

  const maxBytes = maxBytesForKind(input.kind, resourceType);

  try {
    assertWithinSizeLimit(input.byteSize, resourceType);
  } catch (error) {
    // FileTooLargeError's message is a plan-limit sentence with no secret
    // in it ("This image is 14.0 MB. The maximum is 10.0 MB.") — safe to
    // return verbatim. Anything else is unexpected and propagates.
    if (error instanceof FileTooLargeError) return { ok: false, error: error.message };
    throw error;
  }

  if (input.byteSize > maxBytes) {
    const mb = (n: number) => `${(n / (1024 * 1024)).toFixed(1)} MB`;
    return {
      ok: false,
      error: `This file is ${mb(input.byteSize)}. The maximum is ${mb(maxBytes)}.`,
    };
  }

  const folder = FOLDER_BY_CATEGORY[category];
  const uploadPreset = uploadPresetForKind(input.kind);
  // Cryptographically random and opaque on purpose: not derived from the
  // filename, the kind, or the actor, so it cannot be guessed or enumerated
  // to probe for someone else's upload (rule 5's spirit applied to an
  // identifier, not just a secret). The folder is passed separately to
  // Cloudinary and never concatenated in here — see the CRT-1004 lesson in
  // certificate-issue.service.ts for what happens when that rule slips.
  const publicId = randomUUID();

  const reserved = await mediaAssetRepository.reserve({
    publicId,
    resourceType: toDbResourceType(resourceType),
    folder,
    uploadedByUserId: input.actorId,
    expectedFormats: allowedFormats,
    maxBytes,
  });

  const ticket = createSignedUploadTicket({
    folder,
    publicId,
    resourceType,
    allowedFormats,
    maxBytes,
    uploadPreset,
    notificationUrl: uploadWebhookUrl(),
  });

  return { ok: true, ticket, mediaAssetId: reserved.id };
}

// ---------------------------------------------------------------------------
// confirmUpload
// ---------------------------------------------------------------------------

export type ConfirmUploadInput = z.infer<typeof confirmUploadRequestSchema> & {
  actorId: string;
};

export type ConfirmUploadResult = { ok: true } | { ok: false; error: string };

/**
 * The browser's own, optimistic report that its direct upload to Cloudinary
 * succeeded — called immediately after, so the UI can show the file without
 * waiting on the async webhook below.
 *
 * Its word is not authoritative. `confirmUploadRequestSchema` deliberately
 * carries nothing but `{ mediaAssetId, publicId }` — no client-reported
 * size, format or dimensions, because a client-sent fact is not a fact
 * (rule 4). This endpoint is deliberately a no-op acknowledgement: only a
 * signature-verified provider webhook may transition a RESERVED row to
 * ACTIVE. Until that notification arrives, attaching remains impossible and
 * the stale-reservation reaper can reclaim an abandoned upload.
 */
export async function confirmUpload(input: ConfirmUploadInput): Promise<ConfirmUploadResult> {
  const asset = await mediaAssetRepository.findById(input.mediaAssetId);
  if (!asset) return { ok: false, error: NOT_AUTHORIZED };
  // Only the actor who reserved this upload may confirm it — otherwise one
  // user could confirm (and thereby activate) another user's reservation.
  if (asset.uploadedByUserId !== input.actorId) return { ok: false, error: NOT_AUTHORIZED };

  if (asset.purgeState === "RESERVED") {
    // First confirmation for this row: `asset.publicId` is still the bare
    // id minted at reservation time (nothing has promoted it yet) —
    // exactly the value `isAuthenticReturnedPublicId` needs as
    // `mintedPublicId`. A straight equality check here (the pre-2026-08-14
    // behaviour) rejected every raw upload, because Cloudinary legitimately
    // returns that id with the folder folded in and, for raw, an extension
    // appended. A client-sent value is input to validate, not a fact (rule
    // 4) — reject anything that does not match the prefix rule before
    // trusting it for anything else.
    if (!isAuthenticReturnedPublicId(input.publicId, asset.folder, asset.publicId)) {
      return { ok: false, error: NOT_AUTHORIZED };
    }

    // No database mutation here. The public id and every descriptive fact
    // remain untrusted until Cloudinary sends its signed webhook.
  } else if (asset.publicId !== input.publicId) {
    // The row has already been promoted — by an earlier call to this same
    // function, or by the webhook winning the race — so `asset.publicId`
    // is now the SETTLED authoritative id, and a legitimate replay (the
    // client resending the same report) carries that exact value. Re-run
    // the prefix rule here would break: it would treat the now-authoritative
    // `asset.publicId` as a bare minted id and double-prefix the folder,
    // rejecting every genuine replay. A claim that does not match the
    // settled id is not a replay of this upload, so it is rejected rather
    // than silently accepted.
    return { ok: false, error: NOT_AUTHORIZED };
  }

  return { ok: true };
}

// ---------------------------------------------------------------------------
// attachUpload
// ---------------------------------------------------------------------------

export type AttachUploadInput = {
  mediaAssetId: string;
  owner: MediaAssetOwnerRef;
  actorId: string;
  actorRole: UserRole;
};

export type AttachUploadResult = { ok: true } | { ok: false; error: string };

/**
 * Binds a confirmed asset to the row that now owns it. Called by whichever
 * domain service just created or is finalising that row (module creation,
 * gallery photo, announcement, forum post/reply) — by the time `owner`
 * reaches here its id is already a real row that service just validated and
 * wrote, so this does not re-parse it with zod; the boundary was the
 * caller's own request handler.
 *
 * Authorize (same role table `requestUploadTicket` used, keyed by the
 * owner's category instead of a kind string — a trainer may attach to a
 * module, only an admin to a gallery photo or announcement), THEN look the
 * asset up, THEN check both ownership and that its folder actually matches
 * the category being attached to (defense in depth: a MODULE_FILE upload
 * cannot be attached as a GALLERY_PHOTO even if both checks above pass).
 */
export async function attachUpload(input: AttachUploadInput): Promise<AttachUploadResult> {
  const category = categoryForOwner(input.owner);

  const allowed = await verifiedActor(input.actorId, input.actorRole, ALLOWED_ROLES_BY_CATEGORY[category]);
  if (!allowed) return { ok: false, error: NOT_AUTHORIZED };

  const asset = await mediaAssetRepository.findById(input.mediaAssetId);
  if (!asset) return { ok: false, error: NOT_AUTHORIZED };
  if (asset.uploadedByUserId !== input.actorId) return { ok: false, error: NOT_AUTHORIZED };
  if (asset.folder !== FOLDER_BY_CATEGORY[category]) return { ok: false, error: NOT_AUTHORIZED };

  const attached = await mediaAssetRepository.attachToOwner(input.mediaAssetId, input.owner);
  if (attached > 0) return { ok: true };

  // Zero rows is ambiguous by itself: a harmless replay of an attach that
  // already succeeded, or a genuine conflict (not ACTIVE yet, or already
  // bound to a different owner). Re-read and compare rather than reporting
  // a false failure on what might be a legitimate retry (rule 2).
  const current = await mediaAssetRepository.findById(input.mediaAssetId);
  if (current && ownerMatches(current, input.owner)) return { ok: true };
  return { ok: false, error: NOT_AUTHORIZED };
}

// ---------------------------------------------------------------------------
// applyUploadWebhook
// ---------------------------------------------------------------------------

/**
 * Best-effort extraction of the facts Cloudinary's notification actually
 * reports (its documented upload-notification fields — public_id,
 * secure_url, bytes, format, width, height, duration). Assumed shape of
 * `CloudinaryWebhookPayload`; if Builder A's type names these differently,
 * `tsc` will point at exactly this function.
 */
function factsFromWebhookPayload(payload: CloudinaryWebhookPayload): MediaAssetConfirmFacts {
  return {
    url: payload.secure_url,
    bytes: payload.bytes,
    format: payload.format,
    width: typeof payload.width === "number" ? payload.width : null,
    height: typeof payload.height === "number" ? payload.height : null,
    durationSec: typeof payload.duration === "number" ? Math.round(payload.duration) : null,
  };
}

/**
 * Locate the row a webhook delivery is about.
 *
 * Tries an exact match first — this is what fires for a duplicate delivery
 * (confirm already ran, or a previous webhook already promoted the row) and
 * is the common case, since `confirmUpload` typically runs synchronously
 * right after the browser's direct upload, before this async notification
 * ever arrives. Falls back to `candidateMintedIdFromFolder` for the race
 * where the webhook wins and arrives first, while the row is still keyed by
 * the bare minted id. Both are single point lookups on the unique `publicId`
 * index — never a scan, never a per-row Admin API call.
 */
async function findAssetForWebhook(claimedPublicId: string): Promise<MediaAsset | null> {
  const exact = await mediaAssetRepository.findByPublicId(claimedPublicId);
  if (exact) return exact;

  const candidateMintedId = candidateMintedIdFromFolder(claimedPublicId);
  if (!candidateMintedId) return null;
  return mediaAssetRepository.findByPublicId(candidateMintedId);
}

/**
 * Apply a signature-verified Cloudinary upload notification — the
 * authoritative confirmation, as opposed to `confirmUpload`'s optimistic
 * one above. The caller (the /api/uploads/webhook route) has already
 * verified the signature over the exact raw body before this runs; this
 * function does no authentication of its own because there is no actor
 * here, only a trusted provider callback.
 *
 * Validates the provider's actual type, detected format, byte count, folder,
 * and public-id ownership against the reservation before activating it. A
 * provider-authenticated object that maps to the reservation but fails one
 * of those facts is queued for purge with its real deletion handle instead.
 *
 * Idempotent by construction, not by a check added here: `confirm` is
 * guarded to RESERVED-only, so a duplicate delivery (Cloudinary retries
 * webhooks) finds the row already ACTIVE and no-ops. An unknown public_id
 * (asset already purged, or a delivery for something outside this registry)
 * also no-ops — the route acks 200 either way, since there is nothing to
 * act on and nothing to gain by distinguishing the two to a third party.
 */
export async function applyUploadWebhook(payload: CloudinaryWebhookPayload): Promise<void> {
  const publicId = payload.public_id;
  if (!publicId) return;

  const asset = await findAssetForWebhook(publicId);
  if (!asset) return;
  if (asset.purgeState !== "RESERVED") return;

  const expectedFormats = expectedFormatsForReservedAsset(asset);
  if (!expectedFormats) return;

  // A folder/id mismatch could refer to a different object. Do not put that
  // foreign handle into this row, even for cleanup.
  if (!isProviderOwnedReturnedPublicId(publicId, asset.folder, asset.publicId, payload.format)) return;

  const providerResourceType = toDbResourceType(payload.resource_type);
  const matchesPolicy =
    providerResourceType === asset.resourceType &&
    expectedFormats.includes(payload.format) &&
    payload.bytes <= asset.bytes;
  const facts = factsFromWebhookPayload(payload);

  if (!matchesPolicy) {
    await mediaAssetRepository.rejectProviderUpload({
      id: asset.id,
      expectedPublicId: asset.publicId,
      publicId,
      resourceType: providerResourceType,
      facts,
    });
    return;
  }

  await mediaAssetRepository.confirmProviderUpload({
    id: asset.id,
    expectedPublicId: asset.publicId,
    publicId,
    facts,
  });
}
