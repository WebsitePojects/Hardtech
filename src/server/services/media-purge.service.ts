import { randomUUID } from "node:crypto";

import type { MediaResourceType, Prisma } from "@/../generated/prisma/client";

import {
  mediaAssetRepository,
  type MediaAssetOwnerRef,
} from "@/server/repositories/media-asset.repository";
import { destroyAsset } from "@/server/storage/cloudinary";

/**
 * The outbox drain that makes "delete in the system deletes it in
 * Cloudinary" true (.claude/rules/00-non-negotiables.md rule 7).
 *
 * An owner's own delete transaction only ever flips its MediaAsset rows to
 * PENDING (see `scheduleOwnerAssetsForPurge` below and
 * mediaAssetRepository.markPendingForOwner) — it never calls Cloudinary
 * itself. A third-party network call has no place inside a database
 * transaction: it would hold a connection and row locks open for however
 * long that call takes, and a Postgres commit gives no proof the network
 * call also succeeded. This module is the worker that actually calls
 * Cloudinary, on its own schedule, with bounded retry to a terminal state.
 *
 * Nothing in this file is wired to a scheduler yet — see the module-level
 * TODO at the bottom.
 */

const DEFAULT_BACKOFF_BASE_SECONDS = 30;
const MAX_BACKOFF_SECONDS = 60 * 60;
const MAX_PURGE_ERROR_LENGTH = 300;

export type PurgeBatchResult = {
  claimed: number;
  purged: number;
  failed: number;
  abandoned: number;
};

/** The function signature `destroyAsset` satisfies. Exists so tests can
 *  inject a deterministic stub instead of calling the real Cloudinary API —
 *  see the `destroy` parameter on `purgeDueAssets` below. */
export type DestroyAssetFn = (
  publicId: string,
  resourceType: "image" | "video" | "raw",
) => Promise<boolean>;

function toCloudinaryResourceType(resourceType: MediaResourceType): "image" | "video" | "raw" {
  if (resourceType === "VIDEO") return "video";
  if (resourceType === "RAW") return "raw";
  return "image";
}

/**
 * Exponential backoff, capped at an hour, keyed off the attempt number that
 * just failed. Bounded so a sustained Cloudinary outage cannot turn into a
 * tight retry loop hammering the same rows every time the worker runs.
 */
function backoffSeconds(attemptNumber: number): number {
  const seconds = DEFAULT_BACKOFF_BASE_SECONDS * 2 ** Math.max(0, attemptNumber - 1);
  return Math.min(seconds, MAX_BACKOFF_SECONDS);
}

/**
 * Strips anything that looks like provider request internals before a
 * failure reason is persisted — Cloudinary SDK errors have been seen to
 * echo back signed URL components. `lastPurgeError` is a plain-text column
 * a human reads while debugging the outbox; it is not a secret store, but
 * rule 6 ("never log or return secrets, tokens, or PII") applies to it
 * exactly as it would to a log line. Bounded in length for the same reason
 * `truncatePurgeError` bounds it again at the repository layer — belt and
 * suspenders, since this is the one function on the write path that ever
 * sees an unredacted provider error.
 */
function sanitizePurgeError(error: unknown): string {
  const message = error instanceof Error ? error.message : "Unknown purge error.";
  // Matches the key=value pair regardless of what precedes it (`?`, `&`,
  // `;`, plain whitespace, start of string) — a provider error is free-text,
  // not a URL, so anchoring only to query-string delimiters would miss it.
  const stripped = message.replace(/(signature|api_key|token)=\S+/gi, "$1=[redacted]");
  return stripped.length > MAX_PURGE_ERROR_LENGTH
    ? `${stripped.slice(0, MAX_PURGE_ERROR_LENGTH)}…`
    : stripped;
}

/**
 * Record one failed destroy attempt: retry-with-backoff, or terminal
 * abandonment once `maxAttempts` is reached. `asset.purgeAttempts` is the
 * count of failures recorded BEFORE this claim (see
 * mediaAssetRepository.ClaimedMediaAsset), so the attempt that just failed
 * is `purgeAttempts + 1`.
 *
 * Returns `"lost-lease"` when neither repository call actually affected a
 * row — this worker's lease expired mid-attempt and a newer worker has
 * already claimed the row, so this outcome belongs to neither the "still
 * retrying" nor the "abandoned" bucket.
 */
async function recordFailure(
  asset: { id: string; purgeAttempts: number },
  leaseOwner: string,
  errorMessage: string,
  maxAttempts: number,
): Promise<"retrying" | "abandoned" | "lost-lease"> {
  const attemptNumber = asset.purgeAttempts + 1;

  if (attemptNumber >= maxAttempts) {
    const count = await mediaAssetRepository.markPurgeAbandoned(asset.id, leaseOwner, errorMessage);
    return count > 0 ? "abandoned" : "lost-lease";
  }

  const nextAttemptAt = new Date(Date.now() + backoffSeconds(attemptNumber) * 1000);
  const count = await mediaAssetRepository.markPurgeFailed(
    asset.id,
    leaseOwner,
    errorMessage,
    nextAttemptAt,
  );
  return count > 0 ? "retrying" : "lost-lease";
}

