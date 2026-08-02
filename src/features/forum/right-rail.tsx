import Link from "next/link";
import { Bookmark, TrendingUp } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ForumPostSummary, LeaderboardEntry } from "./types";

const MEDALS = ["🥇", "🥈", "🥉"];

/**
 * Right rail: Trending 1-5, My Bookmarks, Rating Leaderboard with medal
 * ranks and star scores (desktop-01.md #11-13, desktop-02.md #28).
 * Hidden on mobile — removed entirely per the contract, not relocated.
 */
export function RightRail({
  trendingPosts,
  bookmarkedPosts,
  leaderboard,
}: {
  trendingPosts: Pick<ForumPostSummary, "id" | "title">[];
  bookmarkedPosts: Pick<ForumPostSummary, "id" | "title">[];
  leaderboard: LeaderboardEntry[];
}) {
  return (
    <div className="hidden w-[220px] shrink-0 flex-col gap-3 xl:flex">
      <Card className="border border-glass-border bg-surface-card ring-0">
        <CardHeader className="px-3.5 pb-1 pt-3.5">
          <CardTitle className="flex items-center gap-2 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            <TrendingUp className="size-4 text-brand-orange" aria-hidden />
            Trending
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 px-3.5 pb-3.5">
          {trendingPosts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No trending posts yet.</p>
          ) : (
            <ol className="space-y-2.5">
              {trendingPosts.map((post, index) => (
                <li key={post.id} className="flex gap-2 text-sm">
                  <span className="font-semibold text-brand-orange">{index + 1}</span>
                  <Link href={`/forum/${post.id}`} className="line-clamp-2 text-foreground hover:text-primary">
                    {post.title}
                  </Link>
                </li>
              ))}
            </ol>
          )}
        </CardContent>
      </Card>

      <Card className="border border-glass-border bg-surface-card ring-0">
        <CardHeader className="px-3.5 pb-1 pt-3.5">
          <CardTitle className="flex items-center gap-2 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            <Bookmark className="size-4" aria-hidden />
            My Bookmarks
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3.5 pb-3.5">
          {bookmarkedPosts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No bookmarks yet.</p>
          ) : (
            <ul className="space-y-2">
              {bookmarkedPosts.map((post) => (
                <li key={post.id}>
                  <Link href={`/forum/${post.id}`} className="line-clamp-2 text-sm text-foreground hover:text-primary">
                    {post.title}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card className="border border-glass-border bg-surface-card ring-0">
        <CardHeader className="px-3.5 pb-1 pt-3.5">
          <CardTitle className="flex items-center gap-2 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            ⭐ Rating Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 px-3.5 pb-3.5">
          {leaderboard.map((entry, index) => {
            const rank = index + 1;
            const initials = `${entry.firstName[0] ?? ""}${entry.lastName[0] ?? ""}`.toUpperCase();
            return (
              <div key={entry.userId} className="flex items-center gap-2.5">
                <span className="w-5 shrink-0 text-center text-sm">
                  {rank <= 3 ? MEDALS[rank - 1] : `#${rank}`}
                </span>
                <Avatar size="sm">
                  <AvatarFallback className="bg-primary/15 text-xs font-semibold text-primary">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="flex-1 truncate text-sm text-foreground">
                  {entry.firstName} {entry.lastName}
                </span>
                <Badge className="border-primary/40 bg-primary/10 text-primary" variant="outline">
                  {entry.ratingAverage.toFixed(1)}★
                </Badge>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
