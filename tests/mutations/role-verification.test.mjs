import "dotenv/config";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { test } from "node:test";
import pg from "pg";

// Second wave of the caller-supplied-role defect first found in the
// certificate/payment admin actions: dashboard-write's TRAINER/TRAINEE-gated
// actions and announcement-write's ADMIN-gated actions trusted the argument
// too. Each test proves the DB-verified check fires before any
// resource-specific lookup, both for a real actor whose status is SUSPENDED
// and for an actor spoofing a role they do not actually hold.

const { evaluateTrainee, createAssignment, submitAssignment } =
  await import("../../src/server/services/dashboard-write.service.ts");
const { createAnnouncement, deleteAnnouncement } =
  await import("../../src/server/services/announcement-write.service.ts");
const { approveForumPost, rejectForumPost } =
  await import("../../src/server/services/forum-write.service.ts");

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

async function one(client, sql, values = []) {
  const result = await client.query(sql, values);
  assert.equal(result.rows.length, 1, `Expected one row for ${sql}`);
  return result.rows[0];
}

function suffix() {
  return `${Date.now()}-${randomUUID().slice(0, 8)}`;
}

async function createUser(client, label, role, status, tag) {
  const id = `role-verify-${label}-${tag}`;
  await client.query(
    `INSERT INTO "User" (id, email, "passwordHash", "firstName", "lastName", role, status, "createdAt", "updatedAt")
     VALUES ($1, $2, 'test-only', 'RoleVerify', $3, $4::"UserRole", $5::"UserStatus", NOW(), NOW())`,
    [id, `${id}@example.com`, label, role, status],
  );
  return id;
}

async function createPendingForumPost(client, tag) {
  const author = await createUser(client, "forum-author", "TRAINEE", "ACTIVE", tag);
  const postId = `role-verify-post-${tag}`;
  await client.query(
    `INSERT INTO "ForumPost" (id, "authorId", title, body, hashtags, status, "createdAt", "updatedAt")
     VALUES ($1, $2, $3, 'A trainee post awaiting moderation.', '{}'::text[], 'PENDING_APPROVAL', NOW(), NOW())`,
    [postId, author, `Role verify forum post ${tag}`],
  );
  return { author, postId };
}

test("evaluateTrainee rejects a suspended trainer even though the claimed role is TRAINER", async () => {
  assert.ok(connectionString, "database is configured");
  await withClient(async (client) => {
    const tag = suffix();
    const trainer = await createUser(client, "eval-suspended-trainer", "TRAINER", "SUSPENDED", tag);
    const trainee = await createUser(client, "eval-target", "TRAINEE", "ACTIVE", tag);
    try {
      const result = await evaluateTrainee({
        trainerId: trainer, trainerRole: "TRAINER", traineeId: trainee,
        skill: "Diagnostics", rating: "COMPETENT", notes: "should not land",
        idempotencyKey: `role-verify-eval-suspended-${tag}`,
      });
      assert.equal(result.ok, false, "a suspended trainer must not be able to evaluate a trainee");
      assert.equal(result.error, "Not authorized.");
      assert.equal((await one(client, 'SELECT count(*)::int AS count FROM "Evaluation" WHERE "trainerId" = $1', [trainer])).count, 0);
    } finally {
      await client.query('DELETE FROM "User" WHERE id = ANY($1::text[])', [[trainer, trainee]]);
    }
  });
});

test("evaluateTrainee rejects a spoofed TRAINER role claim from a real trainee actor", async () => {
  assert.ok(connectionString, "database is configured");
  await withClient(async (client) => {
    const tag = suffix();
    const spoofer = await createUser(client, "eval-spoofer", "TRAINEE", "ACTIVE", tag);
    const trainee = await createUser(client, "eval-target2", "TRAINEE", "ACTIVE", tag);
    try {
      const result = await evaluateTrainee({
        trainerId: spoofer, trainerRole: "TRAINER", traineeId: trainee,
        skill: "Diagnostics", rating: "COMPETENT", notes: "should not land",
        idempotencyKey: `role-verify-eval-spoof-${tag}`,
      });
      assert.equal(result.ok, false, "a trainee claiming TRAINER must not be able to evaluate a trainee");
      assert.equal(result.error, "Not authorized.");
    } finally {
      await client.query('DELETE FROM "User" WHERE id = ANY($1::text[])', [[spoofer, trainee]]);
    }
  });
});

