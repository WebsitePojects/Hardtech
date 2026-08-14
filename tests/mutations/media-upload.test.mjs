import "dotenv/config";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { test } from "node:test";
import pg from "pg";

// Coverage for the 2026-08-14 raw-upload public_id defect (a live probe
// found Cloudinary appends the file extension to public_id for
// resource_type "raw", which broke the old exact-equality check on every
// PDF/DOCX upload while staying invisible for image/video), plus the
// standard duplicate-safety and fail-closed coverage required for any
// mutating path (.claude/rules/00-non-negotiables.md rules 2, 3, 4, 5).
//
// These call the real services against the real database — no
// readFileSync/grep-the-source shortcuts (2026-08-02 lesson). Every
// assertion reads state back from Postgres via a plain pg client, never
// from what the service claims to have done.

const {
  requestUploadTicket,
  confirmUpload,
  attachUpload,
  applyUploadWebhook,
  isAuthenticReturnedPublicId,
} = await import("../../src/server/services/media-upload.service.ts");
const { signUploadRequestSchema } = await import("../../src/server/schemas/media.schema.ts");

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

function tag() {
  return `${Date.now()}-${randomUUID().slice(0, 8)}`;
}

async function seededUser(client, email) {
  const row = await one(client, 'SELECT id FROM "User" WHERE email = $1', [email]);
  return row.id;
}

async function createUser(client, label, role, status, suffix) {
  const id = `media-upload-${label}-${suffix}`;
  await client.query(
    `INSERT INTO "User" (id, email, "passwordHash", "firstName", "lastName", role, status, "createdAt", "updatedAt")
     VALUES ($1, $2, 'test-only', 'MediaUpload', $3, $4::"UserRole", $5::"UserStatus", NOW(), NOW())`,
    [id, `${id}@example.com`, label, role, status],
  );
  return id;
}

async function mediaAssetRow(client, id) {
  return one(client, 'SELECT * FROM "MediaAsset" WHERE id = $1', [id]);
}

async function cleanupMediaAssets(client, ids) {
  if (ids.length === 0) return;
  await client.query('DELETE FROM "MediaAsset" WHERE id = ANY($1::text[])', [ids]);
}

// ---------------------------------------------------------------------------
// isAuthenticReturnedPublicId — the prefix rule itself
// ---------------------------------------------------------------------------

test("isAuthenticReturnedPublicId accepts exact matches and raw's extension suffix, rejects everything else", () => {
  assert.equal(isAuthenticReturnedPublicId("hardtech/modules/abc", "hardtech/modules", "abc"), true, "image/video: exact match");
  assert.equal(isAuthenticReturnedPublicId("hardtech/modules/abc.pdf", "hardtech/modules", "abc"), true, "raw: extension suffix allowed");
  assert.equal(isAuthenticReturnedPublicId("hardtech/modules/abc.", "hardtech/modules", "abc"), false, "an empty extension is not a real suffix");
  assert.equal(isAuthenticReturnedPublicId("hardtech/modules/abcxyz", "hardtech/modules", "abc"), false, "a non-dotted suffix is not the id, it's a different id");
  assert.equal(isAuthenticReturnedPublicId("hardtech/other/abc", "hardtech/modules", "abc"), false, "a different folder is a different object");
  assert.equal(isAuthenticReturnedPublicId("abc", "hardtech/modules", "abc"), false, "the bare minted id with no folder is not what Cloudinary reports");
});

// ---------------------------------------------------------------------------
// The raw-upload defect itself
// ---------------------------------------------------------------------------

