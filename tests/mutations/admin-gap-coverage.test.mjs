import "dotenv/config";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { test } from "node:test";
import pg from "pg";

// This file covers the 5 admin actions the pre-existing suite never called
// (deleteAnnouncement, rejectCertificate, rejectPayment, rejectForumPost,
// updateUserProgram) and adds a spoofed-role authorization probe across every
// admin-only transition, including the ones already covered elsewhere.

const { deleteAnnouncement } = await import("../../src/server/services/announcement-write.service.ts");
const { approveCertificate, rejectCertificate, verifyPayment, rejectPayment } =
  await import("../../src/server/services/dashboard-write.service.ts");
const { rejectForumPost } = await import("../../src/server/services/forum-write.service.ts");
const { updateUserRole, updateUserStatus, updateUserProgram } =
  await import("../../src/server/services/admin-write.service.ts");
const {
  updateUserRoleSchema,
  updateUserStatusSchema,
  updateUserProgramSchema,
  removeAssignedTraineeSchema,
  removeUserSchema,
  savePaymentMethodSchema,
} = await import("../../src/server/schemas/admin-write.schema.ts");
const { certificateTransitionSchema, paymentTransitionSchema, deleteAnnouncementSchema, announcementWriteSchema } =
  await import("../../src/server/schemas/dashboard-write.schema.ts");
const { moderateForumPostSchema } = await import("../../src/server/schemas/forum-write.schema.ts");

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

async function createUser(client, label, role, tag) {
  const id = `gap-${label}-${tag}`;
  await client.query(
    `INSERT INTO "User" (id, email, "passwordHash", "firstName", "lastName", role, status, "createdAt", "updatedAt")
     VALUES ($1, $2, 'test-only', 'Gap', $3, $4::"UserRole", 'ACTIVE'::"UserStatus", NOW(), NOW())`,
    [id, `${id}@example.com`, label, role],
  );
  return id;
}

async function createCertificateFixture(client, tag) {
  const trainee = await createUser(client, "cert-trainee", "TRAINEE", tag);
  const program = await one(client, 'SELECT id FROM "Program" ORDER BY "createdAt" LIMIT 1');
  const paymentId = `gap-cert-payment-${tag}`;
  const enrollmentId = `gap-cert-enrollment-${tag}`;
  const certificateId = `gap-cert-${tag}`;
  await client.query(
    `INSERT INTO "EnrollmentPayment" (id, "traineeId", "idempotencyKey", "referenceCode", "paymentMethod", "totalAmount", "proofImageUrl", status, "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4, 'GCASH', 1, 'https://example.com/gap-cert.png', 'VERIFIED', NOW(), NOW())`,
    [paymentId, trainee, `gap-cert-key-${tag}`, `GAP-CERT-${tag}`],
  );
  await client.query(
    `INSERT INTO "Enrollment" (id, "enrollmentRef", "traineeId", "programId", "batchId", "paymentId", amount, status, "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4, NULL, $5, 1, 'ACTIVE', NOW(), NOW())`,
    [enrollmentId, `GAP-CERT-ENR-${tag}`, trainee, program.id, paymentId],
  );
  await client.query(
    `INSERT INTO "CertificateRequest" (id, "enrollmentId", "certificateCode", "completedAt", status, "createdAt", "updatedAt")
     VALUES ($1, $2, $3, NOW(), 'PENDING', NOW(), NOW())`,
    [certificateId, enrollmentId, `GAP-CERT-CODE-${tag}`],
  );
  return { trainee, paymentId, enrollmentId, certificateId };
}

async function cleanupCertificateFixture(client, fixture) {
  await client.query('DELETE FROM "AuditLog" WHERE "referenceId" = $1', [fixture.certificateId]);
  await client.query('DELETE FROM "CertificateRequest" WHERE id = $1', [fixture.certificateId]);
  await client.query('DELETE FROM "Enrollment" WHERE id = $1', [fixture.enrollmentId]);
  await client.query('DELETE FROM "EnrollmentPayment" WHERE id = $1', [fixture.paymentId]);
  await client.query('DELETE FROM "User" WHERE id = $1', [fixture.trainee]);
}

