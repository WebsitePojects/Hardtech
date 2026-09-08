import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const schema = await import("../src/server/schemas/dashboard.schema.ts");

test("admin queue filter boundaries normalize safe values and reject malformed values", () => {
  assert.equal(schema.adminQueueSearchSchema.parse("  Ana  "), "Ana");
  assert.equal(schema.adminQueueSearchSchema.parse("x".repeat(121)), "");
  assert.equal(schema.adminQueueProgramIdSchema.safeParse("").success, false);
  assert.equal(schema.adminQueueDateSchema.safeParse("2026-02-29").success, false);
  assert.equal(schema.adminQueueDateSchema.parse("2028-02-29").toISOString(), "2028-02-29T00:00:00.000Z");
  assert.equal(schema.paymentQueueStatusSchema.safeParse("DROP TABLE").success, false);
  assert.equal(schema.certificateQueueStatusSchema.safeParse("ISSUED").success, false);
});

test("admin queue pagination clamps stale and forged page numbers before offsets are formed", () => {
  assert.deepEqual(schema.adminQueuePagination(25, 99, 12), { page: 3, totalPages: 3, skip: 24 });
  assert.deepEqual(schema.adminQueuePagination(0, 8, 12), { page: 1, totalPages: 1, skip: 0 });
  assert.deepEqual(schema.adminQueuePagination(13, -2, 12), { page: 1, totalPages: 2, skip: 0 });
});

test("operational queue read models keep stable IDs and retain an admin authorization boundary", async () => {
  const [serviceSource, paymentRepositorySource, certificateRepositorySource, enrollmentSectionSource, certificateSectionSource] = await Promise.all([
    readFile(new URL("../src/server/services/dashboard.service.ts", import.meta.url), "utf8"),
    readFile(new URL("../src/server/repositories/enrollment-payment.repository.ts", import.meta.url), "utf8"),
    readFile(new URL("../src/server/repositories/certificate-request.repository.ts", import.meta.url), "utf8"),
    readFile(new URL("../src/features/dashboard-admin/sections/enrollments-section.tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/features/dashboard-admin/sections/certificates-section.tsx", import.meta.url), "utf8"),
  ]);
  assert.match(serviceSource, /paymentId: row\.id/);
  assert.match(serviceSource, /certificateRequestId: row\.id/);
  assert.match(serviceSource, /await requireRole\("ADMIN"\)/);
  assert.match(paymentRepositorySource, /skip: params\.skip[\s\S]*take: params\.take/);
  assert.match(certificateRepositorySource, /skip: params\.skip[\s\S]*take: params\.take/);
  assert.match(enrollmentSectionSource, /key=\{item\.id\}/);
  assert.match(certificateSectionSource, /key=\{item\.id\}/);
});
