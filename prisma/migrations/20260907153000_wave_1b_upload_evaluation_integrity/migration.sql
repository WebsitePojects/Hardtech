-- Wave 1B: durable evaluation idempotency and active-evaluation integrity.
--
-- EvaluationIntent is append-only by application policy: a trainer's new
-- intent may revise the current Evaluation, but the original idempotency key
-- remains reserved forever. This makes a delayed retry a replay rather than
-- a second assessment or audit event. The table grows one row per assessment
-- attempt and is retained alongside evaluation history.
--
-- The existing Evaluation table can be large. Its partial unique index is
-- deliberately built CONCURRENTLY: it enforces one current assessment per
-- (enrollment, trainer) while preserving revoked history, and does not block
-- normal reads/writes during the build. As with the repository's other
-- concurrent-index migrations, deploy this file outside an explicit SQL
-- transaction (Prisma migration files must not add BEGIN/COMMIT around it).

CREATE TABLE "EvaluationIntent" (
  "id" TEXT NOT NULL,
  "idempotencyKey" TEXT NOT NULL,
  "enrollmentId" TEXT NOT NULL,
  "trainerId" TEXT NOT NULL,
  "fingerprint" TEXT NOT NULL,
  "evaluationId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "EvaluationIntent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX CONCURRENTLY "EvaluationIntent_idempotencyKey_key"
  ON "EvaluationIntent"("idempotencyKey");

CREATE INDEX CONCURRENTLY "EvaluationIntent_enrollmentId_createdAt_idx"
  ON "EvaluationIntent"("enrollmentId", "createdAt");

CREATE INDEX CONCURRENTLY "EvaluationIntent_trainerId_createdAt_idx"
  ON "EvaluationIntent"("trainerId", "createdAt");

-- One non-revoked assessment is the current value for a trainer/enrollment.
-- Revoked rows remain legal and retain the undo/audit history.
CREATE UNIQUE INDEX CONCURRENTLY "Evaluation_active_enrollment_trainer_key"
  ON "Evaluation"("enrollmentId", "trainerId")
  WHERE "revokedAt" IS NULL;

ALTER TABLE "EvaluationIntent"
  ADD CONSTRAINT "EvaluationIntent_enrollmentId_fkey"
  FOREIGN KEY ("enrollmentId") REFERENCES "Enrollment"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "EvaluationIntent"
  ADD CONSTRAINT "EvaluationIntent_trainerId_fkey"
  FOREIGN KEY ("trainerId") REFERENCES "User"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "EvaluationIntent"
  ADD CONSTRAINT "EvaluationIntent_evaluationId_fkey"
  FOREIGN KEY ("evaluationId") REFERENCES "Evaluation"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