test("confirmUpload persists Cloudinary's authoritative raw public_id and rejects a redirected one", async () => {
  assert.ok(connectionString, "database is configured");
  await withClient(async (client) => {
    const trainerId = await seededUser(client, "trainer@gmail.com");
    const createdMediaAssetIds = [];
    try {
      // Happy path: Cloudinary appends ".pdf" to a raw upload's id — this is
      // exactly the 2026-08-14 defect. confirmUpload must accept it and
      // persist the SUFFIXED id, not the bare minted one.
      const ticketResult = await requestUploadTicket({
        kind: "MODULE_FILE",
        fileName: "handout.pdf",
        byteSize: 2048,
        mimeType: "application/pdf",
        actorId: trainerId,
        actorRole: "TRAINER",
      });
      assert.equal(ticketResult.ok, true);
      createdMediaAssetIds.push(ticketResult.mediaAssetId);
      const mintedId = ticketResult.ticket.publicId;
      const folder = ticketResult.ticket.folder;
      const returnedId = `${folder}/${mintedId}.pdf`;

      const confirmResult = await confirmUpload({
        mediaAssetId: ticketResult.mediaAssetId,
        publicId: returnedId,
        actorId: trainerId,
      });
      assert.equal(confirmResult.ok, true, "a raw upload's suffixed public_id must confirm successfully");

      const row = await mediaAssetRow(client, ticketResult.mediaAssetId);
      assert.equal(row.publicId, returnedId, "the stored publicId must be the one Cloudinary actually returned, not the bare minted id");
      assert.equal(row.purgeState, "ACTIVE");

      // Adversarial path: a client claiming a completely different object
      // must be rejected outright — the tamper protection the probe
      // originally confirmed still holds.
      const secondTicket = await requestUploadTicket({
        kind: "MODULE_FILE",
        fileName: "other.pdf",
        byteSize: 2048,
        mimeType: "application/pdf",
        actorId: trainerId,
        actorRole: "TRAINER",
      });
      assert.equal(secondTicket.ok, true);
      createdMediaAssetIds.push(secondTicket.mediaAssetId);
      const redirected = await confirmUpload({
        mediaAssetId: secondTicket.mediaAssetId,
        publicId: "hardtech/modules/some-completely-different-object",
        actorId: trainerId,
      });
      assert.equal(redirected.ok, false, "a redirected public_id must be rejected");
      assert.equal(redirected.error, "Not authorized.");
      const secondRow = await mediaAssetRow(client, secondTicket.mediaAssetId);
      assert.equal(secondRow.purgeState, "RESERVED", "a rejected confirm must not advance the row's state");
      assert.equal(secondRow.publicId, secondTicket.ticket.publicId, "a rejected confirm must not overwrite the stored publicId");
    } finally {
      await cleanupMediaAssets(client, createdMediaAssetIds);
    }
  });
});

test("applyUploadWebhook persists the authoritative raw public_id via the folder-stripped lookup, and is idempotent under replay", async () => {
  assert.ok(connectionString, "database is configured");
  await withClient(async (client) => {
    const trainerId = await seededUser(client, "trainer@gmail.com");
    const createdMediaAssetIds = [];
    try {
      const ticketResult = await requestUploadTicket({
        kind: "MODULE_FILE",
        fileName: "handout.pdf",
        byteSize: 2048,
        mimeType: "application/pdf",
        actorId: trainerId,
        actorRole: "TRAINER",
      });
      assert.equal(ticketResult.ok, true);
      createdMediaAssetIds.push(ticketResult.mediaAssetId);
      const returnedId = `${ticketResult.ticket.folder}/${ticketResult.ticket.publicId}.pdf`;

      // The row is still RESERVED (keyed by the bare minted id) — this
      // simulates the webhook arriving before confirmUpload ever runs.
      const payload = {
        public_id: returnedId,
        secure_url: "https://res.cloudinary.com/demo/raw/upload/handout.pdf",
        bytes: 4096,
        resource_type: "raw",
        notification_type: "upload",
      };

      await applyUploadWebhook(payload);
      let row = await mediaAssetRow(client, ticketResult.mediaAssetId);
      assert.equal(row.publicId, returnedId, "the webhook must persist Cloudinary's own authoritative id");
      assert.equal(row.purgeState, "ACTIVE");
      assert.equal(row.bytes, 4096);

      // Cloudinary retries webhooks — a duplicate delivery must not
      // double-apply or error.
      await applyUploadWebhook(payload);
      row = await mediaAssetRow(client, ticketResult.mediaAssetId);
      assert.equal(row.publicId, returnedId);
      assert.equal(row.purgeState, "ACTIVE");
    } finally {
      await cleanupMediaAssets(client, createdMediaAssetIds);
    }
  });
});

// ---------------------------------------------------------------------------
// Double-fire safety
// ---------------------------------------------------------------------------

