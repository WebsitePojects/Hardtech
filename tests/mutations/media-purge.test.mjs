import "dotenv/config";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { test } from "node:test";
import pg from "pg";

// Coverage for the media purge outbox drain (rule 7: no fire-and-forget side
// effects — deleting an owner row must eventually delete the Cloudinary
// object it referenced, via bounded retry to a terminal state).
//
// The real Cloudinary API is never called here. purgeDueAssets accepts an
// injectable `destroy` function (defaulting to the real destroyAsset) —
// every test below passes a deterministic in-memory stub instead, so
// success/failure/network-outage behaviour is exercised without any network
// call or nondeterminism (per the task brief: "inject or stub the destroy
// step so failures are deterministic").

const { purgeDueAssets, reapStaleUploads, scheduleOwnerAssetsForPurge } = await import(
  "../../src/server/services/media-purge.service.ts"
);
const { db } = await import("../../src/server/db.ts");

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

async function createPendingAsset(client, label) {
  const id = `media-purge-${label}-${tag()}`;
  const publicId = `media-purge-public-${label}-${tag()}`;
  await client.query(
    `INSERT INTO "MediaAsset" (id, "publicId", "resourceType", folder, "purgeState", "purgeAttempts", "createdAt", "updatedAt")
     VALUES ($1, $2, 'IMAGE', 'hardtech/gallery', 'PENDING', 0, NOW(), NOW())`,
    [id, publicId],
  );
  return { id, publicId };
}

// ---------------------------------------------------------------------------
// Happy path
// ---------------------------------------------------------------------------

test("purgeDueAssets purges due rows via the injected destroy stub", async () => {
  assert.ok(connectionString, "database is configured");
  await withClient(async (client) => {
    const assets = await Promise.all([
      createPendingAsset(client, "a"),
      createPendingAsset(client, "b"),
      createPendingAsset(client, "c"),
    ]);
    const ids = assets.map((asset) => asset.id);
    try {
      const seen = [];
      const result = await purgeDueAssets({
        limit: 10,
        leaseSeconds: 60,
        maxAttempts: 5,
        destroy: async (publicId) => {
          seen.push(publicId);
          return true;
        },
      });

      assert.equal(result.claimed, 3);
      assert.equal(result.purged, 3);
      assert.equal(result.failed, 0);
      assert.equal(result.abandoned, 0);
      assert.equal(seen.length, 3, "the real Cloudinary API must never be called — only the injected stub");

      const rows = await client.query(
        'SELECT "purgeState", "purgedAt" FROM "MediaAsset" WHERE id = ANY($1::text[])',
        [ids],
      );
      assert.equal(rows.rows.length, 3);
      for (const row of rows.rows) {
        assert.equal(row.purgeState, "PURGED");
        assert.ok(row.purgedAt, "a PURGED row must carry a purgedAt timestamp (CHECK constraint)");
      }
    } finally {
      await client.query('DELETE FROM "MediaAsset" WHERE id = ANY($1::text[])', [ids]);
    }
  });
});

// ---------------------------------------------------------------------------
// Concurrency: two workers must never claim the same row
// ---------------------------------------------------------------------------

test("two concurrent purgeDueAssets workers never both claim the same row", async () => {
  assert.ok(connectionString, "database is configured");
  await withClient(async (client) => {
    const assets = await Promise.all(
      Array.from({ length: 6 }, (_, index) => createPendingAsset(client, `race-${index}`)),
    );
    const ids = assets.map((asset) => asset.id);
    try {
      const seenByWorkerA = [];
      const seenByWorkerB = [];

      const [resultA, resultB] = await Promise.all([
        purgeDueAssets({
          limit: 10,
          leaseSeconds: 60,
          maxAttempts: 5,
          destroy: async (publicId) => {
            seenByWorkerA.push(publicId);
            return true;
          },
        }),
        purgeDueAssets({
          limit: 10,
          leaseSeconds: 60,
          maxAttempts: 5,
          destroy: async (publicId) => {
            seenByWorkerB.push(publicId);
            return true;
          },
        }),
      ]);

      const overlap = seenByWorkerA.filter((publicId) => seenByWorkerB.includes(publicId));
      assert.deepEqual(overlap, [], "no publicId may be processed by both concurrent workers");
      assert.equal(
        seenByWorkerA.length + seenByWorkerB.length,
        ids.length,
        "the union of what each worker claimed must cover every pending row exactly once",
      );
      assert.equal(resultA.purged + resultB.purged, ids.length);

      const rows = await client.query('SELECT "purgeState" FROM "MediaAsset" WHERE id = ANY($1::text[])', [ids]);
      assert.ok(rows.rows.every((row) => row.purgeState === "PURGED"));
    } finally {
      await client.query('DELETE FROM "MediaAsset" WHERE id = ANY($1::text[])', [ids]);
    }
  });
});

