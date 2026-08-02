import { AuthorRow } from "./author-row";
import { ReplyReactionButton } from "./reply-reaction-button";
import type { ForumReplySummary } from "./types";

/**
 * One reply in a post's thread (mobile-01.md #29-30): green left accent bar
 * marking it as nested under the post, author row, body, and a read-only
 * reaction count footer (voting on a reply is out of this wave's confirmed
 * scope — only post-level reactions were specified as mutating controls in
 * docs/contracts/wave-2-app.md).
 */
export function ReplyCard({ reply }: { reply: ForumReplySummary }) {
  return (
    <div className="space-y-2 rounded-lg border-l-2 border-primary bg-surface-secondary/40 p-4">
      <AuthorRow author={reply.author} createdAt={reply.createdAt} compact />
      <p className="text-sm whitespace-pre-line text-foreground/90">{reply.body}</p>
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <ReplyReactionButton replyId={reply.id} type="UPVOTE" count={reply.counts.upvote} label="Upvote reply" />
        <ReplyReactionButton replyId={reply.id} type="HELPFUL" count={reply.counts.helpful} label="Mark reply helpful" />
        <ReplyReactionButton replyId={reply.id} type="INSIGHTFUL" count={reply.counts.insightful} label="Mark reply insightful" />
      </div>
    </div>
  );
}