async function createPaymentFixture(client, tag) {
  const trainee = await createUser(client, "pay-trainee", "TRAINEE", tag);
  const program = await one(client, 'SELECT id FROM "Program" ORDER BY "createdAt" LIMIT 1');
  const paymentId = `gap-pay-${tag}`;
  const enrollmentId = `gap-pay-enrollment-${tag}`;
  await client.query(
    `INSERT INTO "EnrollmentPayment" (id, "traineeId", "idempotencyKey", "referenceCode", "paymentMethod", "totalAmount", "proofImageUrl", status, "submittedAt", "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4, 'GCASH', 1, 'https://example.com/gap-pay.png', 'SUBMITTED', NOW(), NOW(), NOW())`,
    [paymentId, trainee, `gap-pay-key-${tag}`, `GAP-PAY-${tag}`],
  );
  await client.query(
    `INSERT INTO "Enrollment" (id, "enrollmentRef", "traineeId", "programId", "batchId", "paymentId", amount, status, "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4, NULL, $5, 1, 'PENDING_VERIFICATION', NOW(), NOW())`,
    [enrollmentId, `GAP-PAY-ENR-${tag}`, trainee, program.id, paymentId],
  );
  return { trainee, paymentId, enrollmentId };
}

async function cleanupPaymentFixture(client, fixture) {
  await client.query('DELETE FROM "AuditLog" WHERE "referenceId" = $1', [fixture.paymentId]);
  await client.query('DELETE FROM "Enrollment" WHERE id = $1', [fixture.enrollmentId]);
  await client.query('DELETE FROM "EnrollmentPayment" WHERE id = $1', [fixture.paymentId]);
  await client.query('DELETE FROM "User" WHERE id = $1', [fixture.trainee]);
}

async function createPendingForumPost(client, tag) {
  const author = await createUser(client, "forum-author", "TRAINEE", tag);
  const postId = `gap-post-${tag}`;
  await client.query(
    `INSERT INTO "ForumPost" (id, "authorId", title, body, hashtags, status, "createdAt", "updatedAt")
     VALUES ($1, $2, $3, 'A trainee post awaiting moderation.', '{}'::text[], 'PENDING_APPROVAL', NOW(), NOW())`,
    [postId, author, `Gap forum post ${tag}`],
  );
  return { author, postId };
}

async function createAnnouncementRow(client, tag, authorId) {
  const id = `gap-announcement-${tag}`;
  await client.query(
    `INSERT INTO "Announcement" (id, title, body, type, "isPinned", "postedByUserId", "createdAt", "updatedAt")
     VALUES ($1, $2, 'Gap coverage announcement.', 'INFO', false, $3, NOW(), NOW())`,
    [id, `Gap announcement ${tag}`, authorId],
  );
  return id;
}

test("write schemas reject missing fields, wrong types, and unrecognized enums at the boundary", () => {
  assert.equal(updateUserRoleSchema.safeParse({ userId: "u1", role: "SUPERADMIN" }).success, false);
  assert.equal(updateUserRoleSchema.safeParse({ role: "ADMIN" }).success, false);
  assert.equal(updateUserStatusSchema.safeParse({ userId: "u1", status: 123 }).success, false);
  assert.equal(updateUserProgramSchema.safeParse({ userId: "u1", programId: "" }).success, false);
  assert.equal(removeAssignedTraineeSchema.safeParse({ enrollmentId: "e1" }).success, false);
  assert.equal(removeUserSchema.safeParse({}).success, false);
  assert.equal(
    savePaymentMethodSchema.safeParse({
      method: "PAYPAL",
      displayName: "x",
      accountNumber: null,
      accountName: null,
      bankName: null,
      note: null,
      isEnabled: true,
    }).success,
    false,
  );
  assert.equal(certificateTransitionSchema.safeParse({}).success, false);
  assert.equal(paymentTransitionSchema.safeParse({ paymentId: 42 }).success, false);
  assert.equal(deleteAnnouncementSchema.safeParse({ announcementId: "" }).success, false);
  assert.equal(moderateForumPostSchema.safeParse({}).success, false);
  assert.equal(
    announcementWriteSchema.safeParse({ idempotencyKey: "k", title: "", body: "b", type: "INFO", pinned: false }).success,
    false,
  );
});

