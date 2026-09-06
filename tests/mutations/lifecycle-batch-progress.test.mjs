import "dotenv/config";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { test } from "node:test";
import pg from "pg";

const { assignEnrollmentToBatch } = await import("../../src/server/services/admin-write.service.ts");
const { completeEnrollment, setEnrollmentProgress } = await import("../../src/server/services/enrollment-progress.service.ts");
const { createAssignment } = await import("../../src/server/services/dashboard-write.service.ts");

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
  return `lifecycle-${Date.now()}-${randomUUID().slice(0, 8)}`;
}

async function fixture(client) {
  const value = tag();
  const adminId = `${value}-admin`;
  const trainerId = `${value}-trainer`;
  const otherTrainerId = `${value}-other-trainer`;
  const traineeId = `${value}-trainee`;
  const programId = `${value}-program`;
  const otherProgramId = `${value}-other-program`;
  const batchId = `${value}-batch`;
  const otherBatchId = `${value}-other-batch`;
  const wrongBatchId = `${value}-wrong-batch`;
  const paymentId = `${value}-payment`;
  const enrollmentId = `${value}-enrollment`;

  await client.query(
    `INSERT INTO "User" (id, email, "passwordHash", "firstName", "lastName", role, status, "createdAt", "updatedAt")
     VALUES ($1, $2, 'test-only', 'Lifecycle', 'Admin', 'ADMIN', 'ACTIVE', NOW(), NOW()),
            ($3, $4, 'test-only', 'Lifecycle', 'Trainer', 'TRAINER', 'ACTIVE', NOW(), NOW()),
            ($5, $6, 'test-only', 'Lifecycle', 'OtherTrainer', 'TRAINER', 'ACTIVE', NOW(), NOW()),
            ($7, $8, 'test-only', 'Lifecycle', 'Trainee', 'TRAINEE', 'ACTIVE', NOW(), NOW())`,
    [adminId, `${adminId}@example.test`, trainerId, `${trainerId}@example.test`, otherTrainerId, `${otherTrainerId}@example.test`, traineeId, `${traineeId}@example.test`],
  );
  await client.query(
    `INSERT INTO "Program" (id, name, "shortName", description, "durationLabel", "scheduleLabel", "levelLabel", "priceAmount", "createdAt", "updatedAt")
     VALUES ($1, $2, 'Lifecycle Program', 'Test program.', '1 day', 'Weekdays', 'Beginner', 1, NOW(), NOW()),
            ($3, $4, 'Other Lifecycle Program', 'Other test program.', '1 day', 'Weekdays', 'Beginner', 1, NOW(), NOW())`,
    [programId, `${value}-program`, otherProgramId, `${value}-other-program`],
  );
  await client.query(
    `INSERT INTO "Batch" (id, "programId", "trainerId", code, "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4, NOW(), NOW()), ($5, $2, $6, $7, NOW(), NOW()), ($8, $9, $3, $10, NOW(), NOW())`,
    [batchId, programId, trainerId, `${value}-A`, otherBatchId, otherTrainerId, `${value}-B`, wrongBatchId, otherProgramId, `${value}-wrong`],
  );
  await client.query(
    `INSERT INTO "EnrollmentPayment" (id, "traineeId", "idempotencyKey", "referenceCode", "paymentMethod", "totalAmount", "proofImageUrl", status, "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4, 'GCASH', 1, 'test-proof', 'VERIFIED', NOW(), NOW())`,
    [paymentId, traineeId, `${value}-payment-key`, `${value}-ref`],
  );
  await client.query(
    `INSERT INTO "Enrollment" (id, "enrollmentRef", "traineeId", "programId", "paymentId", amount, status, "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4, $5, 1, 'ACTIVE', NOW(), NOW())`,
    [enrollmentId, `${value}-enrollment-ref`, traineeId, programId, paymentId],
  );
  return { value, adminId, trainerId, otherTrainerId, traineeId, programId, batchId, otherBatchId, wrongBatchId, otherProgramId, paymentId, enrollmentId };
}