// ---------------------------------------------------------------------------
// Bounded retry with backoff to a terminal state
// ---------------------------------------------------------------------------

test("purgeDueAssets backs off on failure and lands terminal FAILED at maxAttempts, sanitizing the stored error", async () => {
  assert.ok(connectionString, "database is configured");
  await withClient(async (client) => {
    const asset = await createPendingAsset(client, "retry");
    try {
      const failingDestroy = async () => {
        throw new Error("simulated provider outage; signature=leaked-should-be-redacted");
      };

      const first = await purgeDueAssets({ limit: 5, leaseSeconds: 60, maxAttempts: 3, destroy: failingDestroy });
      assert.equal(first.claimed, 1);
      assert.equal(first.failed, 1);
      assert.equal(first.abandoned, 0);
      let row = await one(client, 'SELECT * FROM "MediaAsset" WHERE id = $1', [asset.id]);
      assert.equal(row.purgeState, "PENDING", "still retryable after the first failure");
      assert.equal(row.purgeAttempts, 1);
      assert.ok(row.purgeNotBefore, "a failed attempt must schedule a future retry (exponential backoff)");
      assert.ok(
        !row.lastPurgeError.includes("signature=leaked-should-be-redacted"),
        "a raw provider error must be sanitized before being persisted (rule 6)",
      );
      assert.equal(row.leaseOwner, null, "the lease must be released after a failed attempt");
      // Bypass the real backoff wait so the test can proceed immediately —
      // this only fast-forwards eligibility, it does not touch attempts.
      await client.query('UPDATE "MediaAsset" SET "purgeNotBefore" = NULL WHERE id = $1', [asset.id]);

      const second = await purgeDueAssets({ limit: 5, leaseSeconds: 60, maxAttempts: 3, destroy: failingDestroy });
      assert.equal(second.failed, 1);
      row = await one(client, 'SELECT * FROM "MediaAsset" WHERE id = $1', [asset.id]);
      assert.equal(row.purgeState, "PENDING");
      assert.equal(row.purgeAttempts, 2);
      await client.query('UPDATE "MediaAsset" SET "purgeNotBefore" = NULL WHERE id = $1', [asset.id]);

      const third = await purgeDueAssets({ limit: 5, leaseSeconds: 60, maxAttempts: 3, destroy: failingDestroy });
      assert.equal(third.abandoned, 1);
      assert.equal(third.failed, 0);
      row = await one(client, 'SELECT * FROM "MediaAsset" WHERE id = $1', [asset.id]);
      assert.equal(row.purgeState, "FAILED", "bounded retries exhausted must land terminal FAILED, never retried forever");
      assert.equal(row.leaseOwner, null);

      // Terminal: a fourth call must not touch this row at all — FAILED is
      // not in the claimable set.
      const fourth = await purgeDueAssets({ limit: 5, leaseSeconds: 60, maxAttempts: 3, destroy: failingDestroy });
      const stillFailed = await one(client, 'SELECT "purgeAttempts" FROM "MediaAsset" WHERE id = $1', [asset.id]);
      assert.equal(stillFailed.purgeAttempts, 2, "a terminal FAILED row must never be claimed again");
      void fourth;
    } finally {
      await client.query('DELETE FROM "MediaAsset" WHERE id = $1', [asset.id]);
    }
  });
});

test("purgeDueAssets never aborts the batch when one row's destroy throws", async () => {
  assert.ok(connectionString, "database is configured");
  await withClient(async (client) => {
    const good = await createPendingAsset(client, "good");
    const bad = await createPendingAsset(client, "bad");
    const ids = [good.id, bad.id];
    try {
      const result = await purgeDueAssets({
        limit: 10,
        leaseSeconds: 60,
        maxAttempts: 5,
        destroy: async (publicId) => {
          if (publicId === bad.publicId) throw new Error("simulated failure for one row only");
          return true;
        },
      });
      assert.equal(result.claimed, 2);
      assert.equal(result.purged, 1, "the good row must still be purged despite the bad row's exception");
      assert.equal(result.failed, 1);

      const goodRow = await one(client, 'SELECT "purgeState" FROM "MediaAsset" WHERE id = $1', [good.id]);
      assert.equal(goodRow.purgeState, "PURGED");
      const badRow = await one(client, 'SELECT "purgeState" FROM "MediaAsset" WHERE id = $1', [bad.id]);
      assert.equal(badRow.purgeState, "PENDING");
    } finally {
      await client.query('DELETE FROM "MediaAsset" WHERE id = ANY($1::text[])', [ids]);
    }
  });
});

