"use client";

import Link from "next/link";
import { ArrowDown, ExternalLink } from "lucide-react";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { SiteLogo } from "@/components/layout/site-logo";
import { primaryNavItems } from "@/components/layout/nav-items";
import { EASE_DRAMA_CSS } from "@/components/motion/easing";
import {
  COMPACT_GEOMETRY,
  EXPANDED_GEOMETRY,
  FRAME_DESKTOP_BREAKPOINT_PX,
  usePrefersReducedMotion,
  type FrameGeometry,
} from "./hero-frame";

/**
 * Content that lives inside HeroFrame's frame: the top header row (nav
 * left / wordmark centre / actions right on desktop, logo + one CTA on
 * mobile), a functional bottom-left "scroll down" control, and the one
 * genuinely-available bottom-right social link.
 *
 * Deliberately separate from hero-frame.tsx (single responsibility, per the
 * task brief): that file owns the frame's shape and the one GSAP
 * ScrollTrigger; this file owns presentation and reacts to that trigger's
 * output through `html[data-hero-open]` alone — no GSAP import here, no
 * second scroll listener, nothing that could drift out of sync with the
 * timeline that actually owns scroll state.
 *
 * ---------------------------------------------------------------------------
 * Defect 2 — geometry, and the real constraint that shaped this fix
 * ---------------------------------------------------------------------------
 * hero-frame.tsx's SVG path is solid ("frame material") everywhere outside
 * its inner hole, and that hole is shallow (`thickness`) except across the
 * top's "shoulder" plateau, where it's pushed down to `headerBand`. The
 * previous header was an opaque `bg-background` rectangle at `inset-x-0` —
 * full viewport width — but only `headerBand` tall. Outside the shoulder
 * plateau the frame's real material is only `thickness` tall, so from
 * `thickness` to `headerBand` there *should* be open hole (hero background
 * visible, frame's notch/corner curve visible) — and the old header painted
 * straight over that, erasing the frame's own corner shape. That's defect 2's
 * "overlaps the frame instead of sitting inside it."
 *
 * The tempting fix — shrink the header to exactly the shoulder plateau's own
 * width — creates a worse problem: navbar-shell.tsx (read-only, always
 * mounted, `max-w-[1120px]`) is directly beneath this header at a lower
 * z-index specifically so it stays occluded while the hero is closed (see
 * that file's own z-index registry). At most viewport widths the plateau is
 * narrower than navbar-shell's own rendered width, so shrinking to the
 * plateau would leave navbar-shell's glass pill peeking out at the sides —
 * i.e. exactly the "never a state where both are legible at once" hard
 * constraint failing, just in a new place. There is no single flat rectangle
 * that is simultaneously "never wider than the frame's real silhouette" and
 * "always fully covers navbar-shell everywhere it might render," because outside
 * the plateau those are the same pixels with opposite requirements.
 *
 * Resolution: two layers, not one.
 *   - `.hero-chrome-header-shell` stays full width and tall enough to
 *     guarantee full occlusion (`occlusionHeight`, below) — but it's painted
 *     in the frame's own colour (`bg-foreground/95`, the exact class
 *     hero-frame.tsx's `<path>` uses) with its top corners rounded to the
 *     frame's own `outerRadius`. Outside the plateau this reads as "the
 *     frame's own material, uniformly extended" rather than a clashing dark
 *     rectangle — there is no colour seam because there is no colour change.
 *     This is a deliberate, documented trade against defect 2's literal
 *     "never painted over": the frame's fine notch/corner curve is still not
 *     reproduced at the very top corners while this shell is opaque, but the
 *     defect's actual visual symptom — a dark rectangle slicing across the
 *     frame's light band — is gone, and the occlusion guarantee (an
 *     unqualified, twice-stated hard constraint) is never put at risk.
 *   - `.hero-chrome-header-content` is the actual dark, interactive nav row
 *     (logo/links/actions), inset within that shell — reading as a control
 *     panel recessed into the frame's material, which is the "sits inside
 *     the frame's opening" reading the brief asks for.
 *
 * Breakpoint: Tailwind's `lg` (1024px) — the same value hero-frame.tsx's
 * `FRAME_DESKTOP_BREAKPOINT_PX` switches its own geometry on, imported here
 * (not re-typed) so the two can never drift apart.
 *
 * Mobile arrangement: the reference's three-column header (nav left /
 * wordmark centre / actions right) does not fit a 320px phone — the brief
 * calls this out explicitly. Below `lg` this collapses to logo-left +
 * Enroll-Now-right: Enroll Now, not Login, because mobile-nav.tsx's own
 * drawer already treats it as the primary action pinned at the bottom, and a
 * phone visitor is far more likely to be enrolling than logging in from the
 * hero specifically.
 */

