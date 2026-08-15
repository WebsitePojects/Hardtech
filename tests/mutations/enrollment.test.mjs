import "dotenv/config";
import assert from "node:assert/strict";
import { test } from "node:test";
import pg from "pg";

const { submitEnrollment } = await import("../../src/server/services/enrollment.service.ts");
const { db } = await import("../../src/server/db.ts");
const { destroyAsset } = await import("../../src/server/storage/cloudinary.ts");
const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;

// A real, minimal, valid 1x1 transparent PNG — small enough to keep the real
// Cloudinary calls this suite makes (see the file-level note in
// tests/mutations/media-purge.test.mjs and tests/storage/signed-upload.test.mjs
// for why this suite hits the real dev Cloudinary account rather than a mock)
// fast, while still being bytes Cloudinary actually accepts as an image.
const TEST_PNG_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";

function testProofBytes() {
  return Buffer.from(TEST_PNG_BASE64, "base64");
}

/**
 * Mirrors enrollment.service.ts's private `proofPublicIdFor` so cleanup can
 * find (and destroy) exactly the Cloudinary object + MediaAsset row a given
 * idempotencyKey would have produced, without importing a private function.
 * Only used for addressing rows to clean up — every assertion below reads
 * real state back from Postgres/Cloudinary, never this function's output.
 */
function proofPublicIdFor(idempotencyKey) {
  return `enroll-${idempotencyKey.replace(/[^a-zA-Z0-9_-]/g, "_")}`;
}

/** Deletes the MediaAsset row(s) for the given idempotency keys' deterministic
 *  publicIds and destroys the matching Cloudinary objects. Safe to call with
 *  keys that never produced an asset (e.g. a replayed call that short-circuited
 *  before uploading) — such a key simply matches zero rows. */
async function cleanupProofAssets(client, idempotencyKeys) {
  const publicIds = idempotencyKeys.map(proofPublicIdFor);
  const assets = await client.query(
    'SELECT id, "publicId" FROM "MediaAsset" WHERE "publicId" = ANY($1::text[])',
    [publicIds],
  );
  for (const row of assets.rows) {
    await destroyAsset(row.publicId, "image").catch(() => undefined);
  }
  if (assets.rows.length > 0) {
    await client.query('DELETE FROM "MediaAsset" WHERE id = ANY($1::text[])', [
      assets.rows.map((row) => row.id),
    ]);
  }
}

async function deleteTraineeByEmail(client, email) {
  const trainee = await client.query('SELECT id FROM "User" WHERE email = $1', [email]);
  const traineeId = trainee.rows[0]?.id;
  if (!traineeId) return;
  await client.query(
    'DELETE FROM "CertificateRequest" WHERE "enrollmentId" IN (SELECT id FROM "Enrollment" WHERE "traineeId" = $1)',
    [traineeId],
  );
  await client.query(
    'DELETE FROM "Evaluation" WHERE "enrollmentId" IN (SELECT id FROM "Enrollment" WHERE "traineeId" = $1)',
    [traineeId],
  );
  await client.query('DELETE FROM "Enrollment" WHERE "traineeId" = $1', [traineeId]);
  await client.query('DELETE FROM "EnrollmentPayment" WHERE "traineeId" = $1', [traineeId]);
  await client.query('DELETE FROM "User" WHERE id = $1 AND email = $2', [traineeId, email]);
}

