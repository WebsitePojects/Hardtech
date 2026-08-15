import "dotenv/config";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { test } from "node:test";
import pg from "pg";
import { v2 as cloudinary } from "cloudinary";

// End-to-end proof of the certificate chain: approve -> issue -> Cloudinary
// asset -> QR encodes an absolute URL -> public verify is fail-closed and
// non-enumerable -> the download route enforces ownership.
//
// Every assertion here is against OBSERVED state: rows read back with a real
// pg.Client, and the actual asset existence checked against Cloudinary's own
// Admin API (a second channel from whatever destroyAsset() reports — see the
// 2026-08-14 lesson: destroyAsset()'s own return value is not proof anything
// was ever there or is now gone). This suite does real I/O and is expected to
// take real time to run, unlike a suite that only greps its own source.

const { approveCertificate, rejectCertificate } = await import(
  "../../src/server/services/dashboard-write.service.ts"
);
const { getPublicCertificate } = await import(
  "../../src/server/services/certificate-verify.service.ts"
);
const { renderCertificate, certificateOrigin, verificationUrl } = await import(
  "../../src/server/certificates/certificate-render.service.ts"
);
const { revokeCertificateAsset } = await import(
  "../../src/server/services/certificate-issue.service.ts"
);
const { signSessionToken } = await import(
  "../../src/server/auth/session-token.ts"
);

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/+$/, "");

/**
 * Two tests below need things the rest of the suite does not: a dev server
 * actually listening, and real Cloudinary credentials. `npm test` globs every
 * file in this directory, so without these guards a developer who has not run
 * `next dev` — or CI, which never does — gets a red suite for reasons that
 * have nothing to do with the code under test. A gate that fails for
 * environmental reasons stops being a signal and starts being noise people
 * learn to ignore, which is how a real failure gets waved through.
 *
 * Skipping is honest here in a way that silently passing would not be: the
 * runner reports the test as skipped WITH the reason, so nobody mistakes an
 * unmet precondition for a proof of correctness.
 */
const CLOUDINARY_CONFIGURED = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET,
);

async function devServerIsUp() {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);
    const response = await fetch(SITE_URL, { signal: controller.signal });
    clearTimeout(timeout);
    return response.status > 0;
  } catch {
    return false;
  }
}

const DEV_SERVER_UP = await devServerIsUp();

async function one(client, sql, values = []) {
  const result = await client.query(sql, values);
  assert.equal(result.rows.length, 1, `Expected one row for ${sql}`);
  return result.rows[0];
}

function suffix() {
  return `${Date.now()}-${randomUUID().slice(0, 8)}`;
}

/** Creates a real payment + enrollment pair, mirroring the fixture shape
 *  every other tests/mutations/*.test.mjs file uses. */
async function createEnrollment(client, traineeId, programId, batchId, tag) {
  const paymentId = `test-cert-payment-${tag}`;
  const enrollmentId = `test-cert-enrollment-${tag}`;
  await client.query(
    `INSERT INTO "EnrollmentPayment" (id, "traineeId", "idempotencyKey", "referenceCode", "paymentMethod", "totalAmount", "proofImageUrl", status, "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4, 'GCASH', 100.00, 'https://example.com/test-proof.png', 'SUBMITTED', NOW(), NOW())`,
    [paymentId, traineeId, `test-cert-key-${tag}`, `TEST-CERT-${tag}`],
  );
  await client.query(
    `INSERT INTO "Enrollment" (id, "enrollmentRef", "traineeId", "programId", "batchId", "paymentId", amount, status, "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4, $5, $6, 100.00, 'PENDING_VERIFICATION', NOW(), NOW())`,
    [enrollmentId, `TEST-CERT-ENR-${tag}`, traineeId, programId, batchId, paymentId],
  );
  return { paymentId, enrollmentId };
}

async function createCertificateRequest(client, enrollmentId, code, tag) {
  const id = `test-cert-request-${tag}`;
  await client.query(
    `INSERT INTO "CertificateRequest" (id, "enrollmentId", "certificateCode", "completedAt", status, "createdAt", "updatedAt")
     VALUES ($1, $2, $3, NOW(), 'PENDING', NOW(), NOW())`,
    [id, enrollmentId, code],
  );
  return id;
}

