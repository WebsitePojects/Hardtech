import "dotenv/config";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { test } from "node:test";
import pg from "pg";

const { evaluateTrainee, submitAssignment, approveCertificate, verifyPayment } =
  await import("../../src/server/services/dashboard-write.service.ts");

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;

async function one(client, sql, values = []) {
  const result = await client.query(sql, values);
  assert.equal(result.rows.length, 1, `Expected one row for ${sql}`);
  return result.rows[0];
}

async function fixture(client, suffix) {
  const users = await client.query(
    'SELECT id, email FROM "User" WHERE email IN ($1, $2, $3)',
    ["admin@gmail.com", "trainer@gmail.com", "trainee@gmail.com"],
  );
  const byEmail = new Map(users.rows.map((row) => [row.email, row.id]));
  const program = await one(client, 'SELECT id FROM "Program" ORDER BY "createdAt" LIMIT 1');
  const batch = await one(client, 'SELECT id FROM "Batch" WHERE "trainerId" = $1 ORDER BY "createdAt" LIMIT 1', [byEmail.get("trainer@gmail.com")]);
  assert.ok(byEmail.get("admin@gmail.com"));
  assert.ok(byEmail.get("trainer@gmail.com"));
  assert.ok(byEmail.get("trainee@gmail.com"));
  const testTraineeId = `test-trainee-${suffix}`;
  await client.query(
    `INSERT INTO "User" (id, email, "passwordHash", "firstName", "lastName", role, status, "createdAt", "updatedAt")
     VALUES ($1, $2, 'test-only', 'Dashboard', 'Mutation', 'TRAINEE', 'ACTIVE', NOW(), NOW())`,
    [testTraineeId, `dashboard-mutation-${suffix}@example.com`],
  );

  async function createEnrollment(label) {
    const paymentId = `test-payment-${suffix}-${label}`;
    const enrollmentId = `test-enrollment-${suffix}-${label}`;
    await client.query(
      `INSERT INTO "EnrollmentPayment" (id, "traineeId", "idempotencyKey", "referenceCode", "paymentMethod", "totalAmount", "proofImageUrl", status, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, 'GCASH', 100.00, 'https://example.com/test-proof.png', 'SUBMITTED', NOW(), NOW())`,
      [paymentId, testTraineeId, `test-key-${suffix}-${label}`, `TEST-${suffix}-${label}`],
    );
    await client.query(
      `INSERT INTO "Enrollment" (id, "enrollmentRef", "traineeId", "programId", "batchId", "paymentId", amount, status, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, 100.00, $7::"EnrollmentStatus", NOW(), NOW())`,
      [
        enrollmentId,
        `TEST-ENR-${suffix}-${label}`,
        testTraineeId,
        program.id,
        batch.id,
        paymentId,
        label === "evaluation" ? "ACTIVE" : "PENDING_VERIFICATION",
      ],
    );
    return { paymentId, enrollmentId };
  }

  const paymentFixture = await createEnrollment("payment");
  const evaluationFixture = await createEnrollment("evaluation");
  const assignmentId = `test-assignment-${suffix}`;
  const assignmentMediaAssetId = `test-assignment-media-${suffix}`;
  await client.query(
    `INSERT INTO "Assignment" (id, "batchId", "trainerId", title, instructions, "dueDate", "dueTime", "allowedSubmissionTypes", "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4, 'Submit a test link.', NOW() + INTERVAL '1 day', '11:59 PM', ARRAY['DOCUMENT']::"SubmissionType"[], NOW(), NOW())`,
    [assignmentId, batch.id, byEmail.get("trainer@gmail.com"), `Test assignment ${suffix}`],
  );
  await client.query(
    `INSERT INTO "MediaAsset" (id, "publicId", "resourceType", folder, "uploadedByUserId", url, bytes, format, "purgeState", "createdAt", "updatedAt")
     VALUES ($1, $2, 'RAW', 'hardtech/assignment-submissions', $3, 'https://example.com/test-assignment.pdf', 1024, 'pdf', 'ACTIVE', NOW(), NOW())`,
    [assignmentMediaAssetId, `test-assignment-media-${suffix}`, testTraineeId],
  );
  const certificateId = `test-certificate-${suffix}`;
  await client.query(
    `INSERT INTO "CertificateRequest" (id, "enrollmentId", "certificateCode", "completedAt", status, "createdAt", "updatedAt")
     VALUES ($1, $2, $3, NOW(), 'PENDING', NOW(), NOW())`,
    [certificateId, evaluationFixture.enrollmentId, `TEST-CERT-${suffix}`],
  );

  return {
    adminId: byEmail.get("admin@gmail.com"),
    trainerId: byEmail.get("trainer@gmail.com"),
    traineeId: testTraineeId,
    assignmentId,
    assignmentMediaAssetId,
    evaluationPaymentId: evaluationFixture.paymentId,
    evaluationEnrollmentId: evaluationFixture.enrollmentId,
    paymentId: paymentFixture.paymentId,
    paymentEnrollmentId: paymentFixture.enrollmentId,
    certificateId,
  };
}

