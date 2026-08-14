import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";
import { z } from "zod";

/**
 * The only module that configures or talks to Cloudinary.
 *
 * Same rule as src/server/db.ts and the Prisma client: nothing else
 * constructs or configures this SDK. Services call the functions below;
 * repositories and components never import this file.
 *
 * Configuration is read lazily on first use rather than at module load.
 * `prisma.config.ts` taught this lesson already — resolving env eagerly makes
 * every command that merely imports the module fail when a variable is absent,
 * including ones that never touch the service. Here it means `next build` can
 * compile a deployment whose Cloudinary variables are set in the host's
 * dashboard rather than at build time.
 *
 * Secrets never leave this module. The API secret is read from the
 * environment, handed straight to the SDK, and is never logged, returned, or
 * embedded in an error message (non-negotiable rule 6).
 */

/**
 * Free-tier defaults, verified against the Cloudinary console. Used whenever
 * an env override below is absent or malformed.
 *
 * These MUST be kept at or below the actual plan limits. Setting them higher
 * than the plan allows does not unlock anything — it only lets a user wait
 * through a long upload that Cloudinary then rejects at the end, which is
 * strictly worse than rejecting it up front.
 */
const DEFAULT_LIMITS_MB = {
  image: 10,
  video: 100,
  raw: 10,
} as const;
const DEFAULT_MAX_IMAGE_MEGAPIXELS = 25;

/**
 * Admin API allowance is 500 requests per hour on this plan, and it is a
 * SHARED bucket across the whole deployment.
 *
 * Uploading and destroying go through the Upload API, which is unlimited —
 * so the ordinary write path is safe. What is NOT safe is listing, searching
 * or fetching resource metadata in a loop: those are Admin API calls, and a
 * bulk reconciliation job over a few hundred assets can exhaust the hour's
 * budget in one run and lock out the rest of the application.
 *
 * Rule for this codebase: never call the Admin API per-row. Persist the
 * public_id at write time (we do) so cleanup and delivery never need to ask
 * Cloudinary what exists.
 *
 * Not env-overridable — this is a fact about the plan's Admin API tier, not
 * a knob we want raised as a side effect of someone bumping a storage limit.
 */
const ADMIN_API_REQUESTS_PER_HOUR = 500;

/** A positive integer, or the value is treated as absent (rule 3: fail
 *  closed — a malformed override must never be read as "unlimited"). */
const positiveIntEnv = z.coerce.number().int().positive();

/**
 * Read one plan-limit override from the environment.
 *
 * Reads `process.env` on every call rather than once at module load — see
 * the file header. A missing var falls back to the safe default; a present
 * but malformed one (non-numeric, zero, negative, fractional) also falls
 * back to the default rather than being treated as "no limit". Silently
 * accepting garbage as unlimited would violate fail-closed for the sake of a
 * typo in a dashboard env var.
 */
function envOverrideMb(name: string, fallbackMb: number): number {
  const raw = process.env[name];
  if (raw === undefined) return fallbackMb;
  const parsed = positiveIntEnv.safeParse(raw);
  return parsed.success ? parsed.data : fallbackMb;
}

export type StorageLimits = {
  maxImageBytes: number;
  maxVideoBytes: number;
  maxRawBytes: number;
  maxImageMegapixels: number;
  adminApiRequestsPerHour: number;
};

/**
 * Resolve the account's plan limits, applying env overrides over the
 * free-tier defaults.
 *
 * A config change (setting `CLOUDINARY_MAX_VIDEO_MB` etc. in the host's
 * dashboard) is enough to raise a limit after a plan upgrade — no code
 * change or redeploy required. Exported so the UI can show a user the
 * ceiling before they pick a file, rather than after a failed upload.
 */
export function storageLimits(): StorageLimits {
  const mb = (n: number) => n * 1024 * 1024;
  return {
    maxImageBytes: mb(envOverrideMb("CLOUDINARY_MAX_IMAGE_MB", DEFAULT_LIMITS_MB.image)),
    maxVideoBytes: mb(envOverrideMb("CLOUDINARY_MAX_VIDEO_MB", DEFAULT_LIMITS_MB.video)),
    maxRawBytes: mb(envOverrideMb("CLOUDINARY_MAX_RAW_MB", DEFAULT_LIMITS_MB.raw)),
    maxImageMegapixels: envOverrideMb(
      "CLOUDINARY_MAX_IMAGE_MEGAPIXELS",
      DEFAULT_MAX_IMAGE_MEGAPIXELS,
    ),
    adminApiRequestsPerHour: ADMIN_API_REQUESTS_PER_HOUR,
  };
}

