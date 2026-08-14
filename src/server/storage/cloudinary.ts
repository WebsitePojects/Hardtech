import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";

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
 * Hard limits of the account plan, verified against the Cloudinary console.
 *
 * These are enforced BEFORE upload so a user gets a sentence they can act on
 * ("that image is 14 MB, the limit is 10 MB") instead of an opaque provider
 * rejection after waiting for the transfer to finish.
 *
 * Keep these in sync with the plan. Raising the plan without raising these
 * only means we reject things the provider would have accepted; letting them
 * drift the other way means users hit provider errors we promised to catch.
 */
export const STORAGE_LIMITS = {
  /** Images: 10 MB. */
  maxImageBytes: 10 * 1024 * 1024,
  /** Video: 100 MB. */
  maxVideoBytes: 100 * 1024 * 1024,
  /** Raw files (PDF, docs): 10 MB. */
  maxRawBytes: 10 * 1024 * 1024,
  /** Single image: 25 megapixels. Cloudinary enforces this; we surface it. */
  maxImageMegapixels: 25,
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
   */
  adminApiRequestsPerHour: 500,
} as const;

export class FileTooLargeError extends Error {
  constructor(actualBytes: number, limitBytes: number, kind: string) {
    const mb = (n: number) => `${(n / (1024 * 1024)).toFixed(1)} MB`;
    super(`This ${kind} is ${mb(actualBytes)}. The maximum is ${mb(limitBytes)}.`);
    this.name = "FileTooLargeError";
  }
}

/** Byte ceiling for a resource kind, from the plan limits above. */
export function maxBytesFor(resourceType: "image" | "video" | "raw"): number {
  if (resourceType === "video") return STORAGE_LIMITS.maxVideoBytes;
  if (resourceType === "raw") return STORAGE_LIMITS.maxRawBytes;
  return STORAGE_LIMITS.maxImageBytes;
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
                `This image is too large to process. The maximum is ${STORAGE_LIMITS.maxImageMegapixels} megapixels — try resizing it.`,
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
 */
export async function destroyAsset(
  publicId: string,
  resourceType: "image" | "raw" = "image",
): Promise<boolean> {
  const api = client();
  const result = await api.uploader.destroy(publicId, {
    resource_type: resourceType,
    invalidate: true,
  });
  return result.result === "ok" || result.result === "not found";
}
