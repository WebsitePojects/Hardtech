-- Shared, minute-aligned counters for auth and upload-signing rate limits.
--
-- `bucketKey` is a SHA-256 digest, never a raw IP address or user id. The
-- composite primary key is the atomic fixed-window conflict target used by
-- src/server/auth/rate-limit.ts. `windowStart` has its own index for bounded
-- retention cleanup; the table has no foreign keys and retains only active
-- client buckets for roughly one day.
--
-- This creates a new, empty table, so it is online-safe: no existing table is
-- rewritten or backfilled. The primary key enforces one counter per hashed
-- bucket per minute; the CHECK constraint prevents corrupt negative counts.
CREATE TABLE "RateLimitWindow" (
  "bucketKey" TEXT NOT NULL,
  "windowStart" TIMESTAMPTZ NOT NULL,
  "count" INTEGER NOT NULL,
  "updatedAt" TIMESTAMPTZ NOT NULL,
  CONSTRAINT "RateLimitWindow_pkey" PRIMARY KEY ("bucketKey", "windowStart"),
  CONSTRAINT "RateLimitWindow_count_non_negative" CHECK ("count" >= 0)
);

CREATE INDEX "RateLimitWindow_windowStart_idx"
  ON "RateLimitWindow" ("windowStart");
