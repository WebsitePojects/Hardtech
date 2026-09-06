import "dotenv/config";
import assert from "node:assert/strict";
import { test } from "node:test";

const {
  CERTIFICATE_RECOVERY_BATCH_SIZE,
  issueCertificate,
  reissuePendingCertificates,
} = await import("../../src/server/services/certificate-issue.service.ts");
const { createIssueCertificatesCronHandler } = await import(
  "../../src/app/api/cron/issue-certificates/route.ts"
);

function approvedRequest(id = "certificate-request") {
  return {
    id,
    certificateCode: `HT-CERT-2026-${id}`,
    certificatePublicId: null,
    status: "APPROVED",
    completedAt: new Date("2026-01-01T00:00:00.000Z"),
    enrollment: {
      trainee: { firstName: "Recovery", lastName: "Trainee", timezone: "Asia/Manila" },
      program: { name: "Hardware Repair", durationLabel: "40 hours" },
    },
  };
}

function issueDependencies(overrides = {}) {
  return {
    isStorageConfigured: () => true,
    findForIssuance: async (id) => approvedRequest(id),
    attachAsset: async () => 1,
    renderCertificate: async () => ({ bytes: Buffer.from("test-certificate") }),
    uploadAsset: async ({ publicId }) => ({ publicId, secureUrl: "https://storage.example.test/certificate" }),
    ...overrides,
  };
}

async function withCronSecret(value, callback) {
  const original = process.env.CRON_SECRET;
  if (value === undefined) delete process.env.CRON_SECRET;
  else process.env.CRON_SECRET = value;
  try {
    await callback();
  } finally {
    if (original === undefined) delete process.env.CRON_SECRET;
    else process.env.CRON_SECRET = original;
  }
}

test("concurrent recovery coalesces one certificate upload and attaches exactly once", async () => {
  let renders = 0;
  let uploads = 0;
  let attachments = 0;
  const dependencies = issueDependencies({
    renderCertificate: async () => {
      renders += 1;
      return { bytes: Buffer.from("test-certificate") };
    },
    uploadAsset: async ({ publicId }) => {
      uploads += 1;
      return { publicId, secureUrl: "https://storage.example.test/certificate" };
    },
    attachAsset: async () => {
      attachments += 1;
      return 1;
    },
  });

  const [first, second] = await Promise.all([
    issueCertificate("concurrent-request", dependencies),
    issueCertificate("concurrent-request", dependencies),
  ]);

  assert.deepEqual(first, second);
  assert.equal(first.ok, true);
  assert.equal(renders, 1);
  assert.equal(uploads, 1);
  assert.equal(attachments, 1);
});

test("storage failure leaves the approved request unattached for a later recovery run", async () => {
  let attachmentAttempts = 0;
  const result = await issueCertificate("storage-failure", issueDependencies({
    uploadAsset: async () => {
      throw new Error("provider credentials must never escape");
    },
    attachAsset: async () => {
      attachmentAttempts += 1;
      return 1;
    },
  }));

  assert.deepEqual(result, { ok: false, error: "Certificate issuance failed." });
  assert.equal(attachmentAttempts, 0, "a failed upload must not mark the request issued");
});

test("recovery continues after a failed item and clamps its batch", async () => {
  let requestedLimit = null;
  const calls = [];
  const result = await reissuePendingCertificates(
    { limit: 9999 },
    {
      findAwaitingIssuance: async (limit) => {
        requestedLimit = limit;
        return [{ id: "issued" }, { id: "fails" }, { id: "replay" }];
      },
      issueCertificate: async (id) => {
        calls.push(id);
        if (id === "fails") throw new Error("simulated storage outage");
        return id === "replay"
          ? { ok: true, publicId: "replay", alreadyIssued: true }
          : { ok: true, publicId: "issued", alreadyIssued: false };
      },
    },
  );

  assert.equal(requestedLimit, CERTIFICATE_RECOVERY_BATCH_SIZE);
  assert.deepEqual(calls, ["issued", "fails", "replay"]);
  assert.deepEqual(result, { attempted: 3, issued: 1, alreadyIssued: 1, failed: 1 });
});

test("certificate recovery cron handler rejects missing credentials before work", async () => {
  let calls = 0;
  const handler = createIssueCertificatesCronHandler(async () => {
    calls += 1;
    return { attempted: 0, issued: 0, alreadyIssued: 0, failed: 0 };
  });

  await withCronSecret("cron-test-secret", async () => {
    const response = await handler(new Request("http://localhost/api/cron/issue-certificates"));
    assert.equal(response.status, 401);
    assert.deepEqual(await response.json(), { error: "Not authorized." });
    assert.equal(calls, 0);
  });
});

test("certificate recovery cron handler runs one bounded authorized batch", async () => {
  let receivedInput = null;
  const handler = createIssueCertificatesCronHandler(async (input) => {
    receivedInput = input;
    return { attempted: 2, issued: 1, alreadyIssued: 0, failed: 1 };
  });

  await withCronSecret("cron-test-secret", async () => {
    const response = await handler(new Request("http://localhost/api/cron/issue-certificates", {
      headers: { authorization: "Bearer cron-test-secret" },
    }));
    assert.equal(response.status, 200);
    assert.deepEqual(receivedInput, { limit: CERTIFICATE_RECOVERY_BATCH_SIZE });
    assert.deepEqual(await response.json(), { attempted: 2, issued: 1, alreadyIssued: 0, failed: 1 });
  });
});
