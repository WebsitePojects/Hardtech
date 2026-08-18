import "dotenv/config";
import assert from "node:assert/strict";
import { test } from "node:test";
import pg from "pg";

const {
  approveForumPost,
  createForumPost,
  createForumReply,
  reportForumPost,
  togglePostBookmark,
  togglePostReaction,
} = await import("../../src/server/services/forum-write.service.ts");
const { listPosts } = await import("../../src/server/services/forum.service.ts");

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;

async function fixture() {
  const client = new pg.Client({ connectionString });
  await client.connect();
  const users = await client.query('SELECT id, email FROM "User" WHERE email IN ($1, $2, $3)', [
    "admin@gmail.com",
    "trainer@gmail.com",
    "trainee@gmail.com",
  ]);
  const byEmail = new Map(users.rows.map((row) => [row.email, row.id]));
  const post = await client.query('SELECT id, "authorId", "replyCount" FROM "ForumPost" WHERE status = $1 ORDER BY "createdAt" LIMIT 1', ["PUBLISHED"]);
  assert.ok(byEmail.get("admin@gmail.com"));
  assert.ok(byEmail.get("trainee@gmail.com"));
  assert.ok(post.rows[0]?.id);
  return {
    client,
    adminId: byEmail.get("admin@gmail.com"),
    traineeId: byEmail.get("trainee@gmail.com"),
    publishedPostAuthorId: post.rows[0].authorId,
    publishedPostId: post.rows[0].id,
    publishedPostReplyCount: post.rows[0].replyCount,
  };
}

