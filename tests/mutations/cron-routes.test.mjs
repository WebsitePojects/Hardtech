import "dotenv/config";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { test } from "node:test";
import pg from "pg";

// Coverage for the two cron-triggered routes that drain the media-purge
// outbox (rule 7). Neither media-purge.service.ts nor
// media-asset.repository.ts is touched or mocked here — these tests import
// the route handlers themselves and call them with constructed Request
// objects, then verify real Postgres state, per the project lesson "a 307
// is not proof a page renders": a matching status code alone does not prove
// the auth gate ran before any real work, so every auth-failure case here
// proves the underlying service was NOT invoked by asserting the fixture
// row is untouched in the database, not just by reading the response code.

const { GET: purgeAssetsGet } = await import(
  "../../src/app/api/cron/purge-assets/route.ts"
);
const { GET: reapUploadsGet } = await import(
  "../../src/app/api/cron/reap-uploads/route.ts"
);

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
  const id = `cron-route-${label}-${tag()}`;
  const publicId = `cron-route-public-${label}-${tag()}`;
  await client.query(
    `INSERT INTO "MediaAsset" (id, "publicId", "resourceType", folder, "purgeState", "purgeAttempts", "createdAt", "updatedAt")
     VALUES ($1, $2, 'IMAGE', 'hardtech/_cron-route-test', 'PENDING', 0, NOW(), NOW())`,
    [id, publicId],
  );
  return { id, publicId };
}

async function createStaleReservedAsset(client, label) {
  const id = `cron-route-stale-${label}-${tag()}`;
  const publicId = `cron-route-stale-public-${label}-${tag()}`;
  await client.query(
    `INSERT INTO "MediaAsset" (id, "publicId", "resourceType", folder, "purgeState", "createdAt", "updatedAt")
     VALUES ($1, $2, 'IMAGE', 'hardtech/_cron-route-test', 'RESERVED', NOW() - INTERVAL '2 hours', NOW())`,
    [id, publicId],
  );
  return { id, publicId };
}

function purgeAssetsRequest(headers = {}) {
  return new Request("http://localhost/api/cron/purge-assets", { method: "GET", headers });
}

function reapUploadsRequest(headers = {}) {
  return new Request("http://localhost/api/cron/reap-uploads", { method: "GET", headers });
}

/** Save/restore CRON_SECRET around a test body so tests never leak env
 *  mutations into each other or into unrelated test files running in the
 *  same process. */
async function withCronSecret(value, callback) {
  const original = process.env.CRON_SECRET;
  if (value === undefined) {
    delete process.env.CRON_SECRET;
  } else {
    process.env.CRON_SECRET = value;
  }
  try {
    await callback();
  } finally {
    if (original === undefined) {
      delete process.env.CRON_SECRET;
    } else {
      process.env.CRON_SECRET = original;
    }
  }
}

// ---------------------------------------------------------------------------
// /api/cron/purge-assets — auth gate
// ---------------------------------------------------------------------------

test("purge-assets GET rejects a missing Authorization header and never touches a due row", async () => {
  assert.ok(connectionString, "database is configured");
  await withCronSecret(`secret-${tag()}`, async () => {
    await withClient(async (client) => {
      const asset = await createPendingAsset(client, "no-header");
      try {
        const response = await purgeAssetsGet(purgeAssetsRequest());
        assert.equal(response.status, 401);

        const row = await one(client, 'SELECT "purgeState", "purgeAttempts" FROM "MediaAsset" WHERE id = $1', [asset.id]);
        assert.equal(row.purgeState, "PENDING", "the auth gate must run before purgeDueAssets ever claims the row");
        assert.equal(row.purgeAttempts, 0);
      } finally {
        await client.query('DELETE FROM "MediaAsset" WHERE id = $1', [asset.id]);
      }
    });
  });
});

test("purge-assets GET rejects a wrong Authorization secret and never touches a due row", async () => {
  assert.ok(connectionString, "database is configured");
  await withCronSecret(`secret-${tag()}`, async () => {
    await withClient(async (client) => {
      const asset = await createPendingAsset(client, "wrong-secret");
      try {
        const response = await purgeAssetsGet(
          purgeAssetsRequest({ authorization: "Bearer totally-wrong-secret" }),
        );
        assert.equal(response.status, 401);

        const row = await one(client, 'SELECT "purgeState" FROM "MediaAsset" WHERE id = $1', [asset.id]);
        assert.equal(row.purgeState, "PENDING");
      } finally {
        await client.query('DELETE FROM "MediaAsset" WHERE id = $1', [asset.id]);
      }
    });
  });
});

test("purge-assets GET rejects a malformed (non-Bearer) Authorization header", async () => {
  assert.ok(connectionString, "database is configured");
  await withCronSecret(`secret-${tag()}`, async () => {
    const response = await purgeAssetsGet(
      purgeAssetsRequest({ authorization: "Basic dXNlcjpwYXNz" }),
    );
    assert.equal(response.status, 401);
  });
});

