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
import { assertWithinSizeLimit, FileTooLargeError } from "@/server/storage/cloudinary";
import {
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
type MediaCategory = "MODULE" | "GALLERY" | "ANNOUNCEMENT" | "FORUM";

const FOLDER_BY_CATEGORY: Record<MediaCategory, string> = {
  MODULE: "hardtech/modules",
  GALLERY: "hardtech/gallery",
  ANNOUNCEMENT: "hardtech/announcements",
  FORUM: "hardtech/forum",
};

const ALLOWED_ROLES_BY_CATEGORY: Record<MediaCategory, readonly UserRole[]> = {
  MODULE: ["TRAINER", "ADMIN"],
  GALLERY: ["ADMIN"],
  ANNOUNCEMENT: ["ADMIN"],
  FORUM: ["TRAINEE", "TRAINER", "ADMIN"],
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
  POST_ATTACHMENT: ["image", "raw"],
  REPLY_ATTACHMENT: ["image", "raw"],
};

function categoryForKind(kind: UploadKind): MediaCategory | null {
  switch (kind) {
    case "MODULE_FILE":
      return "MODULE";
    case "GALLERY_PHOTO":
      return "GALLERY";
    case "ANNOUNCEMENT_MEDIA":
      return "ANNOUNCEMENT";
    case "POST_ATTACHMENT":
      return "FORUM";
    case "REPLY_ATTACHMENT":
      return "FORUM";
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
  return "FORUM"; // postId or replyId
}

function ownerMatches(asset: MediaAsset, owner: MediaAssetOwnerRef): boolean {
  if ("moduleId" in owner) return asset.moduleId === owner.moduleId;
  if ("galleryPhotoId" in owner) return asset.galleryPhotoId === owner.galleryPhotoId;
  if ("announcementId" in owner) return asset.announcementId === owner.announcementId;
  if ("postId" in owner) return asset.postId === owner.postId;
  return asset.replyId === owner.replyId;
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

  try {
    assertWithinSizeLimit(input.byteSize, resourceType);
  } catch (error) {
    // FileTooLargeError's message is a plan-limit sentence with no secret
    // in it ("This image is 14.0 MB. The maximum is 10.0 MB.") — safe to
    // return verbatim. Anything else is unexpected and propagates.
    if (error instanceof FileTooLargeError) return { ok: false, error: error.message };
    throw error;
  }

  const folder = FOLDER_BY_CATEGORY[category];
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
  });

  const ticket = createSignedUploadTicket({
    folder,
    publicId,
    resourceType,
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
 * (rule 4). This call therefore records placeholder facts and flips
 * RESERVED -> ACTIVE so `attachUpload` can proceed right away;
 * `applyUploadWebhook` below is the one that (usually) supplies the real
 * numbers Cloudinary itself reports. If the webhook happens to win the race
 * and gets there first, `confirm` is guarded to RESERVED-only and this call
 * affects zero rows — a harmless replay per rule 2, not an error, and
 * exactly what "return success" below does with it.
 */
export async function confirmUpload(input: ConfirmUploadInput): Promise<ConfirmUploadResult> {
  const asset = await mediaAssetRepository.findById(input.mediaAssetId);
  if (!asset) return { ok: false, error: NOT_AUTHORIZED };
  // Only the actor who reserved this upload may confirm it — otherwise one
  // user could confirm (and thereby activate) another user's reservation.
  if (asset.uploadedByUserId !== input.actorId) return { ok: false, error: NOT_AUTHORIZED };
  if (asset.publicId !== input.publicId) return { ok: false, error: NOT_AUTHORIZED };

  const placeholderFacts: MediaAssetConfirmFacts = {
    url: null,
    bytes: 0,
    format: null,
    width: null,
    height: null,
    durationSec: null,
  };
  await mediaAssetRepository.confirm(asset.id, placeholderFacts);

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
    url: payload.secure_url ?? null,
    bytes: typeof payload.bytes === "number" ? payload.bytes : 0,
    format: payload.format ?? null,
    width: typeof payload.width === "number" ? payload.width : null,
    height: typeof payload.height === "number" ? payload.height : null,
    durationSec: typeof payload.duration === "number" ? Math.round(payload.duration) : null,
  };
}

/**
 * Apply a signature-verified Cloudinary upload notification — the
 * authoritative confirmation, as opposed to `confirmUpload`'s optimistic
 * one above. The caller (the /api/uploads/webhook route) has already
 * verified the signature over the exact raw body before this runs; this
 * function does no authentication of its own because there is no actor
 * here, only a trusted provider callback.
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

  const asset = await mediaAssetRepository.findByPublicId(publicId);
  if (!asset) return;

  await mediaAssetRepository.confirm(asset.id, factsFromWebhookPayload(payload));
}
