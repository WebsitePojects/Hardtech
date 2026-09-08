import "dotenv/config";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { test } from "node:test";
import pg from "pg";

const { createTrainingSession, publishModule } = await import("../../src/server/services/dashboard-write.service.ts");
const { getTraineeMaterials, getTraineeOverview, isSafeHttpUrl } = await import("../../src/server/services/dashboard.service.ts");

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;

async function withClient(callback) {
  const client = new pg.Client({ connectionString });
  await client.connect();
  try {
    return await callback(client);
  } finally {
    await client.end();
  }
}

function tag() {
  return `delivery-${Date.now()}-${randomUUID().slice(0, 8)}`;
}

async function fixture(client) {
  const value = tag();
  const trainerId = `${value}-trainer`;
  const otherTrainerId = `${value}-other-trainer`;
  const traineeId = `${value}-trainee`;
  const programId = `${value}-program`;
  const batchId = `${value}-batch`;
  const otherBatchId = `${value}-other-batch`;
  const paymentId = `${value}-payment`;
  const enrollmentId = `${value}-enrollment`;
  const assetId = `${value}-asset`;

  await client.query(
    `INSERT INTO "User" (id, email, "passwordHash", "firstName", "lastName", role, status, "createdAt", "updatedAt")
     VALUES ($1, $2, 'test-only', 'Delivery', 'Trainer', 'TRAINER', 'ACTIVE', NOW(), NOW()),
            ($3, $4, 'test-only', 'Delivery', 'Other trainer', 'TRAINER', 'ACTIVE', NOW(), NOW()),
            ($5, $6, 'test-only', 'Delivery', 'Trainee', 'TRAINEE', 'ACTIVE', NOW(), NOW())`,
    [trainerId, `${trainerId}@example.test`, otherTrainerId, `${otherTrainerId}@example.test`, traineeId, `${traineeId}@example.test`],
  );
  await client.query(
    `INSERT INTO "Program" (id, name, "shortName", description, "durationLabel", "scheduleLabel", "levelLabel", "priceAmount", "createdAt", "updatedAt")
     VALUES ($1, $2, 'Delivery', 'Test program.', '1 day', 'Weekdays', 'Beginner', 1, NOW(), NOW())`,
    [programId, `${value}-program`],
  );
  await client.query(
    `INSERT INTO "Batch" (id, "programId", "trainerId", code, "createdAt", "updatedAt")
     VALUES ($1, $2, $3, 'A', NOW(), NOW()), ($4, $2, $5, 'B', NOW(), NOW())`,
    [batchId, programId, trainerId, otherBatchId, otherTrainerId],
  );
  await client.query(
    `INSERT INTO "EnrollmentPayment" (id, "traineeId", "idempotencyKey", "referenceCode", "paymentMethod", "totalAmount", "proofImageUrl", status, "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4, 'GCASH', 1, 'test-proof', 'VERIFIED', NOW(), NOW())`,
    [paymentId, traineeId, `${value}-payment-key`, `${value}-payment-ref`],
  );
  await client.query(
    `INSERT INTO "Enrollment" (id, "enrollmentRef", "traineeId", "programId", "batchId", "paymentId", amount, status, "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4, $5, $6, 1, 'ACTIVE', NOW(), NOW())`,
    [enrollmentId, `${value}-enrollment-ref`, traineeId, programId, batchId, paymentId],
  );
  await client.query(
    `INSERT INTO "MediaAsset" (id, "publicId", "resourceType", folder, url, bytes, format, "purgeState", "uploadedByUserId", "createdAt", "updatedAt")
     VALUES ($1, $2, 'RAW', 'hardtech/modules', 'https://media.example.test/module.pdf', 1234, 'pdf', 'ACTIVE', $3, NOW(), NOW())`,
    [assetId, `${value}-asset`, trainerId],
  );
  return { value, trainerId, otherTrainerId, traineeId, programId, batchId, otherBatchId, paymentId, enrollmentId, assetId };
}

