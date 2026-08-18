import "dotenv/config";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { test } from "node:test";
import pg from "pg";

const {
  getOrCreateDirectConversation,
  getUnreadTotal,
  listConversations,
  listMessages,
  markConversationRead,
  sendMessage,
} = await import("../../src/server/services/messaging.service.ts");

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

function suffix() {
  return `${Date.now()}-${randomUUID().slice(0, 8)}`;
}

function directKeyFor(userA, userB) {
  return [userA, userB].sort().join(":");
}

async function createUser(client, label, role, testSuffix) {
  const id = `messaging-${label}-${testSuffix}`;
  await client.query(
    `INSERT INTO "User" (id, email, "passwordHash", "firstName", "lastName", role, status, "createdAt", "updatedAt")
     VALUES ($1, $2, 'test-only', $3, 'User', $4::"UserRole", 'ACTIVE', NOW(), NOW())`,
    [id, `${id}@example.com`, label, role],
  );
  return id;
}

async function createMessageAsset(client, ownerId, testSuffix, label) {
  const id = `messaging-asset-${label}-${testSuffix}`;
  await client.query(
    `INSERT INTO "MediaAsset" (id, "publicId", "resourceType", folder, url, bytes, format, "purgeState", "uploadedByUserId", "createdAt", "updatedAt")
     VALUES ($1, $2, 'IMAGE', 'hardtech/messages', $3, 256, 'png', 'ACTIVE', $4, NOW(), NOW())`,
    [id, `hardtech/messages/${id}`, `https://example.com/${id}.png`, ownerId],
  );
  return id;
}

async function cleanup(client, testSuffix) {
  await client.query('DELETE FROM "Conversation" WHERE "directKey" LIKE $1', [`%${testSuffix}%`]);
  await client.query('DELETE FROM "MediaAsset" WHERE id LIKE $1', [`messaging-asset-%-${testSuffix}`]);
  await client.query('DELETE FROM "User" WHERE id LIKE $1', [`messaging-%-${testSuffix}`]);
}

test("getOrCreateDirectConversation is duplicate-safe and rejects self-message", async () => {
  assert.ok(connectionString, "database connection is configured");
  await withClient(async (client) => {
    const testSuffix = suffix();
    const senderId = await createUser(client, "sender", "TRAINEE", testSuffix);
    const recipientId = await createUser(client, "recipient", "TRAINER", testSuffix);
    try {
      const first = await getOrCreateDirectConversation(senderId, recipientId);
      const second = await getOrCreateDirectConversation(senderId, recipientId);
      assert.equal(second.id, first.id, "sequential duplicate create returns the existing conversation");

      const concurrent = await Promise.all([
        getOrCreateDirectConversation(senderId, recipientId),
        getOrCreateDirectConversation(senderId, recipientId),
      ]);
      assert.equal(concurrent[0].id, first.id);
      assert.equal(concurrent[1].id, first.id);

      const key = directKeyFor(senderId, recipientId);
      const conversationCount = await one(
        client,
        'SELECT count(*)::int AS count FROM "Conversation" WHERE "directKey" = $1',
        [key],
      );
      assert.equal(conversationCount.count, 1);
      const participantCount = await one(
        client,
        'SELECT count(*)::int AS count FROM "ConversationParticipant" WHERE "conversationId" = $1',
        [first.id],
      );
      assert.equal(participantCount.count, 2);

      await assert.rejects(
        () => getOrCreateDirectConversation(senderId, senderId),
        /not available/i,
        "self-message must be rejected server-side",
      );
    } finally {
      await cleanup(client, testSuffix);
    }
  });
});

