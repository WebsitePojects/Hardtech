import "dotenv/config";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { test } from "node:test";
import pg from "pg";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";

const { getTraineeCertificateStatus } = await import(
  "../../src/server/services/dashboard.service.ts"
);
const { CredentialsSection } = await import(
  "../../src/features/dashboard-trainee/credentials-section.tsx"
);

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;

function fixtureId() {
  return `certificate-lifecycle-${Date.now()}-${randomUUID().slice(0, 8)}`;
}

test("completed trainee keeps their newest eligible certificate status without exposing another trainee's request", async () => {
  assert.ok(connectionString, "QA database is configured");

  const client = new pg.Client({ connectionString });
  await client.connect();
  const tag = fixtureId();
  const ownerId = `${tag}-owner`;
  const strangerId = `${tag}-stranger`;
  const programId = `${tag}-program`;
  const ownerCompletedPaymentId = `${tag}-owner-completed-payment`;
  const ownerActivePaymentId = `${tag}-owner-active-payment`;
  const strangerPaymentId = `${tag}-stranger-payment`;
  const ownerCompletedEnrollmentId = `${tag}-owner-completed-enrollment`;
  const ownerActiveEnrollmentId = `${tag}-owner-active-enrollment`;
  const strangerEnrollmentId = `${tag}-stranger-enrollment`;
  const ownerCertificateId = `${tag}-owner-certificate`;
  const ownerCode = `HT-CERT-OWNER-${tag}`.toUpperCase();

  try {
    await client.query(
      `INSERT INTO "User" (id, email, "passwordHash", "firstName", "lastName", role, status, "createdAt", "updatedAt")
       VALUES ($1, $2, 'test-only', 'Certificate', 'Owner', 'TRAINEE', 'ACTIVE', NOW(), NOW()),
              ($3, $4, 'test-only', 'Certificate', 'Stranger', 'TRAINEE', 'ACTIVE', NOW(), NOW())`,
      [ownerId, `${ownerId}@example.test`, strangerId, `${strangerId}@example.test`],
    );
    await client.query(
      `INSERT INTO "Program" (id, name, "shortName", description, "durationLabel", "scheduleLabel", "levelLabel", "priceAmount", "createdAt", "updatedAt")
       VALUES ($1, $2, 'Certificate Lifecycle', 'Test program.', '1 day', 'Weekdays', 'Beginner', 1, NOW(), NOW())`,
      [programId, `${tag}-program`],
    );
    await client.query(
      `INSERT INTO "EnrollmentPayment" (id, "traineeId", "idempotencyKey", "referenceCode", "paymentMethod", "totalAmount", "proofImageUrl", status, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, 'GCASH', 1, 'test-proof', 'VERIFIED', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '2 hours'),
              ($5, $2, $6, $7, 'GCASH', 1, 'test-proof', 'VERIFIED', NOW(), NOW()),
              ($8, $9, $10, $11, 'GCASH', 1, 'test-proof', 'VERIFIED', NOW(), NOW())`,
      [
        ownerCompletedPaymentId,
        ownerId,
        `${tag}-owner-completed-key`,
        `${tag}-owner-completed-ref`,
        ownerActivePaymentId,
        `${tag}-owner-active-key`,
        `${tag}-owner-active-ref`,
        strangerPaymentId,
        strangerId,
        `${tag}-stranger-key`,
        `${tag}-stranger-ref`,
      ],
    );
    await client.query(
      `INSERT INTO "Enrollment" (id, "enrollmentRef", "traineeId", "programId", "paymentId", amount, status, "progressPercent", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, 1, 'COMPLETED', 100, NOW() - INTERVAL '2 hours', NOW() - INTERVAL '2 hours'),
              ($6, $7, $3, $4, $8, 1, 'ACTIVE', 0, NOW(), NOW()),
              ($9, $10, $11, $4, $12, 1, 'COMPLETED', 100, NOW(), NOW())`,
      [
        ownerCompletedEnrollmentId,
        `${tag}-owner-completed-enrollment-ref`,
        ownerId,
        programId,
        ownerCompletedPaymentId,
        ownerActiveEnrollmentId,
        `${tag}-owner-active-enrollment-ref`,
        ownerActivePaymentId,
        strangerEnrollmentId,
        `${tag}-stranger-enrollment-ref`,
        strangerId,
        strangerPaymentId,
      ],
    );
    await client.query(
      `INSERT INTO "CertificateRequest" (id, "enrollmentId", "certificateCode", status, "completedAt", "requestedAt", "approvedAt", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, 'APPROVED', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1 hour', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1 hour')`,
      [ownerCertificateId, ownerCompletedEnrollmentId, ownerCode],
    );

    const ownerResult = await getTraineeCertificateStatus(ownerId, "TRAINEE");
    assert.deepEqual(
      { status: ownerResult?.status, certificateCode: ownerResult?.certificateCode },
      { status: "APPROVED", certificateCode: ownerCode },
      "a newer ACTIVE enrollment must not hide the owner's completed certificate",
    );

    assert.equal(
      await getTraineeCertificateStatus(strangerId, "TRAINEE"),
      null,
      "a trainee with no eligible certificate request must not receive another trainee's status",
    );
    assert.equal(
      await getTraineeCertificateStatus(ownerId, "ADMIN"),
      null,
      "a non-trainee role must fail closed even when the id owns a request",
    );
  } finally {
    await client.query('DELETE FROM "CertificateRequest" WHERE id = $1', [ownerCertificateId]);
    await client.query('DELETE FROM "Enrollment" WHERE id = ANY($1::text[])', [[ownerCompletedEnrollmentId, ownerActiveEnrollmentId, strangerEnrollmentId]]);
    await client.query('DELETE FROM "EnrollmentPayment" WHERE id = ANY($1::text[])', [[ownerCompletedPaymentId, ownerActivePaymentId, strangerPaymentId]]);
    await client.query('DELETE FROM "Program" WHERE id = $1', [programId]);
    await client.query('DELETE FROM "User" WHERE id = ANY($1::text[])', [[ownerId, strangerId]]);
    await client.end();
  }
});

test("approved credential renders an accessible owner-scoped certificate link", () => {
  const code = "HT-CERT-2026-OWNER-000001";
  const markup = renderToStaticMarkup(
    createElement(CredentialsSection, {
      displayName: "Certificate Owner",
      overview: {
        status: "COMPLETED",
        overallProgressPercent: 100,
        activeProgram: { programName: "Hardware Repair", batchLabel: "Hardware Repair · Batch A" },
      },
      certificateStatus: {
        status: "APPROVED",
        certificateCode: code,
        requestedAt: new Date("2026-01-01T00:00:00.000Z"),
        approvedAt: new Date("2026-01-02T00:00:00.000Z"),
      },
    }),
  );

  assert.match(markup, new RegExp(`<a[^>]+href="/api/certificates/${code}"`));
  assert.match(markup, />\s*Download certificate<\/a>/, "the link needs a visible accessible name");
  assert.doesNotMatch(markup, />Download<\/span>/, "the approved state must not leave behind a non-interactive Download badge");
});
