import Link from "next/link";
import { Hash, MessageCircleQuestion, Trophy } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { RailModule } from "./rail-module";
import type { LeaderboardEntry } from "./types";

export type TopQuestionItem = { id: string; title: string; replyCount: number };
export type PopularHashtagItem = { tag: string; postCount: number };

/**
 * Right rail for the social-feed rebuild (client reference image, not
 * docs/screens — see the note at the top of page.tsx). Three modules: Top
 * Contributors, Top Questions, Popular Hashtags This Month. Sticky on
 * desktop; on mobile it renders in normal document flow below the feed
 * (see the layout decision in page.tsx) rather than a drawer, because this
 * is browse-more content a trainee would scroll past on the way out of the
 * feed, not something that needs to interrupt the primary reading path.
 *
 * Every list here degrades to however many real rows the service returned
 * — never padded to a fixed count — and every empty case gets an honest,
 * specific sentence instead of a generic "nothing here" (per the
 * orchestrator's data-update note on getPopularHashtags: it correctly
 * returns [] right now because every published post is outside the 30-day
 * window, and that fact is worth stating, not hiding).
 */
export function RightRail({
  leaderboard,
  topQuestions,
  popularHashtags,
}: {
  leaderboard: LeaderboardEntry[];
  topQuestions: TopQuestionItem[];
  popularHashtags: PopularHashtagItem[];
}) {
  return (
    <aside className="flex w-full shrink-0 flex-col gap-5 lg:sticky lg:top-24 lg:w-[280px] lg:gap-4 lg:self-start">
      <RailModule icon={Trophy} title="Top Contributors">
        {leaderboard.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No contributors have been rated yet.
          </p>
        ) : (
          <ol className="divide-y divide-glass-border">
            {leaderboard.slice(0, 5).map((entry, index) => {
              const rank = index + 1;
              const initials = `${entry.firstName[0] ?? ""}${entry.lastName[0] ?? ""}`.toUpperCase();
              return (
                <li key={entry.userId} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                  {/* Tabular rank numeral, not a medal emoji — a set of three
                      icons that stops meaning anything past #3 is exactly the
                      template-looking pattern the client called out. */}
                  <span className="w-4 shrink-0 text-right font-mono text-xs tabular-nums text-muted-foreground">
                    {rank}
                  </span>
                  <Avatar size="sm">
                    <AvatarFallback className="bg-primary/15 text-xs font-semibold text-primary">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="min-w-0 flex-1 truncate text-sm text-foreground">
                    {entry.firstName} {entry.lastName}
                  </span>
                  {/* Labelled "ratings", not "answers" — ratingCount is a count
                      of stars received (authorRatingRepository.aggregateAll),
                      not a count of authored replies. The reference's copy
                      doesn't match what this data actually measures, and
                      real-data-only wins over matching the reference's label. */}
                  <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                    {entry.ratingCount} {entry.ratingCount === 1 ? "rating" : "ratings"}
                  </span>
                </li>
              );
            })}
          </ol>
        )}
      </RailModule>

      <RailModule icon={MessageCircleQuestion} title="Top Questions">
        {topQuestions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No questions yet.</p>
        ) : (
          <ol className="divide-y divide-glass-border">
            {topQuestions.map((question, index) => (
              <li key={question.id} className="flex gap-2.5 py-2.5 first:pt-0 last:pb-0">
                <span className="w-4 shrink-0 text-right font-mono text-xs tabular-nums text-muted-foreground">
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1 space-y-0.5">
                  <Link
                    href={`/forum/${question.id}`}
                    className="line-clamp-2 text-sm text-foreground hover:text-primary"
                  >
                    {question.title}
                  </Link>
                  <p className="text-xs tabular-nums text-muted-foreground">
                    {question.replyCount} {question.replyCount === 1 ? "reply" : "replies"}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </RailModule>

      <RailModule icon={Hash} title="Popular Hashtags This Month">
        {popularHashtags.length === 0 ? (
          // Honest, specific fact rather than "no hashtags exist": nothing
          // has published in the 30-day window this module reads. Same
          // vertical rhythm as a populated list (py-0.5) so the module
          // neither collapses to nothing nor reserves a big dead box.
          <p className="py-0.5 text-sm text-muted-foreground">
            No posts have published in the last 30 days, so nothing is
            trending this month yet.
          </p>
        ) : (
          <ul className="space-y-2">
            {popularHashtags.map((hashtag) => (
              <li key={hashtag.tag} className="flex items-center justify-between gap-3 text-sm">
                <span className="min-w-0 truncate text-foreground">#{hashtag.tag}</span>
                <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                  {hashtag.postCount} {hashtag.postCount === 1 ? "post" : "posts"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </RailModule>
    </aside>
  );
}