test("enrollment is idempotent, concurrent-safe, and server-prices programs", async () => {
  assert.ok(connectionString, "database connection is configured");
  const client = new pg.Client({ connectionString });
  await client.connect();

  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const email = `enrollment-${suffix}@gmail.com`;
  const programs = (await client.query('SELECT id, "priceAmount"::text AS price FROM "Program" ORDER BY id LIMIT 2')).rows;
  assert.equal(programs.length, 2, "seeded database has at least two programs");
  const input = {
    idempotencyKey: `enrollment-${suffix}-one`,
    programIds: programs.map((program) => program.id),
    trainee: { firstName: "Integration", lastName: "Applicant", email, phone: "09171234567", password: "ValidPassword1!" },
    paymentMethod: "GCASH",
    proof: { bytes: testProofBytes(), mimeType: "image/png" },
    tamperedPrice: "0.01",
  };
  const concurrentKey = `enrollment-${suffix}-concurrent`;
  const secondKey = `enrollment-${suffix}-two`;

  try {
    const first = await submitEnrollment(input);
    const replay = await submitEnrollment(input);
    assert.deepEqual(replay, first, "sequential retry replays the original result");
    const sequentialCount = await client.query(
      'SELECT COUNT(*)::int AS count FROM "EnrollmentPayment" WHERE "idempotencyKey" = $1',
      [input.idempotencyKey],
    );
    assert.equal(sequentialCount.rows[0]?.count, 1, "sequential retry creates exactly one payment");

    const concurrent = await Promise.all([
      submitEnrollment({ ...input, idempotencyKey: concurrentKey }),
      submitEnrollment({ ...input, idempotencyKey: concurrentKey }),
    ]);
    assert.deepEqual(concurrent[0], concurrent[1], "concurrent retry converges on one result");
    const concurrentCount = await client.query(
      'SELECT COUNT(*)::int AS count FROM "EnrollmentPayment" WHERE "idempotencyKey" = $1',
      [concurrentKey],
    );
    assert.equal(concurrentCount.rows[0]?.count, 1, "concurrent retry creates exactly one payment");

    const secondKeyResult = await submitEnrollment({ ...input, idempotencyKey: secondKey });
    assert.notEqual(secondKeyResult.paymentId, first.paymentId, "a different key creates a different payment");

    const stored = await client.query(
      'SELECT "totalAmount"::text AS total FROM "EnrollmentPayment" WHERE "idempotencyKey" = $1',
      [input.idempotencyKey],
    );
    const expected = programs.reduce((sum, program) => sum + Number(program.price), 0).toFixed(2);
    assert.equal(stored.rows[0]?.total, expected, "stored amount equals real Program prices, not caller input");
    assert.notEqual(stored.rows[0]?.total, input.tamperedPrice, "tampered price does not change stored amount");
  } finally {
    try {
      await client.query("BEGIN");
      await deleteTraineeByEmail(client, email);
      await client.query("COMMIT");
    } catch (cleanupError) {
      await client.query("ROLLBACK").catch(() => undefined);
      throw cleanupError;
    } finally {
      await cleanupProofAssets(client, [input.idempotencyKey, concurrentKey, secondKey]);
      await client.end();
      await db.$disconnect();
    }
  }
});

test("submitEnrollment uploads the real proof bytes to Cloudinary and registers an ACTIVE, attached MediaAsset", async () => {
  assert.ok(connectionString, "database connection is configured");
  const client = new pg.Client({ connectionString });
  await client.connect();

  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const email = `enrollment-proof-${suffix}@gmail.com`;
  const idempotencyKey = `enrollment-proof-${suffix}`;

  try {
    const programs = (await client.query('SELECT id, "priceAmount"::text AS price FROM "Program" ORDER BY id LIMIT 1')).rows;
    assert.equal(programs.length, 1, "seeded database has at least one program");

    const result = await submitEnrollment({
      idempotencyKey,
      programIds: [programs[0].id],
      trainee: { firstName: "Proof", lastName: "Applicant", email, phone: "09171234567", password: "ValidPassword1!" },
      paymentMethod: "GCASH",
      proof: { bytes: testProofBytes(), mimeType: "image/png" },
    });

    const paymentRow = await client.query(
      'SELECT "proofImageUrl" FROM "EnrollmentPayment" WHERE id = $1',
      [result.paymentId],
    );
    assert.equal(paymentRow.rows.length, 1);
    const proofImageUrl = paymentRow.rows[0].proofImageUrl;
    assert.ok(
      /^https:\/\/res\.cloudinary\.com\//.test(proofImageUrl),
      `proofImageUrl must be a real Cloudinary delivery URL, got: ${proofImageUrl.slice(0, 40)}...`,
    );
    assert.ok(!proofImageUrl.startsWith("data:"), "proofImageUrl must never be a base64 data: URI");

    const assetRow = await client.query(
      'SELECT "purgeState", "enrollmentPaymentId", "publicId", url FROM "MediaAsset" WHERE "publicId" = $1',
      [proofPublicIdFor(idempotencyKey)],
    );
    assert.equal(assetRow.rows.length, 1, "exactly one MediaAsset row is registered for the proof upload");
    assert.equal(assetRow.rows[0].purgeState, "ACTIVE", "a successfully attached asset must be ACTIVE, not RESERVED");
    assert.equal(
      assetRow.rows[0].enrollmentPaymentId,
      result.paymentId,
      "the MediaAsset must be attached to the payment it belongs to",
    );
    assert.equal(assetRow.rows[0].url, proofImageUrl, "the MediaAsset's url matches the payment's proofImageUrl");
  } finally {
    try {
      await client.query("BEGIN");
      await deleteTraineeByEmail(client, email);
      await client.query("COMMIT");
    } catch (cleanupError) {
      await client.query("ROLLBACK").catch(() => undefined);
      throw cleanupError;
    } finally {
      await cleanupProofAssets(client, [idempotencyKey]);
      await client.end();
      await db.$disconnect();
    }
  }
});

