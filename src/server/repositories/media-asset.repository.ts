import { db } from "@/server/db";
import type {
  Prisma,
  MediaPurgeState,
  MediaResourceType,
} from "@/../generated/prisma/client";

/** A signature was issued for exactly one of these owners. */
export type MediaAssetOwnerRef =
  | { moduleId: string }
  | { galleryPhotoId: string }
  | { announcementId: string }
  | { postId: string }
  | { replyId: string };

export type MediaAssetReserveInput = {
  publicId: string;
  resourceType: MediaResourceType;
  folder: string;
  uploadedByUserId?: string | null;
};

/** Cloudinary's own report of the uploaded object, stored once at confirm time. */
export type MediaAssetConfirmFacts = {
  url: string | null;
  bytes: number;
  format: string | null;
  width: number | null;
  height: number | null;
  durationSec: number | null;
};

export type MediaAssetClaimBatchInput = {
  leaseOwner: string;
  leaseSeconds: number;
  limit: number;
};

export type ClaimedMediaAsset = {
  id: string;
  publicId: string;
  resourceType: MediaResourceType;
  folder: string;
  /** Failures recorded before this claim — the purge worker needs this to
   *  decide retry-with-backoff vs. terminal abandonment without a second
   *  round trip. */
  purgeAttempts: number;
};

/** Claimable rows sit in the PENDING/RESERVED sliver the partial index covers
 *  (see prisma/migrations/20260814034208_media_asset_registry). Bounded well
 *  above any realistic single-lease batch so the clamp never bites a normal
 *  caller, only a misbehaving one. */
const MAX_PURGE_CLAIM_BATCH = 500;
const MAX_REAP_BATCH = 1000;
const MAX_PURGE_ERROR_LENGTH = 500;

function clampLimit(requested: number, max: number): number {
  if (!Number.isFinite(requested) || requested < 1) return 1;
  return Math.min(Math.floor(requested), max);
}

function truncatePurgeError(message: string): string {
  return message.length > MAX_PURGE_ERROR_LENGTH
    ? `${message.slice(0, MAX_PURGE_ERROR_LENGTH)}…`
    : message;
}

/**
 * Pure data access for MediaAsset — the Cloudinary handle registry and
 * deletion outbox (see the "Media asset registry" block in
 * prisma/schema.prisma for the full lifecycle rationale). No eligibility or
 * policy decisions live here: state transitions are conditional UPDATEs so
 * the caller's intent lands exactly once even under a retry or a race
 * (.claude/rules/00-non-negotiables.md rules 2 and 7), but which transition
 * to call, when, and why is the service layer's job.
 */
