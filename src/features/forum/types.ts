import type {
  ForumAuthorSummary as ServiceForumAuthorSummary,
  ForumStats as ServiceForumStats,
  LeaderboardEntry as ServiceLeaderboardEntry,
  PostDetail,
  PostListItem,
  ReplyItem,
} from "@/server/services/forum.service";
import type { ForumCategory, ReactionType, ReportReason } from "@/../generated/prisma/enums";

export type ForumAuthorSummary = ServiceForumAuthorSummary;
export type ForumPostSummary = PostListItem;
export type ForumReplySummary = ReplyItem;
export type ForumPostDetail = PostDetail;
export type ForumStats = ServiceForumStats;
export type LeaderboardEntry = ServiceLeaderboardEntry;

export type ForumTab = "all" | "trending" | "communities" | "bookmarks";
export type ForumSort = "newest" | "most_active" | "most_viewed" | "most_reactions";

export interface ListPostsParams {
  tab: ForumTab;
  category?: ForumCategory;
  sort?: ForumSort;
  search?: string;
  /** Needed to resolve the Bookmarks tab and each card's bookmark state. */
  currentUserId?: string;
}

export const REACTION_TYPES = ["UPVOTE", "HELPFUL", "INSIGHTFUL"] as const satisfies readonly ReactionType[];

export const REPORT_REASONS = [
  "SPAM",
  "HARASSMENT",
  "MISINFORMATION",
  "OFF_TOPIC",
  "OTHER",
] as const satisfies readonly ReportReason[];

export const FORUM_CATEGORIES = [
  "GENERAL_DISCUSSION",
  "QA_HELP",
  "RESOURCES_TIPS",
  "TROUBLESHOOTING",
  "CAREER_JOBS",
  "ANNOUNCEMENTS",
] as const satisfies readonly ForumCategory[];

/** Verbatim labels transcribed from desktop-01.md #11 / desktop-02.md #28. */
export const CATEGORY_LABELS: Record<ForumCategory, string> = {
  GENERAL_DISCUSSION: "General Discussion",
  QA_HELP: "Q&A Help",
  RESOURCES_TIPS: "Resources & Tips",
  TROUBLESHOOTING: "Troubleshooting",
  CAREER_JOBS: "Career & Jobs",
  ANNOUNCEMENTS: "Announcements",
};

export const SORT_LABELS: Record<ForumSort, string> = {
  newest: "Newest",
  most_active: "Most Active",
  most_viewed: "Most Viewed",
  most_reactions: "Most Reactions",
};