test("updateUserRole rejects a spoofed ADMIN role claim from a real trainee actor", async () => {
  assert.ok(connectionString, "database is configured");
  await withClient(async (client) => {
    const tag = suffix();
    const spoofer = await createUser(client, "role-spoofer", "TRAINEE", tag);
    const target = await createUser(client, "role-target", "TRAINEE", tag);
    try {
      const result = await updateUserRole({ actorId: spoofer, actorRole: "ADMIN", userId: target, role: "TRAINER" });
      assert.equal(result.ok, false, "a trainee claiming ADMIN must be rejected");
      assert.equal((await one(client, 'SELECT role FROM "User" WHERE id = $1', [target])).role, "TRAINEE");
    } finally {
      await client.query('DELETE FROM "AuditLog" WHERE "referenceId" = $1', [target]);
      await client.query('DELETE FROM "User" WHERE id = ANY($1::text[])', [[spoofer, target]]);
    }
  });
});

test("updateUserStatus fails closed on an unrecognized status enum", async () => {
  assert.ok(connectionString, "database is configured");
  await withClient(async (client) => {
    const tag = suffix();
    const admin = await one(client, 'SELECT id FROM "User" WHERE email = $1', ["admin@gmail.com"]);
    const target = await createUser(client, "badstatus", "TRAINEE", tag);
    try {
      const result = await updateUserStatus({ actorId: admin.id, actorRole: "ADMIN", userId: target, status: "BANNED" });
      assert.equal(result.ok, false);
      assert.equal((await one(client, 'SELECT status FROM "User" WHERE id = $1', [target])).status, "ACTIVE");
    } finally {
      await client.query('DELETE FROM "User" WHERE id = $1', [target]);
    }
  });
});

test("rejectCertificate mutates, is duplicate-safe under concurrency, and fails closed on an unknown id", async () => {
  assert.ok(connectionString, "database is configured");
  await withClient(async (client) => {
    const tag = suffix();
    const admin = await one(client, 'SELECT id FROM "User" WHERE email = $1', ["admin@gmail.com"]);
    const fixture = await createCertificateFixture(client, tag);
    try {
      const concurrent = await Promise.all([
        rejectCertificate({ adminId: admin.id, adminRole: "ADMIN", certificateRequestId: fixture.certificateId, reason: "incomplete" }),
        rejectCertificate({ adminId: admin.id, adminRole: "ADMIN", certificateRequestId: fixture.certificateId, reason: "incomplete" }),
      ]);
      assert.equal(concurrent.filter((result) => result.ok).length, 1, "exactly one concurrent reject should land");
      assert.equal((await one(client, 'SELECT status FROM "CertificateRequest" WHERE id = $1', [fixture.certificateId])).status, "REJECTED");
      assert.equal(
        (await one(client, 'SELECT count(*)::int AS count FROM "AuditLog" WHERE "referenceId" = $1 AND category = $2', [fixture.certificateId, "CERTIFICATE"])).count,
        1,
      );

      const missing = await rejectCertificate({ adminId: admin.id, adminRole: "ADMIN", certificateRequestId: "does-not-exist" });
      assert.equal(missing.ok, false);
    } finally {
      await cleanupCertificateFixture(client, fixture);
    }
  });
});

