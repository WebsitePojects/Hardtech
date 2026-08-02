import "dotenv/config";
import assert from "node:assert/strict";
import { test } from "node:test";
import pg from "pg";

const { submitEnrollment } = await import("../../src/server/services/enrollment.service.ts");
const { db } = await import("../../src/server/db.ts");
const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;

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
    proofImageUrl: "data:image/png;base64,dGVzdA==",
    tamperedPrice: "0.01",
  };

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
      submitEnrollment({ ...input, idempotencyKey: `enrollment-${suffix}-concurrent` }),
      submitEnrollment({ ...input, idempotencyKey: `enrollment-${suffix}-concurrent` }),
    ]);
    assert.deepEqual(concurrent[0], concurrent[1], "concurrent retry converges on one result");
    const concurrentCount = await client.query(
      'SELECT COUNT(*)::int AS count FROM "EnrollmentPayment" WHERE "idempotencyKey" = $1',
      [`enrollment-${suffix}-concurrent`],
    );
    assert.equal(concurrentCount.rows[0]?.count, 1, "concurrent retry creates exactly one payment");

    const secondKey = await submitEnrollment({ ...input, idempotencyKey: `enrollment-${suffix}-two` });
    assert.notEqual(secondKey.paymentId, first.paymentId, "a different key creates a different payment");

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
      const trainee = await client.query('SELECT id FROM "User" WHERE email = $1', [email]);
      const traineeId = trainee.rows[0]?.id;

      if (traineeId) {
        // Delete only rows belonging to this test trainee, in FK dependency order.
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
      await client.query("COMMIT");
    } catch (cleanupError) {
      await client.query("ROLLBACK").catch(() => undefined);
      throw cleanupError;
    } finally {
      await client.end();
      await db.$disconnect();
    }
  }
});
