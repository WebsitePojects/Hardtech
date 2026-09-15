-- Server-enforced program catalog contract.
--
-- This migration intentionally treats every pre-existing Program as a closed
-- DRAFT. Only the two names confirmed as the current public catalog are
-- published and opened. It neither deletes historical programs nor infers
-- public availability from a caller knowing a program id.
--
-- The catalog indexes use conventional CREATE INDEX so Prisma can apply this
-- migration transactionally. The table is small today; if that changes, plan
-- a separately deployed concurrent-index migration before altering it.

CREATE TYPE "ProgramCatalogStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- Add nullable columns first. This avoids a table rewrite while allowing a
-- deterministic backfill before NOT NULL / uniqueness are enforced.
ALTER TABLE "Program"
  ADD COLUMN "slug" TEXT,
  ADD COLUMN "catalogStatus" "ProgramCatalogStatus",
  ADD COLUMN "enrollmentOpen" BOOLEAN,
  ADD COLUMN "sortOrder" INTEGER;

-- Slugs for the two active catalog programs are human-readable and stable.
-- Every other legacy row receives a deterministic id-derived slug, which is
-- collision-safe without exposing an unreviewed legacy name to the catalog.
UPDATE "Program"
SET
  "slug" = CASE "name"
    WHEN 'Computer Hardware Servicing' THEN 'computer-hardware-servicing'
    WHEN 'Cellphone Hardware Servicing' THEN 'cellphone-hardware-servicing'
    ELSE 'legacy-' || "id"
  END,
  "catalogStatus" = CASE "name"
    WHEN 'Computer Hardware Servicing' THEN 'PUBLISHED'::"ProgramCatalogStatus"
    WHEN 'Cellphone Hardware Servicing' THEN 'PUBLISHED'::"ProgramCatalogStatus"
    ELSE 'DRAFT'::"ProgramCatalogStatus"
  END,
  "enrollmentOpen" = "name" IN ('Computer Hardware Servicing', 'Cellphone Hardware Servicing'),
  "sortOrder" = CASE "name"
    WHEN 'Computer Hardware Servicing' THEN 10
    WHEN 'Cellphone Hardware Servicing' THEN 20
    ELSE 0
  END;

-- Defaults preserve the closed-by-default contract for future internal rows.
-- The SQL default also supports the repository's isolated raw-SQL test
-- fixtures. Prisma mirrors this expression as a dbgenerated default; public
-- catalog creation still supplies a reviewed slug explicitly.
ALTER TABLE "Program"
  ALTER COLUMN "slug" SET DEFAULT ('program-' || md5(random()::text || clock_timestamp()::text || txid_current()::text)),
  ALTER COLUMN "catalogStatus" SET DEFAULT 'DRAFT',
  ALTER COLUMN "enrollmentOpen" SET DEFAULT FALSE,
  ALTER COLUMN "sortOrder" SET DEFAULT 0,
  ALTER COLUMN "slug" SET NOT NULL,
  ALTER COLUMN "catalogStatus" SET NOT NULL,
  ALTER COLUMN "enrollmentOpen" SET NOT NULL,
  ALTER COLUMN "sortOrder" SET NOT NULL;

ALTER TABLE "Program"
  ADD CONSTRAINT "Program_sortOrder_non_negative" CHECK ("sortOrder" >= 0) NOT VALID;
ALTER TABLE "Program" VALIDATE CONSTRAINT "Program_sortOrder_non_negative";

CREATE UNIQUE INDEX "Program_slug_key" ON "Program"("slug");
CREATE INDEX "Program_catalogStatus_sortOrder_id_idx"
  ON "Program"("catalogStatus", "sortOrder", "id");
CREATE INDEX "Program_catalogStatus_enrollmentOpen_id_idx"
  ON "Program"("catalogStatus", "enrollmentOpen", "id");

-- A slug is a durable public identifier. Keep it immutable at the database
-- boundary so an accidental admin update cannot break a shared program URL.
CREATE FUNCTION public.prevent_program_slug_change()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog
AS $$
BEGIN
  IF NEW."slug" IS DISTINCT FROM OLD."slug" THEN
    RAISE EXCEPTION 'Program slug is immutable';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER "Program_slug_immutable"
  BEFORE UPDATE OF "slug" ON "Program"
  FOR EACH ROW EXECUTE FUNCTION public.prevent_program_slug_change();

-- Do not revoke EXECUTE from PUBLIC here. PostgreSQL evaluates a trigger
-- function using the privileges of the role that performs the row update, and
-- this repository does not define a separate application role to receive an
-- explicit replacement grant. The function is only invoked by this trigger;
-- pinning search_path above keeps that execution deterministic.