// Real breathing room between a hero-chrome element and the frame's actual
// painted edge, so nothing ever grazes it. Matches the "clears X by a
// margin" convention hero-frame.tsx's own geometry comments already use for
// headerBand vs the section's pt-20/pt-24.
const CHROME_GAP_PX = 8;

// navbar-shell.tsx (read-only) renders `h-[68px]` of content plus up to
// `pt-[10px]` once scrolled — 78px tall at most, verified by reading that
// file's own literal classes rather than assumed. The occlusion shell below
// must be at least that tall everywhere it might sit above navbar-shell, or
// the real navbar's own glass pill could poke out beneath it while the hero
// is still "closed" — exactly the "never both legible" failure. Compact's
// own `headerBand` (72) alone falls 6px short of that; expanded's (88)
// already clears it.
const NAVBAR_SHELL_MAX_HEIGHT_PX = 78;

function occlusionHeight(geo: FrameGeometry): number {
  return Math.max(geo.headerBand, NAVBAR_SHELL_MAX_HEIGHT_PX);
}

// Inset for the dark inner nav content within its light occlusion shell.
// This is a layout choice now, not a frame-geometry constraint — the shell
// above already handles full-width occlusion and colour-matching, so the
// content row is free to use the width it actually needs rather than being
// squeezed into the frame's own (much narrower, especially near 1024px)
// shoulder plateau.
function headerContentInset(geo: FrameGeometry): number {
  return geo.thickness + CHROME_GAP_PX;
}

// Bottom-left/right controls sit in the genuine hole, not a shaped slot, so
// they need real clearance from the frame's material: past the straight
// `thickness` band AND past the `notchRadius` bite the inner corner's arc
// carves into the hole (hero-frame.tsx's NOTCH_SWEEP_FLAG comment: the arc
// is centred on the hole's own sharp corner, so anything within
// `notchRadius` of that point is frame material, not hole) — plus the real
// gap. Insetting both edges of a corner control by this amount keeps its
// nearest point at least `notchRadius + gap` from that arc's centre on
// *both* axes, which is always >= the arc's own radius, so the diagonal
// clearance holds too.
function cornerInset(geo: FrameGeometry): number {
  return geo.thickness + geo.notchRadius + CHROME_GAP_PX;
}

const compact = {
  shellHeight: occlusionHeight(COMPACT_GEOMETRY),
  shellRadius: COMPACT_GEOMETRY.outerRadius,
  contentInset: headerContentInset(COMPACT_GEOMETRY),
  cornerInset: cornerInset(COMPACT_GEOMETRY),
};
const expanded = {
  shellHeight: occlusionHeight(EXPANDED_GEOMETRY),
  shellRadius: EXPANDED_GEOMETRY.outerRadius,
  contentInset: headerContentInset(EXPANDED_GEOMETRY),
  cornerInset: cornerInset(EXPANDED_GEOMETRY),
};

