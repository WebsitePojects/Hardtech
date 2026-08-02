import { forumPostRepository } from "@/server/repositories/forum-post.repository";
import { notificationRepository } from "@/server/repositories/notification.repository";
import { postBookmarkRepository } from "@/server/repositories/post-bookmark.repository";
import { postReactionRepository } from "@/server/repositories/post-reaction.repository";
import { postReportRepository } from "@/server/repositories/post-report.repository";
import { replyRepository } from "@/server/repositories/reply.repository";
import { userRepository } from "@/server/repositories/user.repository";
import type { Prisma, ReactionType, ReportReason, UserRole } from "@/../generated/prisma/client";
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

function canModerate(role: UserRole): boolean {
  return role === "ADMIN" || role === "TRAINER";
}

async function verifiedModerator(id: string, suppliedRole: UserRole): Promise<boolean> {
  if (!canModerate(suppliedRole)) return false;
  const user = await userRepository.findById(id);
  return user?.role === suppliedRole && canModerate(user.role);
}

export async function createForumPost(input: CreateForumPostInput, authorId: string): Promise<WriteResult> {
  const author = await userRepository.findById(authorId);
  if (!author) return { ok: false, error: "You must be signed in to post." };

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
      status,
    });
    return { ok: true };
  } catch {
    return { ok: false, error: "We could not publish your post." };
  }
}

export async function createForumReply(input: CreateForumReplyInput, authorId: string): Promise<WriteResult> {
  const post = await forumPostRepository.findById(input.postId);
  if (!post || post.status !== "PUBLISHED") return { ok: false, error: "That post is not available." };

  try {
    await forumPostRepository.transaction(async (client) => {
      await replyRepository.create(
        { postId: input.postId, authorId, body: input.body, parentReplyId: input.parentReplyId },
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
  } catch {
    return { ok: false, error: "We could not post your reply." };
  }
}

export async function togglePostReaction(
  postId: string,
  userId: string,
  type: ReactionType,
): Promise<ToggleResult> {
  const post = await forumPostRepository.findById(postId);
  if (!post || post.status !== "PUBLISHED") return { ok: false, error: "That post is not available." };
  const counter = counterForReaction(type);
  try {
    await forumPostRepository.transaction(async (client) => {
      const [result] = await postReactionRepository.toggle({ postId, userId, type }, client);
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
): Promise<ToggleResult> {
  const reply = await replyRepository.findById(replyId);
  if (!reply) return { ok: false, error: "That reply is not available." };
  const counter = counterForReaction(type);
  try {
    await forumPostRepository.transaction(async (client) => {
      const [result] = await replyRepository.toggleReaction({ replyId, userId, type }, client);
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

export async function togglePostBookmark(postId: string, userId: string): Promise<ToggleResult> {
  const post = await forumPostRepository.findById(postId);
  if (!post || post.status !== "PUBLISHED") return { ok: false, error: "That post is not available." };
  try {
    await forumPostRepository.transaction(async (client) => {
      const [result] = await postBookmarkRepository.toggle({ postId, userId }, client);
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