test("approveCertificate rejects a spoofed ADMIN role claim from a real trainee actor", async () => {
  assert.ok(connectionString, "database is configured");
  await withClient(async (client) => {
    const tag = suffix();
    const fixture = await createCertificateFixture(client, tag);
    const spoofer = await createUser(client, "cert-approve-spoofer", "TRAINEE", tag);
    try {
      const result = await approveCertificate({ adminId: spoofer, adminRole: "ADMIN", certificateRequestId: fixture.certificateId });
      assert.equal(result.ok, false, "a trainee claiming ADMIN must not approve a certificate");
      assert.equal((await one(client, 'SELECT status FROM "CertificateRequest" WHERE id = $1', [fixture.certificateId])).status, "PENDING");
    } finally {
      await cleanupCertificateFixture(client, fixture);
      await client.query('DELETE FROM "User" WHERE id = $1', [spoofer]);
    }
  });
});

test("rejectCertificate rejects a spoofed ADMIN role claim from a real trainee actor", async () => {
  assert.ok(connectionString, "database is configured");
  await withClient(async (client) => {
    const tag = suffix();
    const fixture = await createCertificateFixture(client, tag);
    const spoofer = await createUser(client, "cert-reject-spoofer", "TRAINEE", tag);
    try {
      const result = await rejectCertificate({ adminId: spoofer, adminRole: "ADMIN", certificateRequestId: fixture.certificateId });
      assert.equal(result.ok, false, "a trainee claiming ADMIN must not reject a certificate");
      assert.equal((await one(client, 'SELECT status FROM "CertificateRequest" WHERE id = $1', [fixture.certificateId])).status, "PENDING");
    } finally {
      await cleanupCertificateFixture(client, fixture);
      await client.query('DELETE FROM "User" WHERE id = $1', [spoofer]);
    }
  });
});

test("rejectPayment mutates, is duplicate-safe under concurrency, and fails closed on an unknown id", async () => {
  assert.ok(connectionString, "database is configured");
  await withClient(async (client) => {
    const tag = suffix();
    const admin = await one(client, 'SELECT id FROM "User" WHERE email = $1', ["admin@gmail.com"]);
    const fixture = await createPaymentFixture(client, tag);
    try {
      const concurrent = await Promise.all([
        rejectPayment({ adminId: admin.id, adminRole: "ADMIN", paymentId: fixture.paymentId, reason: "bad proof" }),
        rejectPayment({ adminId: admin.id, adminRole: "ADMIN", paymentId: fixture.paymentId, reason: "bad proof" }),
      ]);
      assert.equal(concurrent.filter((result) => result.ok).length, 1, "exactly one concurrent reject should land");
      assert.equal((await one(client, 'SELECT status FROM "EnrollmentPayment" WHERE id = $1', [fixture.paymentId])).status, "REJECTED");
      assert.equal((await one(client, 'SELECT status FROM "Enrollment" WHERE id = $1', [fixture.enrollmentId])).status, "REJECTED");
      assert.equal(
        (await one(client, 'SELECT count(*)::int AS count FROM "AuditLog" WHERE "referenceId" = $1 AND category = $2', [fixture.paymentId, "PAYMENT"])).count,
        1,
      );

      const missing = await rejectPayment({ adminId: admin.id, adminRole: "ADMIN", paymentId: "does-not-exist" });
      assert.equal(missing.ok, false);
    } finally {
      await cleanupPaymentFixture(client, fixture);
    }
  });
});

test("verifyPayment rejects a spoofed ADMIN role claim from a real trainee actor", async () => {
  assert.ok(connectionString, "database is configured");
  await withClient(async (client) => {
    const tag = suffix();
    const fixture = await createPaymentFixture(client, tag);
    const spoofer = await createUser(client, "pay-verify-spoofer", "TRAINEE", tag);
    try {
      const result = await verifyPayment({ adminId: spoofer, adminRole: "ADMIN", paymentId: fixture.paymentId });
      assert.equal(result.ok, false, "a trainee claiming ADMIN must not verify a payment");
      assert.equal((await one(client, 'SELECT status FROM "EnrollmentPayment" WHERE id = $1', [fixture.paymentId])).status, "SUBMITTED");
    } finally {
      await cleanupPaymentFixture(client, fixture);
      await client.query('DELETE FROM "User" WHERE id = $1', [spoofer]);
    }
  });
});