test("confirmUpload is duplicate-safe under sequential and concurrent replay", async () => {
  assert.ok(connectionString, "database is configured");
  await withClient(async (client) => {
    const trainerId = await seededUser(client, "trainer@gmail.com");
    const createdMediaAssetIds = [];
    try {
      const ticketResult = await requestUploadTicket({
        kind: "MODULE_FILE",
        fileName: "video.mp4",
        byteSize: 4096,
        mimeType: "video/mp4",
        actorId: trainerId,
        actorRole: "TRAINER",
      });
      assert.equal(ticketResult.ok, true);
      createdMediaAssetIds.push(ticketResult.mediaAssetId);
      const returnedId = `${ticketResult.ticket.folder}/${ticketResult.ticket.publicId}`;
      const confirmInput = { mediaAssetId: ticketResult.mediaAssetId, publicId: returnedId, actorId: trainerId };

      const first = await confirmUpload(confirmInput);
      const second = await confirmUpload(confirmInput);
      assert.equal(first.ok, true);
      assert.equal(second.ok, true);
      let row = await mediaAssetRow(client, ticketResult.mediaAssetId);
      assert.equal(row.purgeState, "ACTIVE");
      assert.equal(row.publicId, returnedId);

      const concurrent = await Promise.all([confirmUpload(confirmInput), confirmUpload(confirmInput)]);
      assert.equal(concurrent.every((result) => result.ok), true);
      row = await mediaAssetRow(client, ticketResult.mediaAssetId);
      assert.equal(row.purgeState, "ACTIVE", "must remain ACTIVE, never re-processed");
      assert.equal(row.publicId, returnedId, "must remain the one authoritative id, never overwritten by a replay");
    } finally {
      await cleanupMediaAssets(client, createdMediaAssetIds);
    }
  });
});

test("attachUpload is duplicate-safe under sequential and concurrent replay", async () => {
  assert.ok(connectionString, "database is configured");
  await withClient(async (client) => {
    const suffix = tag();
    const traineeId = await seededUser(client, "trainee@gmail.com");
    const postId = `media-upload-post-${suffix}`;
    const createdMediaAssetIds = [];
    try {
      await client.query(
        `INSERT INTO "ForumPost" (id, "authorId", title, body, hashtags, status, "createdAt", "updatedAt")
         VALUES ($1, $2, $3, 'Body for the media-upload attach double-fire test.', '{}'::text[], 'PENDING_APPROVAL', NOW(), NOW())`,
        [postId, traineeId, `Media upload attach test ${suffix}`],
      );

      const ticketResult = await requestUploadTicket({
        kind: "POST_ATTACHMENT",
        fileName: "photo.jpg",
        byteSize: 512,
        mimeType: "image/jpeg",
        actorId: traineeId,
        actorRole: "TRAINEE",
      });
      assert.equal(ticketResult.ok, true);
      createdMediaAssetIds.push(ticketResult.mediaAssetId);
      const returnedId = `${ticketResult.ticket.folder}/${ticketResult.ticket.publicId}`;
      const confirmed = await confirmUpload({
        mediaAssetId: ticketResult.mediaAssetId,
        publicId: returnedId,
        actorId: traineeId,
      });
      assert.equal(confirmed.ok, true);

      const attachInput = {
        mediaAssetId: ticketResult.mediaAssetId,
        owner: { postId },
        actorId: traineeId,
        actorRole: "TRAINEE",
      };
      const first = await attachUpload(attachInput);
      const second = await attachUpload(attachInput);
      assert.equal(first.ok, true);
      assert.equal(second.ok, true);
      let row = await mediaAssetRow(client, ticketResult.mediaAssetId);
      assert.equal(row.postId, postId);

      const concurrent = await Promise.all([attachUpload(attachInput), attachUpload(attachInput)]);
      assert.equal(concurrent.every((result) => result.ok), true);
      row = await mediaAssetRow(client, ticketResult.mediaAssetId);
      assert.equal(row.postId, postId, "must remain bound to the same post, never reattached or duplicated");
    } finally {
      await cleanupMediaAssets(client, createdMediaAssetIds);
      await client.query('DELETE FROM "ForumPost" WHERE id = $1', [postId]);
    }
  });
});

// ---------------------------------------------------------------------------
// Authorization and fail-closed coverage
// ---------------------------------------------------------------------------

test("requestUploadTicket rejects a trainee requesting MODULE_FILE", async () => {
  assert.ok(connectionString, "database is configured");
  await withClient(async (client) => {
    const traineeId = await seededUser(client, "trainee@gmail.com");
    const result = await requestUploadTicket({
      kind: "MODULE_FILE",
      fileName: "sneaky.pdf",
      byteSize: 1024,
      mimeType: "application/pdf",
      actorId: traineeId,
      actorRole: "TRAINEE",
    });
    assert.equal(result.ok, false);
    assert.equal(result.error, "Not authorized.");
  });
});