test("submitEnrollment double-fire (sequential and concurrent) creates exactly one MediaAsset, never two, for the same idempotencyKey", async () => {
  assert.ok(connectionString, "database connection is configured");
  const client = new pg.Client({ connectionString });
  await client.connect();

  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const sequentialEmail = `enrollment-df-seq-${suffix}@gmail.com`;
  const concurrentEmail = `enrollment-df-conc-${suffix}@gmail.com`;
  const sequentialKey = `enrollment-df-seq-${suffix}`;
  const concurrentKey = `enrollment-df-conc-${suffix}`;

  try {
    const programs = (await client.query('SELECT id, "priceAmount"::text AS price FROM "Program" ORDER BY id LIMIT 1')).rows;
    assert.equal(programs.length, 1, "seeded database has at least one program");
    const programIds = [programs[0].id];
    const proof = { bytes: testProofBytes(), mimeType: "image/png" };

    // Sequential double-fire: a real retry of the exact same intent.
    const sequentialInput = {
      idempotencyKey: sequentialKey,
      programIds,
      trainee: { firstName: "Seq", lastName: "Applicant", email: sequentialEmail, phone: "09171234567", password: "ValidPassword1!" },
      paymentMethod: "GCASH",
      proof,
    };
    const seqFirst = await submitEnrollment(sequentialInput);
    const seqSecond = await submitEnrollment(sequentialInput);
    assert.deepEqual(seqSecond, seqFirst, "sequential retry replays the same result");

    const seqPaymentCount = await client.query(
      'SELECT COUNT(*)::int AS count FROM "EnrollmentPayment" WHERE "idempotencyKey" = $1',
      [sequentialKey],
    );
    assert.equal(seqPaymentCount.rows[0]?.count, 1, "sequential double-fire creates exactly one EnrollmentPayment");
    const seqAssetCount = await client.query(
      'SELECT COUNT(*)::int AS count FROM "MediaAsset" WHERE "publicId" = $1',
      [proofPublicIdFor(sequentialKey)],
    );
    assert.equal(seqAssetCount.rows[0]?.count, 1, "sequential double-fire creates exactly one MediaAsset, not two");

    // Concurrent double-fire: two truly simultaneous submissions under the
    // same idempotencyKey. This races on TWO unique constraints at once —
    // MediaAsset.publicId (both calls derive the same deterministic
    // publicId) and EnrollmentPayment.idempotencyKey — which is exactly the
    // scenario enrollment.service.ts's reserveOrReuseProofAsset exists for.
    const concurrentInput = {
      idempotencyKey: concurrentKey,
      programIds,
      trainee: { firstName: "Conc", lastName: "Applicant", email: concurrentEmail, phone: "09171234567", password: "ValidPassword1!" },
      paymentMethod: "GCASH",
      proof,
    };
    const [concA, concB] = await Promise.all([
      submitEnrollment(concurrentInput),
      submitEnrollment(concurrentInput),
    ]);
    assert.deepEqual(concB, concA, "concurrent double-fire converges on one result");

    const concPaymentCount = await client.query(
      'SELECT COUNT(*)::int AS count FROM "EnrollmentPayment" WHERE "idempotencyKey" = $1',
      [concurrentKey],
    );
    assert.equal(concPaymentCount.rows[0]?.count, 1, "concurrent double-fire creates exactly one EnrollmentPayment");
    const concAssetRows = await client.query(
      'SELECT "purgeState", "enrollmentPaymentId" FROM "MediaAsset" WHERE "publicId" = $1',
      [proofPublicIdFor(concurrentKey)],
    );
    assert.equal(concAssetRows.rows.length, 1, "concurrent double-fire creates exactly one MediaAsset, not two");
    assert.equal(concAssetRows.rows[0].purgeState, "ACTIVE");
    assert.equal(
      concAssetRows.rows[0].enrollmentPaymentId,
      concA.paymentId,
      "the single surviving MediaAsset is attached to the single surviving payment",
    );
  } finally {
    try {
      await client.query("BEGIN");
      await deleteTraineeByEmail(client, sequentialEmail);
      await deleteTraineeByEmail(client, concurrentEmail);
      await client.query("COMMIT");
    } catch (cleanupError) {
      await client.query("ROLLBACK").catch(() => undefined);
      throw cleanupError;
    } finally {
      await cleanupProofAssets(client, [sequentialKey, concurrentKey]);
      await client.end();
      await db.$disconnect();
    }
  }
});