test("rejectPayment rejects a spoofed ADMIN role claim from a real trainee actor", async () => {
  assert.ok(connectionString, "database is configured");
  await withClient(async (client) => {
    const tag = suffix();
    const fixture = await createPaymentFixture(client, tag);
    const spoofer = await createUser(client, "pay-reject-spoofer", "TRAINEE", tag);
    try {
      const result = await rejectPayment({ adminId: spoofer, adminRole: "ADMIN", paymentId: fixture.paymentId });
      assert.equal(result.ok, false, "a trainee claiming ADMIN must not reject a payment");
      assert.equal((await one(client, 'SELECT status FROM "EnrollmentPayment" WHERE id = $1', [fixture.paymentId])).status, "SUBMITTED");
    } finally {
      await cleanupPaymentFixture(client, fixture);
      await client.query('DELETE FROM "User" WHERE id = $1', [spoofer]);
    }
  });
});

test("rejectForumPost mutates, is duplicate-safe under concurrency, and fails closed on an unknown id", async () => {
  assert.ok(connectionString, "database is configured");
  await withClient(async (client) => {
    const tag = suffix();
    const admin = await one(client, 'SELECT id FROM "User" WHERE email = $1', ["admin@gmail.com"]);
    const fixture = await createPendingForumPost(client, tag);
    try {
      const concurrent = await Promise.all([
        rejectForumPost({ postId: fixture.postId, moderatorId: admin.id, moderatorRole: "ADMIN" }),
        rejectForumPost({ postId: fixture.postId, moderatorId: admin.id, moderatorRole: "ADMIN" }),
      ]);
      assert.equal(concurrent.filter((result) => result.ok).length, 1, "exactly one concurrent reject should land");
      assert.equal((await one(client, 'SELECT status FROM "ForumPost" WHERE id = $1', [fixture.postId])).status, "REJECTED");

      const missing = await rejectForumPost({ postId: "does-not-exist", moderatorId: admin.id, moderatorRole: "ADMIN" });
      assert.equal(missing.ok, false);
    } finally {
      await client.query('DELETE FROM "ForumPost" WHERE id = $1', [fixture.postId]);
      await client.query('DELETE FROM "User" WHERE id = $1', [fixture.author]);
    }
  });
});

test("deleteAnnouncement mutates, fails closed on an unknown id, and rejects a spoofed ADMIN role claim", async () => {
  assert.ok(connectionString, "database is configured");
  await withClient(async (client) => {
    const tag = suffix();
    const admin = await one(client, 'SELECT id FROM "User" WHERE email = $1', ["admin@gmail.com"]);
    const spoofer = await createUser(client, "announce-spoofer", "TRAINEE", tag);
    const spoofTarget = await createAnnouncementRow(client, `${tag}-spoof`, admin.id);
    const realTarget = await createAnnouncementRow(client, `${tag}-real`, admin.id);
    try {
      const spoofed = await deleteAnnouncement({ announcementId: spoofTarget, actorId: spoofer, actorRole: "ADMIN" });
      assert.equal(spoofed.ok, false, "a trainee claiming ADMIN must not delete an announcement");
      assert.equal((await one(client, 'SELECT count(*)::int AS count FROM "Announcement" WHERE id = $1', [spoofTarget])).count, 1);

      const missing = await deleteAnnouncement({ announcementId: "does-not-exist", actorId: admin.id, actorRole: "ADMIN" });
      assert.equal(missing.ok, false);

      const real = await deleteAnnouncement({ announcementId: realTarget, actorId: admin.id, actorRole: "ADMIN" });
      assert.equal(real.ok, true);
      assert.equal((await one(client, 'SELECT count(*)::int AS count FROM "Announcement" WHERE id = $1', [realTarget])).count, 0);
    } finally {
      await client.query('DELETE FROM "Announcement" WHERE id = ANY($1::text[])', [[spoofTarget, realTarget]]);
      await client.query('DELETE FROM "User" WHERE id = $1', [spoofer]);
    }
  });
});

