import { forumPostRepository } from "@/server/repositories/forum-post.repository";
import { notificationRepository } from "@/server/repositories/notification.repository";
import { postBookmarkRepository } from "@/server/repositories/post-bookmark.repository";
import { postReactionRepository } from "@/server/repositories/post-reaction.repository";
import { postReportRepository } from "@/server/repositories/post-report.repository";
import { replyRepository } from "@/server/repositories/reply.repository";
import { activeActor, verifiedActor } from "@/server/services/actor-verification.service";
import { checkRateLimit } from "@/server/auth/rate-limit";
import { Prisma, type ReactionType, type ReportReason, type UserRole } from "@/../generated/prisma/client";
import type {
  CreateForumPostInput,
  CreateForumReplyInput,
} from "@/server/schemas/forum-write.schema";

type WriteResult = { ok: true } | { ok: false; error: string };
type ToggleResult = WriteResult & { active?: boolean };

export type PendingPostListItem = {
  id: string;
  title: string;
  body: string;
  category: Prisma.ForumPostGetPayload<{ include: { author: true } }>["category"];
  hashtags: string[];
  createdAt: Date;
  author: { id: string; firstName: string; lastName: string };
};

function counterForReaction(type: ReactionType): "upvoteCount" | "helpfulCount" | "insightfulCount" {
  switch (type) {
    case "UPVOTE":
      return "upvoteCount";
    case "HELPFUL":
      return "helpfulCount";
    case "INSIGHTFUL":
      return "insightfulCount";
    default: {
      const exhaustive: never = type;
      return exhaustive;
    }
  }
}

/** Which roles may moderate the forum — the scope decision stays here; the
 * actual "is this actor really who they claim, and are they active" check
 * lives in the shared actor-verification service. */
const moderatorRoles: readonly UserRole[] = ["ADMIN", "TRAINER"];

function verifiedModerator(id: string, suppliedRole: UserRole): Promise<boolean> {
  return verifiedActor(id, suppliedRole, moderatorRoles);
}