test("requestUploadTicket rejects a suspended admin even though the claimed role is ADMIN", async () => {
  assert.ok(connectionString, "database is configured");
  await withClient(async (client) => {
    const suffix = tag();
    const suspendedAdminId = await createUser(client, "suspended-admin", "ADMIN", "SUSPENDED", suffix);
    try {
      const result = await requestUploadTicket({
        kind: "GALLERY_PHOTO",
        fileName: "photo.png",
        byteSize: 1024,
        mimeType: "image/png",
        actorId: suspendedAdminId,
        actorRole: "ADMIN",
      });
      assert.equal(result.ok, false, "a suspended admin must not be able to request an upload ticket");
      assert.equal(result.error, "Not authorized.");
    } finally {
      await client.query('DELETE FROM "User" WHERE id = $1', [suspendedAdminId]);
    }
  });
});

test("signUploadRequestSchema rejects an unrecognised kind at the schema boundary", () => {
  const parsed = signUploadRequestSchema.safeParse({
    kind: "NOT_A_REAL_KIND",
    fileName: "x.png",
    byteSize: 1024,
    mimeType: "image/png",
  });
  assert.equal(parsed.success, false);
});

test("requestUploadTicket fails closed on a kind outside the recognised set, never defaulting to a real category", async () => {
  assert.ok(connectionString, "database is configured");
  await withClient(async (client) => {
    const adminId = await seededUser(client, "admin@gmail.com");
    const result = await requestUploadTicket({
      kind: "NOT_A_REAL_KIND",
      fileName: "x.png",
      byteSize: 1024,
      mimeType: "image/png",
      actorId: adminId,
      actorRole: "ADMIN",
    });
    assert.equal(result.ok, false);
    assert.equal(result.error, "Not authorized.");
  });
});

test("requestUploadTicket rejects an oversized byteSize before any reservation row exists", async () => {
  assert.ok(connectionString, "database is configured");
  await withClient(async (client) => {
    const trainerId = await seededUser(client, "trainer@gmail.com");
    const before = await one(
      client,
      'SELECT count(*)::int AS count FROM "MediaAsset" WHERE "uploadedByUserId" = $1',
      [trainerId],
    );
    const result = await requestUploadTicket({
      kind: "MODULE_FILE",
      fileName: "huge.pdf",
      byteSize: 999_999_999,
      mimeType: "application/pdf",
      actorId: trainerId,
      actorRole: "TRAINER",
    });
    assert.equal(result.ok, false);
    assert.match(result.error, /maximum/i);
    const after = await one(
      client,
      'SELECT count(*)::int AS count FROM "MediaAsset" WHERE "uploadedByUserId" = $1',
      [trainerId],
    );
    assert.equal(after.count, before.count, "an oversized request must not create a reservation row");
  });
});

test("confirmUpload rejects confirming another user's reservation", async () => {
  assert.ok(connectionString, "database is configured");
  await withClient(async (client) => {
    const suffix = tag();
    const trainerId = await seededUser(client, "trainer@gmail.com");
    const otherId = await createUser(client, "confirm-other", "TRAINER", "ACTIVE", suffix);
    const createdMediaAssetIds = [];
    try {
      const ticketResult = await requestUploadTicket({
        kind: "MODULE_FILE",
        fileName: "x.pdf",
        byteSize: 1024,
        mimeType: "application/pdf",
        actorId: trainerId,
        actorRole: "TRAINER",
      });
      assert.equal(ticketResult.ok, true);
      createdMediaAssetIds.push(ticketResult.mediaAssetId);
      const returnedId = `${ticketResult.ticket.folder}/${ticketResult.ticket.publicId}.pdf`;
      const result = await confirmUpload({
        mediaAssetId: ticketResult.mediaAssetId,
        publicId: returnedId,
        actorId: otherId,
      });
      assert.equal(result.ok, false, "a different user must not be able to confirm someone else's reservation");
      assert.equal(result.error, "Not authorized.");
      const row = await mediaAssetRow(client, ticketResult.mediaAssetId);
      assert.equal(row.purgeState, "RESERVED");
    } finally {
      await cleanupMediaAssets(client, createdMediaAssetIds);
      await client.query('DELETE FROM "User" WHERE id = $1', [otherId]);
    }
  });
});
