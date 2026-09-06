import { z } from "zod";

/**
 * Boundary schemas for the direct-to-Cloudinary upload feature.
 *
 * The browser uploads bytes straight to Cloudinary using a signed ticket this
 * server mints (see src/server/storage/signed-upload.ts) — our server never
 * receives the file body. These schemas guard the two requests our server
 * DOES see: a client asking for a ticket, and Cloudinary's webhook
 * confirming an upload actually landed.
 */

export type UploadResourceType = "image" | "video" | "raw";

/**
 * Purposes a signed upload can be requested for. Each maps to a fixed folder
 * and public_id shape server-side (the service layer that owns folder
 * naming), so the set of places a client can ask to write to is closed, not
 * client-supplied.
 */
// Deliberately does NOT include an enrollment-proof kind: every kind here
// goes through requestUploadTicket, which authorizes via verifiedActor
// against an *existing, signed-in* User row. `/enroll` submits before that
// account is guaranteed to exist yet (submitEnrollment creates it inline via
// findOrCreateApplicant), so there is no actor to authorize a ticket
// against. Payment-proof upload instead goes straight through
// storage/cloudinary.ts's uploadAsset from inside the enrollment Server
// Action — see src/server/services/enrollment.service.ts — the same
// server-authoritative-upload shape certificate-issue.service.ts already
// uses, just registered in the MediaAsset outbox afterward instead of not
// at all.
export const uploadKindSchema = z.enum([
  "MODULE_FILE",
  "GALLERY_PHOTO",
  "ANNOUNCEMENT_MEDIA",
  "ASSIGNMENT_SUBMISSION",
  "POST_ATTACHMENT",
  "REPLY_ATTACHMENT",
  "MESSAGE_ATTACHMENT",
]);
export type UploadKind = z.infer<typeof uploadKindSchema>;

/**
 * What a client may ask to upload.
 *
 * Deliberately does NOT have a `folder`, `publicId`, or `resourceType`
 * field. Those are derived server-side from `kind` and `mimeType` (see
 * `resourceTypeForMime` below and the service layer that owns folder
 * naming). If a client could name its own folder or resource type, a
 * ticket meant for `hardtech/modules` could be requested by any upload kind
 * and used to write into a location its role was never granted — leaving the
 * fields out of the schema makes that impossible to even express, rather
 * than relying on a runtime check that a future caller could forget.
 *
 * `.strict()` so an extra key (e.g. a client trying to smuggle `folder` in
 * anyway) is rejected outright instead of silently dropped.
 */
export const signUploadRequestSchema = z
  .object({
    kind: uploadKindSchema,
    fileName: z.string().trim().min(1).max(255),
    byteSize: z.number().int().positive(),
    mimeType: z.string().trim().min(1).max(255),
  })
  .strict();
export type SignUploadRequest = z.infer<typeof signUploadRequestSchema>;

/** What a client sends after Cloudinary accepts the direct upload, so the
 *  server can look up the pending asset and reconcile it. The webhook (not
 *  this request) is what actually confirms the upload — this only tells the
 *  server which row to check. */
export const confirmUploadRequestSchema = z
  .object({
    mediaAssetId: z.string().trim().min(1).max(255),
    publicId: z.string().trim().min(1).max(255),
  })
  .strict();
export type ConfirmUploadRequest = z.infer<typeof confirmUploadRequestSchema>;

/**
 * Cloudinary's upload webhook payload.
 *
 * Permissive about fields this app doesn't read: Cloudinary adds fields to
 * this payload over time, and a schema that rejected on any unrecognized key
 * would start failing real webhooks on the provider's next release. Strict
 * about the *type* of every field this app does read — zod's default object
 * behaviour (no `.strict()`, no `.passthrough()`) already drops unknown keys
 * without erroring, which is exactly the permissiveness wanted here.
 */
export const cloudinaryWebhookPayloadSchema = z.object({
  public_id: z.string().min(1),
  secure_url: z.string().optional(),
  bytes: z.number().optional(),
  format: z.string().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  duration: z.number().optional(),
  resource_type: z.string().optional(),
  notification_type: z.string().optional(),
});
export type CloudinaryWebhookPayload = z.infer<typeof cloudinaryWebhookPayloadSchema>;

/**
 * Mime types this platform accepts, mapped to the Cloudinary resource type
 * that stores them.
 *
 * An allowlist, not a denylist: Cloudinary's own `"auto"` resource type will
 * happily accept anything, so the boundary against arbitrary file types has
 * to be enforced here, not left to the provider.
 */
export const MIME_ALLOWLIST: Record<string, UploadResourceType> = {
  "image/jpeg": "image",
  "image/png": "image",
  "image/webp": "image",
  "image/gif": "image",
  "video/mp4": "video",
  "video/webm": "video",
  "video/quicktime": "video",
  "application/pdf": "raw",
  "application/msword": "raw",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "raw",
};

/**
 * Resolve the Cloudinary resource type for a mime type, or `null` when it is
 * not recognized.
 *
 * Fails closed (rule 3): an unrecognized mime type is rejected outright. It
 * is never defaulted to `"raw"` or Cloudinary's `"auto"` — silently falling
 * back to a permissive resource type is exactly the kind of gap that would
 * let an unvetted file type through this boundary.
 */
export function resourceTypeForMime(mime: string): UploadResourceType | null {
  return MIME_ALLOWLIST[mime] ?? null;
}
