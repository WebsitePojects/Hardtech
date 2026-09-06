import "dotenv/config";
import assert from "node:assert/strict";
import { test } from "node:test";
import pg from "pg";

const { verifyDemoCredentials } = await import("../../src/server/auth/demo-credentials.ts");
const { hashToken, consumePasswordResetToken } = await import("../../src/server/services/password-reset.service.ts");
const { passwordResetRepository } = await import("../../src/server/repositories/password-reset.repository.ts");
const { joinCommunity, requestCommunity } = await import("../../src/server/services/community-write.service.ts");
const { createAnnouncement } = await import("../../src/server/services/announcement-write.service.ts");
const { createAssignment } = await import("../../src/server/services/dashboard-write.service.ts");

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;

async function withClient(callback) {
  const client = new pg.Client({ connectionString });
  await client.connect();
  try { return await callback(client); } finally { await client.end(); }
}

test("wave A writes are real and duplicate-safe", async () => {
  assert.ok(connectionString);
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const fixture = await withClient(async (client) => {
    const users = await client.query('SELECT id, email FROM "User" WHERE email IN ($1,$2)', ["admin@gmail.com", "trainee@gmail.com"]);
    const ids = new Map(users.rows.map((row) => [row.email, row.id]));
    const community = (await client.query('SELECT id FROM "Community" ORDER BY id LIMIT 1')).rows[0];
    const batch = (await client.query('SELECT id, "trainerId" FROM "Batch" WHERE "trainerId" = $1 LIMIT 1', [ids.get("admin@gmail.com")])).rows[0] ??
      (await client.query('SELECT id, "trainerId" FROM "Batch" LIMIT 1')).rows[0];
    return { adminId: ids.get("admin@gmail.com"), traineeId: ids.get("trainee@gmail.com"), communityId: community.id, batchId: batch.id, trainerId: batch.trainerId };
  });

  const token = `reset-${suffix}`;
  await passwordResetRepository.create({ userId: fixture.traineeId, tokenHash: hashToken(token), expiresAt: new Date(Date.now() + 60_000) });
  assert.equal(await consumePasswordResetToken(token), true);
  assert.equal(await consumePasswordResetToken(token), false);
  const concurrentToken = `reset-concurrent-${suffix}`;
  await passwordResetRepository.create({ userId: fixture.traineeId, tokenHash: hashToken(concurrentToken), expiresAt: new Date(Date.now() + 60_000) });
  assert.deepEqual((await Promise.all([consumePasswordResetToken(concurrentToken), consumePasswordResetToken(concurrentToken)])).sort(), [false, true]);

  await withClient((client) => client.query('DELETE FROM "CommunityMembership" WHERE "communityId"=$1 AND "userId"=$2', [fixture.communityId, fixture.traineeId]));
  const joinInput = { userId: fixture.traineeId, userRole: "TRAINEE", communityId: fixture.communityId, idempotencyKey: `join-${suffix}` };
  assert.equal((await joinCommunity(joinInput)).ok, true);
  assert.equal((await joinCommunity(joinInput)).ok, true);
  assert.equal((await Promise.all([joinCommunity(joinInput), joinCommunity(joinInput)])).every((result) => result.ok), true);
  assert.equal((await withClient((client) => client.query('SELECT count(*)::int AS count FROM "CommunityMembership" WHERE "communityId"=$1 AND "userId"=$2', [fixture.communityId, fixture.traineeId]))).rows[0].count, 1);

  const requestInput = { userId: fixture.traineeId, userRole: "TRAINEE", idempotencyKey: `request-${suffix}`, name: `Test Community ${suffix}`, region: "Test Region", description: "A real duplicate-safe community request." };
  assert.equal((await requestCommunity(requestInput)).ok, true);
  assert.equal((await requestCommunity(requestInput)).ok, true);
  assert.equal((await Promise.all([requestCommunity(requestInput), requestCommunity({ ...requestInput, idempotencyKey: `${requestInput.idempotencyKey}-other` })])).every((result) => result.ok), true);

  const announcementInput = { title: `Test announcement ${suffix}`, body: "A real announcement.", type: "INFO", pinned: false, authorId: fixture.adminId, authorRole: "ADMIN", idempotencyKey: `announcement-${suffix}` };
  assert.equal((await createAnnouncement(announcementInput)).ok, true);
  assert.equal((await createAnnouncement(announcementInput)).ok, true);
  assert.equal((await Promise.all([createAnnouncement(announcementInput), createAnnouncement(announcementInput)])).every((result) => result.ok), true);
  assert.equal((await withClient((client) => client.query('SELECT count(*)::int AS count FROM "Announcement" WHERE "idempotencyKey"=$1', [announcementInput.idempotencyKey]))).rows[0].count, 1);

  const assignmentInput = { trainerId: fixture.trainerId, trainerRole: "TRAINER", batchId: fixture.batchId, title: `Test assignment ${suffix}`, instructions: "Do the work.", dueDate: "2026-12-01", dueTime: "09:00", allowedSubmissionTypes: ["DOCUMENT"], idempotencyKey: `assignment-${suffix}` };
  assert.equal((await createAssignment(assignmentInput)).ok, true);
  assert.equal((await createAssignment(assignmentInput)).ok, true);
  assert.equal((await Promise.all([createAssignment(assignmentInput), createAssignment(assignmentInput)])).every((result) => result.ok), true);
  assert.equal((await withClient((client) => client.query('SELECT count(*)::int AS count FROM "Assignment" WHERE "idempotencyKey"=$1', [assignmentInput.idempotencyKey]))).rows[0].count, 1);

  await withClient(async (client) => {
    await client.query('DELETE FROM "CommunityRequest" WHERE "idempotencyKey" LIKE $1', [`request-${suffix}%`]);
    await client.query('DELETE FROM "Announcement" WHERE "idempotencyKey"=$1', [announcementInput.idempotencyKey]);
    await client.query('DELETE FROM "Assignment" WHERE "idempotencyKey"=$1', [assignmentInput.idempotencyKey]);
    await client.query('DELETE FROM "CommunityMembership" WHERE "communityId"=$1 AND "userId"=$2', [fixture.communityId, fixture.traineeId]);
    await client.query('DELETE FROM "PasswordResetToken" WHERE "tokenHash" IN ($1,$2)', [hashToken(token), hashToken(concurrentToken)]);
  });
});

test("real password verification rejects wrong passwords when demo mode is off", async () => {
  const oldNodeEnv = process.env.NODE_ENV;
  const oldDemoAuth = process.env.DEMO_AUTH;
  process.env.NODE_ENV = "production";
  delete process.env.DEMO_AUTH;
  try {
    assert.equal((await verifyDemoCredentials("admin@gmail.com", "wrong-password")), null);
    assert.equal((await verifyDemoCredentials("admin@gmail.com", "HardTechLocalDevOnly!")).role, "ADMIN");
  } finally {
    if (oldNodeEnv === undefined) delete process.env.NODE_ENV; else process.env.NODE_ENV = oldNodeEnv;
    if (oldDemoAuth === undefined) delete process.env.DEMO_AUTH; else process.env.DEMO_AUTH = oldDemoAuth;
  }
});
