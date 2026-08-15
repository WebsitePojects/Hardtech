-- Admin audit log needs to filter AND sort: by actor (newest first), and
-- with no category filter at all (newest first, unfiltered). Neither was
-- servable by the existing [category, createdAt] / [actorUserId] indexes.
--
-- SAFETY FOR A LIVE DATABASE: this migration is safe to run online only
-- while AuditLog is still small (this is an early-stage app; locally it is
-- a few hundred rows). Postgres builds a plain CREATE INDEX under an
-- exclusive lock that blocks writes to the table for the build's duration —
-- fine on a small table, not fine once AuditLog is genuinely large (this is
-- a "keep forever" growth-shaped table per .claude/rules/50-database.md).
-- Before running this against a production-sized AuditLog, a DBA should
-- instead run the two CREATE INDEX statements below individually with
-- CONCURRENTLY, outside of a migration transaction (CONCURRENTLY cannot run
-- inside the transaction Prisma wraps migration.sql in), then mark this
-- migration as already-applied via `prisma migrate resolve --applied`.

-- DropIndex
DROP INDEX "AuditLog_actorUserId_idx";

-- CreateIndex
CREATE INDEX "AuditLog_actorUserId_createdAt_idx" ON "AuditLog"("actorUserId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");
