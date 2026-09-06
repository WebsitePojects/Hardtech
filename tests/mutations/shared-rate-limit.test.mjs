import "dotenv/config";
import assert from "node:assert/strict";
import { createHash, randomUUID } from "node:crypto";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { test } from "node:test";
import pg from "pg";

const { checkRateLimit } = await import("../../src/server/auth/rate-limit.ts");
const { db } = await import("../../src/server/db.ts");

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
const root = process.cwd();

function digest(key) {
  return createHash("sha256").update(key).digest("hex");
}

function key(prefix = "login") {
  return `${prefix}:rate-limit-test-${Date.now()}-${randomUUID().replaceAll("-", "")}`;
}

async function withClient(callback) {
  const client = new pg.Client({ connectionString });
  await client.connect();
  try {
    return await callback(client);
  } finally {
    await client.end();
  }
}

async function deleteBucket(client, rawKey) {
  await client.query('DELETE FROM "RateLimitWindow" WHERE "bucketKey" = $1', [digest(rawKey)]);
}

function checkFromSeparateProcess(rawKey) {
  const script = [
    "(async () => {",
    'const { checkRateLimit } = await import("./src/server/auth/rate-limit.ts");',
    `const result = await checkRateLimit(${JSON.stringify(rawKey)});`,
    "process.stdout.write(JSON.stringify(result), () => process.exit(0));",
    "})().catch(() => process.exit(1));",
  ].join("\n");
  const child = spawnSync(
    process.execPath,
    [path.join(root, "node_modules/tsx/dist/cli.mjs"), "-e", script],
    { cwd: root, env: process.env, encoding: "utf8" },
  );
  assert.equal(child.status, 0, "the separate process must execute the shared limiter");
  return JSON.parse(child.stdout);
}

test("shared limiter denies malformed bucket keys without persisting them", async () => {
  assert.ok(connectionString, "QA database is configured");
  await withClient(async (client) => {
    const before = await client.query('SELECT count(*)::int AS count FROM "RateLimitWindow"');
    const result = await checkRateLimit("login:contains a space");
    const after = await client.query('SELECT count(*)::int AS count FROM "RateLimitWindow"');
    assert.deepEqual(result, { allowed: false, retryAfterMs: 60_000 });
    assert.equal(after.rows[0].count, before.rows[0].count);
  });
});

test("shared limiter permits five sequential attempts and stores only a digest", async () => {
  assert.ok(connectionString, "QA database is configured");
  const rawKey = key();
  await withClient(async (client) => {
    try {
      const results = [];
      for (let attempt = 0; attempt < 6; attempt += 1) results.push(await checkRateLimit(rawKey));
      assert.equal(results.filter((result) => result.allowed).length, 5);
      assert.equal(results[5].allowed, false);
      assert.ok(results[5].retryAfterMs > 0 && results[5].retryAfterMs <= 60_000);

      const row = await client.query('SELECT "bucketKey", "count" FROM "RateLimitWindow" WHERE "bucketKey" = $1', [digest(rawKey)]);
      assert.equal(row.rows.length, 1);
      assert.equal(row.rows[0].bucketKey, digest(rawKey));
      assert.equal(row.rows[0].count, 5);
    } finally {
      await deleteBucket(client, rawKey);
    }
  });
});

test("shared limiter admits exactly five concurrent attempts", async () => {
  assert.ok(connectionString, "QA database is configured");
  const rawKey = key();
  await withClient(async (client) => {
    try {
      const results = await Promise.all(Array.from({ length: 12 }, () => checkRateLimit(rawKey)));
      assert.equal(results.filter((result) => result.allowed).length, 5);
      assert.equal(results.filter((result) => !result.allowed).length, 7);
    } finally {
      await deleteBucket(client, rawKey);
    }
  });
});

test("a separate Node process consumes the same fixed-window counter", async () => {
  assert.ok(connectionString, "QA database is configured");
  await withClient(async (client) => {
    let sharedWindowObserved = false;
    // A test that starts at the final millisecond of a minute can correctly
    // cross into a fresh fixed window during the child-process call. Retry
    // with a new bucket in that rare case; three immediate tries make the
    // assertion about shared-process semantics rather than wall-clock luck.
    for (let attempt = 0; attempt < 3 && !sharedWindowObserved; attempt += 1) {
      const rawKey = key();
      try {
        for (let count = 0; count < 4; count += 1) assert.equal((await checkRateLimit(rawKey)).allowed, true);
        assert.equal(checkFromSeparateProcess(rawKey).allowed, true);
        sharedWindowObserved = !(await checkRateLimit(rawKey)).allowed;
      } finally {
        await deleteBucket(client, rawKey);
      }
    }
    assert.equal(sharedWindowObserved, true, "a fresh Node process must consume the same database counter");
  });
});

test("database failures deny instead of bypassing the limiter", async () => {
  const original = db.$queryRaw;
  db.$queryRaw = async () => {
    throw new Error("simulated database outage");
  };
  try {
    assert.deepEqual(await checkRateLimit(key()), { allowed: false, retryAfterMs: 60_000 });
  } finally {
    db.$queryRaw = original;
  }
});

test("expiry cleanup removes no more than one bounded batch", async () => {
  assert.ok(connectionString, "QA database is configured");
  const rawKey = key();
  const stalePrefix = `stale-${randomUUID().replaceAll("-", "")}`;
  await withClient(async (client) => {
    const staleKeys = Array.from({ length: 101 }, (_, index) => `${stalePrefix}-${index}`.padEnd(64, "0"));
    try {
      for (const bucketKey of staleKeys) {
        await client.query(
          'INSERT INTO "RateLimitWindow" ("bucketKey", "windowStart", "count", "updatedAt") VALUES ($1, NOW() - INTERVAL \'2 days\', 1, NOW())',
          [bucketKey],
        );
      }
      assert.equal((await checkRateLimit(rawKey)).allowed, true);
      const remaining = await client.query('SELECT count(*)::int AS count FROM "RateLimitWindow" WHERE "bucketKey" = ANY($1::text[])', [staleKeys]);
      assert.equal(remaining.rows[0].count, 1);
    } finally {
      await deleteBucket(client, rawKey);
      await client.query('DELETE FROM "RateLimitWindow" WHERE "bucketKey" = ANY($1::text[])', [staleKeys]);
    }
  });
});