export class FileTooLargeError extends Error {
  constructor(actualBytes: number, limitBytes: number, kind: string) {
    const mb = (n: number) => `${(n / (1024 * 1024)).toFixed(1)} MB`;
    super(`This ${kind} is ${mb(actualBytes)}. The maximum is ${mb(limitBytes)}.`);
    this.name = "FileTooLargeError";
  }
}

/** Byte ceiling for a resource kind, from the plan limits above. */
export function maxBytesFor(resourceType: "image" | "video" | "raw"): number {
  const limits = storageLimits();
  if (resourceType === "video") return limits.maxVideoBytes;
  if (resourceType === "raw") return limits.maxRawBytes;
  return limits.maxImageBytes;
}

/**
 * Reject oversized payloads before the network call.
 *
 * Throws rather than returning a flag: an upload that exceeds the plan cannot
 * proceed, and a caller that forgets to check a boolean would otherwise send
 * it anyway (fail closed).
 */
export function assertWithinSizeLimit(
  bytes: number,
  resourceType: "image" | "video" | "raw",
): void {
  const limit = maxBytesFor(resourceType);
  if (bytes > limit) throw new FileTooLargeError(bytes, limit, resourceType);
}

export type StoredAsset = {
  /** Cloudinary's `public_id`. This is the delete handle — persist it on the
   *  owning row or the asset becomes an orphan nobody can reclaim. */
  publicId: string;
  /** HTTPS delivery URL. */
  url: string;
  bytes: number;
  format: string;
  width: number | null;
  height: number | null;
};

export class StorageNotConfiguredError extends Error {
  constructor(missing: string[]) {
    super(`Cloudinary is not configured. Missing: ${missing.join(", ")}.`);
    this.name = "StorageNotConfiguredError";
  }
}

let configured = false;

function requiredEnv(): { cloudName: string; apiKey: string; apiSecret: string } {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  const missing: string[] = [];
  if (!cloudName) missing.push("CLOUDINARY_CLOUD_NAME");
  if (!apiKey) missing.push("CLOUDINARY_API_KEY");
  if (!apiSecret) missing.push("CLOUDINARY_API_SECRET");

  // Fail closed. An unconfigured storage layer must refuse to run, never
  // silently no-op — a no-op upload would let a certificate be marked issued
  // with no file behind it (rule 3).
  if (missing.length > 0) throw new StorageNotConfiguredError(missing);

  return { cloudName: cloudName!, apiKey: apiKey!, apiSecret: apiSecret! };
}

function client() {
  if (!configured) {
    const { cloudName, apiKey, apiSecret } = requiredEnv();
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });
    configured = true;
  }
  return cloudinary;
}

/** True when every required variable is present. Lets a caller degrade a
 *  feature gracefully instead of throwing — used by health checks and by the
 *  admin UI to explain why uploads are unavailable. */
export function isStorageConfigured(): boolean {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET,
  );
}

/**
 * The public half of the Cloudinary configuration — safe to hand to a
 * browser or embed in a signed-upload ticket. `signed-upload.ts` (the direct
 * browser-upload feature) calls this instead of touching `process.env`
 * itself, so this file stays the only place that decides which env vars are
 * required and the only place that ever holds the secret.
 */
export function publicConfig(): { cloudName: string; apiKey: string } {
  const { cloudName, apiKey } = requiredEnv();
  return { cloudName, apiKey };
}

/**
 * Sign a set of upload parameters for a direct-to-Cloudinary browser upload.
 *
 * This is the only function in the codebase that calls
 * `cloudinary.utils.api_sign_request`, and therefore the only function that
 * ever holds the API secret for this purpose. `signed-upload.ts` decides
 * WHAT gets signed (folder, public_id, timestamp, notification_url) and
 * calls this to sign it; the secret itself never crosses that boundary.
 */
export function signParams(paramsToSign: Record<string, string | number>): string {
  const api = client();
  const { apiSecret } = requiredEnv();
  return api.utils.api_sign_request(paramsToSign, apiSecret);
}

/**
 * Compute the hash Cloudinary signs webhook deliveries with:
 * `SHA1(rawBody + timestamp + api_secret)`.
 *
 * Delegates to the SDK's own `utils.webhook_signature`, which reads the
 * secret from this module's configured client rather than from an argument
 * — so, like `signParams`, this is the only place the secret is touched.
 * `signed-upload.ts` supplies the exact raw request body and timestamp and
 * gets back a hash to compare; it never sees the secret.
 */
export function computeWebhookSignature(rawBody: string, timestampSeconds: number): string {
  const api = client();
  return api.utils.webhook_signature(rawBody, timestampSeconds);
}

