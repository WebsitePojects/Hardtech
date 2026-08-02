import Link from "next/link";
import { Pin, TrendingUp } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { AuthorRow } from "./author-row";
import { CATEGORY_BADGE_CLASS, CATEGORY_ICONS, categoryLabel } from "./category-meta";
import { PostEngagementBar } from "./post-engagement-bar";
import type { ForumPostSummary } from "./types";

/**
 * One forum post card (desktop-01.md #11-13, desktop-02.md #28-31,
 * mobile-01.md #24-27). Pinned and Trending are independent flags and can
 * both appear on the same post (desktop-02.md #31).
 */
export function PostCard({ post }: { post: ForumPostSummary }) {
  const CategoryIcon = post.category ? CATEGORY_ICONS[post.category] : null;

  return (
    <Card className="border border-glass-border bg-surface-card ring-0 transition-colors hover:border-[var(--glass-border-strong)]">
      <CardContent className="space-y-2.5 p-4 sm:p-[18px]">
        {post.isPinned || post.isTrending ? (
          <div className="flex flex-wrap gap-2">
            {post.isPinned ? (
              <Badge className="border-brand-orange/40 bg-brand-orange/10 text-brand-orange">
                <Pin className="size-3" aria-hidden /> PINNED
              </Badge>
            ) : null}
            {post.isTrending ? (
              <Badge className="border-brand-orange/40 bg-brand-orange/10 text-brand-orange">
                <TrendingUp className="size-3" aria-hidden /> TRENDING
              </Badge>
            ) : null}
          </div>
        ) : null}

        <div className="flex flex-wrap items-start justify-between gap-3">
          <AuthorRow author={post.author} createdAt={post.createdAt} />
          {post.category ? (
            <Badge variant="outline" className={cn("shrink-0 gap-1", CATEGORY_BADGE_CLASS[post.category])}>
              {CategoryIcon ? <CategoryIcon className="size-3" aria-hidden /> : null}
              {categoryLabel(post.category)}
            </Badge>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <Link href={`/forum/${post.id}`} className="block">
            <h3 className="font-heading text-base font-semibold leading-snug text-foreground hover:text-primary sm:text-[15px]">
              {post.title}
            </h3>
          </Link>
          <p className="line-clamp-2 text-[13px] leading-relaxed text-muted-foreground">{post.body}</p>
        </div>

        {post.hashtags.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {post.hashtags.map((tag) => (
            <span key={tag} className="rounded border border-glass-border bg-glass px-1.5 py-0.5 text-[10px] text-muted-foreground">
                #{tag}
              </span>
            ))}
          </div>
        ) : null}

        <PostEngagementBar post={post} />
      </CardContent>
    </Card>
  );
}