test("certificate chain: approve -> issue -> real Cloudinary asset -> public verify is fail-closed", {
  skip: CLOUDINARY_CONFIGURED
    ? false
    : "needs real CLOUDINARY_* credentials — it verifies the stored asset through Cloudinary's Admin API, a second channel from destroyAsset()'s own return value",
}, async () => {
  assert.ok(connectionString, "database connection is configured");
  const client = new pg.Client({ connectionString });
  await client.connect();
  const tag = suffix();

  const approveCode = `TEST-CERT-CHAIN-APPROVE-${tag}`;
  const pendingCode = `TEST-CERT-CHAIN-PENDING-${tag}`;
  const rejectCode = `TEST-CERT-CHAIN-REJECT-${tag}`;
  const unknownCode = `TEST-CERT-CHAIN-UNKNOWN-${tag}`; // well-formed, never inserted

  let data;
  let issuedPublicId = null;

  try {
    const users = await client.query(
      'SELECT id, email, role FROM "User" WHERE email IN ($1, $2)',
      ["admin@gmail.com", "trainer@gmail.com"],
    );
    const byEmail = new Map(users.rows.map((row) => [row.email, row.id]));
    const adminId = byEmail.get("admin@gmail.com");
    const trainerId = byEmail.get("trainer@gmail.com");
    assert.ok(adminId, "seeded admin@gmail.com exists");
    assert.ok(trainerId, "seeded trainer@gmail.com exists");

    const program = await one(client, 'SELECT id FROM "Program" ORDER BY "createdAt" LIMIT 1');
    const batch = await one(
      client,
      'SELECT id FROM "Batch" WHERE "trainerId" = $1 ORDER BY "createdAt" LIMIT 1',
      [trainerId],
    );

    const testTraineeId = `test-cert-trainee-${tag}`;
    await client.query(
      `INSERT INTO "User" (id, email, "passwordHash", "firstName", "lastName", role, status, "createdAt", "updatedAt")
       VALUES ($1, $2, 'test-only', 'Certificate', 'Chain', 'TRAINEE', 'ACTIVE', NOW(), NOW())`,
      [testTraineeId, `certificate-chain-${tag}@example.com`],
    );

    const approveEnrollment = await createEnrollment(client, testTraineeId, program.id, batch.id, `${tag}-a`);
    const pendingEnrollment = await createEnrollment(client, testTraineeId, program.id, batch.id, `${tag}-p`);
    const rejectEnrollment = await createEnrollment(client, testTraineeId, program.id, batch.id, `${tag}-r`);

    const approveCertId = await createCertificateRequest(client, approveEnrollment.enrollmentId, approveCode, `${tag}-a`);
    const pendingCertId = await createCertificateRequest(client, pendingEnrollment.enrollmentId, pendingCode, `${tag}-p`);
    const rejectCertId = await createCertificateRequest(client, rejectEnrollment.enrollmentId, rejectCode, `${tag}-r`);

    data = {
      testTraineeId,
      enrollmentIds: [approveEnrollment.enrollmentId, pendingEnrollment.enrollmentId, rejectEnrollment.enrollmentId],
      paymentIds: [approveEnrollment.paymentId, pendingEnrollment.paymentId, rejectEnrollment.paymentId],
      certificateIds: [approveCertId, pendingCertId, rejectCertId],
      approveCertId,
    };

    // --- 1. End-to-end issuance: real DB transition + real Cloudinary upload ---
    const concurrentApprovals = await Promise.all([
      approveCertificate({ adminId, adminRole: "ADMIN", certificateRequestId: approveCertId }),
      approveCertificate({ adminId, adminRole: "ADMIN", certificateRequestId: approveCertId }),
    ]);
    assert.equal(
      concurrentApprovals.filter((r) => r.ok).length,
      1,
      "only one of two concurrent approvals should win the conditional transition",
    );

    const approvedRow = await one(
      client,
      'SELECT status, "certificatePublicId" FROM "CertificateRequest" WHERE id = $1',
      [approveCertId],
    );
    assert.equal(approvedRow.status, "APPROVED", "the row must actually transition to APPROVED");
    assert.ok(
      approvedRow.certificatepublicid ?? approvedRow.certificatePublicId,
      "issueCertificate must have run and populated certificatePublicId",
    );
    issuedPublicId = approvedRow.certificatepublicid ?? approvedRow.certificatePublicId;

    // Prove the asset is REAL by checking a second channel — Cloudinary's own
    // Admin API — not by trusting destroyAsset()'s return value later (that
    // return conflates "deleted" with "was never there", per the 2026-08-14
    // lesson). A single Admin API call for one row is within the documented
    // "never call it per-row in a loop" guidance in cloudinary.ts.
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });
    const remoteAsset = await cloudinary.api.resource(issuedPublicId, { resource_type: "image" });
    assert.equal(remoteAsset.public_id, issuedPublicId, "Cloudinary must actually hold an asset at the persisted public_id");
    assert.ok(remoteAsset.bytes > 0, "the uploaded certificate must have real bytes");

    // Idempotent re-approval: an already-APPROVED request must not be
    // re-transitioned (transition() is conditional on status = PENDING).
    const reapproval = await approveCertificate({ adminId, adminRole: "ADMIN", certificateRequestId: approveCertId });
    assert.equal(reapproval.ok, false, "an already-approved request must not transition again");

    // --- 3. Public verification is fail-closed and non-enumerable ---
    const verified = await getPublicCertificate(approveCode);
    assert.ok(verified, "an APPROVED certificate must verify publicly");
    assert.equal(verified.certificateCode, approveCode);
    assert.equal(typeof verified.recipientName, "string");
    assert.ok(!("id" in verified), "public shape must never leak the internal id");
    assert.ok(!("approvedByUserId" in verified), "public shape must never leak the approver");

    const pendingResult = await getPublicCertificate(pendingCode);
    assert.equal(pendingResult, null, "a PENDING certificate must not verify");

    await rejectCertificate({ adminId, adminRole: "ADMIN", certificateRequestId: rejectCertId, reason: "test rejection" });
    const rejectedRow = await one(client, 'SELECT status FROM "CertificateRequest" WHERE id = $1', [rejectCertId]);
    assert.equal(rejectedRow.status, "REJECTED");
    const rejectedResult = await getPublicCertificate(rejectCode);
    assert.equal(rejectedResult, null, "a REJECTED certificate must not verify");

    const unknownResult = await getPublicCertificate(unknownCode);
    assert.equal(unknownResult, null, "a well-formed but nonexistent code must not verify");

    const malformedCodes = [
      "",
      "ab", // below min length
      "'; DROP TABLE \"CertificateRequest\"; --",
      "code with spaces",
      "A".repeat(10000),
    ];
    const malformedResults = await Promise.all(malformedCodes.map((code) => getPublicCertificate(code)));
    for (const [i, result] of malformedResults.entries()) {
      assert.equal(result, null, `malformed code ${JSON.stringify(malformedCodes[i]).slice(0, 40)} must return null, never throw`);
    }

    // Non-enumerability: PENDING, REJECTED, unknown, and every malformed
    // input must be byte-for-byte indistinguishable — all exactly null.
    const allNonVerifying = [pendingResult, rejectedResult, unknownResult, ...malformedResults];
    assert.ok(
      allNonVerifying.every((r) => r === null),
      "every non-verifying case must collapse to the identical null result",
    );
  } finally {
    // Clean up the Cloudinary asset first, then prove it is actually gone
    // through the same second channel used to prove it existed.
    if (issuedPublicId) {
      const destroyed = await revokeCertificateAsset(issuedPublicId);
      assert.equal(destroyed, true, "cleanup destroy must report success");
      await assert.rejects(
        () => cloudinary.api.resource(issuedPublicId, { resource_type: "image" }),
        /not found/i,
        "the asset must actually be gone from Cloudinary after cleanup, not just reported gone",
      );
    }
    if (data) {
      await client.query('DELETE FROM "CertificateRequest" WHERE id = ANY($1::text[])', [data.certificateIds]);
      await client.query('DELETE FROM "Enrollment" WHERE id = ANY($1::text[])', [data.enrollmentIds]);
      await client.query('DELETE FROM "EnrollmentPayment" WHERE id = ANY($1::text[])', [data.paymentIds]);
      await client.query('DELETE FROM "User" WHERE id = $1', [data.testTraineeId]);
    }
    await client.end();
  }
});