async function destroyFixture(client, data) {
  await client.query('DELETE FROM "AuditLog" WHERE "referenceId" = $1', [data.enrollmentId]);
  await client.query('DELETE FROM "CertificateRequest" WHERE "enrollmentId" = $1', [data.enrollmentId]);
  await client.query('DELETE FROM "Enrollment" WHERE id = $1', [data.enrollmentId]);
  await client.query('DELETE FROM "EnrollmentPayment" WHERE id = $1', [data.paymentId]);
  await client.query('DELETE FROM "Batch" WHERE id = ANY($1::text[])', [[data.batchId, data.otherBatchId, data.wrongBatchId]]);
  await client.query('DELETE FROM "Program" WHERE id = ANY($1::text[])', [[data.programId, data.otherProgramId]]);
  await client.query('DELETE FROM "User" WHERE id = ANY($1::text[])', [[data.adminId, data.trainerId, data.otherTrainerId, data.traineeId]]);
}

test("batch assignment validates program, replays one intent, and writes one audit record", async () => {
  assert.ok(connectionString, "QA database is configured");
  await withClient(async (client) => {
    const data = await fixture(client);
    try {
      const mismatch = await assignEnrollmentToBatch({ actorId: data.adminId, actorRole: "ADMIN", enrollmentId: data.enrollmentId, batchId: data.wrongBatchId });
      assert.deepEqual(mismatch, { ok: false, error: "Enrollment and batch programs must match." });
      assert.equal((await client.query('SELECT "batchId" FROM "Enrollment" WHERE id = $1', [data.enrollmentId])).rows[0].batchId, null);

      const input = { actorId: data.adminId, actorRole: "ADMIN", enrollmentId: data.enrollmentId, batchId: data.batchId };
      assert.equal((await assignEnrollmentToBatch(input)).ok, true);
      assert.equal((await assignEnrollmentToBatch(input)).ok, true);
      assert.equal((await client.query('SELECT "batchId" FROM "Enrollment" WHERE id = $1', [data.enrollmentId])).rows[0].batchId, data.batchId);
      assert.equal((await client.query('SELECT count(*)::int AS count FROM "AuditLog" WHERE "referenceId" = $1 AND action = $2', [data.enrollmentId, "batch_assign"])).rows[0].count, 1);
    } finally {
      await destroyFixture(client, data);
    }
  });
});

test("concurrent batch assignment accepts the same batch once and rejects a competing batch", async () => {
  await withClient(async (client) => {
    const data = await fixture(client);
    try {
      const same = { actorId: data.adminId, actorRole: "ADMIN", enrollmentId: data.enrollmentId, batchId: data.batchId };
      const results = await Promise.all([assignEnrollmentToBatch(same), assignEnrollmentToBatch(same)]);
      assert.deepEqual(results, [{ ok: true }, { ok: true }]);
      assert.equal((await client.query('SELECT count(*)::int AS count FROM "AuditLog" WHERE "referenceId" = $1 AND action = $2', [data.enrollmentId, "batch_assign"])).rows[0].count, 1);

      const competing = await assignEnrollmentToBatch({ ...same, batchId: data.otherBatchId });
      assert.deepEqual(competing, { ok: false, error: "Enrollment is already assigned to another batch." });
    } finally {
      await destroyFixture(client, data);
    }
  });
});