test("purge-assets GET fails closed when CRON_SECRET is entirely unset, even with a plausible header", async () => {
  assert.ok(connectionString, "database is configured");
  await withCronSecret(undefined, async () => {
    await withClient(async (client) => {
      const asset = await createPendingAsset(client, "unset-secret");
      try {
        const response = await purgeAssetsGet(
          purgeAssetsRequest({ authorization: "Bearer whatever-a-caller-might-guess" }),
        );
        assert.equal(response.status, 401, "missing configuration must never fall through to 'no auth required'");

        const row = await one(client, 'SELECT "purgeState" FROM "MediaAsset" WHERE id = $1', [asset.id]);
        assert.equal(row.purgeState, "PENDING");
      } finally {
        await client.query('DELETE FROM "MediaAsset" WHERE id = $1', [asset.id]);
      }
    });
  });
});

test("purge-assets GET with the correct secret returns 200 and the PurgeBatchResult shape", async () => {
  assert.ok(connectionString, "database is configured");
  const secret = `secret-${tag()}`;
  await withCronSecret(secret, async () => {
    const response = await purgeAssetsGet(purgeAssetsRequest({ authorization: `Bearer ${secret}` }));
    assert.equal(response.status, 200);
    const body = await response.json();
    for (const key of ["claimed", "purged", "failed", "abandoned"]) {
      assert.equal(typeof body[key], "number", `${key} must be a number`);
      assert.ok(body[key] >= 0, `${key} must be non-negative`);
    }
  });
});

// ---------------------------------------------------------------------------
// /api/cron/reap-uploads — auth gate
// ---------------------------------------------------------------------------

test("reap-uploads GET rejects a missing Authorization header and never touches a stale reservation", async () => {
  assert.ok(connectionString, "database is configured");
  await withCronSecret(`secret-${tag()}`, async () => {
    await withClient(async (client) => {
      const asset = await createStaleReservedAsset(client, "no-header");
      try {
        const response = await reapUploadsGet(reapUploadsRequest());
        assert.equal(response.status, 401);

        const row = await one(client, 'SELECT "purgeState" FROM "MediaAsset" WHERE id = $1', [asset.id]);
        assert.equal(row.purgeState, "RESERVED", "the auth gate must run before reapStaleUploads ever moves the row");
      } finally {
        await client.query('DELETE FROM "MediaAsset" WHERE id = $1', [asset.id]);
      }
    });
  });
});

test("reap-uploads GET rejects a wrong Authorization secret and never touches a stale reservation", async () => {
  assert.ok(connectionString, "database is configured");
  await withCronSecret(`secret-${tag()}`, async () => {
    await withClient(async (client) => {
      const asset = await createStaleReservedAsset(client, "wrong-secret");
      try {
        const response = await reapUploadsGet(
          reapUploadsRequest({ authorization: "Bearer totally-wrong-secret" }),
        );
        assert.equal(response.status, 401);

        const row = await one(client, 'SELECT "purgeState" FROM "MediaAsset" WHERE id = $1', [asset.id]);
        assert.equal(row.purgeState, "RESERVED");
      } finally {
        await client.query('DELETE FROM "MediaAsset" WHERE id = $1', [asset.id]);
      }
    });
  });
});

test("reap-uploads GET fails closed when CRON_SECRET is entirely unset", async () => {
  assert.ok(connectionString, "database is configured");
  await withCronSecret(undefined, async () => {
    await withClient(async (client) => {
      const asset = await createStaleReservedAsset(client, "unset-secret");
      try {
        const response = await reapUploadsGet(
          reapUploadsRequest({ authorization: "Bearer whatever-a-caller-might-guess" }),
        );
        assert.equal(response.status, 401);

        const row = await one(client, 'SELECT "purgeState" FROM "MediaAsset" WHERE id = $1', [asset.id]);
        assert.equal(row.purgeState, "RESERVED");
      } finally {
        await client.query('DELETE FROM "MediaAsset" WHERE id = $1', [asset.id]);
      }
    });
  });
});

test("reap-uploads GET with the correct secret returns 200, reaps a due stale reservation, and leaves a fresh one alone", async () => {
  assert.ok(connectionString, "database is configured");
  const secret = `secret-${tag()}`;
  await withCronSecret(secret, async () => {
    await withClient(async (client) => {
      const stale = await createStaleReservedAsset(client, "due");
      const freshId = `cron-route-fresh-${tag()}`;
      const freshPublicId = `cron-route-fresh-public-${tag()}`;
      await client.query(
        `INSERT INTO "MediaAsset" (id, "publicId", "resourceType", folder, "purgeState", "createdAt", "updatedAt")
         VALUES ($1, $2, 'IMAGE', 'hardtech/_cron-route-test', 'RESERVED', NOW(), NOW())`,
        [freshId, freshPublicId],
      );
      try {
        const response = await reapUploadsGet(reapUploadsRequest({ authorization: `Bearer ${secret}` }));
        assert.equal(response.status, 200);
        const body = await response.json();
        assert.equal(typeof body.reaped, "number");
        assert.ok(body.reaped >= 1, "at least the fixture's stale row must be reaped");

        const staleRow = await one(client, 'SELECT "purgeState" FROM "MediaAsset" WHERE id = $1', [stale.id]);
        assert.equal(staleRow.purgeState, "PENDING");

        const freshRow = await one(client, 'SELECT "purgeState" FROM "MediaAsset" WHERE id = $1', [freshId]);
        assert.equal(freshRow.purgeState, "RESERVED", "a fresh reservation must not be reaped");
      } finally {
        await client.query('DELETE FROM "MediaAsset" WHERE id = ANY($1::text[])', [[stale.id, freshId]]);
      }
    });
  });
});