// ---------------------------------------------------------------------------
// reapStaleUploads
// ---------------------------------------------------------------------------

test("reapStaleUploads moves an old RESERVED row into the purge queue", async () => {
  assert.ok(connectionString, "database is configured");
  await withClient(async (client) => {
    const suffix = tag();
    const assetId = `media-purge-stale-${suffix}`;
    const publicId = `media-purge-stale-public-${suffix}`;
    try {
      await client.query(
        `INSERT INTO "MediaAsset" (id, "publicId", "resourceType", folder, "purgeState", "createdAt", "updatedAt")
         VALUES ($1, $2, 'IMAGE', 'hardtech/gallery', 'RESERVED', NOW() - INTERVAL '2 hours', NOW())`,
        [assetId, publicId],
      );

      const result = await reapStaleUploads({ olderThanMinutes: 60, limit: 50 });
      assert.ok(result.reaped >= 1, "at least the fixture row must be reaped");

      const row = await one(client, 'SELECT "purgeState" FROM "MediaAsset" WHERE id = $1', [assetId]);
      assert.equal(row.purgeState, "PENDING");
    } finally {
      await client.query('DELETE FROM "MediaAsset" WHERE id = $1', [assetId]);
    }
  });
});

test("reapStaleUploads leaves a recent RESERVED row alone", async () => {
  assert.ok(connectionString, "database is configured");
  await withClient(async (client) => {
    const suffix = tag();
    const assetId = `media-purge-fresh-${suffix}`;
    const publicId = `media-purge-fresh-public-${suffix}`;
    try {
      await client.query(
        `INSERT INTO "MediaAsset" (id, "publicId", "resourceType", folder, "purgeState", "createdAt", "updatedAt")
         VALUES ($1, $2, 'IMAGE', 'hardtech/gallery', 'RESERVED', NOW(), NOW())`,
        [assetId, publicId],
      );

      await reapStaleUploads({ olderThanMinutes: 60, limit: 50 });

      const row = await one(client, 'SELECT "purgeState" FROM "MediaAsset" WHERE id = $1', [assetId]);
      assert.equal(row.purgeState, "RESERVED", "a fresh reservation must not be reaped");
    } finally {
      await client.query('DELETE FROM "MediaAsset" WHERE id = $1', [assetId]);
    }
  });
});

// ---------------------------------------------------------------------------
// scheduleOwnerAssetsForPurge — must run inside the owner's own transaction
// ---------------------------------------------------------------------------

test("scheduleOwnerAssetsForPurge detaches and schedules an owner's asset atomically with the owner's own delete", async () => {
  assert.ok(connectionString, "database is configured");
  await withClient(async (client) => {
    const suffix = tag();
    const trainee = await one(client, 'SELECT id FROM "User" WHERE email = $1', ["trainee@gmail.com"]);
    const postId = `media-purge-owner-post-${suffix}`;
    const assetId = `media-purge-owner-asset-${suffix}`;
    const publicId = `media-purge-owner-public-${suffix}`;
    try {
      await client.query(
        `INSERT INTO "ForumPost" (id, "authorId", title, body, hashtags, status, "createdAt", "updatedAt")
         VALUES ($1, $2, $3, 'Body for the scheduleOwnerAssetsForPurge test.', '{}'::text[], 'PENDING_APPROVAL', NOW(), NOW())`,
        [postId, trainee.id, `Media purge schedule test ${suffix}`],
      );
      await client.query(
        `INSERT INTO "MediaAsset" (id, "publicId", "resourceType", folder, "purgeState", "postId", "createdAt", "updatedAt")
         VALUES ($1, $2, 'IMAGE', 'hardtech/forum', 'ACTIVE', $3, NOW(), NOW())`,
        [assetId, publicId, postId],
      );

      await db.$transaction(async (tx) => {
        const count = await scheduleOwnerAssetsForPurge({ postId }, tx);
        assert.equal(count, 1);
        await tx.forumPost.delete({ where: { id: postId } });
      });

      const row = await one(client, 'SELECT "purgeState", "postId" FROM "MediaAsset" WHERE id = $1', [assetId]);
      assert.equal(row.purgeState, "PENDING", "the asset must be scheduled for purge in the same transaction as the owner's delete");
      assert.equal(row.postId, null, "the asset must be detached from the deleted owner");

      const postRows = await client.query('SELECT id FROM "ForumPost" WHERE id = $1', [postId]);
      assert.equal(postRows.rows.length, 0, "the owner row itself must be gone");
    } finally {
      await client.query('DELETE FROM "MediaAsset" WHERE id = $1', [assetId]);
      await client.query('DELETE FROM "ForumPost" WHERE id = $1', [postId]);
    }
  });
});
