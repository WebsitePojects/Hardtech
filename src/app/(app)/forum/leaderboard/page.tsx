import Link from "next/link";
import { ArrowLeft, Star, Users } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Footer } from "@/components/layout/footer";
import { RoleBadge } from "@/features/forum/author-badges";
import { getInitials } from "@/components/dashboard/get-initials";

// NOT SOURCED: no screenshot in docs/screens/ captures /forum/leaderboard
// itself — desktop-01.md #11-13 and desktop-02.md #28 only show the
// top-5-entry "RATING LEADERBOARD" rail card embedded in /forum. This page
// is the full-list expansion of that same card (all ranked authors instead
// of the rail's top 5), reusing its exact visual language (medal icons for
// #1-3, "#N" numerals below that, star-average badge) rather than inventing
// a new layout. Flagged for the wave orchestrator per docs/contracts/
// wave-2-app.md's "mark it NOT SOURCED inline and report it" instruction.
//
// Cannot find module '@/server/services/forum.service' is expected until
// DATA-2 lands it — see src/app/(app)/forum/page.tsx for the full contract
// disclaimer. Expected shape: getLeaderboard(limit?: number): Promise<LeaderboardEntry[]>
import { getForumStats, getLeaderboard } from "@/server/services/forum.service";

export const metadata = {
  title: "Rating Leaderboard | HardTech IT Corp",
};

const MEDALS = ["🥇", "🥈", "🥉"];

export default async function ForumLeaderboardPage() {
  const [leaderboard, forumStats] = await Promise.all([getLeaderboard(), getForumStats()]);
  const totalRatings = leaderboard.reduce((sum, entry) => sum + entry.ratingCount, 0);
  const communityAverage = totalRatings === 0
    ? 0
    : leaderboard.reduce((sum, entry) => sum + entry.ratingAverage * entry.ratingCount, 0) / totalRatings;

  return (
    <>
      <div className="mx-auto max-w-3xl space-y-6 px-4 pt-20 pb-16 sm:px-6 sm:pt-28">
        <Link
          href="/forum"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden /> Back to Forum
        </Link>

        <div className="space-y-2">
          <Badge variant="outline" className="border-primary/40 text-primary">
            ⭐ Leaderboard
          </Badge>
          <h1 className="font-heading text-3xl font-bold text-foreground sm:text-4xl">
            Rating <span className="text-primary">Leaderboard</span>
          </h1>
          <p className="text-muted-foreground">
            Ranked by average author rating across the HardTech community forum.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <Card className="bg-surface-secondary">
            <CardContent className="flex flex-col items-center gap-1 p-3 text-center">
              <Users className="size-4 text-brand-blue" aria-hidden />
              <strong className="font-heading text-xl text-brand-blue">{forumStats.memberCount}</strong>
              <span className="text-xs text-muted-foreground">Total Members</span>
            </CardContent>
          </Card>
          <Card className="bg-surface-secondary">
            <CardContent className="flex flex-col items-center gap-1 p-3 text-center">
              <Star className="size-4 text-brand-orange" aria-hidden />
              <strong className="font-heading text-xl text-brand-orange">{totalRatings}</strong>
              <span className="text-xs text-muted-foreground">Total Ratings</span>
            </CardContent>
          </Card>
          <Card className="bg-surface-secondary">
            <CardContent className="flex flex-col items-center gap-1 p-3 text-center">
              <Star className="size-4 text-brand-orange" aria-hidden />
              <strong className="font-heading text-xl text-brand-orange">{communityAverage.toFixed(1)}★</strong>
              <span className="text-xs text-muted-foreground">Community Avg</span>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="space-y-1">
            {leaderboard.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No ratings yet.
              </p>
            ) : (
              leaderboard.map((entry, index) => {
                const rank = index + 1;
                const initials = getInitials(`${entry.firstName} ${entry.lastName}`);
                return (
                  <div
                    key={entry.userId}
                    className="flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-glass-hover"
                  >
                    <span className="w-7 shrink-0 text-center text-base">
                      {rank <= 3 ? MEDALS[rank - 1] : `#${rank}`}
                    </span>
                    <Avatar>
                      <AvatarFallback className="bg-primary/15 font-semibold text-primary">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {entry.firstName} {entry.lastName}
                      </p>
                      <RoleBadge role={entry.role} />
                    </div>
                    <Badge className="border-primary/40 bg-primary/10 text-primary" variant="outline">
                      {entry.ratingAverage.toFixed(1)}★ ({entry.ratingCount})
                    </Badge>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>
      <Footer />
    </>
  );
}