export const mediaAssetRepository = {
  reserve(input: MediaAssetReserveInput) {
    return db.mediaAsset.create({
      data: {
        publicId: input.publicId,
        resourceType: input.resourceType,
        folder: input.folder,
        uploadedByUserId: input.uploadedByUserId ?? null,
      },
    });
  },

  findByPublicId(publicId: string) {
    return db.mediaAsset.findUnique({ where: { publicId } });
  },

  findById(id: string) {
    return db.mediaAsset.findUnique({ where: { id } });
  },

  /**
   * RESERVED -> ACTIVE, storing the facts Cloudinary reported back. Guarded
   * on `purgeState = 'RESERVED'` so a replayed confirm (duplicate webhook,
   * retried client call) cannot resurrect a row that has since moved on —
   * in particular one already PURGED. Returns the affected row count: 1 on
   * the winning call, 0 on every replay after it.
   */
  confirm(id: string, facts: MediaAssetConfirmFacts) {
    return db.mediaAsset
      .updateMany({
        where: { id, purgeState: "RESERVED" },
        data: { purgeState: "ACTIVE", ...facts },
      })
      .then((result) => result.count);
  },

  /**
   * RESERVED -> ACTIVE's sibling for the owner side: binds a confirmed
   * asset to the row that now references it. Guarded on `purgeState =
   * 'ACTIVE'` (an asset that never got confirmed, or one already detached
   * and scheduled for deletion, must not be attachable) AND the target
   * owner column still being NULL. That second guard is what makes a
   * replayed attach safe: the first call wins and binds the column: any
   * retry of the SAME attach finds the column already NULL->non-null and
   * affects zero rows rather than re-writing it, and a call trying to
   * attach an asset already bound to a DIFFERENT owner is rejected the same
   * way instead of stealing it. Returns the affected row count so the
   * service can tell a genuine conflict from a harmless replay by reading
   * the row back (see media-upload.service.ts `attachUpload`).
   */
  attachToOwner(id: string, owner: MediaAssetOwnerRef, tx: Prisma.TransactionClient = db) {
    if ("moduleId" in owner) {
      return tx.mediaAsset
        .updateMany({
          where: { id, purgeState: "ACTIVE", moduleId: null },
          data: { moduleId: owner.moduleId },
        })
        .then((result) => result.count);
    }
    if ("galleryPhotoId" in owner) {
      return tx.mediaAsset
        .updateMany({
          where: { id, purgeState: "ACTIVE", galleryPhotoId: null },
          data: { galleryPhotoId: owner.galleryPhotoId },
        })
        .then((result) => result.count);
    }
    if ("announcementId" in owner) {
      return tx.mediaAsset
        .updateMany({
          where: { id, purgeState: "ACTIVE", announcementId: null },
          data: { announcementId: owner.announcementId },
        })
        .then((result) => result.count);
    }
    if ("postId" in owner) {
      return tx.mediaAsset
        .updateMany({
          where: { id, purgeState: "ACTIVE", postId: null },
          data: { postId: owner.postId },
        })
        .then((result) => result.count);
    }
    return tx.mediaAsset
      .updateMany({
        where: { id, purgeState: "ACTIVE", replyId: null },
        data: { replyId: owner.replyId },
      })
      .then((result) => result.count);
  },

  /**
   * Detaches an owner and schedules its asset for deletion. Called from
   * inside the owner's own delete transaction (hence the optional `tx`) so
   * the FK-null and the PENDING flip commit atomically with the owner's
   * removal — never as a separate fire-and-forget step. RESERVED and ACTIVE
   * are the only source states; a row already PENDING, PURGED, or FAILED is
   * left alone; the case is `if`/`else` per owner column rather than a
   * dynamic key so every Prisma field access stays typed.
   */
  markPendingForOwner(owner: MediaAssetOwnerRef, tx: Prisma.TransactionClient = db) {
    const claimableStates = { in: ["RESERVED", "ACTIVE"] as MediaPurgeState[] };
    if ("moduleId" in owner) {
      return tx.mediaAsset
        .updateMany({
          where: { moduleId: owner.moduleId, purgeState: claimableStates },
          data: { purgeState: "PENDING", moduleId: null },
        })
        .then((result) => result.count);
    }
    if ("galleryPhotoId" in owner) {
      return tx.mediaAsset
        .updateMany({
          where: { galleryPhotoId: owner.galleryPhotoId, purgeState: claimableStates },
          data: { purgeState: "PENDING", galleryPhotoId: null },
        })
        .then((result) => result.count);
    }
    if ("announcementId" in owner) {
      return tx.mediaAsset
        .updateMany({
          where: { announcementId: owner.announcementId, purgeState: claimableStates },
          data: { purgeState: "PENDING", announcementId: null },
        })
        .then((result) => result.count);
    }
    if ("postId" in owner) {
      return tx.mediaAsset
        .updateMany({
          where: { postId: owner.postId, purgeState: claimableStates },
          data: { purgeState: "PENDING", postId: null },
        })
        .then((result) => result.count);
    }
    return tx.mediaAsset
      .updateMany({
        where: { replyId: owner.replyId, purgeState: claimableStates },
        data: { purgeState: "PENDING", replyId: null },
      })
      .then((result) => result.count);
  },

  /**
   * Atomically leases up to `limit` claimable rows for one purge worker.
   * Claimable = PENDING, due (`purgeNotBefore` null or past), and not
   * currently leased by another worker. `FOR UPDATE SKIP LOCKED` is what
   * lets two workers run this concurrently without blocking on each other —
   * each walks past rows the other already has locked instead of waiting.
   * One statement, tagged-template interpolation only
   * (.claude/rules/00-non-negotiables.md rule 4).
   */
  claimPurgeBatch(input: MediaAssetClaimBatchInput) {
    const limit = clampLimit(input.limit, MAX_PURGE_CLAIM_BATCH);
    return db.$queryRaw<ClaimedMediaAsset[]>`
      UPDATE "MediaAsset"
      SET "leaseOwner" = ${input.leaseOwner},
          "leaseExpiresAt" = NOW() + make_interval(secs => ${input.leaseSeconds})
      WHERE id IN (
        SELECT id FROM "MediaAsset"
        WHERE "purgeState" = 'PENDING'
          AND ("purgeNotBefore" IS NULL OR "purgeNotBefore" <= NOW())
          AND ("leaseExpiresAt" IS NULL OR "leaseExpiresAt" <= NOW())
        ORDER BY "purgeNotBefore" ASC NULLS FIRST, "createdAt" ASC
        LIMIT ${limit}
        FOR UPDATE SKIP LOCKED
      )
      RETURNING "id", "publicId", "resourceType", "folder", "purgeAttempts"
    `;
  },

  /**
   * PENDING (leased) -> PURGED, terminal. Guarded on `purgeState = 'PENDING'
   * AND leaseOwner = <caller's lease>` — both, not just the state. The state
   * alone is not enough: if this worker's lease expired mid-destroy (slow
   * Cloudinary call) and `claimPurgeBatch` handed the row to a second
   * worker, the row is still PENDING while that second worker holds it, so
   * a state-only guard would let the straggler overwrite whatever the new
   * owner does next. Requiring `leaseOwner` to still match this worker's own
   * id is what actually prevents that — the previous version of this method
   * guarded on state only and its comment claimed otherwise; it did not.
   */
  markPurged(id: string, leaseOwner: string) {
    return db.mediaAsset
      .updateMany({
        where: { id, purgeState: "PENDING", leaseOwner },
        data: { purgeState: "PURGED", purgedAt: new Date(), leaseOwner: null, leaseExpiresAt: null },
      })
      .then((result) => result.count);
  },

  /**
   * One failed attempt: stays PENDING (still retryable), records a bounded,
   * non-secret error string, releases the lease, and pushes the next
   * attempt out to `nextAttemptAt` so the claim scan skips it until then.
   * Guarded on `purgeState = 'PENDING' AND leaseOwner = <caller's lease>`
   * for the same reason as `markPurged` above: state alone does not prove
   * this caller still holds the row, only that nobody has finished it yet.
   */
  markPurgeFailed(id: string, leaseOwner: string, error: string, nextAttemptAt: Date) {
    return db.mediaAsset
      .updateMany({
        where: { id, purgeState: "PENDING", leaseOwner },
        data: {
          purgeAttempts: { increment: 1 },
          lastPurgeError: truncatePurgeError(error),
          purgeNotBefore: nextAttemptAt,
          leaseOwner: null,
          leaseExpiresAt: null,
        },
      })
      .then((result) => result.count);
  },

  /**
   * Bounded retries exhausted: PENDING -> FAILED, terminal, needs a human.
   * Same `purgeState = 'PENDING' AND leaseOwner = <caller's lease>` guard as
   * `markPurged`/`markPurgeFailed` — a lease-expired straggler must not be
   * able to abandon a row a different worker is now actively retrying.
   */
  markPurgeAbandoned(id: string, leaseOwner: string, error: string) {
    return db.mediaAsset
      .updateMany({
        where: { id, purgeState: "PENDING", leaseOwner },
        data: {
          purgeState: "FAILED",
          lastPurgeError: truncatePurgeError(error),
          leaseOwner: null,
          leaseExpiresAt: null,
        },
      })
      .then((result) => result.count);
  },

  /**
   * RESERVED rows older than the window either never got an upload or got
   * one that was never confirmed — either way Cloudinary may be holding
   * bytes nothing in Postgres references anymore, so they join the same
   * PENDING queue a deleted owner would create. Bounded and lock-skipping
   * for the same reason as `claimPurgeBatch`: this runs on a schedule and
   * must never contend with a concurrent run of itself.
   */
  reapStaleReservations(input: { olderThanMinutes: number; limit: number }) {
    const limit = clampLimit(input.limit, MAX_REAP_BATCH);
    return db.$queryRaw<{ id: string }[]>`
      UPDATE "MediaAsset"
      SET "purgeState" = 'PENDING'
      WHERE id IN (
        SELECT id FROM "MediaAsset"
        WHERE "purgeState" = 'RESERVED'
          AND "createdAt" <= NOW() - make_interval(mins => ${input.olderThanMinutes})
        ORDER BY "createdAt" ASC
        LIMIT ${limit}
        FOR UPDATE SKIP LOCKED
      )
      RETURNING "id"
    `.then((rows) => rows.length);
  },
};