test("trainer progress and completion are ownership-scoped and completion is exactly once", async () => {
  await withClient(async (client) => {
    const data = await fixture(client);
    try {
      assert.equal((await assignEnrollmentToBatch({ actorId: data.adminId, actorRole: "ADMIN", enrollmentId: data.enrollmentId, batchId: data.batchId })).ok, true);
      const denied = await setEnrollmentProgress({ actorId: data.otherTrainerId, actorRole: "TRAINER", enrollmentId: data.enrollmentId, progressPercent: 100 });
      assert.deepEqual(denied, { ok: false, error: "Not authorized." });
      const incomplete = await completeEnrollment({ actorId: data.trainerId, actorRole: "TRAINER", enrollmentId: data.enrollmentId });
      assert.deepEqual(incomplete, { ok: false, error: "Enrollment progress must be 100% before completion." });

      const progress = { actorId: data.trainerId, actorRole: "TRAINER", enrollmentId: data.enrollmentId, progressPercent: 100 };
      assert.equal((await setEnrollmentProgress(progress)).ok, true);
      assert.equal((await Promise.all([setEnrollmentProgress(progress), setEnrollmentProgress(progress)])).every((result) => result.ok), true);
      const complete = { actorId: data.trainerId, actorRole: "TRAINER", enrollmentId: data.enrollmentId };
      assert.deepEqual(await Promise.all([completeEnrollment(complete), completeEnrollment(complete)]), [{ ok: true }, { ok: true }]);
      assert.deepEqual(await completeEnrollment(complete), { ok: true });
      assert.equal((await client.query('SELECT status FROM "Enrollment" WHERE id = $1', [data.enrollmentId])).rows[0].status, "COMPLETED");
      assert.equal((await client.query('SELECT count(*)::int AS count FROM "CertificateRequest" WHERE "enrollmentId" = $1', [data.enrollmentId])).rows[0].count, 1);
    } finally {
      await destroyFixture(client, data);
    }
  });
});

test("a former trainer cannot update or complete after the batch changes hands", async () => {
  assert.ok(connectionString, "QA database is configured");
  await withClient(async (client) => {
    const data = await fixture(client);
    try {
      assert.equal((await assignEnrollmentToBatch({ actorId: data.adminId, actorRole: "ADMIN", enrollmentId: data.enrollmentId, batchId: data.batchId })).ok, true);
      await client.query('UPDATE "Batch" SET "trainerId" = $1 WHERE id = $2', [data.otherTrainerId, data.batchId]);

      const progress = await setEnrollmentProgress({ actorId: data.trainerId, actorRole: "TRAINER", enrollmentId: data.enrollmentId, progressPercent: 100 });
      assert.deepEqual(progress, { ok: false, error: "Not authorized." });
      const complete = await completeEnrollment({ actorId: data.trainerId, actorRole: "TRAINER", enrollmentId: data.enrollmentId });
      assert.deepEqual(complete, { ok: false, error: "Not authorized." });
      assert.equal((await client.query('SELECT "progressPercent", status FROM "Enrollment" WHERE id = $1', [data.enrollmentId])).rows[0].progressPercent, 0);
    } finally {
      await destroyFixture(client, data);
    }
  });
});

test("assignment creation rechecks ownership after an in-flight batch handoff", async () => {
  assert.ok(connectionString, "QA database is configured");
  await withClient(async (client) => {
    const data = await fixture(client);
    const idempotencyKey = `${data.value}-assignment`;
    try {
      await client.query("BEGIN");
      await client.query('UPDATE "Batch" SET code = code WHERE id = $1', [data.batchId]);
      const creation = createAssignment({
        trainerId: data.trainerId, trainerRole: "TRAINER", batchId: data.batchId,
        title: "Stale ownership assignment", instructions: "Should not be created.",
        dueDate: "2026-12-01", dueTime: "09:00", allowedSubmissionTypes: ["DOCUMENT"], idempotencyKey,
      });
      await client.query('UPDATE "Batch" SET "trainerId" = $1 WHERE id = $2', [data.otherTrainerId, data.batchId]);
      await client.query("COMMIT");

      assert.deepEqual(await creation, { ok: false, error: "Selected batch is not assigned to you." });
      assert.equal((await client.query('SELECT count(*)::int AS count FROM "Assignment" WHERE "idempotencyKey" = $1', [idempotencyKey])).rows[0].count, 0);
    } finally {
      await client.query("ROLLBACK").catch(() => undefined);
      await destroyFixture(client, data);
    }
  });
});