test("createAssignment rejects a suspended trainer even though the claimed role is TRAINER", async () => {
  assert.ok(connectionString, "database is configured");
  await withClient(async (client) => {
    const tag = suffix();
    const trainer = await createUser(client, "assignment-suspended-trainer", "TRAINER", "SUSPENDED", tag);
    const idempotencyKey = `role-verify-assignment-${tag}`;
    try {
      const result = await createAssignment({
        trainerId: trainer, trainerRole: "TRAINER", batchId: "not-owned-batch", title: "Should not be created",
        instructions: "n/a", dueDate: "2026-12-01", dueTime: "09:00",
        allowedSubmissionTypes: ["DOCUMENT"], idempotencyKey,
      });
      assert.equal(result.ok, false, "a suspended trainer must not be able to create an assignment");
      assert.equal(result.error, "Not authorized.");
      assert.equal((await one(client, 'SELECT count(*)::int AS count FROM "Assignment" WHERE "idempotencyKey" = $1', [idempotencyKey])).count, 0);
    } finally {
      await client.query('DELETE FROM "User" WHERE id = $1', [trainer]);
    }
  });
});

test("submitAssignment rejects a suspended trainee even though the claimed role is TRAINEE", async () => {
  assert.ok(connectionString, "database is configured");
  await withClient(async (client) => {
    const tag = suffix();
    const trainee = await createUser(client, "submit-suspended-trainee", "TRAINEE", "SUSPENDED", tag);
    try {
      const result = await submitAssignment({
        traineeId: trainee, traineeRole: "TRAINEE", assignmentId: "does-not-exist",
        submissionLink: "https://example.com/should-not-land", idempotencyKey: `role-verify-submit-${tag}`,
      });
      assert.equal(result.ok, false, "a suspended trainee must not be able to submit an assignment");
      assert.equal(result.error, "Not authorized.");
    } finally {
      await client.query('DELETE FROM "User" WHERE id = $1', [trainee]);
    }
  });
});

test("submitAssignment rejects a spoofed TRAINEE role claim from a real trainer actor", async () => {
  assert.ok(connectionString, "database is configured");
  await withClient(async (client) => {
    const tag = suffix();
    const spoofer = await createUser(client, "submit-spoofer", "TRAINER", "ACTIVE", tag);
    try {
      const result = await submitAssignment({
        traineeId: spoofer, traineeRole: "TRAINEE", assignmentId: "does-not-exist",
        submissionLink: "https://example.com/should-not-land", idempotencyKey: `role-verify-submit-spoof-${tag}`,
      });
      assert.equal(result.ok, false, "a trainer claiming TRAINEE must not be able to submit an assignment");
      assert.equal(result.error, "Not authorized.");
    } finally {
      await client.query('DELETE FROM "User" WHERE id = $1', [spoofer]);
    }
  });
});

test("createAnnouncement rejects a suspended admin even though the claimed role is ADMIN", async () => {
  assert.ok(connectionString, "database is configured");
  await withClient(async (client) => {
    const tag = suffix();
    const admin = await createUser(client, "announce-suspended-admin", "ADMIN", "SUSPENDED", tag);
    const idempotencyKey = `role-verify-announce-create-${tag}`;
    try {
      const result = await createAnnouncement({
        title: "Should not be created", body: "n/a", type: "INFO", pinned: false,
        authorId: admin, authorRole: "ADMIN", idempotencyKey,
      });
      assert.equal(result.ok, false, "a suspended admin must not be able to create an announcement");
      assert.equal(result.error, "Not authorized.");
      assert.equal((await one(client, 'SELECT count(*)::int AS count FROM "Announcement" WHERE "idempotencyKey" = $1', [idempotencyKey])).count, 0);
    } finally {
      await client.query('DELETE FROM "User" WHERE id = $1', [admin]);
    }
  });
});

test("deleteAnnouncement rejects a suspended admin even though the claimed role is ADMIN", async () => {
  assert.ok(connectionString, "database is configured");
  await withClient(async (client) => {
    const tag = suffix();
    const activeAdmin = await one(client, 'SELECT id FROM "User" WHERE email = $1', ["admin@gmail.com"]);
    const suspendedAdmin = await createUser(client, "announce-suspended-deleter", "ADMIN", "SUSPENDED", tag);
    const announcementId = `role-verify-announcement-${tag}`;
    await client.query(
      `INSERT INTO "Announcement" (id, title, body, type, "isPinned", "postedByUserId", "createdAt", "updatedAt")
       VALUES ($1, $2, 'Role-verification coverage announcement.', 'INFO', false, $3, NOW(), NOW())`,
      [announcementId, `Role verify announcement ${tag}`, activeAdmin.id],
    );
    try {
      const result = await deleteAnnouncement({ announcementId, actorId: suspendedAdmin, actorRole: "ADMIN" });
      assert.equal(result.ok, false, "a suspended admin must not be able to delete an announcement");
      assert.equal(result.error, "Not authorized.");
      assert.equal((await one(client, 'SELECT count(*)::int AS count FROM "Announcement" WHERE id = $1', [announcementId])).count, 1);
    } finally {
      await client.query('DELETE FROM "Announcement" WHERE id = $1', [announcementId]);
      await client.query('DELETE FROM "User" WHERE id = $1', [suspendedAdmin]);
    }
  });
});

