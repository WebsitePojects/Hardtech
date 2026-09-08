import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { test } from "node:test";
import pg from "pg";

// Accept only a standard qa-run isolated database. The launcher supplies
// DATABASE_URL/DIRECT_URL (not TEST_DATABASE_URL), so each candidate is
// parsed and rejected unless it is local and names the hardtech_qa_* database.
// Never fall back to a developer or production connection string.
function isolatedQaConnectionString() {
  for (const candidate of [process.env.TEST_DATABASE_URL, process.env.DATABASE_URL, process.env.DIRECT_URL]) {
    if (!candidate) continue;
    try {
      const url = new URL(candidate);
      const localHost = ["localhost", "127.0.0.1", "::1", "[::1]"].includes(url.hostname);
      const databaseName = decodeURIComponent(url.pathname.replace(/^\//, ""));
      if (localHost && /^hardtech_qa_[a-z0-9_]+$/i.test(databaseName)) return url.toString();
    } catch {
      // A malformed candidate is not a test database.
    }
  }
  return null;
}

const connectionString = isolatedQaConnectionString();
if (connectionString) {
  process.env.DATABASE_URL = connectionString;
  // Signing is deterministic and offline. These deliberately fake values
  // prove the signed-ticket path without loading a developer secret or
  // making a Cloudinary request.
  process.env.CLOUDINARY_CLOUD_NAME = "assignment-upload-test";
  process.env.CLOUDINARY_API_KEY = "assignment-upload-test-key";
  process.env.CLOUDINARY_API_SECRET = "assignment-upload-test-secret";
  process.env.CLOUDINARY_DIRECT_UPLOAD_PRESET_ASSIGNMENT_SUBMISSION = "assignment_upload_test";
}

const service = connectionString
  ? await import("../../src/server/services/dashboard-write.service.ts")
  : null;
const dashboardService = connectionString
  ? await import("../../src/server/services/dashboard.service.ts")
  : null;
const uploadService = connectionString
  ? await import("../../src/server/services/media-upload.service.ts")
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
  const traineeId = `assignment-upload-trainee-${suffix}`;
  const otherTraineeId = `assignment-upload-other-${suffix}`;
  const trainerId = `assignment-upload-trainer-${suffix}`;
  const programId = `assignment-upload-program-${suffix}`;
  const batchId = `assignment-upload-batch-${suffix}`;
  const assignmentId = `assignment-upload-assignment-${suffix}`;
  const paymentId = `assignment-upload-payment-${suffix}`;
  const otherPaymentId = `assignment-upload-other-payment-${suffix}`;
  const enrollmentId = `assignment-upload-enrollment-${suffix}`;
  const otherEnrollmentId = `assignment-upload-other-enrollment-${suffix}`;

  for (const [id, role] of [[traineeId, "TRAINEE"], [otherTraineeId, "TRAINEE"], [trainerId, "TRAINER"]]) {
    await client.query(
      `INSERT INTO "User" (id, email, "passwordHash", "firstName", "lastName", role, status, "createdAt", "updatedAt")
       VALUES ($1, $2, 'test-only', 'Assignment', 'Upload', $3::"UserRole", 'ACTIVE', NOW(), NOW())`,
      [id, `${id}@example.test`, role],
    );
  }
  await client.query(
    `INSERT INTO "Program" (id, name, "shortName", description, "durationLabel", "scheduleLabel", "levelLabel", "priceAmount", "createdAt", "updatedAt")
     VALUES ($1, $2, 'AU', 'Assignment upload test program.', '1 day', 'Test', 'Test', 1.00, NOW(), NOW())`,
    [programId, `Assignment upload ${suffix}`],
  );
  await client.query(
    `INSERT INTO "Batch" (id, "programId", "trainerId", code, "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4, NOW(), NOW())`,
    [batchId, programId, trainerId, `AU-${suffix}`],
  );
  for (const [id, ownerId, key] of [[paymentId, traineeId, "one"], [otherPaymentId, otherTraineeId, "two"]]) {
    await client.query(
      `INSERT INTO "EnrollmentPayment" (id, "traineeId", "idempotencyKey", "referenceCode", "paymentMethod", "totalAmount", "proofImageUrl", status, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, 'GCASH', 1.00, 'test-only', 'VERIFIED', NOW(), NOW())`,
      [id, ownerId, `assignment-upload-payment-${key}-${suffix}`, `AU-${key}-${suffix}`],
    );
  }
  for (const [id, ownerId, payment, key] of [[enrollmentId, traineeId, paymentId, "one"], [otherEnrollmentId, otherTraineeId, otherPaymentId, "two"]]) {
    await client.query(
      `INSERT INTO "Enrollment" (id, "enrollmentRef", "traineeId", "programId", "batchId", "paymentId", amount, status, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, 1.00, 'ACTIVE', NOW(), NOW())`,
      [id, `AU-ENR-${key}-${suffix}`, ownerId, programId, batchId, payment],
    );
  }
  await client.query(
    `INSERT INTO "Assignment" (id, "batchId", "trainerId", title, instructions, "dueDate", "dueTime", "allowedSubmissionTypes", "createdAt", "updatedAt")
     VALUES ($1, $2, $3, 'Upload assignment', 'Submit a document.', NOW() + INTERVAL '1 day', '11:59 PM', ARRAY['DOCUMENT']::"SubmissionType"[], NOW(), NOW())`,
    [assignmentId, batchId, trainerId],
  );

  async function asset(label, { ownerId = traineeId, type = "RAW", state = "ACTIVE" } = {}) {
    const id = `assignment-upload-asset-${label}-${suffix}`;
    await client.query(
      `INSERT INTO "MediaAsset" (id, "publicId", "resourceType", folder, "purgeState", "uploadedByUserId", "createdAt", "updatedAt")
       VALUES ($1, $2, $3::"MediaResourceType", 'hardtech/assignment-submissions', $4::"MediaPurgeState", $5, NOW(), NOW())`,
      [id, `hardtech/assignment-submissions/${id}.pdf`, type, state, ownerId],
    );
    return id;
  }

  return {
    traineeId, otherTraineeId, trainerId, programId, batchId, assignmentId,
    paymentId, otherPaymentId, enrollmentId, otherEnrollmentId, asset,
  };
}

async function cleanup(client, fixture) {
  await client.query('DELETE FROM "MediaAsset" WHERE "uploadedByUserId" IN ($1, $2)', [fixture.traineeId, fixture.otherTraineeId]);
  await client.query('DELETE FROM "AssignmentSubmission" WHERE "assignmentId" = $1', [fixture.assignmentId]);
  await client.query('DELETE FROM "Assignment" WHERE id = $1', [fixture.assignmentId]);
  await client.query('DELETE FROM "Enrollment" WHERE id IN ($1, $2)', [fixture.enrollmentId, fixture.otherEnrollmentId]);
  await client.query('DELETE FROM "EnrollmentPayment" WHERE id IN ($1, $2)', [fixture.paymentId, fixture.otherPaymentId]);
  await client.query('DELETE FROM "Batch" WHERE id = $1', [fixture.batchId]);
  await client.query('DELETE FROM "Program" WHERE id = $1', [fixture.programId]);
  await client.query('DELETE FROM "User" WHERE id IN ($1, $2, $3)', [fixture.traineeId, fixture.otherTraineeId, fixture.trainerId]);
}

test("assignment uploads attach exactly one confirmed, owned, allowed asset and replay one intent", { skip: !connectionString }, async () => {
  const client = new pg.Client({ connectionString });
  await client.connect();
  const fixture = await createFixture(client, tag());
  try {
    const ticket = await uploadService.requestUploadTicket({
      kind: "ASSIGNMENT_SUBMISSION",
      fileName: "submission.pdf",
      byteSize: 1024,
      mimeType: "application/pdf",
      actorId: fixture.traineeId,
      actorRole: "TRAINEE",
    });
    assert.equal(ticket.ok, true, "an active trainee receives an assignment-only signed ticket");
    const confirmed = await uploadService.confirmUpload({
      mediaAssetId: ticket.mediaAssetId,
      publicId: `${ticket.ticket.folder}/${ticket.ticket.publicId}.pdf`,
      actorId: fixture.traineeId,
    });
    assert.equal(confirmed.ok, true, "the signed ticket's matching return id confirms the asset");
    await uploadService.applyUploadWebhook({
      public_id: `${ticket.ticket.folder}/${ticket.ticket.publicId}.pdf`,
      secure_url: "https://storage.example.test/submission.pdf",
      bytes: 1024,
      resource_type: "raw",
      format: "pdf",
      notification_type: "upload",
    });
    const firstAssetId = ticket.mediaAssetId;
    const input = {
      traineeId: fixture.traineeId,
      traineeRole: "TRAINEE",
      assignmentId: fixture.assignmentId,
      mediaAssetId: firstAssetId,
      idempotencyKey: `assignment-upload-intent-${tag()}`,
    };
    assert.equal((await service.submitAssignment(input)).ok, true);
    assert.equal((await service.submitAssignment(input)).ok, true, "sequential replay must preserve the first intent");
    const concurrent = await Promise.all([service.submitAssignment(input), service.submitAssignment(input)]);
    assert.equal(concurrent.every((result) => result.ok), true, "concurrent replay must resolve successfully");

    let submission = await one(client, 'SELECT id, "idempotencyKey" FROM "AssignmentSubmission" WHERE "assignmentId" = $1 AND "traineeId" = $2', [fixture.assignmentId, fixture.traineeId]);
    assert.equal(submission.idempotencyKey, input.idempotencyKey);
    let attached = await one(client, 'SELECT "assignmentSubmissionId", "purgeState" FROM "MediaAsset" WHERE id = $1', [firstAssetId]);
    assert.equal(attached.assignmentSubmissionId, submission.id);
    assert.equal(attached.purgeState, "ACTIVE");

    let assignmentRead = await dashboardService.getTraineeAssignments(fixture.traineeId, "TRAINEE");
    assert.equal(assignmentRead.length, 1);
    assert.deepEqual(
      assignmentRead[0].submission?.delivery,
      { state: "READY", type: "DOCUMENT", url: "https://storage.example.test/submission.pdf" },
      "the signed provider webhook makes the asset's delivery URL available",
    );
    await client.query('UPDATE "MediaAsset" SET url = $1 WHERE id = $2', ["https://storage.example.test/submission.pdf", firstAssetId]);
    assignmentRead = await dashboardService.getTraineeAssignments(fixture.traineeId, "TRAINEE");
    assert.deepEqual(
      assignmentRead[0].submission?.delivery,
      { state: "READY", type: "DOCUMENT", url: "https://storage.example.test/submission.pdf" },
      "the trainee read model returns the asset-derived delivery URL and type",
    );

    const replacementAssetId = await fixture.asset("replacement");
    const replacement = await service.submitAssignment({ ...input, mediaAssetId: replacementAssetId, idempotencyKey: `assignment-upload-replacement-${tag()}` });
    assert.equal(replacement.ok, true, "a fresh intent deliberately re-submits");
    submission = await one(client, 'SELECT id, "idempotencyKey" FROM "AssignmentSubmission" WHERE "assignmentId" = $1 AND "traineeId" = $2', [fixture.assignmentId, fixture.traineeId]);
    assert.match(submission.idempotencyKey, /^assignment-upload-replacement-/);
    attached = await one(client, 'SELECT "assignmentSubmissionId", "purgeState" FROM "MediaAsset" WHERE id = $1', [firstAssetId]);
    assert.equal(attached.assignmentSubmissionId, null, "the replaced asset must be released to the deletion outbox");
    assert.equal(attached.purgeState, "PENDING");
    attached = await one(client, 'SELECT "assignmentSubmissionId", "purgeState" FROM "MediaAsset" WHERE id = $1', [replacementAssetId]);
    assert.equal(attached.assignmentSubmissionId, submission.id);
    assert.equal(attached.purgeState, "ACTIVE");
  } finally {
    await cleanup(client, fixture);
    await client.end();
  }
});

test("assignment upload rejects a wrong actor, wrong stored type, unconfirmed asset, and missing asset", { skip: !connectionString }, async () => {
  const client = new pg.Client({ connectionString });
  await client.connect();
  const fixture = await createFixture(client, tag());
  try {
    const owned = await fixture.asset("owned");
    const wrongActor = await service.submitAssignment({
      traineeId: fixture.otherTraineeId, traineeRole: "TRAINEE", assignmentId: fixture.assignmentId,
      mediaAssetId: owned, idempotencyKey: `assignment-upload-wrong-actor-${tag()}`,
    });
    assert.deepEqual(wrongActor, { ok: false, error: "Unable to submit assignment." });

    const wrongType = await fixture.asset("image", { type: "IMAGE" });
    const wrongTypeResult = await service.submitAssignment({
      traineeId: fixture.traineeId, traineeRole: "TRAINEE", assignmentId: fixture.assignmentId,
      mediaAssetId: wrongType, idempotencyKey: `assignment-upload-wrong-type-${tag()}`,
    });
    assert.deepEqual(wrongTypeResult, { ok: false, error: "This file type is not accepted for this assignment." });

    const unconfirmed = await fixture.asset("reserved", { state: "RESERVED" });
    const unconfirmedResult = await service.submitAssignment({
      traineeId: fixture.traineeId, traineeRole: "TRAINEE", assignmentId: fixture.assignmentId,
      mediaAssetId: unconfirmed, idempotencyKey: `assignment-upload-unconfirmed-${tag()}`,
    });
    assert.deepEqual(unconfirmedResult, { ok: false, error: "Unable to submit assignment." });

    const missingResult = await service.submitAssignment({
      traineeId: fixture.traineeId, traineeRole: "TRAINEE", assignmentId: fixture.assignmentId,
      mediaAssetId: `missing-${tag()}`, idempotencyKey: `assignment-upload-missing-${tag()}`,
    });
    assert.deepEqual(missingResult, { ok: false, error: "Unable to submit assignment." });
    const count = await one(client, 'SELECT count(*)::int AS count FROM "AssignmentSubmission" WHERE "assignmentId" = $1', [fixture.assignmentId]);
    assert.equal(count.count, 0);
  } finally {
    await cleanup(client, fixture);
    await client.end();
  }
});
