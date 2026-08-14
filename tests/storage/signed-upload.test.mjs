import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { test } from "node:test";

/**
 * Hermetic: fake Cloudinary credentials set here, not read from `.env`, so
 * this suite never touches real storage and never depends on machine state.
 * Set before the dynamic import so the module's lazy env reads see them.
 */
process.env.CLOUDINARY_CLOUD_NAME = "test-cloud";
process.env.CLOUDINARY_API_KEY = "123456789012345";
const FAKE_API_SECRET = "shh_this_is_the_test_secret_do_not_leak_9f8e7d";
process.env.CLOUDINARY_API_SECRET = FAKE_API_SECRET;

const { createSignedUploadTicket, verifyWebhookSignature } = await import(
  "../../src/server/storage/signed-upload.ts"
);
const { resourceTypeForMime } = await import("../../src/server/schemas/media.schema.ts");
const { maxBytesFor } = await import("../../src/server/storage/cloudinary.ts");

/** Ground truth for what Cloudinary signs a webhook with — computed
 *  independently of the module under test, per the documented scheme
 *  `SHA1(rawBody + timestamp + api_secret)`. This lets the tests construct
 *  known-valid and deliberately-tampered signatures without ever calling
 *  into the SDK's own signing helper, so the assertions below are testing
 *  `verifyWebhookSignature`'s actual verification logic, not repeating it. */
function referenceSignature(rawBody, timestampSeconds, secret = FAKE_API_SECRET) {
  return createHash("sha1").update(rawBody + timestampSeconds + secret).digest("hex");
}

test("resourceTypeForMime resolves known mime types and fails closed on unknown ones", () => {
  assert.equal(resourceTypeForMime("image/png"), "image");
  assert.equal(resourceTypeForMime("video/mp4"), "video");
  assert.equal(resourceTypeForMime("application/pdf"), "raw");
  // Fail closed (rule 3): never default to "raw" or "auto".
  assert.equal(resourceTypeForMime("application/x-msdownload"), null);
  assert.equal(resourceTypeForMime(""), null);
});

test("createSignedUploadTicket never includes the API secret anywhere in the returned object", () => {
  const ticket = createSignedUploadTicket({
    folder: "hardtech/modules",
    publicId: "module-abc123",
    resourceType: "video",
  });

  const serialized = JSON.stringify(ticket);
  assert.doesNotMatch(serialized, new RegExp(FAKE_API_SECRET));

  // Public fields are present and shaped as documented.
  assert.equal(ticket.cloudName, "test-cloud");
  assert.equal(ticket.apiKey, "123456789012345");
  assert.equal(ticket.folder, "hardtech/modules");
  assert.equal(ticket.publicId, "module-abc123");
  assert.equal(ticket.resourceType, "video");
  assert.equal(
    ticket.uploadUrl,
    "https://api.cloudinary.com/v1_1/test-cloud/video/upload",
  );
  assert.equal(ticket.maxBytes, maxBytesFor("video"));
  assert.ok(typeof ticket.signature === "string" && ticket.signature.length > 0);
  assert.ok(Number.isInteger(ticket.timestamp) && ticket.timestamp > 0);
});

test("createSignedUploadTicket signs a notification_url when provided, and the signature changes with it", () => {
  const base = { folder: "hardtech/forum", publicId: "post-1", resourceType: "image" };
  const withoutHook = createSignedUploadTicket(base);
  const withHook = createSignedUploadTicket({
    ...base,
    notificationUrl: "https://hardtech.example/api/webhooks/cloudinary",
  });

  // Different signed parameter sets must not collide on the same signature —
  // otherwise notification_url would not actually be protected by the
  // signature at all.
  assert.notEqual(withoutHook.signature, withHook.signature);
});

test("verifyWebhookSignature accepts a correctly signed, fresh payload", () => {
  const rawBody = JSON.stringify({ public_id: "hardtech/modules/abc", bytes: 4096 });
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = referenceSignature(rawBody, timestamp);

  assert.equal(
    verifyWebhookSignature({ rawBody, timestamp: String(timestamp), signature }),
    true,
  );
});