test("updateUserProgram mutates a trainee's enrollment and a trainer's profile, and replays an unchanged program successfully", async () => {
  assert.ok(connectionString, "database is configured");
  await withClient(async (client) => {
    const tag = suffix();
    const admin = await one(client, 'SELECT id FROM "User" WHERE email = $1', ["admin@gmail.com"]);
    const programs = await client.query('SELECT id, "shortName" FROM "Program" ORDER BY "createdAt" LIMIT 2');
    assert.equal(programs.rows.length, 2, "fixture needs two distinct seeded programs");
    const [programA, programB] = programs.rows;
    assert.notEqual(programA.shortName, programB.shortName);

    const trainee = await createUser(client, "program-trainee", "TRAINEE", tag);
    const trainer = await createUser(client, "program-trainer", "TRAINER", tag);
    const paymentId = `gap-program-payment-${tag}`;
    const enrollmentId = `gap-program-enrollment-${tag}`;
    const trainerProfileId = `gap-program-profile-${tag}`;
    await client.query(
      `INSERT INTO "EnrollmentPayment" (id, "traineeId", "idempotencyKey", "referenceCode", "paymentMethod", "totalAmount", "proofImageUrl", status, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, 'GCASH', 1, 'https://example.com/gap-program.png', 'VERIFIED', NOW(), NOW())`,
      [paymentId, trainee, `gap-program-key-${tag}`, `GAP-PROGRAM-${tag}`],
    );
    await client.query(
      `INSERT INTO "Enrollment" (id, "enrollmentRef", "traineeId", "programId", "batchId", "paymentId", amount, status, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, NULL, $5, 1, 'ACTIVE', NOW(), NOW())`,
      [enrollmentId, `GAP-PROGRAM-ENR-${tag}`, trainee, programA.id, paymentId],
    );
    await client.query(
      `INSERT INTO "TrainerProfile" (id, "userId", title, bio, credentials, "primaryProgramId", status, "createdAt", "updatedAt")
       VALUES ($1, $2, 'Test Trainer', 'Test bio.', '{}'::text[], $3, 'ACTIVE', NOW(), NOW())`,
      [trainerProfileId, trainer, programA.id],
    );
    try {
      const traineeChange = await updateUserProgram({ actorId: admin.id, actorRole: "ADMIN", userId: trainee, programId: programB.shortName });
      assert.equal(traineeChange.ok, true);
      assert.equal((await one(client, 'SELECT "programId" FROM "Enrollment" WHERE id = $1', [enrollmentId])).programId, programB.id);

      const traineeReplay = await updateUserProgram({ actorId: admin.id, actorRole: "ADMIN", userId: trainee, programId: programB.shortName });
      assert.equal(traineeReplay.ok, true, "a replay that leaves the program unchanged must not be reported as a failure");

      const trainerChange = await updateUserProgram({ actorId: admin.id, actorRole: "ADMIN", userId: trainer, programId: programB.shortName });
      assert.equal(trainerChange.ok, true);
      assert.equal((await one(client, 'SELECT "primaryProgramId" FROM "TrainerProfile" WHERE id = $1', [trainerProfileId])).primaryProgramId, programB.id);

      const trainerReplay = await updateUserProgram({ actorId: admin.id, actorRole: "ADMIN", userId: trainer, programId: programB.shortName });
      assert.equal(trainerReplay.ok, true, "a replay that leaves the program unchanged must not be reported as a failure");
    } finally {
      await client.query('DELETE FROM "AuditLog" WHERE "referenceId" = ANY($1::text[])', [[trainee, trainer]]);
      await client.query('DELETE FROM "TrainerProfile" WHERE id = $1', [trainerProfileId]);
      await client.query('DELETE FROM "Enrollment" WHERE id = $1', [enrollmentId]);
      await client.query('DELETE FROM "EnrollmentPayment" WHERE id = $1', [paymentId]);
      await client.query('DELETE FROM "User" WHERE id = ANY($1::text[])', [[trainee, trainer]]);
    }
  });
});
