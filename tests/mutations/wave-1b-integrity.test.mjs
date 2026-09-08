import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { test } from "node:test";
import pg from "pg";

// These integration tests are deliberately opt-in and hermetic. They accept
// only a local hardtech_qa_* database and configure fake Cloudinary values
// before importing the application modules; no developer database or real
// Cloudinary account can be reached by this file.
function isolatedQaConnectionString() {
  for (const candidate of [process.env.TEST_DATABASE_URL, process.env.DATABASE_URL, process.env.DIRECT_URL]) {
    if (!candidate) continue;
    try {
      const url = new URL(candidate);
      const localHost = ["localhost", "127.0.0.1", "::1", "[::1]"].includes(url.hostname);
      const databaseName = decodeURIComponent(url.pathname.replace(/^\//, ""));
      if (localHost && /^hardtech_qa_[a-z0-9_]+$/i.test(databaseName)) return url.toString();
    } catch {
      // A malformed URL cannot be a permitted test target.
    }
  }
  return null;
}

const connectionString = isolatedQaConnectionString();
if (connectionString) {
  process.env.DATABASE_URL = connectionString;
  process.env.CLOUDINARY_CLOUD_NAME = "wave-1b-test";
  process.env.CLOUDINARY_API_KEY = "wave-1b-test-key";
  process.env.CLOUDINARY_API_SECRET = "wave-1b-test-secret";
  for (const kind of [
    "MODULE_FILE", "GALLERY_PHOTO", "ANNOUNCEMENT_MEDIA", "ASSIGNMENT_SUBMISSION",
    "POST_ATTACHMENT", "REPLY_ATTACHMENT", "MESSAGE_ATTACHMENT",
  ]) {
    process.env[`CLOUDINARY_DIRECT_UPLOAD_PRESET_${kind}`] = `wave_1b_${kind.toLowerCase()}`;
  }
}

const uploadService = connectionString
  ? await import("../../src/server/services/media-upload.service.ts")
  : null;
const dashboardWrites = connectionString
  ? await import("../../src/server/services/dashboard-write.service.ts")
  : null;

function tag() {
  return `${Date.now()}-${randomUUID().slice(0, 8)}`;
}

async function one(client, sql, values = []) {
  const result = await client.query(sql, values);
  assert.equal(result.rows.length, 1, `Expected one row for ${sql}`);
  return result.rows[0];
}

async function createFixture(client, suffix) {
  const traineeId = `wave-1b-trainee-${suffix}`;
  const trainerId = `wave-1b-trainer-${suffix}`;
  const programId = `wave-1b-program-${suffix}`;
  const batchId = `wave-1b-batch-${suffix}`;
  const paymentId = `wave-1b-payment-${suffix}`;
  const enrollmentId = `wave-1b-enrollment-${suffix}`;
  const postId = `wave-1b-post-${suffix}`;

  for (const [id, role] of [[traineeId, "TRAINEE"], [trainerId, "TRAINER"]]) {
    await client.query(
      `INSERT INTO "User" (id, email, "passwordHash", "firstName", "lastName", role, status, "createdAt", "updatedAt")
       VALUES ($1, $2, 'test-only', 'Wave', 'OneB', $3::"UserRole", 'ACTIVE', NOW(), NOW())`,
      [id, `${id}@example.test`, role],
    );
  }
  await client.query(
    `INSERT INTO "Program" (id, name, "shortName", description, "durationLabel", "scheduleLabel", "levelLabel", "priceAmount", "createdAt", "updatedAt")
     VALUES ($1, $2, 'W1B', 'Wave 1B test program.', '1 day', 'Test', 'Test', 1.00, NOW(), NOW())`,
    [programId, `Wave 1B ${suffix}`],
  );
  await client.query(
    `INSERT INTO "Batch" (id, "programId", "trainerId", code, "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4, NOW(), NOW())`,
    [batchId, programId, trainerId, `W1B-${suffix}`],
  );
  await client.query(
    `INSERT INTO "EnrollmentPayment" (id, "traineeId", "idempotencyKey", "referenceCode", "paymentMethod", "totalAmount", "proofImageUrl", status, "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4, 'GCASH', 1.00, 'test-only', 'VERIFIED', NOW(), NOW())`,
    [paymentId, traineeId, `wave-1b-payment-key-${suffix}`, `W1B-${suffix}`],
  );
  await client.query(
    `INSERT INTO "Enrollment" (id, "enrollmentRef", "traineeId", "programId", "batchId", "paymentId", amount, status, "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4, $5, $6, 1.00, 'ACTIVE', NOW(), NOW())`,
    [enrollmentId, `W1B-ENR-${suffix}`, traineeId, programId, batchId, paymentId],
  );
  await client.query(
    `INSERT INTO "ForumPost" (id, "authorId", title, body, hashtags, status, "createdAt", "updatedAt")
     VALUES ($1, $2, 'Wave 1B media target', 'Upload target.', '{}'::text[], 'PENDING_APPROVAL', NOW(), NOW())`,
    [postId, traineeId],
  );

  return { traineeId, trainerId, programId, batchId, paymentId, enrollmentId, postId };
}

async function cleanup(client, fixture) {
  await client.query(
    `DELETE FROM "AuditLog" WHERE "referenceId" IN (
       SELECT id FROM "EvaluationIntent" WHERE "enrollmentId" = $1
     )`,
    [fixture.enrollmentId],
  );
  await client.query('DELETE FROM "MediaAsset" WHERE "uploadedByUserId" = $1', [fixture.traineeId]);
  await client.query('DELETE FROM "ForumPost" WHERE id = $1', [fixture.postId]);
  await client.query('DELETE FROM "Enrollment" WHERE id = $1', [fixture.enrollmentId]);
  await client.query('DELETE FROM "EnrollmentPayment" WHERE id = $1', [fixture.paymentId]);
  await client.query('DELETE FROM "Batch" WHERE id = $1', [fixture.batchId]);
  await client.query('DELETE FROM "Program" WHERE id = $1', [fixture.programId]);
  await client.query('DELETE FROM "AuthorRating" WHERE "ratedUserId" = $1 AND "raterUserId" = $2', [fixture.traineeId, fixture.trainerId]);
  await client.query('DELETE FROM "User" WHERE id IN ($1, $2)', [fixture.traineeId, fixture.trainerId]);
}

function webhook(ticket, overrides = {}) {
  return {
    public_id: `${ticket.folder}/${ticket.publicId}`,
    secure_url: "https://res.cloudinary.com/wave-1b/image/upload/example.jpg",
    bytes: 500,
    format: "jpg",
    resource_type: "image",
    notification_type: "upload",
    ...overrides,
  };
}

test("provider facts, not browser confirmation, control direct-upload activation", { skip: !connectionString }, async () => {
  const client = new pg.Client({ connectionString });
  await client.connect();
  const fixture = await createFixture(client, tag());
  try {
    const pending = await uploadService.requestUploadTicket({
      kind: "POST_ATTACHMENT", fileName: "photo.jpg", byteSize: 500, mimeType: "image/jpeg",
      actorId: fixture.traineeId, actorRole: "TRAINEE",
    });
    assert.equal(pending.ok, true);
    assert.deepEqual(pending.ticket.allowedFormats, ["jpg", "jpeg"]);
    assert.ok(pending.ticket.uploadPreset, "the provider-side policy preset must be signed into the ticket");

    const confirmed = await uploadService.confirmUpload({
      mediaAssetId: pending.mediaAssetId,
      publicId: `${pending.ticket.folder}/${pending.ticket.publicId}`,
      actorId: fixture.traineeId,
    });
    assert.equal(confirmed.ok, true);
    let row = await one(client, 'SELECT "purgeState", bytes, format FROM "MediaAsset" WHERE id = $1', [pending.mediaAssetId]);
    assert.deepEqual(row, { purgeState: "RESERVED", bytes: pending.ticket.maxBytes, format: "jpg,jpeg" });
    const preWebhookAttach = await uploadService.attachUpload({
      mediaAssetId: pending.mediaAssetId, owner: { postId: fixture.postId }, actorId: fixture.traineeId, actorRole: "TRAINEE",
    });
    assert.deepEqual(preWebhookAttach, { ok: false, error: "Not authorized." });

    // A signed provider event for a different public id cannot write a
    // foreign deletion handle into this reservation. It remains RESERVED,
    // which the existing stale-reservation outbox will purge safely.
    await uploadService.applyUploadWebhook(webhook(pending.ticket, { public_id: "hardtech/forum/foreign-id" }));
    row = await one(client, 'SELECT "purgeState" FROM "MediaAsset" WHERE id = $1', [pending.mediaAssetId]);
    assert.equal(row.purgeState, "RESERVED");

    // Real provider facts unlock the asset, and only then can it attach.
    await uploadService.applyUploadWebhook(webhook(pending.ticket));
    row = await one(client, 'SELECT "purgeState", bytes, format FROM "MediaAsset" WHERE id = $1', [pending.mediaAssetId]);
    assert.deepEqual(row, { purgeState: "ACTIVE", bytes: 500, format: "jpg" });
    assert.equal((await uploadService.attachUpload({
      mediaAssetId: pending.mediaAssetId, owner: { postId: fixture.postId }, actorId: fixture.traineeId, actorRole: "TRAINEE",
    })).ok, true);
  } finally {
    await cleanup(client, fixture);
    await client.end();
  }
});

test("mismatched provider type, format, and byte facts enter the purge queue", { skip: !connectionString }, async () => {
  const client = new pg.Client({ connectionString });
  await client.connect();
  const fixture = await createFixture(client, tag());
  try {
    for (const [label, overrides] of [
      ["wrong-type", { public_id: null, resource_type: "raw", format: "pdf", bytes: 500 }],
      ["wrong-format", { public_id: null, resource_type: "image", format: "png", bytes: 500 }],
      ["oversize", { public_id: null, resource_type: "image", format: "jpg", bytes: null }],
    ]) {
      const ticket = await uploadService.requestUploadTicket({
        kind: "POST_ATTACHMENT", fileName: `${label}.jpg`, byteSize: 500, mimeType: "image/jpeg",
        actorId: fixture.traineeId, actorRole: "TRAINEE",
      });
      assert.equal(ticket.ok, true);
      const suffix = overrides.format === "jpg" ? "" : `.${overrides.format}`;
      const actualBytes = label === "oversize" ? ticket.ticket.maxBytes + 1 : overrides.bytes;
      await uploadService.applyUploadWebhook(webhook(ticket.ticket, {
        ...overrides,
        bytes: actualBytes,
        public_id: `${ticket.ticket.folder}/${ticket.ticket.publicId}${suffix}`,
        secure_url: `https://res.cloudinary.com/wave-1b/${overrides.resource_type}/upload/${label}`,
      }));
      const row = await one(client, 'SELECT "purgeState", "resourceType", bytes, format FROM "MediaAsset" WHERE id = $1', [ticket.mediaAssetId]);
      assert.equal(row.purgeState, "PENDING", `${label} must be purgeable, never attachable`);
      assert.equal(row.bytes, actualBytes);
      assert.equal(row.format, overrides.format);
      assert.equal(row.resourceType, overrides.resource_type.toUpperCase());
    }
  } finally {
    await cleanup(client, fixture);
    await client.end();
  }
});

test("evaluation intent ledger replays exactly once sequentially and concurrently", { skip: !connectionString }, async () => {
  const client = new pg.Client({ connectionString });
  await client.connect();
  const fixture = await createFixture(client, tag());
  try {
    // A revoked historical assessment remains valid when a new active one is
    // recorded; the partial unique index only constrains the current value.
    await client.query(
      `INSERT INTO "Evaluation" (id, "enrollmentId", "trainerId", rating, "revokedAt", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, 'NEEDS_IMPROVEMENT', NOW(), NOW(), NOW())`,
      [`wave-1b-revoked-${tag()}`, fixture.enrollmentId, fixture.trainerId],
    );
    const input = {
      trainerId: fixture.trainerId, trainerRole: "TRAINER", traineeId: fixture.traineeId,
      skill: "Diagnostics", rating: "COMPETENT", notes: "first assessment", idempotencyKey: `wave-1b-eval-${tag()}`,
    };
    const initialRace = await Promise.all([dashboardWrites.evaluateTrainee(input), dashboardWrites.evaluateTrainee(input)]);
    assert.equal(initialRace.every((result) => result.ok), true, "concurrent first submission must create one intent");
    assert.equal((await dashboardWrites.evaluateTrainee(input)).ok, true, "sequential replay must be a no-op");
    const repeated = await Promise.all([dashboardWrites.evaluateTrainee(input), dashboardWrites.evaluateTrainee(input)]);
    assert.equal(repeated.every((result) => result.ok), true, "concurrent replay must find the stored intent");
    assert.equal((await one(client, 'SELECT count(*)::int AS count FROM "EvaluationIntent" WHERE "idempotencyKey" = $1', [input.idempotencyKey])).count, 1);
    assert.equal((await one(client, 'SELECT count(*)::int AS count FROM "Evaluation" WHERE "enrollmentId" = $1 AND "trainerId" = $2 AND "revokedAt" IS NULL', [fixture.enrollmentId, fixture.trainerId])).count, 1);
    assert.equal((await one(client, 'SELECT count(*)::int AS count FROM "AuditLog" WHERE action = $1 AND "actorUserId" = $2', ["evaluate", fixture.trainerId])).count, 1);
    const active = await one(client, 'SELECT rating, notes FROM "Evaluation" WHERE "enrollmentId" = $1 AND "trainerId" = $2 AND "revokedAt" IS NULL', [fixture.enrollmentId, fixture.trainerId]);
    assert.deepEqual(active, { rating: "COMPETENT", notes: "first assessment" });

    // Same key with different content is not the same intent and cannot
    // overwrite the original assessment.
    const conflicting = await dashboardWrites.evaluateTrainee({ ...input, notes: "tampered replay" });
    assert.deepEqual(conflicting, { ok: false, error: "Unable to evaluate trainee." });
    assert.deepEqual(await one(client, 'SELECT notes FROM "Evaluation" WHERE "enrollmentId" = $1 AND "trainerId" = $2 AND "revokedAt" IS NULL', [fixture.enrollmentId, fixture.trainerId]), { notes: "first assessment" });

    // A distinct intent deliberately updates the current assessment, keeps
    // the revoked row, and creates exactly one distinct audit side effect.
    const revision = { ...input, idempotencyKey: `wave-1b-eval-revision-${tag()}`, rating: "CERTIFIED", notes: "revised assessment" };
    assert.equal((await dashboardWrites.evaluateTrainee(revision)).ok, true);
    assert.equal((await one(client, 'SELECT count(*)::int AS count FROM "Evaluation" WHERE "enrollmentId" = $1 AND "trainerId" = $2 AND "revokedAt" IS NOT NULL', [fixture.enrollmentId, fixture.trainerId])).count, 1);
    assert.deepEqual(await one(client, 'SELECT rating, notes FROM "Evaluation" WHERE "enrollmentId" = $1 AND "trainerId" = $2 AND "revokedAt" IS NULL', [fixture.enrollmentId, fixture.trainerId]), { rating: "CERTIFIED", notes: "revised assessment" });
    assert.equal((await one(client, 'SELECT count(*)::int AS count FROM "AuditLog" WHERE action = $1 AND "actorUserId" = $2', ["evaluate", fixture.trainerId])).count, 2);

    // Database integrity is independent of the service: a second active
    // row is rejected even if a future caller bypasses this repository.
    await assert.rejects(
      client.query(
        `INSERT INTO "Evaluation" (id, "enrollmentId", "trainerId", rating, "createdAt", "updatedAt")
         VALUES ($1, $2, $3, 'COMPETENT', NOW(), NOW())`,
        [`wave-1b-duplicate-active-${tag()}`, fixture.enrollmentId, fixture.trainerId],
      ),
      (error) => error?.constraint === "Evaluation_active_enrollment_trainer_key",
    );
  } finally {
    await cleanup(client, fixture);
    await client.end();
  }
});
