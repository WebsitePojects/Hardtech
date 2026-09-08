import "dotenv/config";
import assert from "node:assert/strict";
import { createHash, randomUUID } from "node:crypto";
import { test } from "node:test";
import pg from "pg";

const { getOrCreateDirectConversation, sendMessage } =
  await import("../../src/server/services/messaging.service.ts");

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;

function suffix() {
  return `${Date.now()}-${randomUUID().slice(0, 8)}`;
}

function rateBucket(operation, userId) {
  return createHash("sha256").update(`enroll:messages-${operation}:${userId}`).digest("hex");
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

async function createUser(client, label, role, tag) {
  const id = `messaging-security-${label}-${tag}`;
  await client.query(
    `INSERT INTO "User" (id, email, "passwordHash", "firstName", "lastName", role, status, "createdAt", "updatedAt")
     VALUES ($1, $2, 'test-only', 'Messaging', $3, $4::"UserRole", 'ACTIVE', NOW(), NOW())`,
    [id, `${id}@example.com`, label, role],
  );
  return id;
}

test("message writes reject users suspended after a conversation was created", async () => {
  assert.ok(connectionString, "database connection is configured");
  await withClient(async (client) => {
    const tag = suffix();
    const senderId = await createUser(client, "sender", "TRAINEE", tag);
    const recipientId = await createUser(client, "recipient", "TRAINER", tag);
    try {
      const conversation = await getOrCreateDirectConversation(senderId, recipientId);
      await client.query('UPDATE "User" SET status = $1::"UserStatus" WHERE id = $2', ["SUSPENDED", senderId]);
      await assert.rejects(
        () => sendMessage({
          idempotencyKey: `suspended-send-${tag}`,
          conversationId: conversation.id,
          senderId,
          body: "This must not be sent.",
          attachmentIds: [],
        }),
        (error) => error instanceof Error && error.message === "NOT_AUTHORIZED",
      );
      const count = await client.query('SELECT count(*)::int AS count FROM "Message" WHERE "conversationId" = $1', [conversation.id]);
      assert.equal(count.rows[0].count, 0);
    } finally {
      await client.query('DELETE FROM "Conversation" WHERE "directKey" LIKE $1', [`%${tag}%`]);
      await client.query('DELETE FROM "RateLimitWindow" WHERE "bucketKey" = $1', [
        rateBucket("conversation", senderId),
      ]);
      await client.query('DELETE FROM "User" WHERE id = ANY($1::text[])', [[senderId, recipientId]]);
    }
  });
});