test("certificate QR/verify URL is absolute under every NEXT_PUBLIC_SITE_URL/VERCEL_URL combination", async () => {
  const original = {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    VERCEL_URL: process.env.VERCEL_URL,
  };

  function assertAbsolute(url, label) {
    assert.match(url, /^https?:\/\//, `${label} must be absolute, got ${JSON.stringify(url)}`);
  }

  try {
    // Explicit NEXT_PUBLIC_SITE_URL wins, and a trailing slash is stripped.
    process.env.NEXT_PUBLIC_SITE_URL = "https://hardtech.example.com/";
    delete process.env.VERCEL_URL;
    assert.equal(certificateOrigin(), "https://hardtech.example.com");
    assertAbsolute(verificationUrl("HT-CERT-2026-000001"), "verificationUrl with explicit site url");

    // No explicit site url, but VERCEL_URL is set without a scheme.
    delete process.env.NEXT_PUBLIC_SITE_URL;
    process.env.VERCEL_URL = "hardtech-abc123.vercel.app";
    const vercelOrigin = certificateOrigin();
    assertAbsolute(vercelOrigin, "certificateOrigin() falling back to VERCEL_URL");
    assert.equal(vercelOrigin, "https://hardtech-abc123.vercel.app");

    // Neither set — must still fall back to an absolute localhost URL, never
    // a bare relative path.
    delete process.env.NEXT_PUBLIC_SITE_URL;
    delete process.env.VERCEL_URL;
    const fallbackOrigin = certificateOrigin();
    assertAbsolute(fallbackOrigin, "certificateOrigin() with no env vars set");
    assert.equal(fallbackOrigin, "http://localhost:3000");

    // End-to-end: renderCertificate must embed an absolute verifyUrl into
    // both the returned value and the SVG's visible/QR-encoded text — this is
    // literally the string handed to QRCode.create, so asserting it here is
    // the proof the QR encodes an absolute URL (a bare path is useless once
    // printed and scanned by a phone with no origin to resolve against).
    const rendered = await renderCertificate({
      recipientName: "Test Recipient",
      programName: "Test Program",
      programHours: 40,
      completedAt: new Date("2026-01-01T00:00:00.000Z"),
      certificateCode: "HT-CERT-TEST-000001",
    });
    assertAbsolute(rendered.verifyUrl, "renderCertificate().verifyUrl");
    assert.ok(rendered.svg.includes(rendered.verifyUrl), "the visible/QR text in the SVG must match the returned verifyUrl exactly");
    assert.match(rendered.svg, /<path d="M/, "a real, non-empty QR path must be present in the rendered SVG");
  } finally {
    if (original.NEXT_PUBLIC_SITE_URL === undefined) delete process.env.NEXT_PUBLIC_SITE_URL;
    else process.env.NEXT_PUBLIC_SITE_URL = original.NEXT_PUBLIC_SITE_URL;
    if (original.VERCEL_URL === undefined) delete process.env.VERCEL_URL;
    else process.env.VERCEL_URL = original.VERCEL_URL;
  }
});

test("GET /api/certificates/[code] is session-gated and ownership-scoped against the live dev server", {
  skip: DEV_SERVER_UP
    ? false
    : `needs a dev server listening at ${SITE_URL} — it drives the real route handler over HTTP rather than calling the service directly, which is the only way to prove the session gate itself works`,
}, async () => {
  assert.ok(connectionString, "database connection is configured");
  assert.ok(process.env.AUTH_SECRET, "AUTH_SECRET must be set to mint a real session");

  const client = new pg.Client({ connectionString });
  await client.connect();
  const tag = suffix();
  const code = `TEST-CERT-ROUTE-${tag}`;

  let data;
  let issuedPublicId = null;

  function cookieFor(userId, role) {
    const token = signSessionToken({ userId, role, exp: Date.now() + 60_000 });
    return `hardtech_session=${token}`;
  }

  try {
    const users = await client.query(
      'SELECT id, email FROM "User" WHERE email IN ($1, $2, $3)',
      ["admin@gmail.com", "trainer@gmail.com", "trainee@gmail.com"],
    );
    const byEmail = new Map(users.rows.map((row) => [row.email, row.id]));
    const adminId = byEmail.get("admin@gmail.com");
    const trainerId = byEmail.get("trainer@gmail.com");
    const otherTraineeId = byEmail.get("trainee@gmail.com");
    assert.ok(adminId && trainerId && otherTraineeId, "seeded fixture users exist");

    const program = await one(client, 'SELECT id FROM "Program" ORDER BY "createdAt" LIMIT 1');
    const batch = await one(client, 'SELECT id FROM "Batch" WHERE "trainerId" = $1 ORDER BY "createdAt" LIMIT 1', [trainerId]);

    const ownerId = `test-cert-route-owner-${tag}`;
    await client.query(
      `INSERT INTO "User" (id, email, "passwordHash", "firstName", "lastName", role, status, "createdAt", "updatedAt")
       VALUES ($1, $2, 'test-only', 'Route', 'Owner', 'TRAINEE', 'ACTIVE', NOW(), NOW())`,
      [ownerId, `certificate-route-owner-${tag}@example.com`],
    );

    const enrollment = await createEnrollment(client, ownerId, program.id, batch.id, `${tag}-route`);
    const certId = await createCertificateRequest(client, enrollment.enrollmentId, code, `${tag}-route`);

    data = {
      ownerId,
      enrollmentId: enrollment.enrollmentId,
      paymentId: enrollment.paymentId,
      certId,
    };

    const base = SITE_URL;

    // Unauthenticated: no session cookie at all -> 401, never a 404/200 that
    // would leak whether the code exists.
    const unauthed = await fetch(`${base}/api/certificates/${code}`);
    assert.equal(unauthed.status, 401, "no session must be rejected with 401");

    // Approve + issue for real, so there is a genuine document behind the code.
    const approval = await approveCertificate({ adminId, adminRole: "ADMIN", certificateRequestId: certId });
    assert.equal(approval.ok, true);
    const row = await one(client, 'SELECT "certificatePublicId" FROM "CertificateRequest" WHERE id = $1', [certId]);
    issuedPublicId = row.certificatepublicid ?? row.certificatePublicId;
    assert.ok(issuedPublicId, "issuance must have produced a real asset before exercising the route");

    // Owner, approved -> 200 with the actual rendered document.
    const ownerRes = await fetch(`${base}/api/certificates/${code}`, {
      headers: { Cookie: cookieFor(ownerId, "TRAINEE") },
    });
    assert.equal(ownerRes.status, 200, "the owner must be able to fetch their own approved certificate");
    assert.match(ownerRes.headers.get("content-type") ?? "", /image\/svg\+xml/);
    const ownerBody = await ownerRes.text();
    assert.ok(ownerBody.includes(code), "the served document must contain the actual certificate code");

    // Admin, not the owner, approved -> 200 (admin is explicitly allowed).
    const adminRes = await fetch(`${base}/api/certificates/${code}`, {
      headers: { Cookie: cookieFor(adminId, "ADMIN") },
    });
    assert.equal(adminRes.status, 200, "an admin must be able to fetch any approved certificate");

    // A different, real trainee who is neither the owner nor an admin,
    // approved -> 404, not 403 — never confirming the code exists to a
    // caller who isn't entitled to see it.
    const strangerRes = await fetch(`${base}/api/certificates/${code}`, {
      headers: { Cookie: cookieFor(otherTraineeId, "TRAINEE") },
    });
    assert.equal(strangerRes.status, 404, "a non-owner, non-admin trainee must get 404, not the document");

    // Malformed code shape in the URL itself -> 404 before ever touching the
    // database (the schema gate rejects it).
    const malformedRes = await fetch(`${base}/api/certificates/ab`, {
      headers: { Cookie: cookieFor(ownerId, "TRAINEE") },
    });
    assert.equal(malformedRes.status, 404, "a malformed code must 404, never 500 or leak a parse error");

    // A second CertificateRequest, still PENDING (not approved) -> the owner
    // must still get 404 for it, proving the route's own APPROVED check
    // fires independently of the verify-service's identical rule.
    const pendingCode2 = `TEST-CERT-ROUTE-PENDING-${tag}`;
    const pendingEnrollment = await createEnrollment(client, ownerId, program.id, batch.id, `${tag}-route-pending`);
    const pendingCertId = await createCertificateRequest(client, pendingEnrollment.enrollmentId, pendingCode2, `${tag}-route-pending`);
    data.enrollmentId2 = pendingEnrollment.enrollmentId;
    data.paymentId2 = pendingEnrollment.paymentId;
    data.certId2 = pendingCertId;
    const pendingRes = await fetch(`${base}/api/certificates/${pendingCode2}`, {
      headers: { Cookie: cookieFor(ownerId, "TRAINEE") },
    });
    assert.equal(pendingRes.status, 404, "a PENDING certificate must not be downloadable even by its own owner");
  } finally {
    if (issuedPublicId) {
      await revokeCertificateAsset(issuedPublicId);
    }
    if (data) {
      const certIds = [data.certId, data.certId2].filter(Boolean);
      const enrollmentIds = [data.enrollmentId, data.enrollmentId2].filter(Boolean);
      const paymentIds = [data.paymentId, data.paymentId2].filter(Boolean);
      await client.query('DELETE FROM "CertificateRequest" WHERE id = ANY($1::text[])', [certIds]);
      await client.query('DELETE FROM "Enrollment" WHERE id = ANY($1::text[])', [enrollmentIds]);
      await client.query('DELETE FROM "EnrollmentPayment" WHERE id = ANY($1::text[])', [paymentIds]);
      await client.query('DELETE FROM "User" WHERE id = $1', [data.ownerId]);
    }
    await client.end();
  }
});
