import Link from "next/link";
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
 * #28-31). Centralized deliberately (per the messaging-feature brief) so a
 * "message this author" entry point only needs editing here, not at every
 * call site.
 *
 * DECISION: the AVATAR is the click target for `/messages/new?to={author.id}`,
 * the name stays plain text. Reasoning:
 *   - Avatar-click-to-profile-or-DM is the dominant convention (Reddit,
 *     Discourse, Slack) and this app has no author profile page for the
 *     avatar to go to instead, so "start a DM" is the only useful
 *     destination for it.
 *   - The name sits directly beside a role badge and a rating/post-count
 *     line that are plain text — making the name a link too would put two
 *     differently-styled clickable targets side by side for the same
 *     destination, which reads as visual noise rather than affordance.
 *     Picking one target consistently matters more than which one.
 *
 * KNOWN GAP: this component has no "is this the viewing user" concept —
 * `ForumAuthorSummary` carries no viewer context, and no call site
 * (post-card.tsx, reply-card.tsx) passes one. `currentUserId` below is
 * therefore optional and, until a caller passes it, a user CAN see a
 * "message" affordance on their own posts. The self-message guard is
 * enforced server-side regardless (src/app/(app)/messages/new/page.tsx
 * redirects `to === session.userId` back to /messages), so this gap is a
 * UX rough edge, not a security hole — flagged for whoever wires viewer
 * context through the forum call sites next.
 */
export function AuthorRow({
  author,
  createdAt,
  compact = false,
  currentUserId,
}: {
  author: ForumAuthorSummary;
  createdAt?: string | Date;
  compact?: boolean;
  currentUserId?: string;
}) {
  const initials = `${author.firstName[0] ?? ""}${author.lastName[0] ?? ""}`.toUpperCase();
  const isViewingOwnRow = currentUserId !== undefined && currentUserId === author.id;
  const avatarSize = compact ? "sm" : "default";
  const avatarNode = (
    <Avatar size={avatarSize}>
      <AvatarFallback className="bg-primary/15 font-semibold text-primary">
        {initials}
      </AvatarFallback>
    </Avatar>
  );

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {isViewingOwnRow ? (
        avatarNode
      ) : (
        <Link
          href={`/messages/new?to=${encodeURIComponent(author.id)}`}
          aria-label={`Message ${author.firstName} ${author.lastName}`}
          className="rounded-full transition-opacity hover:opacity-80"
        >
          {avatarNode}
        </Link>
      )}
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
