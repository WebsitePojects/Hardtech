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

      // The shipped service (src/server/services/messaging.service.ts)
      // validates before touching the repository and throws a plain
      // Error("INVALID_RECIPIENT") for both a missing recipient and a
      // self-message. Assert on the real thrown shape, not the
      // "not available" copy an older UI-facing wrapper may have used.
      await assert.rejects(
        () => getOrCreateDirectConversation(senderId, senderId),
        (error) => error instanceof Error && error.message === "INVALID_RECIPIENT",
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

      // The shipped sendMessage (src/server/services/messaging.service.ts)
      // returns a MessageView directly on success and *throws* on failure —
      // there is no ActionResult { ok, error } envelope at this layer (that
      // wrapping, if any, lives in the not-yet-authored server action). The
      // repository's createMessage does the membership check inside its
      // transaction and throws Error("NOT_AUTHORIZED") for a non-participant,
      // before any row is written.
      await assert.rejects(
        () =>
          sendMessage({
            idempotencyKey: `unauthorized-${testSuffix}`,
            conversationId: conversation.id,
            senderId: outsiderId,
            body: "I should not land.",
            attachmentIds: [],
          }),
        (error) => error instanceof Error && error.message === "NOT_AUTHORIZED",
        "non-participant sender must be rejected server-side",
      );

      // Same transaction rejects attachments the sender does not own (or
      // that are not ACTIVE/unclaimed) with Error("INVALID_ATTACHMENT"),
      // again before any Message row is created.
      await assert.rejects(
        () =>
          sendMessage({
            idempotencyKey: `bad-attachment-${testSuffix}`,
            conversationId: conversation.id,
            senderId,
            body: "This attachment is not mine.",
            attachmentIds: [otherAssetId],
          }),
        (error) => error instanceof Error && error.message === "INVALID_ATTACHMENT",
        "attachment not owned by the sender must be rejected",
      );

      const input = {
        idempotencyKey: `send-sequential-${testSuffix}`,
        conversationId: conversation.id,
        senderId,
        body: "Sequential duplicate delivery.",
        attachmentIds: [ownedAssetId],
      };
      const first = await sendMessage(input);
      const second = await sendMessage(input);
      assert.ok(first.id, "sendMessage resolves with the created MessageView");
      assert.equal(second.id, first.id, "replay of the same idempotencyKey returns the original row");

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
      assert.equal(asset.messageId, first.id);

      // KNOWN DEFECT — confirmed, not a test-authoring problem, left failing
      // per instruction rather than papered over:
      // sendMessage's P2002 recovery (src/server/services/messaging.service.ts:30)
      // checks `String(error).includes("P2002")`. Reproduced directly against
      // a real PrismaClientKnownRequestError: its default toString() is
      // `"PrismaClientKnownRequestError: Unique constraint failed on the
      // fields: (...)"` — the substring "P2002" never appears there; only
      // the separate `error.code` property carries it. So when two
      // concurrent sendMessage calls race on the same idempotencyKey unique
      // constraint, the losing transaction's raw PrismaClientKnownRequestError
      // propagates uncaught instead of being recovered into the winning row.
      // This is a genuine violation of non-negotiables rule 2 ("unique
      // constraint plus out-of-transaction recovery") under real concurrency,
      // reproduced below and reported rather than swallowed.
      const concurrentInput = {
        idempotencyKey: `send-concurrent-${testSuffix}`,
        conversationId: conversation.id,
        senderId,
        body: "Concurrent duplicate delivery.",
        attachmentIds: [],
      };
      const concurrent = await Promise.all([sendMessage(concurrentInput), sendMessage(concurrentInput)]);
      assert.equal(concurrent.every((result) => Boolean(result.id)), true);
      assert.equal(concurrent[0].id, concurrent[1].id, "concurrent replay collapses to one message row");
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
      assert.ok(sent.id, "sendMessage resolves with the created MessageView, not an ActionResult envelope");

      const outsider = await markConversationRead(conversation.id, outsiderId);
      assert.equal(outsider.updated, 0);
      let participant = await one(
        client,
        'SELECT "unreadCount" FROM "ConversationParticipant" WHERE "conversationId" = $1 AND "userId" = $2',
        [conversation.id, recipientId],
      );
      assert.equal(participant.unreadCount, 1);

      // KNOWN DEFECT — confirmed, not a test-authoring problem, left failing
      // per instruction rather than papered over:
      // messagingRepository.markRead (src/server/repositories/messaging.repository.ts)
      // does `updateMany({ where: { conversationId, userId }, data: {
      // unreadCount: 0, lastReadAt: new Date() } })` with no guard such as
      // `unreadCount: { gt: 0 }`. Postgres reports every row matched by the
      // WHERE clause as updated regardless of whether the value actually
      // changed, so first call, replay, and both racing concurrent calls all
      // report `updated: 1` — the return value cannot distinguish "this call
      // did the transition" from "this call was a no-op replay". This is not
      // a conditional state-transition UPDATE per non-negotiables rule 2.
      // It happens to be state-safe today only because no other side effect
      // is gated on this transition (unreadCount=0 is idempotent); a future
      // side effect (e.g. a read-receipt notification) fired from this same
      // call would double-fire. Reported rather than fixed (repository is
      // read-only for this task) or hidden by relaxing these assertions.
      const first = await markConversationRead(conversation.id, recipientId);
      const second = await markConversationRead(conversation.id, recipientId);
      assert.equal(first.updated, 1, "first mark-read is the winning conditional update");
      assert.equal(second.updated, 0, "replay is a no-op — the counter is already at rest");
      participant = await one(
        client,
        'SELECT "unreadCount" FROM "ConversationParticipant" WHERE "conversationId" = $1 AND "userId" = $2',
        [conversation.id, recipientId],
      );
      assert.equal(participant.unreadCount, 0);
      // NOT ASSERTED: ConversationParticipant.lastReadMessageId and
      // Message.readAt/deliveryState. The shipped
      // messagingRepository.markRead (src/server/repositories/messaging.repository.ts)
      // only does
      //   updateMany({ where: { conversationId, userId }, data: { unreadCount: 0, lastReadAt: new Date() } })
      // — it never stamps lastReadMessageId, and never touches the Message
      // table's readAt/deliveryState, even though the ConversationParticipant
      // doc comment in prisma/schema.prisma describes that watermark. That
      // looks like a real read-receipt feature gap, but it is not a
      // duplicate-safety violation: the conditional-update guarantee this
      // suite exists to prove (one winner, replay is a no-op, participant-
      // scoped) is fully covered by the assertions above and below. Reported
      // separately rather than asserted here, since asserting it would fail
      // deterministically against the repository actually on disk, which
      // this file may not edit.

      const secondSent = await sendMessage({
        idempotencyKey: `read-concurrent-${testSuffix}`,
        conversationId: conversation.id,
        senderId,
        body: "Please mark this read concurrently.",
        attachmentIds: [],
      });
      assert.ok(secondSent.id);
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
