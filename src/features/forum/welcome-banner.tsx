import Link from "next/link";
import { ArrowRight, Wrench } from "lucide-react";

/**
 * Top-of-feed banner (reference structure's "welcome banner" module). Pure
 * server component — the CTA is a plain anchor, not a client trigger, so no
 * function ever needs to cross the Server→Client boundary here (see the
 * comment at the top of page.tsx for why that specific mistake matters on
 * this route).
 *
 * `totalPosts`/`memberCount` are real numbers from `getForumStats()` — this
 * is also where the old left rail's "Forum Stats" card lands now that the
 * rail itself is gone (see forum-toolbar.tsx's docstring): condensed into
 * the one sentence a visitor actually reads, instead of a standalone card
 * nobody scanned.
 *
 * The "illustration" is a restrained CSS/icon composition, not a stock
 * photo or an imported asset — this project has no mascot image, and the
 * brief explicitly forbids inserting one that doesn't exist. It reuses the
 * project's own `--dashboard-glow` token rather than inventing a new colour.
 */
export function WelcomeBanner({
  isSignedIn,
  totalPosts,
  memberCount,
}: {
  isSignedIn: boolean;
  totalPosts: number;
  memberCount: number;
}) {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-glass-border bg-surface-card">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{ backgroundImage: "var(--dashboard-glow)" }}
      />
      <div className="relative flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div className="max-w-xl space-y-3">
          <h1 className="font-heading text-2xl leading-tight font-bold text-foreground sm:text-3xl">
            Ask, share, and get unstuck — <span className="text-primary">together</span>.
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
            {totalPosts} {totalPosts === 1 ? "post" : "posts"} and {memberCount}{" "}
            {memberCount === 1 ? "member" : "members"} trading real fixes for
            board-level repairs, mobile teardowns, and networking headaches.
          </p>
          <Link
            href={isSignedIn ? "#composer" : "/login"}
            className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-glow-sm transition-colors hover:bg-primary-dark"
          >
            {isSignedIn ? "Start a Post" : "Sign in to Post"}
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>

        <div aria-hidden className="hidden shrink-0 sm:block">
          <div className="flex size-28 items-center justify-center rounded-full border border-glass-border bg-glass shadow-glow-md">
            <Wrench className="size-11 text-primary" strokeWidth={1.5} />
          </div>
        </div>
      </div>
    </section>
  );
}