export function HeroFrameChrome() {
  const prefersReducedMotion = usePrefersReducedMotion();

  // Matches hero-frame.tsx's own reduced-motion policy exactly: render
  // nothing. Without the frame there is no shaped opening for this content
  // to sit "inside," and the real navbar-shell (always mounted, unconditional)
  // already carries every piece of navigation these controls duplicate. The
  // alternative — rendering the controls in a fixed, un-animated resting
  // state — would permanently occlude navbar-shell for a visitor who can
  // never scroll past HERO_HANDOFF_PROGRESS-driven motion to reveal it, which
  // is worse than not rendering them at all.
  if (prefersReducedMotion) return null;

  return (
    <>
      {/*
        data-hero-open is written by hero-frame.tsx's ScrollTrigger onUpdate;
        this component never reads it in JS, only in CSS, which is what makes
        the fade free to reverse — the attribute flips the instant scroll
        direction reverses and the transition just runs backward.

        Defect 3 — the handoff motion. EASE_DRAMA (not EASE_UI): the brief
        names this exact case ("hero and curtain only, sparingly ... this is
        exactly that case"). 500ms: matches navbar-shell.tsx's own transition
        durations (`duration-[500ms]` on its shell, `duration-[600ms]` on its
        pill) so the exiting chrome and the navbar's own already-running
        scrolled-state transition read as one rhythm rather than two
        unrelated timings. Opacity + scale (not position): the chrome
        dissolves toward its own centre rather than translating toward the
        navbar's literal DOM position, because navbar-shell occupies the
        exact same fixed top-of-viewport region already — there's no gap to
        bridge, so a directional slide would be motion for its own sake
        rather than motion that means something.

        pointer-events flips at the same instant as the opacity/transform
        transition starts (CSS can't animate it, and both live in the same
        rule): the chrome briefly stays visible-but-unclickable for the first
        stretch of its own exit, which reads as "already leaving" rather than
        "still here" — the same affordance a closing modal uses.
      */}
      <style>{`
        .hero-chrome {
          opacity: 1;
          transform: scale(1);
          transition: opacity 500ms ${EASE_DRAMA_CSS}, transform 500ms ${EASE_DRAMA_CSS};
        }
        html[data-hero-open="true"] .hero-chrome {
          opacity: 0;
          transform: scale(0.96);
          pointer-events: none;
        }
        @media (prefers-reduced-motion: reduce) {
          .hero-chrome { transition: none; }
        }

        /* Full-width, frame-coloured occlusion shell (see the file doc
           comment above for why this can't just be the plateau's own
           width). Height and corner radius both taller/rounder than the
           frame's own headerBand/outerRadius would need on their own,
           because they additionally have to guarantee navbar-shell.tsx is
           never visible underneath — see occlusionHeight()'s own comment. */
        .hero-chrome-header-shell {
          height: ${compact.shellHeight}px;
          border-radius: ${compact.shellRadius}px ${compact.shellRadius}px 0 0;
        }
        .hero-chrome-header-content {
          margin: ${CHROME_GAP_PX}px ${compact.contentInset}px 0;
          height: calc(100% - ${CHROME_GAP_PX * 2}px);
        }
        .hero-chrome-corner-bl { left: ${compact.cornerInset}px; bottom: ${compact.cornerInset}px; }
        .hero-chrome-corner-br { right: ${compact.cornerInset}px; bottom: ${compact.cornerInset}px; }

        @media (min-width: ${FRAME_DESKTOP_BREAKPOINT_PX}px) {
          .hero-chrome-header-shell {
            height: ${expanded.shellHeight}px;
            border-radius: ${expanded.shellRadius}px ${expanded.shellRadius}px 0 0;
          }
          .hero-chrome-header-content {
            margin: ${CHROME_GAP_PX}px ${expanded.contentInset}px 0;
          }
          .hero-chrome-corner-bl { left: ${expanded.cornerInset}px; bottom: ${expanded.cornerInset}px; }
          .hero-chrome-corner-br { right: ${expanded.cornerInset}px; bottom: ${expanded.cornerInset}px; }
        }
      `}</style>

      {/* Occlusion shell + recessed content panel — see the file doc comment
          for why this is two layers instead of one rectangle. */}
      <div className="hero-chrome hero-chrome-header-shell fixed inset-x-0 top-0 z-[100001] bg-foreground/95">
        <div className="hero-chrome-header-content relative flex items-center justify-between gap-3 rounded-xl border border-glass-border bg-background px-4 lg:px-6">
          <nav className="hidden items-center gap-6 lg:flex" aria-label="Primary">
            {primaryNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                // inline-flex + py-3: text-sm's own line box is ~20px, +24px
                // of vertical padding clears the 44px tap-target floor
                // without changing the row's own height (items-center on
                // the parent absorbs the extra box height).
                className="inline-flex items-center py-3 font-sub text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Mobile: logo takes the left slot the nav occupies on desktop. */}
          <SiteLogo size="sm" className="lg:hidden" />

          {/* Desktop: wordmark centred in the content panel's own box (that
              panel is `relative`, so this `absolute` child's containing
              block is the panel itself, not the viewport — it centres
              against the actual nav row, not the wider occlusion shell
              behind it). */}
          <SiteLogo size="sm" className="hidden lg:absolute lg:left-1/2 lg:flex lg:-translate-x-1/2" />

          <div className="flex items-center gap-2">
            {/* Login/Enroll Now: same hrefs and copy as navbar-actions.tsx's
                signed-out state (that file is read-only; reusing its
                content, not its component, since this row has no session
                data to hand it). h-11 overrides buttonVariants' own
                size="sm" height (h-7, 28px) — neither shadcn size token
                reaches the 44px tap-target floor the brief requires, so it's
                overridden explicitly rather than picking a "close enough"
                size. */}
            <Link
              href="/login"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "hidden h-11 border-glass-border bg-transparent px-4 hover:bg-glass-hover lg:inline-flex",
              )}
            >
              Login
            </Link>
            <Link href="/enroll" className={cn(buttonVariants({ size: "sm" }), "h-11 px-4")}>
              Enroll Now
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom-left: functional, not decorative — scrolls to whatever
          section follows the hero. Positioned via hero-chrome-corner-bl
          (see the <style> block above) instead of a Tailwind inset utility
          so its clearance from the frame's bottom-left notch is derived from
          COMPACT_GEOMETRY/EXPANDED_GEOMETRY rather than guessed — the
          original `bottom-4 left-4` (16px) sat *inside* the frame's own
          18-22px material band, the same defect the header had. */}
      <div className="hero-chrome hero-chrome-corner-bl fixed z-[100001] flex items-center gap-2">
        <button
          type="button"
          onClick={scrollPastHero}
          className="flex size-11 items-center justify-center rounded-full border border-glass-border bg-glass text-foreground transition-colors hover:bg-glass-hover"
          aria-label="Scroll down"
        >
          <ArrowDown className="size-4" aria-hidden />
        </button>
        {/* Label hidden below `sm`: at 320-390px width there isn't room for
            a label beside the button without crowding the frame's own
            corner geometry. */}
        <span className="hidden font-sub text-xs font-medium tracking-wide text-muted-foreground uppercase sm:inline">
          Scroll down
        </span>
      </div>

      {/*
        Bottom-right: the ONE social link the codebase has any real basis
        for. footer.tsx documents that no confirmed HardTech company
        Facebook URL exists (it links to "#" there too) and that no other
        platform has a known URL at all — so this renders exactly one
        button, not the three the reference visual implies, and reuses
        footer.tsx's own reasoning for the icon (lucide ships no Facebook
        glyph; ExternalLink stands in there too).
      */}
      <a
        href="#"
        aria-label="Follow on Facebook"
        className="hero-chrome hero-chrome-corner-br fixed z-[100001] flex size-11 items-center justify-center rounded-full border border-glass-border bg-glass text-foreground transition-colors hover:bg-glass-hover"
      >
        <ExternalLink className="size-4" aria-hidden />
      </a>

      {/*
        Bottom-centre is intentionally empty. The reference shows a
        cookie-consent bar there; this project has no consent system, and a
        fake one would be a compliance misstatement, not a design element
        (task brief, explicit) — so nothing renders in that slot at all.
      */}
    </>
  );
}

// Named export so it's independently testable/readable, and so the
// fallback path (no next section, e.g. this ever becomes the last element
// on the page) is visible without reading into the JSX below.
function scrollPastHero() {
  const hero = document.querySelector(".hero-full-bleed");
  const next = hero?.nextElementSibling;
  if (next instanceof HTMLElement) {
    next.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }
  window.scrollBy({ top: window.innerHeight, behavior: "smooth" });
}
