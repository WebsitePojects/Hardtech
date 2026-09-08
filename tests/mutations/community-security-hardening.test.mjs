import "dotenv/config";
import assert from "node:assert/strict";
import { createHash, randomUUID } from "node:crypto";
import { test } from "node:test";
import pg from "pg";

const { joinCommunity, requestCommunity, approveCommunityRequest } =
  await import("../../src/server/services/community-write.service.ts");
const { db } = await import("../../src/server/db.ts");

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;

function suffix() {
  return `${Date.now()}-${randomUUID().slice(0, 8)}`;
}

function rateBucket(operation, userId) {
  return createHash("sha256").update(`enroll:communities-${operation}:${userId}`).digest("hex");
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

async function createUser(client, label, role, status, tag) {
  const id = `community-security-${label}-${tag}`;
  await client.query(
    `INSERT INTO "User" (id, email, "passwordHash", "firstName", "lastName", role, status, "createdAt", "updatedAt")
     VALUES ($1, $2, 'test-only', 'Community', $3, $4::"UserRole", $5::"UserStatus", NOW(), NOW())`,
    [id, `${id}@example.com`, label, role, status],
  );
  return id;
}

test("community writes verify live roles and fail closed when the shared limiter rejects a write", async () => {
  assert.ok(connectionString, "database connection is configured");
  await withClient(async (client) => {
    const tag = suffix();
    const suspendedAdmin = await createUser(client, "suspended", "ADMIN", "SUSPENDED", tag);
    const traineeClaimingAdmin = await createUser(client, "spoofed", "TRAINEE", "ACTIVE", tag);
    const activeTrainee = await createUser(client, "limited", "TRAINEE", "ACTIVE", tag);
    const requestKey = `community-security-request-${tag}`;
    try {
      const suspended = await joinCommunity({
        userId: suspendedAdmin,
        userRole: "ADMIN",
        communityId: `missing-${tag}`,
        idempotencyKey: `suspended-${tag}`,
      });
      assert.deepEqual(suspended, { ok: false, error: "Not authorized." });

      const spoofed = await approveCommunityRequest({
        requestId: `missing-${tag}`,
        reviewerId: traineeClaimingAdmin,
        reviewerRole: "ADMIN",
      });
      assert.deepEqual(spoofed, { ok: false, error: "Not authorized." });

      const attempts = [];
      for (let index = 0; index < 6; index += 1) {
        attempts.push(
          await joinCommunity({
            userId: activeTrainee,
            userRole: "TRAINEE",
            communityId: `missing-${tag}-${index}`,
            idempotencyKey: `limited-${tag}-${index}`,
          }),
        );
      }
      assert.equal(attempts.slice(0, 5).every((result) => result.error === "Community not found."), true);
      assert.deepEqual(attempts[5], {
        ok: false,
        error: "Please wait before joining another community.",
      });

      const originalQueryRaw = db.$queryRaw;
      db.$queryRaw = async () => {
        throw new Error("simulated limiter outage");
      };
      try {
        const limiterFailure = await requestCommunity({
          userId: activeTrainee,
          userRole: "TRAINEE",
          idempotencyKey: requestKey,
          name: `Community ${tag}`,
          region: "Test Region",
          description: "A valid request that must not persist during an outage.",
        });
        assert.deepEqual(limiterFailure, {
          ok: false,
          error: "Please wait before requesting another community.",
        });
      } finally {
        db.$queryRaw = originalQueryRaw;
      }
      const persisted = await client.query('SELECT count(*)::int AS count FROM "CommunityRequest" WHERE "idempotencyKey" = $1', [requestKey]);
      assert.equal(persisted.rows[0].count, 0, "a limiter failure must not create a request");
    } finally {
      await client.query('DELETE FROM "RateLimitWindow" WHERE "bucketKey" = ANY($1::text[])', [
        [rateBucket("join", activeTrainee), rateBucket("request", activeTrainee)],
      ]);
      await client.query('DELETE FROM "CommunityRequest" WHERE "idempotencyKey" = $1', [requestKey]);
      await client.query('DELETE FROM "User" WHERE id = ANY($1::text[])', [
        [suspendedAdmin, traineeClaimingAdmin, activeTrainee],
      ]);
    }
  });
});
