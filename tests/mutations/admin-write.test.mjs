import "dotenv/config";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { test } from "node:test";
import pg from "pg";

const { updateUserRole, updateUserStatus, removeUser, removeAssignedTrainee, savePaymentMethod } =
  await import("../../src/server/services/admin-write.service.ts");

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;

async function one(client, sql, values = []) {
  const result = await client.query(sql, values);
  assert.equal(result.rows.length, 1, `Expected one row for ${sql}`);
  return result.rows[0];
}

test("admin writes are authorized, transactional, and duplicate-safe", async () => {
  assert.ok(connectionString, "database is configured");
  const client = new pg.Client({ connectionString });
  await client.connect();
  const suffix = `${Date.now()}-${randomUUID().slice(0, 8)}`;
  const createdUserIds = [];
  const auditReferences = [];
  let enrollmentId;
  let paymentId;
  let paymentMethodId;
  let originalCard;
  try {
    const admin = await one(client, 'SELECT id FROM "User" WHERE email = $1', ["admin@gmail.com"]);
    const trainer = await one(client, 'SELECT id FROM "User" WHERE email = $1', ["trainer@gmail.com"]);
    const trainee = await one(client, 'SELECT id FROM "User" WHERE email = $1', ["trainee@gmail.com"]);
    const program = await one(client, 'SELECT id FROM "Program" ORDER BY "createdAt" LIMIT 1');
    const batch = await one(client, 'SELECT id FROM "Batch" WHERE "trainerId" = $1 ORDER BY "createdAt" LIMIT 1', [trainer.id]);

    async function createUser(label, role = "TRAINEE", status = "ACTIVE") {
      const id = `admin-write-${label}-${suffix}`;
      createdUserIds.push(id);
      await client.query(
        `INSERT INTO "User" (id, email, "passwordHash", "firstName", "lastName", role, status, "createdAt", "updatedAt")
         VALUES ($1, $2, 'test-only', 'Admin', $3, $4::"UserRole", $5::"UserStatus", NOW(), NOW())`,
        [id, `${id}@example.com`, label, role, status],
      );
      return id;
    }

    const roleTarget = await createUser("role");
    const statusTarget = await createUser("status");
    const removeTarget = await createUser("remove");

    const unauthorized = await updateUserRole({ actorId: trainee.id, actorRole: "TRAINEE", userId: roleTarget, role: "TRAINER" });
    assert.equal(unauthorized.ok, false);
    const badRole = await updateUserRole({ actorId: admin.id, actorRole: "ADMIN", userId: roleTarget, role: "NOT_A_ROLE" });
    assert.equal(badRole.ok, false);
    const selfDemotion = await updateUserRole({ actorId: admin.id, actorRole: "ADMIN", userId: admin.id, role: "TRAINER" });
    assert.equal(selfDemotion.ok, false);
    const selfRemoval = await removeUser({ actorId: admin.id, actorRole: "ADMIN", userId: admin.id });
    assert.equal(selfRemoval.ok, false);

    const roleInput = { actorId: admin.id, actorRole: "ADMIN", userId: roleTarget, role: "TRAINER" };
    assert.equal((await updateUserRole(roleInput)).ok, true);
    assert.equal((await updateUserRole(roleInput)).ok, true);
    const roleConcurrent = await Promise.all([updateUserRole(roleInput), updateUserRole(roleInput)]);
    assert.equal(roleConcurrent.every((result) => result.ok), true);
    assert.equal((await one(client, 'SELECT role FROM "User" WHERE id = $1', [roleTarget])).role, "TRAINER");
    assert.equal((await one(client, 'SELECT count(*)::int AS count FROM "AuditLog" WHERE category = $1 AND "referenceId" = $2 AND action = $3', ["USER", roleTarget, "role_update"])).count, 1);
    auditReferences.push(roleTarget);

    const statusInput = { actorId: admin.id, actorRole: "ADMIN", userId: statusTarget, status: "SUSPENDED" };
    assert.equal((await updateUserStatus(statusInput)).ok, true);
    assert.equal((await updateUserStatus(statusInput)).ok, true);
    const statusConcurrent = await Promise.all([updateUserStatus(statusInput), updateUserStatus(statusInput)]);
    assert.equal(statusConcurrent.every((result) => result.ok), true);
    assert.equal((await one(client, 'SELECT status FROM "User" WHERE id = $1', [statusTarget])).status, "SUSPENDED");
    assert.equal((await one(client, 'SELECT count(*)::int AS count FROM "AuditLog" WHERE category = $1 AND "referenceId" = $2 AND action = $3', ["USER", statusTarget, "status_update"])).count, 1);
    auditReferences.push(statusTarget);

    const removalInput = { actorId: admin.id, actorRole: "ADMIN", userId: removeTarget };
    assert.equal((await removeUser(removalInput)).ok, true);
    assert.equal((await removeUser(removalInput)).ok, true);
    const removalConcurrent = await Promise.all([removeUser(removalInput), removeUser(removalInput)]);
    assert.equal(removalConcurrent.every((result) => result.ok), true);
    assert.equal((await one(client, 'SELECT status FROM "User" WHERE id = $1', [removeTarget])).status, "SUSPENDED");
    assert.equal((await one(client, 'SELECT count(*)::int AS count FROM "AuditLog" WHERE category = $1 AND "referenceId" = $2 AND action = $3', ["USER", removeTarget, "remove"])).count, 1);
    auditReferences.push(removeTarget);

    paymentId = `admin-write-payment-${suffix}`;
    enrollmentId = `admin-write-enrollment-${suffix}`;
    await client.query(
      `INSERT INTO "EnrollmentPayment" (id, "traineeId", "idempotencyKey", "referenceCode", "paymentMethod", "totalAmount", "proofImageUrl", status, "submittedAt", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, 'GCASH', 1, 'https://example.com/test.png', 'SUBMITTED', NOW(), NOW(), NOW())`,
      [paymentId, trainee.id, `admin-write-key-${suffix}`, `ADMIN-WRITE-${suffix}`],
    );
    await client.query(
      `INSERT INTO "Enrollment" (id, "enrollmentRef", "traineeId", "programId", "batchId", "paymentId", amount, status, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, 1, 'PENDING_VERIFICATION', NOW(), NOW())`,
      [enrollmentId, `ADMIN-WRITE-ENR-${suffix}`, trainee.id, program.id, batch.id, paymentId],
    );
    const traineeInput = { actorId: admin.id, actorRole: "ADMIN", enrollmentId, batchId: batch.id };
    assert.equal((await removeAssignedTrainee(traineeInput)).ok, true);
    assert.equal((await removeAssignedTrainee(traineeInput)).ok, false);
    const traineeConcurrent = await Promise.all([removeAssignedTrainee(traineeInput), removeAssignedTrainee(traineeInput)]);
    assert.equal(traineeConcurrent.every((result) => result.ok === false), true);
    assert.equal((await one(client, 'SELECT "batchId" FROM "Enrollment" WHERE id = $1', [enrollmentId])).batchId, null);
    assert.equal((await one(client, 'SELECT count(*)::int AS count FROM "AuditLog" WHERE category = $1 AND "referenceId" = $2 AND action = $3', ["ENROLLMENT", enrollmentId, "trainee_unassigned"])).count, 1);
    auditReferences.push(enrollmentId);

    originalCard = await client.query('SELECT * FROM "PaymentMethodConfig" WHERE method = $1', ["CARD"]);
    const paymentInput = { actorId: admin.id, actorRole: "ADMIN", method: "CARD", displayName: `Card ${suffix}`, accountNumber: null, accountName: null, bankName: null, note: `note-${suffix}`, isEnabled: true };
    assert.equal((await savePaymentMethod(paymentInput)).ok, true);
    assert.equal((await savePaymentMethod(paymentInput)).ok, true);
    const paymentConcurrent = await Promise.all([savePaymentMethod(paymentInput), savePaymentMethod(paymentInput)]);
    assert.equal(paymentConcurrent.every((result) => result.ok), true);
    const card = await one(client, 'SELECT id, "displayName" FROM "PaymentMethodConfig" WHERE method = $1', ["CARD"]);
    paymentMethodId = card.id;
    assert.equal(card.displayName, paymentInput.displayName);
    assert.equal((await one(client, 'SELECT count(*)::int AS count FROM "AuditLog" WHERE category = $1 AND "referenceId" = $2 AND action = $3', ["PAYMENT", paymentMethodId, "payment_method_save"])).count, 1);
    auditReferences.push(paymentMethodId);
  } finally {
    if (originalCard?.rows.length === 1) {
      const row = originalCard.rows[0];
      await client.query('UPDATE "PaymentMethodConfig" SET "displayName" = $1, "accountNumber" = $2, "accountName" = $3, "bankName" = $4, note = $5, "isEnabled" = $6, "updatedByUserId" = $7 WHERE id = $8', [row.displayName, row.accountNumber, row.accountName, row.bankName, row.note, row.isEnabled, row.updatedByUserId, row.id]);
    } else if (paymentMethodId) {
      await client.query('DELETE FROM "PaymentMethodConfig" WHERE id = $1', [paymentMethodId]);
    }
    if (auditReferences.length) await client.query('DELETE FROM "AuditLog" WHERE "referenceId" = ANY($1::text[])', [auditReferences]);
    if (enrollmentId) await client.query('DELETE FROM "Enrollment" WHERE id = $1', [enrollmentId]);
    if (paymentId) await client.query('DELETE FROM "EnrollmentPayment" WHERE id = $1', [paymentId]);
    if (createdUserIds.length) await client.query('DELETE FROM "User" WHERE id = ANY($1::text[])', [createdUserIds]);
    await client.end();
  }
});
