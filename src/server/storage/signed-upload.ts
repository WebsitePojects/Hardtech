import { timingSafeEqual } from "node:crypto";
import { computeWebhookSignature, maxBytesFor, publicConfig, signParams } from "./cloudinary";
import { cloudinaryWebhookPayloadSchema } from "@/server/schemas/media.schema";

/**
 * Signed direct-to-Cloudinary upload tickets, and verification of the
 * webhook Cloudinary sends back once an upload lands.
 *
 * WHY THIS EXISTS: Vercel caps a serverless request body at 4.5 MB and
 * Server Actions cap around 1 MB. A 100 MB training video cannot be routed
 * through our server at any Cloudinary plan tier. So the browser POSTs the
 * file straight to Cloudinary, using a short-lived signature this module
 * mints — our server never sees the bytes.
 *
 * THE SECURITY PROPERTY: the signature covers every server-chosen parameter
 * (`timestamp`, `public_id`, `folder`, and `notification_url` when present).
 * A client holding a ticket for `folder=hardtech/modules, public_id=abc`
 * cannot repoint it at a different folder or id — changing any signed
 * parameter invalidates the signature and Cloudinary rejects the upload.
 * What `folder`/`public_id`/`resourceType` should be for a given upload
 * `kind` is a decision for the service layer, not this module; this module
 * only signs whatever parameters it is asked to sign.
 *
 * This is the only module in the codebase that computes a Cloudinary
 * signature. It never reads `CLOUDINARY_API_SECRET` and never calls
 * `cloudinary.config()` — it asks `cloudinary.ts` (the one module allowed to
 * hold the secret) to do the signing and hash computation, and only ever
 * receives the result back.
 */

export type UploadResourceType = "image" | "video" | "raw";

export type SignedUploadTicket = {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: string;
  publicId: string;
  resourceType: UploadResourceType;
  uploadUrl: string;
  maxBytes: number;
};

/**
 * Mint a short-lived ticket that lets the browser POST a file directly to
 * Cloudinary.
 *
 * `timestamp` is Unix seconds. Cloudinary rejects a signature whose
 * timestamp is more than roughly an hour old — that is this ticket's natural
 * expiry, enforced by the provider, not by anything in this function.
 *
 * Throws `StorageNotConfiguredError` (propagated from `cloudinary.ts`) when
 * Cloudinary is not configured — fail closed rather than minting a ticket
 * that cannot possibly be honoured.
 */
export function createSignedUploadTicket(input: {
  folder: string;
  publicId: string;
  resourceType: UploadResourceType;
  notificationUrl?: string;
}): SignedUploadTicket {
  const { cloudName, apiKey } = publicConfig();
  const timestamp = Math.floor(Date.now() / 1000);

  // Every parameter the client is allowed to send must be in this set —
  // anything left out of the signature is a parameter an attacker could
  // inject into the direct upload request unchecked.
  const paramsToSign: Record<string, string | number> = {
    timestamp,
    public_id: input.publicId,
    folder: input.folder,
  };
  if (input.notificationUrl) {
    paramsToSign.notification_url = input.notificationUrl;
  }

  const signature = signParams(paramsToSign);

  return {
    cloudName,
    apiKey,
    timestamp,
    signature,
    folder: input.folder,
    publicId: input.publicId,
    resourceType: input.resourceType,
    uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/${input.resourceType}/upload`,
    // Lets the browser reject an oversized file locally before starting a
    // long upload it would only have rejected by Cloudinary at the end.
    maxBytes: maxBytesFor(input.resourceType),
  };
}

export type CloudinaryWebhookPayload = {
  public_id: string;
  secure_url?: string;
  bytes?: number;
  format?: string;
  width?: number;
  height?: number;
  duration?: number;
  resource_type?: string;
  notification_type?: string;
};

/**
 * Cloudinary rejects a webhook signature older than roughly this window on
 * its own side; this bounds it independently on ours so a captured webhook
 * cannot be replayed indefinitely even if that provider behaviour ever
 * changes. Checked as an absolute difference, not just "not too old", so a
 * clock-skewed future timestamp cannot buy a longer window either.
 */
const WEBHOOK_SIGNATURE_WINDOW_SECONDS = 2 * 60 * 60;

/**
 * The authoritative confirmation that an upload really happened — the
 * browser's own word (via `confirmUploadRequestSchema`) is not trustworthy,
 * since nothing stops a client from calling that endpoint without ever
 * having uploaded anything.
 *
 * Cloudinary signs a webhook as `SHA1(rawBody + timestamp + api_secret)`.
 * This verifies against the exact raw request body string, never a
 * re-serialized JSON object — re-serialization can reorder keys or change
 * whitespace, which changes the hash even though the "meaning" of the
 * payload is unchanged (rule 5: HMAC over the exact raw bytes).
 *
 * Returns `false` for every failure — malformed timestamp, expired window,
 * length mismatch, or a genuine signature mismatch — and never throws a
 * message that would reveal which check failed.
 */
export function verifyWebhookSignature(input: {
  rawBody: string;
  timestamp: string;
  signature: string;
}): boolean {
  const timestampSeconds = Number(input.timestamp);
  if (!Number.isFinite(timestampSeconds)) return false;

  const nowSeconds = Math.floor(Date.now() / 1000);
  if (Math.abs(nowSeconds - timestampSeconds) > WEBHOOK_SIGNATURE_WINDOW_SECONDS) return false;

  let expectedHex: string;
  try {
    expectedHex = computeWebhookSignature(input.rawBody, timestampSeconds);
  } catch {
    // Cloudinary not configured, or the SDK rejected the input. Either way
    // this is a verification failure, not something to surface — fail
    // closed and reveal nothing (rule 3, rule 6).
    return false;
  }

  const provided = Buffer.from(input.signature, "hex");
  const expected = Buffer.from(expectedHex, "hex");

  // timingSafeEqual throws on mismatched lengths rather than returning
  // false, so an attacker-controlled length must be handled first.
  if (provided.length !== expected.length) return false;

  return timingSafeEqual(provided, expected);
}

/**
 * Parse a Cloudinary webhook body into the fields this app reads.
 *
 * Returns `null` on any parse failure — malformed JSON or a payload that
 * doesn't match the expected shape — so a caller never has to guard against
 * a thrown exception or a cast that lies about the shape (rule 4: parse,
 * don't cast).
 */
export function parseWebhookPayload(rawBody: string): CloudinaryWebhookPayload | null {
  let json: unknown;
  try {
    json = JSON.parse(rawBody);
  } catch {
    return null;
  }

  const parsed = cloudinaryWebhookPayloadSchema.safeParse(json);
  if (!parsed.success) return null;

  const {
    public_id,
    secure_url,
    bytes,
    format,
    width,
    height,
    duration,
    resource_type,
    notification_type,
  } = parsed.data;

  return {
    public_id,
    secure_url,
    bytes,
    format,
    width,
    height,
    duration,
    resource_type,
    notification_type,
  };
}