function isUniqueViolation(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

async function consumeWriteBudget(actorId: string, operation: string): Promise<boolean> {
  try {
    // The limiter hashes this server-composed value before persistence. The
    // user id never reaches the database or logs in clear text.
    return (await checkRateLimit(`enroll:forum-${operation}:${actorId}`)).allowed;
  } catch {
    return false;
  }
}

export async function createForumPost(input: CreateForumPostInput, authorId: string): Promise<WriteResult> {
  const author = await activeActor(authorId);
  if (!author) return { ok: false, error: "You must be signed in to post." };
  if (!(await consumeWriteBudget(authorId, "post"))) {
    return { ok: false, error: "Please wait before posting again." };
  }

  let status: "PENDING_APPROVAL" | "PUBLISHED";
  switch (author.role) {
    case "TRAINEE":
      status = "PENDING_APPROVAL";
      break;
    case "TRAINER":
    case "ADMIN":
      status = "PUBLISHED";
      break;
    default: {
      const exhaustive: never = author.role;
      void exhaustive;
      return { ok: false, error: "Your account role cannot create forum posts." };
    }
  }

  try {
    await forumPostRepository.create({
      authorId,
      title: input.title,
      body: input.body,
      category: input.category,
      hashtags: input.hashtags,
      communityId: input.communityId,
      idempotencyKey: input.idempotencyKey,
      status,
    });
    return { ok: true };
  } catch (error) {
    if (isUniqueViolation(error)) {
      const existing = await forumPostRepository.findByIdempotencyKey(input.idempotencyKey);
      if (existing?.authorId === authorId) return { ok: true };
    }
    return { ok: false, error: "We could not publish your post." };
  }
}

export async function createForumReply(input: CreateForumReplyInput, authorId: string): Promise<WriteResult> {
  if (!(await activeActor(authorId))) return { ok: false, error: "You must be signed in to reply." };
  const replay = await replyRepository.findByIdempotencyKey(input.idempotencyKey);
  if (replay?.postId === input.postId && replay.authorId === authorId) return { ok: true };
  if (!(await consumeWriteBudget(authorId, "reply"))) {
    return { ok: false, error: "Please wait before replying again." };
  }
  const post = await forumPostRepository.findById(input.postId);
  if (!post || post.status !== "PUBLISHED") return { ok: false, error: "That post is not available." };
  if (input.parentReplyId) {
    const parent = await replyRepository.findById(input.parentReplyId);
    if (!parent || parent.postId !== post.id) return { ok: false, error: "That reply is not available." };
  }

  try {
    await forumPostRepository.transaction(async (client) => {
      await replyRepository.create(
        {
          postId: input.postId,
          authorId,
          body: input.body,
          parentReplyId: input.parentReplyId,
          idempotencyKey: input.idempotencyKey,
        },
        client,
      );
      await forumPostRepository.incrementCounter(input.postId, "replyCount", 1, client);
      if (post.authorId !== authorId) {
        await notificationRepository.create(
          {
            userId: post.authorId,
            title: "New reply on your post",
            body: "Someone replied to your forum post.",
            linkUrl: `/forum/${post.id}`,
          },
          client,
        );
      }
    });
    return { ok: true };
  } catch (error) {
    if (isUniqueViolation(error)) {
      const existing = await replyRepository.findByIdempotencyKey(input.idempotencyKey);
      if (existing?.postId === input.postId && existing.authorId === authorId) return { ok: true };
    }
    return { ok: false, error: "We could not post your reply." };
  }
}

export async function togglePostReaction(
  postId: string,
  userId: string,
  type: ReactionType,
  idempotencyKey?: string,
): Promise<ToggleResult> {
  if (!(await activeActor(userId))) return { ok: false, error: "You must be signed in to react." };
  if (!(await consumeWriteBudget(userId, "post-reaction"))) {
    return { ok: false, error: "Please wait before reacting again." };
  }
  const post = await forumPostRepository.findById(postId);
  if (!post || post.status !== "PUBLISHED") return { ok: false, error: "That post is not available." };
  const counter = counterForReaction(type);
  try {
    await forumPostRepository.transaction(async (client) => {
      const [result] = await postReactionRepository.toggle({ postId, userId, type, idempotencyKey }, client);
      if (result?.inserted === 1) {
        await forumPostRepository.incrementCounter(postId, counter, 1, client);
      } else if (result?.deleted === 1) {
        await forumPostRepository.incrementCounter(postId, counter, -1, client);
      }
    });
    return { ok: true };
  } catch {
    return { ok: false, error: "We could not update your reaction." };
  }
}

export async function toggleReplyReaction(
  replyId: string,
  userId: string,
  type: ReactionType,
  idempotencyKey?: string,
): Promise<ToggleResult> {
  if (!(await activeActor(userId))) return { ok: false, error: "You must be signed in to react." };
  if (!(await consumeWriteBudget(userId, "reply-reaction"))) {
    return { ok: false, error: "Please wait before reacting again." };
  }
  const reply = await replyRepository.findById(replyId);
  if (!reply) return { ok: false, error: "That reply is not available." };
  const counter = counterForReaction(type);
  try {
    await forumPostRepository.transaction(async (client) => {
      const [result] = await replyRepository.toggleReaction({ replyId, userId, type, idempotencyKey }, client);
      if (result?.inserted === 1) {
        await replyRepository.incrementCounter(replyId, counter, 1, client);
      } else if (result?.deleted === 1) {
        await replyRepository.incrementCounter(replyId, counter, -1, client);
      }
    });
    return { ok: true };
  } catch {
    return { ok: false, error: "We could not update your reaction." };
  }
}

export async function togglePostBookmark(postId: string, userId: string, idempotencyKey?: string): Promise<ToggleResult> {
  if (!(await activeActor(userId))) return { ok: false, error: "You must be signed in to bookmark posts." };
  if (!(await consumeWriteBudget(userId, "bookmark"))) {
    return { ok: false, error: "Please wait before bookmarking again." };
  }
  const post = await forumPostRepository.findById(postId);
  if (!post || post.status !== "PUBLISHED") return { ok: false, error: "That post is not available." };
  try {
    await forumPostRepository.transaction(async (client) => {
      const [result] = await postBookmarkRepository.toggle({ postId, userId, idempotencyKey }, client);
      if (result?.inserted === 1) {
        await forumPostRepository.incrementCounter(postId, "bookmarkCount", 1, client);
      } else if (result?.deleted === 1) {
        await forumPostRepository.incrementCounter(postId, "bookmarkCount", -1, client);
      }
    });
    return { ok: true };
  } catch {
    return { ok: false, error: "We could not update your bookmark." };
  }
}

export async function reportForumPost(
  postId: string,
  reporterId: string,
  reason: ReportReason,
  note?: string,
): Promise<WriteResult> {
  if (!(await activeActor(reporterId))) return { ok: false, error: "You must be signed in to report posts." };
  if (!(await consumeWriteBudget(reporterId, "report"))) {
    return { ok: false, error: "Please wait before reporting again." };
  }
  const post = await forumPostRepository.findById(postId);
  if (!post || post.status !== "PUBLISHED") return { ok: false, error: "That post is not available." };
  try {
    await forumPostRepository.transaction(async (client) => {
      const inserted = await postReportRepository.createIfAbsent({ postId, reporterId, reason, note }, client);
      if (inserted.length === 1) {
        await forumPostRepository.incrementCounter(postId, "reportCount", 1, client);
      }
    });
    return { ok: true };
  } catch {
    return { ok: false, error: "We could not submit your report." };
  }
}

export async function approveForumPost(input: {
  postId: string;
  moderatorId: string;
  moderatorRole: UserRole;
}): Promise<WriteResult> {
  if (!(await verifiedModerator(input.moderatorId, input.moderatorRole))) {
    return { ok: false, error: "You are not allowed to moderate forum posts." };
  }
  if (!(await consumeWriteBudget(input.moderatorId, "moderate"))) {
    return { ok: false, error: "Please wait before moderating another post." };
  }
  const post = await forumPostRepository.findById(input.postId);
  if (!post || post.status !== "PENDING_APPROVAL") return { ok: false, error: "That post is no longer pending." };
  if (post.authorId === input.moderatorId) return { ok: false, error: "You cannot approve your own post." };

  try {
    const changed = await forumPostRepository.transaction(async (client) => {
      const result = await forumPostRepository.updatePendingToPublished(input.postId, input.moderatorId, client);
      if (result.count !== 1) return false;
      await notificationRepository.create(
        {
          userId: post.authorId,
          title: "Your forum post was approved",
          body: "Your post is now visible on the forum.",
          linkUrl: `/forum/${post.id}`,
        },
        client,
      );
      return true;
    });
    return changed ? { ok: true } : { ok: false, error: "That post is no longer pending." };
  } catch {
    return { ok: false, error: "We could not approve that post." };
  }
}

export async function rejectForumPost(input: {
  postId: string;
  moderatorId: string;
  moderatorRole: UserRole;
  reason?: string;
}): Promise<WriteResult> {
  if (!(await verifiedModerator(input.moderatorId, input.moderatorRole))) {
    return { ok: false, error: "You are not allowed to moderate forum posts." };
  }
  if (!(await consumeWriteBudget(input.moderatorId, "moderate"))) {
    return { ok: false, error: "Please wait before moderating another post." };
  }
  try {
    const changed = await forumPostRepository.transaction(async (client) => {
      const result = await forumPostRepository.updatePendingToRejected(input.postId, client);
      return result.count === 1;
    });
    return changed ? { ok: true } : { ok: false, error: "That post is no longer pending." };
  } catch {
    return { ok: false, error: "We could not reject that post." };
  }
}

export async function listPendingForumPosts(viewerId: string, viewerRole: UserRole): Promise<PendingPostListItem[]> {
  if (!(await verifiedModerator(viewerId, viewerRole))) return [];
  const posts = await forumPostRepository.findPendingWithAuthor();
  return posts.map((post) => ({
    id: post.id,
    title: post.title,
    body: post.body,
    category: post.category,
    hashtags: post.hashtags,
    createdAt: post.createdAt,
    author: { id: post.author.id, firstName: post.author.firstName, lastName: post.author.lastName },
  }));
}