test("forum writes are duplicate-safe and trainee posts stay private until approval", async () => {
  assert.ok(connectionString, "database connection is configured");
  const { client, adminId, traineeId, publishedPostAuthorId, publishedPostId, publishedPostReplyCount } = await fixture();
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const title = `Forum mutation ${suffix}`;
  const sequentialPostKey = `post-${suffix}`;
  const concurrentPostKey = `post-concurrent-${suffix}`;
  const sequentialReplyKey = `reply-${suffix}`;
  const concurrentReplyKey = `reply-concurrent-${suffix}`;
  const replyAuthorId = publishedPostAuthorId === adminId ? traineeId : adminId;
  const replyNotificationUserId = publishedPostAuthorId;
  const testStartedAt = new Date();
  const replyNotificationWhere = [replyNotificationUserId, "New reply on your post", `/forum/${publishedPostId}`];
  let startingReplyNotificationCount = 0;
  let publishedPostCounters;
  let createdPostId;
  let concurrentCreatedPostId;
  try {
    await client.query('DELETE FROM "PostReaction" WHERE "postId" = $1 AND "userId" = $2 AND type IN ($3, $4)', [
      publishedPostId,
      traineeId,
      "UPVOTE",
      "HELPFUL",
    ]);
    await client.query('DELETE FROM "PostBookmark" WHERE "postId" = $1 AND "userId" = $2', [publishedPostId, traineeId]);
    await client.query('DELETE FROM "PostReport" WHERE "postId" = $1 AND "reporterId" = $2', [publishedPostId, traineeId]);
    await client.query(
      `UPDATE "ForumPost"
       SET
         "upvoteCount" = (SELECT count(*)::int FROM "PostReaction" WHERE "postId" = $1 AND type = $2),
         "helpfulCount" = (SELECT count(*)::int FROM "PostReaction" WHERE "postId" = $1 AND type = $3),
         "bookmarkCount" = (SELECT count(*)::int FROM "PostBookmark" WHERE "postId" = $1),
         "reportCount" = (SELECT count(*)::int FROM "PostReport" WHERE "postId" = $1)
       WHERE id = $1`,
      [publishedPostId, "UPVOTE", "HELPFUL"],
    );
    publishedPostCounters = (
      await client.query(
        'SELECT "replyCount", "upvoteCount", "helpfulCount", "bookmarkCount", "reportCount" FROM "ForumPost" WHERE id = $1',
        [publishedPostId],
      )
    ).rows[0];
    startingReplyNotificationCount = (
      await client.query('SELECT count(*)::int AS count FROM "Notification" WHERE "userId" = $1 AND title = $2 AND "linkUrl" = $3', replyNotificationWhere)
    ).rows[0].count;

    const postInput = {
      idempotencyKey: sequentialPostKey,
      title,
      body: "A trainee post awaiting moderation.",
      category: "GENERAL_DISCUSSION",
      hashtags: ["test"],
    };
    const created = await createForumPost(postInput, traineeId);
    const replayed = await createForumPost(postInput, traineeId);
    assert.equal(created.ok, true);
    assert.equal(replayed.ok, true);
    createdPostId = (await client.query('SELECT id FROM "ForumPost" WHERE title = $1', [title])).rows[0].id;
    assert.equal((await client.query('SELECT count(*)::int AS count FROM "ForumPost" WHERE "idempotencyKey" = $1', [sequentialPostKey])).rows[0].count, 1);
    assert.equal((await listPosts({ viewerId: adminId })).some((post) => post.id === createdPostId), false);

    const concurrentPostInput = {
      ...postInput,
      idempotencyKey: concurrentPostKey,
      title: `Forum mutation concurrent ${suffix}`,
    };
    const concurrentPosts = await Promise.all([
      createForumPost(concurrentPostInput, traineeId),
      createForumPost(concurrentPostInput, traineeId),
    ]);
    assert.equal(concurrentPosts.every((result) => result.ok), true);
    const concurrentPostRows = await client.query('SELECT id FROM "ForumPost" WHERE "idempotencyKey" = $1', [concurrentPostKey]);
    assert.equal(concurrentPostRows.rowCount, 1);
    concurrentCreatedPostId = concurrentPostRows.rows[0].id;

    const replyInput = {
      idempotencyKey: sequentialReplyKey,
      postId: publishedPostId,
      body: `Sequential reply ${suffix}`,
    };
    const replyOne = await createForumReply(replyInput, replyAuthorId);
    const replyTwo = await createForumReply(replyInput, replyAuthorId);
    assert.equal(replyOne.ok, true);
    assert.equal(replyTwo.ok, true);
    assert.equal((await client.query('SELECT count(*)::int AS count FROM "Reply" WHERE "idempotencyKey" = $1', [sequentialReplyKey])).rows[0].count, 1);
    assert.equal((await client.query('SELECT "replyCount" FROM "ForumPost" WHERE id = $1', [publishedPostId])).rows[0].replyCount, publishedPostReplyCount + 1);
    assert.equal((await client.query('SELECT count(*)::int AS count FROM "Notification" WHERE "userId" = $1 AND title = $2 AND "linkUrl" = $3', replyNotificationWhere)).rows[0].count, startingReplyNotificationCount + 1);

    const concurrentReplyInput = {
      idempotencyKey: concurrentReplyKey,
      postId: publishedPostId,
      body: `Concurrent reply ${suffix}`,
    };
    const concurrentReplies = await Promise.all([
      createForumReply(concurrentReplyInput, replyAuthorId),
      createForumReply(concurrentReplyInput, replyAuthorId),
    ]);
    assert.equal(concurrentReplies.every((result) => result.ok), true);
    assert.equal((await client.query('SELECT count(*)::int AS count FROM "Reply" WHERE "idempotencyKey" = $1', [concurrentReplyKey])).rows[0].count, 1);
    assert.equal((await client.query('SELECT "replyCount" FROM "ForumPost" WHERE id = $1', [publishedPostId])).rows[0].replyCount, publishedPostReplyCount + 2);
    assert.equal((await client.query('SELECT count(*)::int AS count FROM "Notification" WHERE "userId" = $1 AND title = $2 AND "linkUrl" = $3', replyNotificationWhere)).rows[0].count, startingReplyNotificationCount + 2);

    const reactionOne = await togglePostReaction(publishedPostId, traineeId, "UPVOTE");
    const reactionTwo = await togglePostReaction(publishedPostId, traineeId, "UPVOTE");
    assert.equal(reactionOne.ok, true);
    assert.equal(reactionTwo.ok, true);
    const reactionCount = await client.query('SELECT count(*)::int AS count FROM "PostReaction" WHERE "postId" = $1 AND "userId" = $2 AND type = $3', [publishedPostId, traineeId, "UPVOTE"]);
    assert.equal(reactionCount.rows[0].count, 0);

    await Promise.all([
      togglePostReaction(publishedPostId, traineeId, "HELPFUL"),
      togglePostReaction(publishedPostId, traineeId, "HELPFUL"),
    ]);
    const concurrentReactionCount = await client.query('SELECT count(*)::int AS count FROM "PostReaction" WHERE "postId" = $1 AND "userId" = $2 AND type = $3', [publishedPostId, traineeId, "HELPFUL"]);
    assert.equal(concurrentReactionCount.rows[0].count, 1);

    await togglePostBookmark(publishedPostId, traineeId);
    await togglePostBookmark(publishedPostId, traineeId);
    const bookmarkCount = await client.query('SELECT count(*)::int AS count FROM "PostBookmark" WHERE "postId" = $1 AND "userId" = $2', [publishedPostId, traineeId]);
    assert.equal(bookmarkCount.rows[0].count, 0);
    await Promise.all([
      togglePostBookmark(publishedPostId, traineeId),
      togglePostBookmark(publishedPostId, traineeId),
    ]);
    const concurrentBookmarkCount = await client.query('SELECT count(*)::int AS count FROM "PostBookmark" WHERE "postId" = $1 AND "userId" = $2', [publishedPostId, traineeId]);
    assert.equal(concurrentBookmarkCount.rows[0].count, 1);

    const reportOne = await reportForumPost(publishedPostId, traineeId, "OTHER", `note-${suffix}`);
    const reportTwo = await reportForumPost(publishedPostId, traineeId, "OTHER", `note-${suffix}`);
    assert.equal(reportOne.ok, true);
    assert.equal(reportTwo.ok, true);
    await Promise.all([
      reportForumPost(publishedPostId, traineeId, "OTHER", `note-${suffix}`),
      reportForumPost(publishedPostId, traineeId, "OTHER", `note-${suffix}`),
    ]);
    const reportCount = await client.query('SELECT count(*)::int AS count FROM "PostReport" WHERE "postId" = $1 AND "reporterId" = $2', [publishedPostId, traineeId]);
    assert.equal(reportCount.rows[0].count, 1);

    const approvals = await Promise.all([
      approveForumPost({ postId: createdPostId, moderatorId: adminId, moderatorRole: "ADMIN" }),
      approveForumPost({ postId: createdPostId, moderatorId: adminId, moderatorRole: "ADMIN" }),
    ]);
    assert.equal(approvals.filter((result) => result.ok).length, 1);
    assert.equal((await client.query('SELECT status FROM "ForumPost" WHERE id = $1', [createdPostId])).rows[0].status, "PUBLISHED");
    assert.equal((await client.query('SELECT count(*)::int AS count FROM "Notification" WHERE "userId" = $1 AND title = $2 AND "linkUrl" = $3', [traineeId, "Your forum post was approved", `/forum/${createdPostId}`])).rows[0].count, 1);
    assert.equal((await listPosts({ viewerId: adminId })).some((post) => post.id === createdPostId), true);
  } finally {
    if (createdPostId) await client.query('DELETE FROM "Notification" WHERE "userId" = $1 AND title = $2 AND "linkUrl" = $3', [traineeId, "Your forum post was approved", `/forum/${createdPostId}`]);
    if (createdPostId) await client.query('DELETE FROM "ForumPost" WHERE id = $1', [createdPostId]);
    if (concurrentCreatedPostId) await client.query('DELETE FROM "ForumPost" WHERE id = $1', [concurrentCreatedPostId]);
    await client.query('DELETE FROM "Reply" WHERE "idempotencyKey" IN ($1, $2)', [sequentialReplyKey, concurrentReplyKey]);
    await client.query('DELETE FROM "Notification" WHERE "userId" = $1 AND title = $2 AND "linkUrl" = $3 AND "createdAt" >= $4', [...replyNotificationWhere, testStartedAt]);
    await client.query('DELETE FROM "PostReaction" WHERE "postId" = $1 AND "userId" = $2 AND type IN ($3, $4)', [
      publishedPostId,
      traineeId,
      "UPVOTE",
      "HELPFUL",
    ]);
    await client.query('DELETE FROM "PostBookmark" WHERE "postId" = $1 AND "userId" = $2', [publishedPostId, traineeId]);
    await client.query('DELETE FROM "PostReport" WHERE "postId" = $1 AND "reporterId" = $2', [publishedPostId, traineeId]);
    await client.query(
      'UPDATE "ForumPost" SET "replyCount" = $1, "upvoteCount" = $2, "helpfulCount" = $3, "bookmarkCount" = $4, "reportCount" = $5 WHERE id = $6',
      [
        publishedPostCounters?.replyCount ?? publishedPostReplyCount,
        publishedPostCounters?.upvoteCount ?? 0,
        publishedPostCounters?.helpfulCount ?? 0,
        publishedPostCounters?.bookmarkCount ?? 0,
        publishedPostCounters?.reportCount ?? 0,
        publishedPostId,
      ],
    );
    await client.end();
  }
});