// forum-write.service.ts's verifiedModerator previously checked only role
// equality, with no status check — extracting it onto the shared
// actor-verification helper fixed that silently. These three tests pin the
// fix down: each would have passed with the pre-extraction, role-only check
// (a SUSPENDED admin whose real role is still ADMIN, or a real TRAINEE
// claiming ADMIN, are the exact two ways to prove role-only checking is
// insufficient), so a later refactor that regresses to role-only would turn
// one of these red instead of silently reopening the gap.

test("approveForumPost rejects a suspended admin even though the claimed role is ADMIN", async () => {
  assert.ok(connectionString, "database is configured");
  await withClient(async (client) => {
    const tag = suffix();
    const suspendedAdmin = await createUser(client, "forum-approve-suspended-admin", "ADMIN", "SUSPENDED", tag);
    const fixture = await createPendingForumPost(client, tag);
    try {
      const result = await approveForumPost({ postId: fixture.postId, moderatorId: suspendedAdmin, moderatorRole: "ADMIN" });
      assert.equal(result.ok, false, "a suspended admin must not be able to approve a forum post");
      assert.equal(result.error, "You are not allowed to moderate forum posts.");
      assert.equal((await one(client, 'SELECT status FROM "ForumPost" WHERE id = $1', [fixture.postId])).status, "PENDING_APPROVAL");
    } finally {
      await client.query('DELETE FROM "ForumPost" WHERE id = $1', [fixture.postId]);
      await client.query('DELETE FROM "User" WHERE id = ANY($1::text[])', [[suspendedAdmin, fixture.author]]);
    }
  });
});

test("rejectForumPost rejects a suspended admin even though the claimed role is ADMIN", async () => {
  assert.ok(connectionString, "database is configured");
  await withClient(async (client) => {
    const tag = suffix();
    const suspendedAdmin = await createUser(client, "forum-reject-suspended-admin", "ADMIN", "SUSPENDED", tag);
    const fixture = await createPendingForumPost(client, tag);
    try {
      const result = await rejectForumPost({ postId: fixture.postId, moderatorId: suspendedAdmin, moderatorRole: "ADMIN" });
      assert.equal(result.ok, false, "a suspended admin must not be able to reject a forum post");
      assert.equal(result.error, "You are not allowed to moderate forum posts.");
      assert.equal((await one(client, 'SELECT status FROM "ForumPost" WHERE id = $1', [fixture.postId])).status, "PENDING_APPROVAL");
    } finally {
      await client.query('DELETE FROM "ForumPost" WHERE id = $1', [fixture.postId]);
      await client.query('DELETE FROM "User" WHERE id = ANY($1::text[])', [[suspendedAdmin, fixture.author]]);
    }
  });
});

test("approveForumPost rejects a spoofed ADMIN role claim from a real trainee actor", async () => {
  assert.ok(connectionString, "database is configured");
  await withClient(async (client) => {
    const tag = suffix();
    const spoofer = await createUser(client, "forum-approve-spoofer", "TRAINEE", "ACTIVE", tag);
    const fixture = await createPendingForumPost(client, tag);
    try {
      const result = await approveForumPost({ postId: fixture.postId, moderatorId: spoofer, moderatorRole: "ADMIN" });
      assert.equal(result.ok, false, "a trainee claiming ADMIN must not be able to approve a forum post");
      assert.equal(result.error, "You are not allowed to moderate forum posts.");
      assert.equal((await one(client, 'SELECT status FROM "ForumPost" WHERE id = $1', [fixture.postId])).status, "PENDING_APPROVAL");
    } finally {
      await client.query('DELETE FROM "ForumPost" WHERE id = $1', [fixture.postId]);
      await client.query('DELETE FROM "User" WHERE id = ANY($1::text[])', [[spoofer, fixture.author]]);
    }
  });
});
