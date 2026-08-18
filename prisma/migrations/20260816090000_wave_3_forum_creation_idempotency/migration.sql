-- Wave 3: database-enforced idempotency for forum post/reply creation.
--
-- Online/backfill-safe strategy:
-- - Add nullable columns with no default, so existing ForumPost/Reply rows
--   remain valid and the table is not rewritten.
-- - Enforce uniqueness with concurrent unique indexes. Postgres permits many
--   NULLs in a unique index, so legacy rows with no key do not conflict while
--   future non-null create keys are duplicate-safe.
-- - Do not wrap this migration in an explicit transaction: CREATE INDEX
--   CONCURRENTLY must run outside a transaction block.

ALTER TABLE "ForumPost"
  ADD COLUMN IF NOT EXISTS "idempotencyKey" TEXT;

ALTER TABLE "Reply"
  ADD COLUMN IF NOT EXISTS "idempotencyKey" TEXT;

CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS "ForumPost_idempotencyKey_key"
  ON "ForumPost"("idempotencyKey");

CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS "Reply_idempotencyKey_key"
  ON "Reply"("idempotencyKey");
