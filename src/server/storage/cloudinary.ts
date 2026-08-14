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
  /** Cloudinary infers this for images; set "raw" for PDFs and documents. */
  resourceType?: "image" | "raw" | "auto";
}): Promise<StoredAsset> {
  const api = client();

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
          // request signatures. Keep the message generic and typed.
          reject(new Error(`Upload failed: ${error.message}`));
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