test("verifyWebhookSignature rejects a tampered raw body", () => {
  const originalBody = JSON.stringify({ public_id: "hardtech/modules/abc", bytes: 4096 });
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = referenceSignature(originalBody, timestamp);

  const tamperedBody = JSON.stringify({ public_id: "hardtech/modules/abc", bytes: 999999999 });

  assert.equal(
    verifyWebhookSignature({ rawBody: tamperedBody, timestamp: String(timestamp), signature }),
    false,
  );
});

test("verifyWebhookSignature rejects a tampered signature", () => {
  const rawBody = JSON.stringify({ public_id: "hardtech/modules/abc" });
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = referenceSignature(rawBody, timestamp);
  const tamperedSignature = signature.slice(0, -1) + (signature.at(-1) === "a" ? "b" : "a");

  assert.equal(
    verifyWebhookSignature({ rawBody, timestamp: String(timestamp), signature: tamperedSignature }),
    false,
  );
});

test("a signature valid for one body fails for a different body", () => {
  const timestamp = Math.floor(Date.now() / 1000);
  const bodyA = JSON.stringify({ public_id: "hardtech/modules/a" });
  const bodyB = JSON.stringify({ public_id: "hardtech/modules/b" });
  const signatureForA = referenceSignature(bodyA, timestamp);

  // Sanity: the signature really is valid for the body it was made for.
  assert.equal(
    verifyWebhookSignature({ rawBody: bodyA, timestamp: String(timestamp), signature: signatureForA }),
    true,
  );
  // But reusing it against a different body must fail.
  assert.equal(
    verifyWebhookSignature({ rawBody: bodyB, timestamp: String(timestamp), signature: signatureForA }),
    false,
  );
});

test("verifyWebhookSignature rejects a timestamp outside the window even with an otherwise-correct signature", () => {
  const rawBody = JSON.stringify({ public_id: "hardtech/modules/abc" });
  const staleTimestamp = Math.floor(Date.now() / 1000) - 3 * 60 * 60; // 3 hours old
  const signature = referenceSignature(rawBody, staleTimestamp);

  assert.equal(
    verifyWebhookSignature({ rawBody, timestamp: String(staleTimestamp), signature }),
    false,
  );
});

test("verifyWebhookSignature returns false, not a throw, for a mismatched-length signature", () => {
  const rawBody = JSON.stringify({ public_id: "hardtech/modules/abc" });
  const timestamp = Math.floor(Date.now() / 1000);

  assert.doesNotThrow(() => {
    const result = verifyWebhookSignature({
      rawBody,
      timestamp: String(timestamp),
      signature: "ab",
    });
    assert.equal(result, false);
  });

  assert.doesNotThrow(() => {
    const result = verifyWebhookSignature({ rawBody, timestamp: String(timestamp), signature: "" });
    assert.equal(result, false);
  });
});

test("verifyWebhookSignature returns false for a non-numeric timestamp", () => {
  const rawBody = JSON.stringify({ public_id: "hardtech/modules/abc" });
  assert.equal(
    verifyWebhookSignature({ rawBody, timestamp: "not-a-number", signature: "deadbeef" }),
    false,
  );
});

test("a malformed CLOUDINARY_MAX_VIDEO_MB falls back to the default instead of being accepted", () => {
  const defaultVideoBytes = 100 * 1024 * 1024;
  assert.equal(maxBytesFor("video"), defaultVideoBytes);

  const originalValue = process.env.CLOUDINARY_MAX_VIDEO_MB;
  try {
    process.env.CLOUDINARY_MAX_VIDEO_MB = "not-a-number";
    assert.equal(maxBytesFor("video"), defaultVideoBytes);

    // Zero and negative are malformed too, not "unlimited".
    process.env.CLOUDINARY_MAX_VIDEO_MB = "0";
    assert.equal(maxBytesFor("video"), defaultVideoBytes);

    process.env.CLOUDINARY_MAX_VIDEO_MB = "-5";
    assert.equal(maxBytesFor("video"), defaultVideoBytes);

    // A well-formed override is honoured.
    process.env.CLOUDINARY_MAX_VIDEO_MB = "250";
    assert.equal(maxBytesFor("video"), 250 * 1024 * 1024);
  } finally {
    if (originalValue === undefined) delete process.env.CLOUDINARY_MAX_VIDEO_MB;
    else process.env.CLOUDINARY_MAX_VIDEO_MB = originalValue;
  }

  // Restored for any test running after this one in the same process.
  assert.equal(maxBytesFor("video"), defaultVideoBytes);
});
