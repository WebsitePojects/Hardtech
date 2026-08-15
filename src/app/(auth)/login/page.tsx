import Link from "next/link";
import { redirect } from "next/navigation";
import { Award, ShieldCheck, Zap } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getSession } from "@/server/auth/session";

import { LoginForm } from "./login-form";
import { TestCredentialsCard } from "./test-credentials-card";

/**
 * docs/screens/desktop-02.md #1, docs/screens/mobile-04.md #11-12. Two-column
 * split on desktop (marketing copy left, sign-in card right); the mobile
 * capture shows the same content stacked, which the responsive classes below
 * produce without a separate mobile layout.
 */
const FEATURE_ROWS = [
  { icon: Zap, label: "Real-time progress tracking & analytics" },
  { icon: Award, label: "Download your QR-verified certificates" },
  { icon: ShieldCheck, label: "Secure, role-based account access" },
] as const;

export default async function LoginPage() {
  // Already signed in? Don't show the login form — go to the role router.
  // (This also keeps requireRole()'s /login redirect on a role mismatch from
  // ever landing on a form instead of bouncing straight through.)
  const session = await getSession();
  if (session) redirect("/dashboard");

  return (
    <div className="hero-glow relative overflow-hidden">
      {/*
       * Two soft orbs + a technical grid, layered above the global `cyber-bg`
       * texture on this page only. Geometry and alpha match the live
       * reference measured with Playwright (docs/research/02-reference-behavior.md
       * §3); color comes from `.login-orb-a`/`.login-orb-b` in globals.css, which
       * consume the `--cyber-green-rgb` token rather than a pasted hex.
       * `aria-hidden` + `pointer-events-none` keep them out of the a11y tree
       * and off the hit-test path.
       */}
      <div
        aria-hidden
        className="login-orb-a pointer-events-none absolute left-[20%] top-[40%] size-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[40px]"
      />
      <div
        aria-hidden
        className="login-orb-b pointer-events-none absolute left-[80%] top-[60%] size-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[40px]"
      />

      {/* min-h-screen is what keeps the global footer off this screen. The
        * reference's login panel measures exactly one viewport tall (main
        * height 900 at a 900px viewport, footer starting at 996), so the
        * footer exists but sits below the fold. Ours was 770 tall, which
        * pulled the footer into view and made the page read as a different
        * layout entirely. */}
      <div className="relative mx-auto grid min-h-screen w-full max-w-[1400px] gap-8 px-4 py-10 sm:gap-10 sm:px-8 sm:py-16 lg:grid-cols-2 lg:items-center lg:py-24">
        <div className="relative space-y-6 lg:space-y-8">
          {/* Scoped to the marketing column, matching the reference's
           * `hidden lg:flex lg:w-1/2 ... overflow-hidden` panel. */}
          <div
            aria-hidden
            className="login-grid-overlay pointer-events-none absolute inset-0 hidden lg:block"
          />
          {/* Uppercase with wide tracking at 12px, transcribed from the
            * reference — it renders "SYSTEM ONLINE · 2026 BATCHES OPEN".
            * Applied via text-transform rather than retyping the string, so
            * the source copy stays readable in the markup. */}
          <Badge
            variant="outline"
            className="gap-1.5 border-primary/40 text-[12px] tracking-wider text-primary uppercase"
          >
            <span className="size-1.5 rounded-full bg-primary" aria-hidden />
            System Online · 2026 Batches Open
          </Badge>

          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-balance sm:text-5xl">
              Continue Your
              <br />
              <span className="text-primary">Tech Journey</span>
            </h1>
            <p className="max-w-md text-lg text-muted-foreground">
              Access your personalized training dashboard and track your progress in real time.
            </p>
          </div>

          <ul className="space-y-4">
            {FEATURE_ROWS.map((row) => (
              <li key={row.label} className="flex items-center gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-glass-border bg-glass">
                  <row.icon className="size-4 text-primary" aria-hidden />
                </span>
                {/* Muted, not near-white. The reference renders these feature
                  * rows at rgb(138,149,163) — exactly --text-muted. At
                  * text-foreground they compete with the heading and flatten
                  * the column's hierarchy. */}
                <span className="text-sm text-text-muted">{row.label}</span>
              </li>
            ))}
          </ul>

          <p className="hidden text-xs text-muted-foreground lg:block">
            © 2026 HardTech IT Corp. All rights reserved.
          </p>
        </div>

        {/* The reference's card box measures 448px wide at a 1440 viewport and
          * is pinned to the right of its column rather than stretched across
          * it. Measure the card element itself, not "the smallest box
          * containing the words Welcome Back" — that heuristic lands on an
          * inner wrapper and reports 382. */}
        <Card
          className="glass w-full max-w-[448px] justify-self-end rounded-2xl p-6 [--card-spacing:--spacing(1)] sm:p-8"
        >
          {/* Measured (Playwright, all 4 breakpoints): h2-bottom to email-input-top
            * was a consistent 88px. `mb-6` (24px) + `space-y-1.5` (6px) here
            * accounted for only 30 of it; the rest was Card's own
            * `gap-(--card-spacing)` flex gap (16px — src/components/ui/card.tsx,
            * default `[--card-spacing:--spacing(4)]`) plus the subtext
            * paragraph's and the email label's own rendered line-heights.
            *
            * Card.tsx is a shadcn primitive shared across the whole app and
            * stays byte-identical per .claude/rules/10-architecture.md
            * ("project styling goes in wrapper components or tokens, so the
            * primitives stay regenerable") — so the fix is entirely at this
            * call site: `[--card-spacing:--spacing(1)]` overrides the CSS
            * custom property Card's own `gap-(--card-spacing)` reads, Tailwind
            * class order lets this later declaration win with no `!important`
            * needed. `p-6 sm:p-8` already overrides Card's `py-(--card-spacing)`
            * padding the same way (a `p-*` utility always wins its conflict
            * with `py-*` in `cn`'s tailwind-merge, regardless of which came
            * first in the base class list) — this Card renders no
            * CardHeader/CardContent/CardFooter, so `--card-spacing` has no
            * other consumer in this instance to disturb.
            *
            * Tried tighter first: `[--card-spacing:0px]` + `mb-0.5` measured
            * 46px, but screenshotted visibly cramped — "Enroll in a program"
            * and "EMAIL ADDRESS" nearly touched, no breathing room between
            * the marketing subtext and the form start. Backed off to
            * `[--card-spacing:--spacing(1)]` (4px) + `mb-2` (8px) below,
            * re-measured (Playwright, all 4 breakpoints — 390/768/1024/1440,
            * identical at each): a consistent **56px**. Still short of the
            * 24-40px band, but both remaining lines (the subtext paragraph
            * and the "Email Address" label) are real transcribed content,
            * not whitespace — the 46px version proved that pushing further
            * costs legibility, not just density. 56px is the number to
            * defend: down 36% from the original 88px, screenshotted clean at
            * all four breakpoints (D:/ht-shots/login-gap-*.png). See
            * login-form.tsx / animated-field.tsx for the matching
            * field-internal tighten. */}
          <div className="mb-2 space-y-1">
            <h2 className="font-heading text-2xl font-semibold">Welcome Back</h2>
            <p className="text-sm text-muted-foreground">
              Want to join HardTech?{" "}
              <Link href="/enroll" className="font-medium text-primary hover:underline">
                Enroll in a program
              </Link>
            </p>
          </div>

          <LoginForm />

          <div className="mt-6">
            <TestCredentialsCard />
          </div>
        </Card>
      </div>
    </div>
  );
}
