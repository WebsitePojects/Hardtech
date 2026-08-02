import { FileText } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { RoleBadge } from "./author-badges";
import { RatingStars } from "./rating-stars";
import { formatPostAge } from "./format-age";
import type { ForumAuthorSummary } from "./types";

/**
 * Shared "avatar + name + role badge + status badge + star rating + post
 * count + age" byline row used on every post card, the post detail page, and
 * (without the age) the leaderboard (desktop-01.md #11-13, desktop-02.md
 * #28-31).
 */
export function AuthorRow({
  author,
  createdAt,
  compact = false,
}: {
  author: ForumAuthorSummary;
  createdAt?: string | Date;
  compact?: boolean;
}) {
  const initials = `${author.firstName[0] ?? ""}${author.lastName[0] ?? ""}`.toUpperCase();

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <Avatar size={compact ? "sm" : "default"}>
        <AvatarFallback className="bg-primary/15 font-semibold text-primary">
          {initials}
        </AvatarFallback>
      </Avatar>
      <span className="font-sub text-xs font-semibold text-foreground">
        {author.firstName} {author.lastName}
      </span>
      <RoleBadge role={author.role} />
      {/* TODO(orchestrator): forum.service lacks author reputationBadge */}
      <span className="flex flex-wrap items-center gap-1.5 text-[10px] text-muted-foreground">
        <RatingStars average={author.ratingAverage} count={author.ratingCount} />
        <span className="inline-flex items-center gap-1">
          <FileText className="size-3.5" aria-hidden />
          {author.postCount} {author.postCount === 1 ? "post" : "posts"}
        </span>
        {createdAt ? <span>{formatPostAge(createdAt)}</span> : null}
      </span>
    </div>
  );
}
