import "dotenv/config";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import pg from "pg";

const { programRepository } = await import("../../src/server/repositories/program.repository.ts");
const { enrollmentRepository } = await import("../../src/server/repositories/enrollment.repository.ts");
const {
  coalesceEnrollmentSubmission,
  submitEnrollment,
} = await import("../../src/server/services/enrollment.service.ts");
const {
  getPrograms,
  getPublishedProgramBySlug,
} = await import("../../src/server/services/marketing.service.ts");
const { db } = await import("../../src/server/db.ts");

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;

function tag() {
  return `${Date.now()}-${randomUUID().slice(0, 8)}`;
}

async function withClient(callback) {
  assert.ok(connectionString, "database is configured");
  const client = new pg.Client({ connectionString });
  await client.connect();
  try {
    return await callback(client);
  } finally {
    await client.end();
  }
}

async function insertProgram(client, { id, name, slug, catalogStatus, enrollmentOpen, sortOrder }) {
  await client.query(
    `INSERT INTO "Program"
      (id, name, slug, "catalogStatus", "enrollmentOpen", "sortOrder", "shortName", description, "durationLabel", "scheduleLabel", "levelLabel", "priceAmount", "createdAt", "updatedAt")
     VALUES
      ($1, $2, $3, $4::"ProgramCatalogStatus", $5, $6, $7, 'Catalog contract test.', '1 day', 'Weekdays', 'Beginner', 1234.50, NOW(), NOW())`,
    [id, name, slug, catalogStatus, enrollmentOpen, sortOrder, name],
  );
}

