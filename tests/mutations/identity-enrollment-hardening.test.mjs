import "dotenv/config";
import assert from "node:assert/strict";
import { test } from "node:test";

const { isCurrentSessionPrincipal } = await import("../../src/server/auth/session.ts");
const { hashPassword, isDemoAuthEnabled, verifyPassword } = await import("../../src/server/auth/demo-credentials.ts");
const { checkRateLimit } = await import("../../src/server/auth/rate-limit.ts");
const { canReuseExistingApplicant, coalesceEnrollmentSubmission } = await import("../../src/server/services/enrollment.service.ts");
const { TestCredentialsCard } = await import("../../src/app/(auth)/login/test-credentials-card.tsx");
const { db } = await import("../../src/server/db.ts");

test("current session validation rejects suspended and role-demoted principals", () => {
  assert.equal(isCurrentSessionPrincipal("ADMIN", { role: "ADMIN", status: "ACTIVE" }), true);
  assert.equal(isCurrentSessionPrincipal("ADMIN", { role: "ADMIN", status: "SUSPENDED" }), false);
  assert.equal(isCurrentSessionPrincipal("ADMIN", { role: "TRAINEE", status: "ACTIVE" }), false);
  assert.equal(isCurrentSessionPrincipal("TRAINER", null), false);
});

test("existing admin, trainer, and trainee addresses require the matching active trainee session", () => {
  const cases = [
    { email: "admin@gmail.com", id: "admin-id", role: "ADMIN", status: "ACTIVE" },
    { email: "trainer@gmail.com", id: "trainer-id", role: "TRAINER", status: "ACTIVE" },
    { email: "trainee@gmail.com", id: "trainee-id", role: "TRAINEE", status: "ACTIVE" },
  ];

  for (const applicant of cases) {
    assert.equal(
      canReuseExistingApplicant(applicant, { userId: applicant.id, role: "TRAINEE" }),
      applicant.email === "trainee@gmail.com",
      `${applicant.email} must only be reusable by its matching trainee session`,
    );
    assert.equal(canReuseExistingApplicant(applicant, null), false);
  }

  assert.equal(
    canReuseExistingApplicant(
      { id: "trainee-id", role: "TRAINEE", status: "SUSPENDED" },
      { userId: "trainee-id", role: "TRAINEE" },
    ),
    false,
  );
  assert.equal(
    canReuseExistingApplicant(
      { id: "trainee-id", role: "TRAINEE", status: "ACTIVE" },
      { userId: "another-trainee", role: "TRAINEE" },
    ),
    false,
  );
});

test("production disables test credentials and verifies scrypt password hashes", () => {
  const oldNodeEnv = process.env.NODE_ENV;
  const oldDemoAuth = process.env.DEMO_AUTH;
  process.env.NODE_ENV = "production";
  process.env.DEMO_AUTH = "true";
  try {
    assert.equal(isDemoAuthEnabled(), false, "DEMO_AUTH must not re-enable production test accounts");
    assert.equal(TestCredentialsCard(), null, "production must not render the development credential card");
    const encoded = hashPassword("CorrectPassword1!");
    assert.equal(verifyPassword("CorrectPassword1!", encoded), true);
    assert.equal(verifyPassword("wrong-password", encoded), false);
  } finally {
    if (oldNodeEnv === undefined) delete process.env.NODE_ENV; else process.env.NODE_ENV = oldNodeEnv;
    if (oldDemoAuth === undefined) delete process.env.DEMO_AUTH; else process.env.DEMO_AUTH = oldDemoAuth;
  }
});

test("the public enrollment limiter accepts its known bucket and fails closed", async () => {
  const originalQuery = db.$queryRaw;
  const originalCleanup = db.$executeRaw;
  try {
    db.$queryRaw = async () => [{ allowed: true, retryAfterMs: 1 }];
    db.$executeRaw = async () => 0;
    assert.deepEqual(await checkRateLimit("enroll:203.0.113.7"), { allowed: true, retryAfterMs: 0 });

    db.$queryRaw = async () => { throw new Error("simulated limiter outage"); };
    assert.deepEqual(await checkRateLimit("enroll:203.0.113.7"), { allowed: false, retryAfterMs: 60_000 });
  } finally {
    db.$queryRaw = originalQuery;
    db.$executeRaw = originalCleanup;
  }
});

test("concurrent enrollment replays share one in-flight operation", async () => {
  let calls = 0;
  let release;
  const blocker = new Promise((resolve) => { release = resolve; });
  const submit = async () => {
    calls += 1;
    await blocker;
    return { paymentId: "payment-1" };
  };

  const first = coalesceEnrollmentSubmission("enrollment-replay-test", submit);
  const concurrent = coalesceEnrollmentSubmission("enrollment-replay-test", submit);
  assert.strictEqual(first, concurrent);
  assert.equal(calls, 1);
  release();
  assert.deepEqual(await first, { paymentId: "payment-1" });
});
