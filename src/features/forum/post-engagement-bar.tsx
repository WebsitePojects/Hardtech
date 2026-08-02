import { Eye, MessageCircle } from "lucide-react";
import Link from "next/link";

import { ReactionButton } from "./reaction-button";
import { BookmarkButton } from "./bookmark-button";
import { ReportDialog } from "./report-dialog";
import type { ForumPostSummary } from "./types";

/**
 * Footer icon row on every post card and the post detail page
 * (desktop-01.md #11-13: "upvote count, helpful count, insight marker, view
 * count, reply count, bookmark, report" — desktop-02.md #30 open question 5
 * notes the exact icon-to-meaning mapping wasn't fully certain from static
 * screenshots; this uses ThumbsUp/upvote, CheckCircle/helpful,
 * Lightbulb/insightful, matching the design-source doc's own phrasing).
 * Views and reply-count are read-only; the rest are guarded mutating
 * controls (see reaction-button.tsx, bookmark-button.tsx, report-dialog.tsx).
 */
export function PostEngagementBar({ post }: { post: ForumPostSummary }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-glass-border pt-2.5 text-[11px] text-muted-foreground">
      <div className="flex items-center gap-1">
        <ReactionButton
          label="Upvote"
          count={post.counts.upvote}
          postId={post.id}
          reactionType="UPVOTE"
        />
        <ReactionButton
          label="Mark helpful"
          count={post.counts.helpful}
          postId={post.id}
          reactionType="HELPFUL"
        />
        <ReactionButton
          label="Mark insightful"
          count={post.counts.insightful}
          postId={post.id}
          reactionType="INSIGHTFUL"
        />
      </div>

      <div className="flex items-center gap-3">
        <span className="inline-flex items-center gap-1">
          <Eye className="size-3.5" aria-hidden />
          {post.counts.view}
        </span>
        <Link
          href={`/forum/${post.id}`}
          className="inline-flex items-center gap-1 transition-colors hover:text-foreground"
        >
          <MessageCircle className="size-3.5" aria-hidden />
          {post.counts.reply} {post.counts.reply === 1 ? "reply" : "replies"}
        </Link>
        <BookmarkButton postId={post.id} isBookmarked={post.viewer?.hasBookmarked ?? false} />
        <ReportDialog postId={post.id} />
      </div>
    </div>
  );
}
