import { createHash } from "node:crypto";

import { db } from "@/server/db";

/**
 * Shared fixed-window rate limiting for authentication and upload-signing
 * entry points. The counter lives in Postgres, so separate Next.js workers,
 * cold starts, and deployments all consume the same five-attempt minute.
 *
 * The database stores only a SHA-256 digest of the caller-provided bucket,
 * never the source IP address or user id embedded in it. This module neither
 * logs keys nor exposes database/provider errors to callers.
 */

const WINDOW_MS = 60_000;
const MAX_ATTEMPTS_PER_WINDOW = 5;
const MAX_KEY_LENGTH = 200;
const HASHED_KEY_LENGTH = 64;
const CLEANUP_BATCH_SIZE = 100;

export interface RateLimitResult {
  allowed: boolean;
  retryAfterMs: number;
}

type RateLimitRow = { allowed: boolean; retryAfterMs: number };

/** Only known server-composed bucket namespaces and conservative identifier
 * characters are accepted. A malformed key is denied before it can reach SQL.
 */
function hashBucketKey(key: string): string | null {
  if (
    key.length === 0 ||
    key.length > MAX_KEY_LENGTH ||
    !/^(?:login|forgot-password|uploads:sign):[A-Za-z0-9._:-]+$/.test(key)
  ) {
    return null;
  }
  return createHash("sha256").update(key).digest("hex");
}

async function cleanupExpiredWindows(): Promise<void> {
  // Bounded cleanup keeps this append-heavy table finite without turning an
  // auth request into an unbounded maintenance scan. The windowStart index
  // in the migration serves this ordered retention query.
  await db.$executeRaw`
    DELETE FROM "RateLimitWindow"
    WHERE ctid IN (
      SELECT ctid
      FROM "RateLimitWindow"
      WHERE "windowStart" < date_trunc('minute', NOW()) - INTERVAL '1 day'
      ORDER BY "windowStart" ASC
      LIMIT ${CLEANUP_BATCH_SIZE}
    )
  `;
}

/**
 * Atomically consumes one attempt from a shared, minute-aligned window.
 *
 * `INSERT .. ON CONFLICT .. DO UPDATE .. WHERE count < max RETURNING` means
 * every concurrent caller competes on the primary key in Postgres. Exactly
 * five callers receive a returned row; later callers receive no row and are
 * denied. Any malformed key or database error also denies, never bypasses.
 */
export async function checkRateLimit(key: string): Promise<RateLimitResult> {
  const bucketKey = hashBucketKey(key);
  if (!bucketKey || bucketKey.length !== HASHED_KEY_LENGTH) {
    return { allowed: false, retryAfterMs: WINDOW_MS };
  }

  try {
    const rows = await db.$queryRaw<RateLimitRow[]>`
      WITH current_window AS (
        SELECT date_trunc('minute', NOW()) AS "windowStart"
      ),
      attempted AS (
        INSERT INTO "RateLimitWindow" ("bucketKey", "windowStart", "count", "updatedAt")
        SELECT ${bucketKey}, "windowStart", 1, NOW()
        FROM current_window
        ON CONFLICT ("bucketKey", "windowStart")
        DO UPDATE SET
          "count" = "RateLimitWindow"."count" + 1,
          "updatedAt" = NOW()
        WHERE "RateLimitWindow"."count" < ${MAX_ATTEMPTS_PER_WINDOW}
        RETURNING "count"
      )
      SELECT
        EXISTS (SELECT 1 FROM attempted) AS "allowed",
        GREATEST(
          1,
          CEIL(EXTRACT(EPOCH FROM ((SELECT "windowStart" FROM current_window) + INTERVAL '1 minute' - NOW())) * 1000)
        )::INTEGER AS "retryAfterMs"
    `;

    await cleanupExpiredWindows();
    const row = rows[0];
    if (!row) return { allowed: false, retryAfterMs: WINDOW_MS };
    return row.allowed ? { allowed: true, retryAfterMs: 0 } : { allowed: false, retryAfterMs: row.retryAfterMs };
  } catch {
    return { allowed: false, retryAfterMs: WINDOW_MS };
  }
}
