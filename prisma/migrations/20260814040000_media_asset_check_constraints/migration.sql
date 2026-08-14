-- Integrity CHECK constraints for MediaAsset, not expressible in
-- prisma/schema.prisma's DSL (same limitation documented in
-- prisma/migrations/20260729173000_author_rating_integrity/migration.sql).
-- Hand-authored as a follow-up migration rather than folded into
-- 20260814034208_media_asset_registry because that migration is already
-- applied and recorded in _prisma_migrations with a checksum — editing an
-- applied migration file in place would desync the checksum and force a
-- destructive `prisma migrate reset` the next time anyone runs
-- `prisma migrate dev`. A follow-up ALTER TABLE migration is the safe path,
-- and it is cheap here: MediaAsset has zero rows in every environment this
-- has been applied to so far, so validating these CHECKs is instantaneous.

-- Byte counts and retry counters are accumulating, never-negative numbers,
-- same reasoning as every other *_non_negative guard in this project.
ALTER TABLE "MediaAsset"
  ADD CONSTRAINT "MediaAsset_bytes_non_negative"
  CHECK ("bytes" >= 0);

ALTER TABLE "MediaAsset"
  ADD CONSTRAINT "MediaAsset_purge_attempts_non_negative"
  CHECK ("purgeAttempts" >= 0);

-- Fail-closed guard for the outbox's terminal "gone" state (non-negotiables
-- rule 3 and rule 7): a row claiming PURGED with no purgedAt would mean the
-- system asserts a Cloudinary file is deleted without being able to prove
-- when. Every other purgeState is unconstrained by this rule.
ALTER TABLE "MediaAsset"
  ADD CONSTRAINT "MediaAsset_purged_state_has_timestamp"
  CHECK ("purgeState" <> 'PURGED' OR "purgedAt" IS NOT NULL);