function toStoredAsset(res: UploadApiResponse): StoredAsset {
  return {
    publicId: res.public_id,
    url: res.secure_url,
    bytes: res.bytes,
    format: res.format,
    width: res.width ?? null,
    height: res.height ?? null,
  };
}

/**
 * Upload bytes and return the handle needed to serve and later delete them.
 *
 * `folder` segments the account so a deployment's assets stay separable
 * (certificates, gallery, materials). `publicId` is optional: pass a stable,
 * caller-derived id to make the upload idempotent — re-uploading the same id
 * with `overwrite` replaces the asset instead of creating a duplicate, which
 * is what a retried request should do (rule 2).
 */
export async function uploadAsset(input: {
  bytes: Buffer;
  folder: string;
  publicId?: string;
  /**
   * Cloudinary infers this for images. Set it explicitly for anything else:
   * "raw" for PDFs and documents, "video" for video.
   *
   * The choice decides which size ceiling applies — 10 MB for image and raw,
   * 100 MB for video — so it is not merely a hint.
   */
  resourceType?: "image" | "raw" | "video" | "auto";
}): Promise<StoredAsset> {
  const api = client();

  // Enforced here, not only at the call site, so no future caller can bypass
  // the plan's ceiling by forgetting to check first.
  const sizeKind =
    input.resourceType === "video" ? "video" : input.resourceType === "raw" ? "raw" : "image";
  assertWithinSizeLimit(input.bytes.byteLength, sizeKind);

  return new Promise<StoredAsset>((resolve, reject) => {
    const stream = api.uploader.upload_stream(
      {
        folder: input.folder,
        public_id: input.publicId,
        overwrite: Boolean(input.publicId),
        resource_type: input.resourceType ?? "auto",
        // Cloudinary derives the extension; keeping the caller's id clean
        // means the stored public_id is exactly what we persist.
        use_filename: false,
        unique_filename: !input.publicId,
      },
      (error, result) => {
        if (error) {
          // Never surface the provider's raw error object — it can carry
          // request signatures. Translate the plan limits we know about into
          // sentences a user can act on, and keep everything else generic.
          const raw = error.message ?? "";
          if (/megapixel/i.test(raw)) {
            reject(
              new Error(
                `This image is too large to process. The maximum is ${storageLimits().maxImageMegapixels} megapixels — try resizing it.`,
              ),
            );
            return;
          }
          if (/file size|too large|maximum.*size/i.test(raw)) {
            reject(new Error("This file exceeds the maximum size allowed."));
            return;
          }
          if (/rate limit|too many requests/i.test(raw)) {
            reject(
              new Error("Storage is temporarily rate limited. Please try again shortly."),
            );
            return;
          }
          reject(new Error("Upload failed. Please try again."));
          return;
        }
        if (!result) {
          reject(new Error("Upload failed: provider returned no result."));
          return;
        }
        resolve(toStoredAsset(result));
      },
    );

    stream.end(input.bytes);
  });
}

/**
 * Delete an asset by its `public_id`.
 *
 * Idempotent by design: Cloudinary answers `not found` for an id that is
 * already gone, and this treats that as success. A cleanup path must be safe
 * to retry — the goal state is "the asset does not exist", and a second
 * attempt that finds it already deleted has achieved that goal.
 *
 * Returns false only when the provider refused for some other reason, so the
 * caller can decide whether to retry or record an orphan.
 *
 * IMPORTANT — what a `true` return does and does NOT prove (2026-08-14
 * lesson): it proves only that Cloudinary now reports nothing exists at
 * `publicId`. It is NOT proof this call is what deleted anything, and it is
 * NOT proof `publicId` was ever a real object's id in the first place — a
 * WRONG public_id (e.g. the raw-upload id-mismatch defect this lesson
 * describes) reads back identically as `true`, because "not found" and
 * "deleted" collapse to the same goal-state answer on purpose. A caller
 * that treats `true` as a deletion receipt rather than a goal-state check
 * can silently leak a file forever while reporting success. See
 * media-purge.service.ts for where that distinction actually matters.
 *
 * `resourceType` must match what the asset was uploaded as — Cloudinary scopes
 * `public_id` per resource type, so destroying a video with the default
 * `"image"` silently targets the wrong (nonexistent) resource and reports
 * `not found` instead of actually deleting anything. The purge worker deletes
 * video assets and needs `"video"` to be a valid choice here.
 */
export async function destroyAsset(
  publicId: string,
  resourceType: "image" | "raw" | "video" = "image",
): Promise<boolean> {
  const api = client();
  const result = await api.uploader.destroy(publicId, {
    resource_type: resourceType,
    invalidate: true,
  });
  return result.result === "ok" || result.result === "not found";
}