async function cleanup(client, data) {
  await client.query('DELETE FROM "AuditLog" WHERE "actorUserId" = ANY($1::text[])', [[data.trainerId, data.otherTrainerId]]);
  await client.query('DELETE FROM "Module" WHERE "trainerId" = $1', [data.trainerId]);
  await client.query('DELETE FROM "MediaAsset" WHERE id = $1', [data.assetId]);
  await client.query('DELETE FROM "TrainingSession" WHERE "trainerId" = $1', [data.trainerId]);
  await client.query('DELETE FROM "Enrollment" WHERE id = $1', [data.enrollmentId]);
  await client.query('DELETE FROM "EnrollmentPayment" WHERE id = $1', [data.paymentId]);
  await client.query('DELETE FROM "Batch" WHERE id = ANY($1::text[])', [[data.batchId, data.otherBatchId]]);
  await client.query('DELETE FROM "Program" WHERE id = $1', [data.programId]);
  await client.query('DELETE FROM "User" WHERE id = ANY($1::text[])', [[data.trainerId, data.otherTrainerId, data.traineeId]]);
}

test("trainer delivery mutations are ownership-scoped, idempotent under replay and concurrent calls, and reach the enrolled trainee", async () => {
  assert.ok(connectionString, "QA database is configured");
  await withClient(async (client) => {
    const data = await fixture(client);
    try {
      const sessionInput = {
        trainerId: data.trainerId, trainerRole: "TRAINER", batchId: data.batchId,
        title: "Safe handling", sessionType: "HANDS_ON", sessionDate: "2026-12-02",
        startTime: "09:30", location: "Lab A", idempotencyKey: `${data.value}-session`,
      };
      assert.deepEqual(await createTrainingSession(sessionInput), { ok: true });
      assert.deepEqual(await createTrainingSession(sessionInput), { ok: true });
      assert.equal((await Promise.all([createTrainingSession(sessionInput), createTrainingSession(sessionInput)])).every((result) => result.ok), true);
      assert.equal((await client.query('SELECT count(*)::int AS count FROM "TrainingSession" WHERE "trainerId" = $1', [data.trainerId])).rows[0].count, 1);
      assert.equal((await client.query('SELECT "sessionDate", "startTime" FROM "TrainingSession" WHERE "trainerId" = $1', [data.trainerId])).rows[0].startTime, "09:30");
      assert.equal((await getTraineeOverview(data.traineeId)).upcomingSessions.some((session) => session.title === "Safe handling"), true);

      const deniedSession = await createTrainingSession({ ...sessionInput, trainerId: data.otherTrainerId, batchId: data.batchId, idempotencyKey: `${data.value}-denied-session` });
      assert.deepEqual(deniedSession, { ok: false, error: "Selected batch is not assigned to you." });

      const moduleInput = {
        trainerId: data.trainerId, trainerRole: "TRAINER", batchId: data.batchId, mediaAssetId: data.assetId,
        title: "Electrical safety", fileType: "PDF", unitNumber: 1, idempotencyKey: `${data.value}-module`,
      };
      assert.deepEqual(await publishModule(moduleInput), { ok: true });
      assert.deepEqual(await publishModule(moduleInput), { ok: true });
      assert.equal((await Promise.all([publishModule(moduleInput), publishModule(moduleInput)])).every((result) => result.ok), true);
      assert.equal((await client.query('SELECT count(*)::int AS count FROM "Module" WHERE "trainerId" = $1', [data.trainerId])).rows[0].count, 1);
      assert.equal((await client.query('SELECT count(*)::int AS count FROM "MediaAsset" WHERE id = $1 AND "moduleId" IS NOT NULL AND "purgeState" = $2', [data.assetId, "ACTIVE"])).rows[0].count, 1);
      const materials = await getTraineeMaterials(data.traineeId, "TRAINEE");
      assert.deepEqual(materials.map((material) => material.delivery.state), ["READY"]);

      const deniedModule = await publishModule({ ...moduleInput, trainerId: data.otherTrainerId, batchId: data.otherBatchId, idempotencyKey: `${data.value}-denied-module` });
      assert.deepEqual(deniedModule, { ok: false, error: "The uploaded file is still being verified. Try publishing again shortly." });
    } finally {
      await cleanup(client, data);
    }
  });
});

test("legacy assignment links only permit absolute http(s) URLs", () => {
  assert.equal(isSafeHttpUrl("https://example.test/file.pdf"), true);
  assert.equal(isSafeHttpUrl("http://example.test/file.pdf"), true);
  assert.equal(isSafeHttpUrl("/relative-file.pdf"), false);
  assert.equal(isSafeHttpUrl("javascript:alert(1)"), false);
  assert.equal(isSafeHttpUrl("not a URL"), false);
});