test("sendMessage is duplicate-safe, participant-scoped, and binds owned active attachments once", async () => {
  assert.ok(connectionString, "database connection is configured");
  await withClient(async (client) => {
    const testSuffix = suffix();
    const senderId = await createUser(client, "sender", "TRAINEE", testSuffix);
    const recipientId = await createUser(client, "recipient", "TRAINER", testSuffix);
    const outsiderId = await createUser(client, "outsider", "TRAINEE", testSuffix);
    const ownedAssetId = await createMessageAsset(client, senderId, testSuffix, "owned");
    const otherAssetId = await createMessageAsset(client, recipientId, testSuffix, "other");
    try {
      const conversation = await getOrCreateDirectConversation(senderId, recipientId);

      const scoped = await listMessages(conversation.id, outsiderId);
      assert.deepEqual(scoped, [], "non-participants get an empty list, not proof the conversation exists");

      const unauthorizedSend = await sendMessage({
        idempotencyKey: `unauthorized-${testSuffix}`,
        conversationId: conversation.id,
        senderId: outsiderId,
        body: "I should not land.",
        attachmentIds: [],
      });
      assert.equal(unauthorizedSend.ok, false);
      assert.equal(unauthorizedSend.error, "We could not send your message.");

      const badAttachment = await sendMessage({
        idempotencyKey: `bad-attachment-${testSuffix}`,
        conversationId: conversation.id,
        senderId,
        body: "This attachment is not mine.",
        attachmentIds: [otherAssetId],
      });
      assert.equal(badAttachment.ok, false);

      const input = {
        idempotencyKey: `send-sequential-${testSuffix}`,
        conversationId: conversation.id,
        senderId,
        body: "Sequential duplicate delivery.",
        attachmentIds: [ownedAssetId],
      };
      const first = await sendMessage(input);
      const second = await sendMessage(input);
      assert.equal(first.ok, true);
      assert.equal(second.ok, true);
      assert.equal(second.data.id, first.data.id);

      let messageCount = await one(
        client,
        'SELECT count(*)::int AS count FROM "Message" WHERE "idempotencyKey" = $1',
        [input.idempotencyKey],
      );
      assert.equal(messageCount.count, 1);
      let recipientParticipant = await one(
        client,
        'SELECT "unreadCount" FROM "ConversationParticipant" WHERE "conversationId" = $1 AND "userId" = $2',
        [conversation.id, recipientId],
      );
      assert.equal(recipientParticipant.unreadCount, 1, "sequential replay increments unread exactly once");
      let asset = await one(client, 'SELECT "messageId" FROM "MediaAsset" WHERE id = $1', [ownedAssetId]);
      assert.equal(asset.messageId, first.data.id);

      const concurrentInput = {
        idempotencyKey: `send-concurrent-${testSuffix}`,
        conversationId: conversation.id,
        senderId,
        body: "Concurrent duplicate delivery.",
        attachmentIds: [],
      };
      const concurrent = await Promise.all([sendMessage(concurrentInput), sendMessage(concurrentInput)]);
      assert.equal(concurrent.every((result) => result.ok), true);
      assert.equal(concurrent[0].data.id, concurrent[1].data.id);
      messageCount = await one(
        client,
        'SELECT count(*)::int AS count FROM "Message" WHERE "idempotencyKey" = $1',
        [concurrentInput.idempotencyKey],
      );
      assert.equal(messageCount.count, 1);
      recipientParticipant = await one(
        client,
        'SELECT "unreadCount" FROM "ConversationParticipant" WHERE "conversationId" = $1 AND "userId" = $2',
        [conversation.id, recipientId],
      );
      assert.equal(recipientParticipant.unreadCount, 2, "concurrent replay increments unread exactly once");

      const visible = await listConversations(recipientId);
      assert.equal(visible.some((item) => item.id === conversation.id), true);
      assert.equal(await getUnreadTotal(recipientId), 2);
    } finally {
      await cleanup(client, testSuffix);
    }
  });
});

test("markConversationRead is conditional, participant-scoped, and duplicate-safe", async () => {
  assert.ok(connectionString, "database connection is configured");
  await withClient(async (client) => {
    const testSuffix = suffix();
    const senderId = await createUser(client, "sender", "TRAINEE", testSuffix);
    const recipientId = await createUser(client, "recipient", "TRAINER", testSuffix);
    const outsiderId = await createUser(client, "outsider", "ADMIN", testSuffix);
    try {
      const conversation = await getOrCreateDirectConversation(senderId, recipientId);
      const sent = await sendMessage({
        idempotencyKey: `read-${testSuffix}`,
        conversationId: conversation.id,
        senderId,
        body: "Please mark this read once.",
        attachmentIds: [],
      });
      assert.equal(sent.ok, true);

      const outsider = await markConversationRead(conversation.id, outsiderId);
      assert.equal(outsider.updated, 0);
      let participant = await one(
        client,
        'SELECT "unreadCount" FROM "ConversationParticipant" WHERE "conversationId" = $1 AND "userId" = $2',
        [conversation.id, recipientId],
      );
      assert.equal(participant.unreadCount, 1);

      const first = await markConversationRead(conversation.id, recipientId);
      const second = await markConversationRead(conversation.id, recipientId);
      assert.equal(first.updated, 1);
      assert.equal(second.updated, 0);
      participant = await one(
        client,
        'SELECT "unreadCount", "lastReadMessageId" FROM "ConversationParticipant" WHERE "conversationId" = $1 AND "userId" = $2',
        [conversation.id, recipientId],
      );
      assert.equal(participant.unreadCount, 0);
      assert.equal(participant.lastReadMessageId, sent.data.id);
      const message = await one(client, 'SELECT "readAt", "deliveryState" FROM "Message" WHERE id = $1', [sent.data.id]);
      assert.ok(message.readAt);
      assert.equal(message.deliveryState, "SEEN");

      const secondSent = await sendMessage({
        idempotencyKey: `read-concurrent-${testSuffix}`,
        conversationId: conversation.id,
        senderId,
        body: "Please mark this read concurrently.",
        attachmentIds: [],
      });
      assert.equal(secondSent.ok, true);
      const concurrent = await Promise.all([
        markConversationRead(conversation.id, recipientId),
        markConversationRead(conversation.id, recipientId),
      ]);
      assert.equal(concurrent.filter((result) => result.updated === 1).length, 1);
      participant = await one(
        client,
        'SELECT "unreadCount" FROM "ConversationParticipant" WHERE "conversationId" = $1 AND "userId" = $2',
        [conversation.id, recipientId],
      );
      assert.equal(participant.unreadCount, 0);
    } finally {
      await cleanup(client, testSuffix);
    }
  });
});