test("program catalog migration declares a closed-by-default, immutable public contract", async () => {
  const [schema, migration] = await Promise.all([
    readFile("prisma/schema.prisma", "utf8"),
    readFile("prisma/migrations/20260908180000_program_catalog_contract/migration.sql", "utf8"),
  ]);

  assert.match(schema, /enum ProgramCatalogStatus\s*\{[\s\S]*DRAFT[\s\S]*PUBLISHED[\s\S]*ARCHIVED/);
  assert.match(schema, /slug\s+String\s+@unique/);
  assert.match(schema, /catalogStatus\s+ProgramCatalogStatus\s+@default\(DRAFT\)/);
  assert.match(schema, /enrollmentOpen\s+Boolean\s+@default\(false\)/);
  assert.match(schema, /@@index\(\[catalogStatus, sortOrder, id\]\)/);
  assert.match(schema, /@@index\(\[catalogStatus, enrollmentOpen, id\]\)/);
  assert.match(migration, /WHEN 'Computer Hardware Servicing' THEN 'PUBLISHED'/);
  assert.match(migration, /WHEN 'Cellphone Hardware Servicing' THEN 'PUBLISHED'/);
  assert.match(migration, /ELSE 'DRAFT'/);
  assert.match(migration, /CREATE TRIGGER "Program_slug_immutable"/);
  assert.match(migration, /CREATE UNIQUE INDEX "Program_slug_key"/);
});

test("public catalog reads only published records in explicit order while preserving closed public pages", async () => {
  await withClient(async (client) => {
    const suffix = tag();
    const programs = [
      { id: `catalog-${suffix}-open`, name: `Catalog open ${suffix}`, slug: `catalog-open-${suffix}`, catalogStatus: "PUBLISHED", enrollmentOpen: true, sortOrder: 20 },
      { id: `catalog-${suffix}-closed`, name: `Catalog closed ${suffix}`, slug: `catalog-closed-${suffix}`, catalogStatus: "PUBLISHED", enrollmentOpen: false, sortOrder: 10 },
      { id: `catalog-${suffix}-draft`, name: `Catalog draft ${suffix}`, slug: `catalog-draft-${suffix}`, catalogStatus: "DRAFT", enrollmentOpen: false, sortOrder: 1 },
      { id: `catalog-${suffix}-archive`, name: `Catalog archive ${suffix}`, slug: `catalog-archive-${suffix}`, catalogStatus: "ARCHIVED", enrollmentOpen: false, sortOrder: 2 },
    ];

    try {
      for (const program of programs) await insertProgram(client, program);

      const internal = await programRepository.findAll();
      assert.deepEqual(
        internal.filter((program) => program.id.startsWith(`catalog-${suffix}`)).map((program) => program.id),
        [programs[2].id, programs[3].id, programs[1].id, programs[0].id],
        "internal reads intentionally retain all lifecycle states in deterministic order",
      );

      const publicCatalog = await getPrograms();
      assert.deepEqual(
        publicCatalog.filter((program) => program.id.startsWith(`catalog-${suffix}`)).map((program) => program.id),
        [programs[1].id, programs[0].id],
        "marketing catalog returns PUBLISHED rows only, ordered by sortOrder",
      );
      assert.equal((await getPublishedProgramBySlug(programs[1].slug))?.id, programs[1].id);
      assert.equal((await getPublishedProgramBySlug(programs[2].slug)), null, "draft slug is fail-closed");
      assert.equal(await getPublishedProgramBySlug("not a valid slug"), null, "invalid slug is fail-closed");
      await assert.rejects(
        () => client.query('UPDATE "Program" SET slug = $1 WHERE id = $2', [`changed-${programs[0].slug}`, programs[0].id]),
        /Program slug is immutable/,
        "database trigger prevents a durable public identifier from changing",
      );
    } finally {
      await client.query('DELETE FROM "Program" WHERE id = ANY($1::text[])', [programs.map((program) => program.id)]);
    }
  });
});

test("checkout accepts only published/open IDs before any applicant or payment write", async () => {
  await withClient(async (client) => {
    const suffix = tag();
    const programs = [
      { id: `catalog-checkout-${suffix}-open`, name: `Catalog checkout open ${suffix}`, slug: `catalog-checkout-open-${suffix}`, catalogStatus: "PUBLISHED", enrollmentOpen: true, sortOrder: 10 },
      { id: `catalog-checkout-${suffix}-closed`, name: `Catalog checkout closed ${suffix}`, slug: `catalog-checkout-closed-${suffix}`, catalogStatus: "PUBLISHED", enrollmentOpen: false, sortOrder: 20 },
      { id: `catalog-checkout-${suffix}-draft`, name: `Catalog checkout draft ${suffix}`, slug: `catalog-checkout-draft-${suffix}`, catalogStatus: "DRAFT", enrollmentOpen: false, sortOrder: 30 },
    ];
    const email = `catalog-checkout-${suffix}@example.com`;
    const idempotencyKey = `catalog-checkout-${suffix}`;

    try {
      for (const program of programs) await insertProgram(client, program);
      const purchasable = await enrollmentRepository.findPurchasableProgramsByIds(programs.map((program) => program.id));
      assert.deepEqual(purchasable.map((program) => program.id), [programs[0].id]);
      assert.equal(purchasable[0]?.priceAmount.toString(), "1234.5", "the server-owned price is selected from Program");

      await assert.rejects(
        () => submitEnrollment({
          idempotencyKey,
          programIds: [programs[1].id],
          trainee: { firstName: "Catalog", lastName: "Rejected", email, phone: "09171234567", password: "ValidPassword1!" },
          paymentMethod: "GCASH",
          proof: { bytes: Buffer.from("not-reached"), mimeType: "image/png" },
        }),
        /One or more programs are unavailable/,
      );
      assert.equal((await client.query('SELECT COUNT(*)::int AS count FROM "User" WHERE email = $1', [email])).rows[0]?.count, 0);
      assert.equal((await client.query('SELECT COUNT(*)::int AS count FROM "EnrollmentPayment" WHERE "idempotencyKey" = $1', [idempotencyKey])).rows[0]?.count, 0);
    } finally {
      await client.query('DELETE FROM "Program" WHERE id = ANY($1::text[])', [programs.map((program) => program.id)]);
    }
  });
});

test("catalog eligibility does not weaken in-process concurrent idempotency coalescing", async () => {
  const key = `catalog-idempotency-${tag()}`;
  let calls = 0;
  const intent = () => coalesceEnrollmentSubmission(key, async () => {
    calls += 1;
    await Promise.resolve();
    return { paymentId: "payment", referenceCode: "reference", totalAmount: "1234.50", enrollmentIds: ["enrollment"] };
  });

  const [first, second] = await Promise.all([intent(), intent()]);
  assert.deepEqual(first, second);
  assert.equal(calls, 1, "concurrent duplicate intent still runs once");
  await db.$disconnect();
});