test("dashboard writes are real, duplicate-safe mutations", async () => {
  assert.ok(connectionString, "database connection is configured");
  const client = new pg.Client({ connectionString });
  await client.connect();
  const suffix = `${Date.now()}-${randomUUID().slice(0, 8)}`;
  let data;
  try {
    data = await fixture(client, suffix);

    // A real trainee spoofing trainerRole: "TRAINER" must be stopped by the
    // authorization gate itself, with only the generic error — never the
    // self-rating message, which would leak business-rule detail to an
    // unauthorized caller.
    const spoofedSelfRating = await evaluateTrainee({
      trainerId: data.traineeId,
      trainerRole: "TRAINER",
      traineeId: data.traineeId,
      skill: "Diagnostics",
      rating: "CERTIFIED",
      notes: "spoofed self-rating should be rejected",
      idempotencyKey: `spoofed-self-rating-${suffix}`,
    });
    assert.equal(spoofedSelfRating.ok, false, "a spoofed non-trainer must not rate anyone");
    assert.equal(spoofedSelfRating.error, "Not authorized.", "a spoofed non-trainer must get the generic authorization error, not the self-rating message");

    // The self-rating rule exists for the real conflict-of-interest case: a
    // genuine ACTIVE trainer who is also the trainee on record. That actor
    // passes the authorization gate and must still be blocked, with the
    // specific self-rating message.
    const selfTrainerId = `test-self-trainer-${suffix}`;
    try {
      await client.query(
        `INSERT INTO "User" (id, email, "passwordHash", "firstName", "lastName", role, status, "createdAt", "updatedAt")
         VALUES ($1, $2, 'test-only', 'Self', 'Trainer', 'TRAINER', 'ACTIVE', NOW(), NOW())`,
        [selfTrainerId, `self-trainer-${suffix}@example.com`],
      );
      const selfRating = await evaluateTrainee({
        trainerId: selfTrainerId,
        trainerRole: "TRAINER",
        traineeId: selfTrainerId,
        skill: "Diagnostics",
        rating: "CERTIFIED",
        notes: "self-rating should be rejected",
        idempotencyKey: `self-rating-${suffix}`,
      });
      assert.equal(selfRating.ok, false, "a genuine trainer must still be blocked from rating themselves");
      assert.match(selfRating.error, /cannot rate yourself/i);
    } finally {
      await client.query('DELETE FROM "User" WHERE id = $1', [selfTrainerId]);
    }

    const ratingInput = {
      trainerId: data.trainerId,
      trainerRole: "TRAINER",
      traineeId: data.traineeId,
      skill: "Diagnostics",
      rating: "COMPETENT",
      notes: "sequential replay",
      idempotencyKey: `rating-${suffix}`,
    };
    const initialRating = await evaluateTrainee(ratingInput);
    assert.equal(initialRating.ok, true, initialRating.ok ? undefined : initialRating.error);
    assert.equal(
      (await evaluateTrainee({
        ...ratingInput,
        idempotencyKey: `rating-revision-${suffix}`,
        notes: "updated answer",
      })).ok,
      true,
    );
    assert.equal((await client.query('SELECT count(*)::int AS count FROM "AuthorRating" WHERE "ratedUserId" = $1 AND "raterUserId" = $2', [data.traineeId, data.trainerId])).rows[0].count, 1);
    assert.equal((await client.query('SELECT count(*)::int AS count FROM "Evaluation" WHERE "enrollmentId" = $1 AND "trainerId" = $2 AND "revokedAt" IS NULL', [data.evaluationEnrollmentId, data.trainerId])).rows[0].count, 1);
    const concurrentRatings = await Promise.all([evaluateTrainee(ratingInput), evaluateTrainee(ratingInput)]);
    assert.equal(concurrentRatings.every((result) => result.ok), true);
    assert.equal((await client.query('SELECT count(*)::int AS count FROM "AuthorRating" WHERE "ratedUserId" = $1 AND "raterUserId" = $2', [data.traineeId, data.trainerId])).rows[0].count, 1);
    assert.equal((await client.query('SELECT count(*)::int AS count FROM "Evaluation" WHERE "enrollmentId" = $1 AND "trainerId" = $2 AND "revokedAt" IS NULL', [data.evaluationEnrollmentId, data.trainerId])).rows[0].count, 1);

    const submission = {
      assignmentId: data.assignmentId,
      traineeId: data.traineeId,
      traineeRole: "TRAINEE",
      mediaAssetId: data.assignmentMediaAssetId,
      idempotencyKey: `submission-${suffix}`,
    };
    assert.equal((await submitAssignment(submission)).ok, true);
    assert.equal((await submitAssignment(submission)).ok, true);
    assert.equal((await client.query('SELECT count(*)::int AS count FROM "AssignmentSubmission" WHERE "assignmentId" = $1 AND "traineeId" = $2', [data.assignmentId, data.traineeId])).rows[0].count, 1);
    const concurrentSubmissions = await Promise.all([submitAssignment(submission), submitAssignment(submission)]);
    assert.equal(concurrentSubmissions.every((result) => result.ok), true);
    assert.equal((await client.query('SELECT count(*)::int AS count FROM "AssignmentSubmission" WHERE "assignmentId" = $1 AND "traineeId" = $2', [data.assignmentId, data.traineeId])).rows[0].count, 1);

    const certificateApprovals = await Promise.all([
      approveCertificate({ adminId: data.adminId, adminRole: "ADMIN", certificateRequestId: data.certificateId }),
      approveCertificate({ adminId: data.adminId, adminRole: "ADMIN", certificateRequestId: data.certificateId }),
    ]);
    assert.equal(certificateApprovals.filter((result) => result.ok).length, 1);
    assert.equal((await client.query('SELECT status FROM "CertificateRequest" WHERE id = $1', [data.certificateId])).rows[0].status, "APPROVED");
    assert.equal((await client.query('SELECT count(*)::int AS count FROM "AuditLog" WHERE "referenceId" = $1 AND category = $2', [data.certificateId, "CERTIFICATE"])).rows[0].count, 1);

    // A real trainee spoofing adminRole: "ADMIN" must be stopped by the
    // authorization gate itself and get only the generic error — never a
    // resource-specific message that would let a non-admin caller learn
    // anything about the payment (id exists, whose it is) before being
    // authorized to see it at all.
    const spoofedVerification = await verifyPayment({ adminId: data.traineeId, adminRole: "ADMIN", paymentId: data.paymentId });
    assert.equal(spoofedVerification.ok, false, "a spoofed non-admin must not verify a payment");
    assert.equal(spoofedVerification.error, "Not authorized.", "a spoofed non-admin must get the generic authorization error, not a resource-specific one");

    // The self-conflict rule exists for the real conflict-of-interest case:
    // a genuine ADMIN in the database who also happens to own the payment
    // being cleared (e.g. an admin who submitted this payment before being
    // promoted). That actor passes the authorization gate and must still be
    // blocked, with the specific self-conflict message.
    const program = await one(client, 'SELECT id FROM "Program" ORDER BY "createdAt" LIMIT 1');
    const selfAdminId = `test-self-admin-${suffix}`;
    const selfPaymentId = `test-self-payment-${suffix}`;
    const selfEnrollmentId = `test-self-enrollment-${suffix}`;
    try {
      await client.query(
        `INSERT INTO "User" (id, email, "passwordHash", "firstName", "lastName", role, status, "createdAt", "updatedAt")
         VALUES ($1, $2, 'test-only', 'Self', 'Admin', 'ADMIN', 'ACTIVE', NOW(), NOW())`,
        [selfAdminId, `self-admin-${suffix}@example.com`],
      );
      await client.query(
        `INSERT INTO "EnrollmentPayment" (id, "traineeId", "idempotencyKey", "referenceCode", "paymentMethod", "totalAmount", "proofImageUrl", status, "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, 'GCASH', 100.00, 'https://example.com/self-proof.png', 'SUBMITTED', NOW(), NOW())`,
        [selfPaymentId, selfAdminId, `test-self-key-${suffix}`, `TEST-SELF-${suffix}`],
      );
      await client.query(
        `INSERT INTO "Enrollment" (id, "enrollmentRef", "traineeId", "programId", "batchId", "paymentId", amount, status, "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, NULL, $5, 100.00, 'PENDING_VERIFICATION', NOW(), NOW())`,
        [selfEnrollmentId, `TEST-SELF-ENR-${suffix}`, selfAdminId, program.id, selfPaymentId],
      );
      const selfVerification = await verifyPayment({ adminId: selfAdminId, adminRole: "ADMIN", paymentId: selfPaymentId });
      assert.equal(selfVerification.ok, false, "a genuine admin must still be blocked from clearing their own payment");
      assert.match(selfVerification.error, /cannot verify your own payment/i);
    } finally {
      await client.query('DELETE FROM "Enrollment" WHERE id = $1', [selfEnrollmentId]);
      await client.query('DELETE FROM "EnrollmentPayment" WHERE id = $1', [selfPaymentId]);
      await client.query('DELETE FROM "User" WHERE id = $1', [selfAdminId]);
    }

    const paymentApprovals = await Promise.all([
      verifyPayment({ adminId: data.adminId, adminRole: "ADMIN", paymentId: data.paymentId }),
      verifyPayment({ adminId: data.adminId, adminRole: "ADMIN", paymentId: data.paymentId }),
    ]);
    assert.equal(paymentApprovals.filter((result) => result.ok).length, 1);
    assert.equal((await client.query('SELECT status FROM "EnrollmentPayment" WHERE id = $1', [data.paymentId])).rows[0].status, "VERIFIED");
    assert.equal((await client.query('SELECT count(*)::int AS count FROM "AuditLog" WHERE "referenceId" = $1 AND category = $2', [data.paymentId, "PAYMENT"])).rows[0].count, 1);
    assert.equal((await client.query('SELECT status FROM "Enrollment" WHERE "paymentId" = $1', [data.paymentId])).rows[0].status, "ACTIVE");
  } finally {
    if (data) {
      await client.query('DELETE FROM "CertificateRequest" WHERE id = $1', [data.certificateId]);
      await client.query(
        `DELETE FROM "AuditLog" WHERE "referenceId" IN (
          SELECT id FROM "EvaluationIntent" WHERE "enrollmentId" = $1
        )`,
        [data.evaluationEnrollmentId],
      );
      await client.query('DELETE FROM "Evaluation" WHERE "enrollmentId" = $1', [data.evaluationEnrollmentId]);
      await client.query('DELETE FROM "AuditLog" WHERE "referenceId" IN ($1, $2)', [data.certificateId, data.paymentId]);
      await client.query('DELETE FROM "AssignmentSubmission" WHERE "assignmentId" = $1 AND "traineeId" = $2', [data.assignmentId, data.traineeId]);
      await client.query('DELETE FROM "MediaAsset" WHERE id = $1', [data.assignmentMediaAssetId]);
      await client.query('DELETE FROM "Assignment" WHERE id = $1', [data.assignmentId]);
      await client.query('DELETE FROM "Enrollment" WHERE id IN ($1, $2)', [data.evaluationEnrollmentId, data.paymentEnrollmentId]);
      await client.query('DELETE FROM "EnrollmentPayment" WHERE id IN ($1, $2)', [data.evaluationPaymentId, data.paymentId]);
      await client.query('DELETE FROM "AuthorRating" WHERE "ratedUserId" = $1 AND "raterUserId" = $2', [data.traineeId, data.trainerId]);
      await client.query('DELETE FROM "User" WHERE id = $1', [data.traineeId]);
    }
    await client.end();
  }
});
