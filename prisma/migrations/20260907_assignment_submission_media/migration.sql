-- Assignment submissions move from client-supplied links to a confirmed,
-- one-to-one MediaAsset ownership relation. Both new columns are nullable so
-- this migration is metadata-only for existing rows: no table rewrite and no
-- application backfill are required while legacy submissions remain readable.
ALTER TABLE "AssignmentSubmission"
  ADD COLUMN "idempotencyKey" TEXT;

ALTER TABLE "MediaAsset"
  ADD COLUMN "assignmentSubmissionId" TEXT;

-- Each intent belongs to one submission. PostgreSQL permits multiple NULLs,
-- preserving historical rows that predate idempotency keys.
CREATE UNIQUE INDEX "AssignmentSubmission_idempotencyKey_key"
  ON "AssignmentSubmission"("idempotencyKey");

-- One asset can be attached to one submission and vice versa. The unique
-- index also prevents two concurrent fresh intents from retaining two files
-- for the same submission record.
CREATE UNIQUE INDEX "MediaAsset_assignmentSubmissionId_key"
  ON "MediaAsset"("assignmentSubmissionId");

ALTER TABLE "MediaAsset"
  ADD CONSTRAINT "MediaAsset_assignmentSubmissionId_fkey"
  FOREIGN KEY ("assignmentSubmissionId") REFERENCES "AssignmentSubmission"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- The assignment eligibility query joins active enrollment by trainee and
-- batch. This compound index avoids scanning a growing enrollment table for
-- every submitted file.
CREATE INDEX "Enrollment_traineeId_batchId_status_idx"
  ON "Enrollment"("traineeId", "batchId", "status");