/**
 * Leases and processes up to `limit` due rows.
 *
 * Two workers can call this concurrently without duplicating work:
 * `claimPurgeBatch` leases with `FOR UPDATE SKIP LOCKED` so each row is
 * claimed by exactly one caller, and `markPurged` / `markPurgeFailed` /
 * `markPurgeAbandoned` are all guarded on `leaseOwner` matching THIS call's
 * own freshly generated owner id, so a straggler whose lease already
 * expired and was reassigned cannot overwrite whatever the new holder does
 * with the row (see the repository's doc comments on those three methods).
 *
 * One row's failure is caught and recorded per-row — never allowed to abort
 * the batch — because a single bad row (a malformed publicId, a provider
 * 5xx) must not block every other row's cleanup behind it.
 */
export async function purgeDueAssets(input: {
  limit: number;
  leaseSeconds: number;
  maxAttempts: number;
  /** Injectable for tests. Defaults to the real Cloudinary call — never
   *  call the real provider from a test; pass a deterministic stub instead
   *  (see tests/mutations/media-purge.test.mjs). */
  destroy?: DestroyAssetFn;
}): Promise<PurgeBatchResult> {
  const destroy = input.destroy ?? destroyAsset;
  const leaseOwner = randomUUID();

  const claimed = await mediaAssetRepository.claimPurgeBatch({
    leaseOwner,
    leaseSeconds: input.leaseSeconds,
    limit: input.limit,
  });

  let purged = 0;
  let failed = 0;
  let abandoned = 0;

  for (const asset of claimed) {
    try {
      // A `true` here means "Cloudinary reports nothing exists at this
      // public_id" — see destroyAsset's doc comment in cloudinary.ts. It is
      // NOT proof this call is what deleted it, and NOT proof the id was
      // ever valid in the first place: a wrong id (the pre-fix raw defect)
      // reads back identically. Treated here only as "the goal state
      // holds," which is the only claim this worker is entitled to make —
      // never logged or reported as a confirmed deletion receipt.
      const goalStateHolds = await destroy(
        asset.publicId,
        toCloudinaryResourceType(asset.resourceType),
      );

      if (goalStateHolds) {
        const count = await mediaAssetRepository.markPurged(asset.id, leaseOwner);
        if (count > 0) purged += 1;
        // count === 0: this lease expired and a newer worker claimed the
        // row before this markPurged ran. Not this attempt's failure — the
        // row belongs to someone else now — so it is not counted as failed
        // or abandoned either.
        continue;
      }

      const outcome = await recordFailure(
        asset,
        leaseOwner,
        "Provider refused to delete this asset.",
        input.maxAttempts,
      );
      if (outcome === "abandoned") abandoned += 1;
      if (outcome === "retrying") failed += 1;
    } catch (error) {
      const outcome = await recordFailure(
        asset,
        leaseOwner,
        sanitizePurgeError(error),
        input.maxAttempts,
      );
      if (outcome === "abandoned") abandoned += 1;
      if (outcome === "retrying") failed += 1;
    }
  }

  return { claimed: claimed.length, purged, failed, abandoned };
}

/**
 * Wraps the reaper for RESERVED rows abandoned before a ticket was ever
 * used, or whose upload was never confirmed — see
 * mediaAssetRepository.reapStaleReservations. Moves them into the same
 * PENDING queue `purgeDueAssets` drains, so an abandoned upload flow does
 * not leak a Cloudinary object silently forever.
 */
export async function reapStaleUploads(input: {
  olderThanMinutes: number;
  limit: number;
}): Promise<{ reaped: number }> {
  const reaped = await mediaAssetRepository.reapStaleReservations(input);
  return { reaped };
}

/**
 * Detach and schedule every media asset owned by `owner` for Cloudinary
 * deletion.
 *
 * `tx` is REQUIRED, not optional and not defaulted — unlike the repository
 * method it wraps — specifically so this cannot be called outside a
 * transaction by omission.
 *
 * CALL THIS FROM INSIDE the same transaction that deletes (or otherwise
 * removes ownership from) the owning row — a Module, GalleryPhoto,
 * Announcement, ForumPost, or Reply — and nowhere else. Calling it after
 * that transaction has already committed reintroduces the exact orphan this
 * outbox exists to prevent: the owner row is already gone, so if this call
 * is then lost to a crash, a thrown exception, or a forgotten `await`,
 * nothing will ever revisit that Cloudinary object again. The owner's own
 * transaction is what makes this NOT a fire-and-forget side effect (rule
 * 7) — and only for as long as it is actually inside it.
 */
export function scheduleOwnerAssetsForPurge(
  owner: MediaAssetOwnerRef,
  tx: Prisma.TransactionClient,
): Promise<number> {
  return mediaAssetRepository.markPendingForOwner(owner, tx);
}

// ---------------------------------------------------------------------------
// STILL NEEDS SCHEDULING (not done this wave — see the Programmer's report):
//   - purgeDueAssets on a recurring schedule (e.g. a Vercel Cron route
//     calling it every 1-5 minutes with a bounded limit/lease).
//   - reapStaleUploads on a slower recurring schedule (e.g. hourly).
// Neither is wired to a cron trigger yet. Calling either from an
// unauthenticated route would need its own auth story (a shared secret
// header, e.g. CRON_SECRET, checked before running) — do not expose either
// as an open POST endpoint.
// ---------------------------------------------------------------------------
