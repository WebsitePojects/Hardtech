"use client";

import { useCallback, useEffect, useRef, useSyncExternalStore } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { EASE_DRAMA_CSS } from "@/components/motion/easing";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

// Same useSyncExternalStore pattern the previous version of this file used
// (see git history) — avoids the mirrored-useState flash where a
// reduced-motion visitor would otherwise see the frame animation render for
// one tick before being corrected. Exported so hero-frame-chrome.tsx can
// apply the identical reduced-motion policy (render nothing, resting state
// is the end state) without a second, possibly-drifting matchMedia listener.
export function usePrefersReducedMotion(): boolean {
  const subscribe = useCallback((onChange: () => void) => {
    const query = window.matchMedia(REDUCED_MOTION_QUERY);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(REDUCED_MOTION_QUERY).matches,
    () => false,
  );
}

/**
 * ---------------------------------------------------------------------------
 * Frame geometry
 * ---------------------------------------------------------------------------
 * Every number the frame's shape depends on lives here, named, so the shape
 * can be retuned without touching the path-building logic below. None of
 * these were measured against the client's reference screenshot — this
 * agent was only given a prose description of it, not the image itself (see
 * the task brief) — so treat every value as an inference, not ground truth,
 * and re-tune against the real asset the moment it's available. That
 * discipline follows the 2026-08-09 "unmeasured spec" lesson in
 * .claude/lessons.md: label inferred numbers as inferred.
 */
// Exported (defect 2) so hero-frame-chrome.tsx can derive the in-frame
// header/scroll-down/social controls' insets from these actual numbers
// instead of a second, hand-copied set of magic numbers that would drift
// the moment this file's geometry is retuned.
export type FrameGeometry = {
  /** Side/bottom band thickness. Brief: "roughly 18-24px thick". */
  thickness: number;
  /**
   * Top band thickness. Taller than `thickness` because it has to hold the
   * in-frame header row (hero-frame-chrome.tsx) — the brief's "shoulders"
   * detail is this value diverging from `thickness` at all, not a uniform
   * top border like the sides get.
   */
  headerBand: number;
  /** Outer corner rounding (all four corners, brief: "all rounded"). */
  outerRadius: number;
  /**
   * Radius of the concave bite cut into each inner corner. Kept larger than
   * `thickness` so the notch reads as a deliberate scallop against a thin
   * band rather than disappearing into it.
   */
  notchRadius: number;
  /**
   * Horizontal distance, from each top corner's notch, to where the top
   * inner edge jogs from `thickness` (shallow, matching the sides) down to
   * `headerBand` (deep, for the header row). This is the "shoulder" step.
   */
  shoulderInset: number;
};

// Matches hero.tsx's own `lg:pt-24` step, not an invented value — see the
// padding-clearance note on headerBand below. Also used to switch the
// in-frame header (hero-frame-chrome.tsx) between its compact (logo + one
// CTA) and full three-column layouts, so the frame's top band and the
// header content riding inside it always change together.
export const FRAME_DESKTOP_BREAKPOINT_PX = 1024;

export const COMPACT_GEOMETRY: FrameGeometry = {
  thickness: 18, // bottom of the brief's 18-24px range — mobile is the traffic priority, keep the side bands light so they don't eat width on a 320px screen
  headerBand: 72, // clears the section's own `pt-20` (80px) navbar-clearance padding — preserved unmodified per the task's hard constraints — with an 8px margin
  outerRadius: 22,
  notchRadius: 26,
  shoulderInset: 36, // small: the compact header (logo + one CTA) doesn't need a wide plateau, and 320px of width doesn't have one to give
};

export const EXPANDED_GEOMETRY: FrameGeometry = {
  thickness: 22, // mid-upper of the 18-24px range
  headerBand: 88, // clears `lg:pt-24` (96px) with an 8px margin
  outerRadius: 34,
  notchRadius: 42,
  shoulderInset: 130, // room for the full nav-links / logo / actions three-column row
};

function geometryFor(viewportWidth: number): FrameGeometry {
  return viewportWidth >= FRAME_DESKTOP_BREAKPOINT_PX ? EXPANDED_GEOMETRY : COMPACT_GEOMETRY;
}

// With this traversal direction (clockwise around the hole boundary,
// starting just past the top-left notch) and each notch arc centred on the
// hole's own sharp corner rather than the diagonal inset point a normal
// rounded-rect hole would use, sweep=1 is what pulls the boundary IN toward
// the frame material — i.e. the concave "bite" the brief asks for, not a
// standard convex rounded corner. Verified empirically against a zoomed
// Playwright screenshot of one corner (no reference image was available to
// derive this from directly); flip this constant if a real reference later
// shows the opposite reading.
const NOTCH_SWEEP_FLAG = 1;

/**
 * Builds the frame's `<path d>`: two closed subpaths — a plain rounded-rect
 * outer boundary and a "notched, shouldered" inner boundary — combined with
 * `fill-rule="evenodd"` so the pair reads as one solid band with a hole cut
 * out of it. A `border` can only express four straight or uniformly-curved
 * sides, which is exactly why this is a path instead: the inner boundary's
 * corners curve the *wrong* way (concave, into the frame material) and its
 * top edge is two different heights joined by a right-angle step, neither
 * of which a CSS border can produce.
 */
function buildFramePath(width: number, height: number, geo: FrameGeometry): string {
  const { thickness: T, headerBand: HT, outerRadius: R, notchRadius: RN, shoulderInset: SI } = geo;

  const outer =
    `M${R},0 H${width - R} A${R},${R} 0 0 1 ${width},${R} ` +
    `V${height - R} A${R},${R} 0 0 1 ${width - R},${height} ` +
    `H${R} A${R},${R} 0 0 1 0,${height - R} ` +
    `V${R} A${R},${R} 0 0 1 ${R},0 Z`;

  const ix0 = T;
  const ix1 = width - T;
  const iyTopSide = T;
  const iyTopHeader = HT;
  const iyBottom = height - T;
  const sweep = NOTCH_SWEEP_FLAG;

  const inner =
    // Start just past the top-left notch, run the shallow top edge in to
    // the shoulder, jog down to the deep header-band edge, run across the
    // header plateau, jog back up, run out to the top-right notch.
    `M${ix0 + RN},${iyTopSide} ` +
    `H${ix0 + RN + SI} V${iyTopHeader} H${ix1 - RN - SI} V${iyTopSide} ` +
    `H${ix1 - RN} A${RN},${RN} 0 0 ${sweep} ${ix1},${iyTopSide + RN} ` +
    `V${iyBottom - RN} A${RN},${RN} 0 0 ${sweep} ${ix1 - RN},${iyBottom} ` +
    `H${ix0 + RN} A${RN},${RN} 0 0 ${sweep} ${ix0},${iyBottom - RN} ` +
    `V${iyTopSide + RN} A${RN},${RN} 0 0 ${sweep} ${ix0 + RN},${iyTopSide} Z`;

  return `${outer} ${inner}`;
}

// ---------------------------------------------------------------------------
// Scroll orchestration
// ---------------------------------------------------------------------------

// Registering a GSAP plugin twice is harmless but pointless; this module can
// be evaluated once per page load, so a module-level guard is enough (no
// need for the ref-based guards a per-instance effect would need).
let scrollTriggerRegistered = false;

// Inherited from the previous version of this file's own tuning pass — no
// new reference asset was supplied to re-measure against, so the value
// carries forward rather than being re-guessed. Progress reaches 1 after
// 80% of one viewport height of scroll.
const SCROLL_FRACTION = 0.8;

// The frame scales up 25% as it "opens" — also inherited, same reasoning.
const SCALE_END = 1.25;

// Relative position (0-1) within the scrubbed timeline where the in-frame
// header (hero-frame-chrome.tsx) cuts out. Set past the midpoint so the
// header stays legible while the frame is still mostly closed, and is fully
// gone well before the frame finishes fading — there is no scroll position
// where a half-faded header and a re-appeared real navbar could both read
// as legible at once, which is the hard constraint in the brief. Exported
// so hero-frame-chrome.tsx's CSS can be tuned against the same number this
// file writes into `data-hero-open`.
export const HERO_HANDOFF_PROGRESS = 0.55;

/**
 * Full-viewport concave-corner frame for the home hero, plus the one GSAP
 * ScrollTrigger that drives the whole hero->normal-layout transition:
 *   - this frame scales up and fades out (EASE_DRAMA, the "hero + curtain
 *     only" curve reserved for exactly this kind of moment);
 *   - `document.documentElement.dataset.heroOpen` flips to "true" once
 *     scroll progress crosses HERO_HANDOFF_PROGRESS — hero-frame-chrome.tsx
 *     reacts to that attribute with a plain CSS transition, so it needs no
 *     scroll listener of its own and the two pieces can never drift out of
 *     sync with each other.
 *
 * Retirement: `scrub: true` ties the timeline directly to scroll position
 * and GSAP only re-evaluates it when that position actually changes.  Once
 * progress clamps at 1 (well past the transition), further downward scroll
 * doesn't move progress at all, so nothing re-renders and no extra work
 * happens — true retirement, no new rAF loop, using the single `gsap.ticker`
 * this codebase already runs sitewide (see smooth-scroll-provider.tsx).
 * Because it's a scrub tween rather than the previous version's one-shot
 * `retiredRef` latch, it is also naturally reversible: scrolling back up
 * immediately starts moving progress again in the other direction.
 *
 * Lenis: smooth-scroll-provider.tsx runs Lenis in its default (non-virtual)
 * window-scroll mode — it smooths `window.scrollTo` calls but does not
 * decouple `window.scrollY`/native `scroll` events from the real position.
 * ScrollTrigger's default `window` scroller reads that position directly on
 * every shared-ticker tick, so this works without a custom scrollerProxy;
 * that file is read-only for this task regardless, so a proxy wasn't an
 * option even if one were needed. Verified empirically in the Playwright
 * pass rather than assumed.
 *
 * Reduced motion: renders nothing, same policy the previous version of this
 * file established and documented — the codebase convention is that the
 * resting state must be the animation's own end state, and this animation's
 * end state (frame gone, real navbar the only header) is what a
 * reduced-motion visitor sees from the first frame, with no transition ever
 * scheduled.
 */
export function HeroFrame() {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const pathRef = useRef<SVGPathElement | null>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) return;

    const svg = svgRef.current;
    const path = pathRef.current;
    if (!svg || !path) return;

    const heroSection = document.querySelector<HTMLElement>(".hero-full-bleed");
    if (!heroSection) return;

    if (!scrollTriggerRegistered) {
      gsap.registerPlugin(ScrollTrigger);
      scrollTriggerRegistered = true;
    }

    // The SVG's viewBox tracks real window pixels (not percentages) so the
    // notch/corner arcs stay circular instead of stretching into ellipses
    // at odd aspect ratios. Resize-driven, rAF-throttled — the same
    // discipline FloatingLines.tsx uses for its own resize handling.
    let resizeFrame: number | null = null;
    const syncPath = () => {
      resizeFrame = null;
      const { innerWidth, innerHeight } = window;
      svg.setAttribute("viewBox", `0 0 ${innerWidth} ${innerHeight}`);
      path.setAttribute("d", buildFramePath(innerWidth, innerHeight, geometryFor(innerWidth)));
    };
    const onResize = () => {
      if (resizeFrame !== null) return;
      resizeFrame = window.requestAnimationFrame(syncPath);
    };
    syncPath();
    window.addEventListener("resize", onResize);

    gsap.set(svg, { transformOrigin: "50% 50%" });

    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: heroSection,
        start: "top top",
        end: () => window.innerHeight * SCROLL_FRACTION,
        scrub: true,
        onUpdate(self) {
          document.documentElement.dataset.heroOpen = self.progress >= HERO_HANDOFF_PROGRESS ? "true" : "false";
        },
      },
    });
    timeline.fromTo(
      svg,
      { scale: 1, opacity: 1 },
      { scale: SCALE_END, opacity: 0, ease: EASE_DRAMA_CSS, duration: 1 },
      0,
    );

    return () => {
      window.removeEventListener("resize", onResize);
      if (resizeFrame !== null) window.cancelAnimationFrame(resizeFrame);
      timeline.kill(); // also kills the ScrollTrigger it owns
      delete document.documentElement.dataset.heroOpen;
    };
  }, [prefersReducedMotion]);

  if (prefersReducedMotion) return null;

  return (
    <svg
      ref={svgRef}
      aria-hidden="true"
      // pointer-events-none: purely decorative, must never intercept a
      // click meant for the real navbar (once handed off) or a CTA beneath
      // it. z-[9000]: below the real navbar's documented 100000 (see
      // navbar-shell.tsx) and below hero-frame-chrome.tsx's 100001 — the
      // frame graphic itself never needs to outrank either header.
      className="pointer-events-none fixed inset-0 z-[9000] h-full w-full"
    >
      {/*
        fill-foreground/95: the one sanctioned token-derived exception this
        element already had (see the file this replaced) — --foreground is
        near-white in the dark theme this project verifies against, giving
        the "light-coloured frame" the brief describes. 95%, not 100%: this
        is now a filled band of material, not a hairline, so it needs to
        read as solid — but full opacity flattened the corners against the
        WebGL background in an early look, and 95% still lets the scene
        behind it register faintly at the band's own edges rather than
        looking like a flat cutout pasted on top.
      */}
      <path ref={pathRef} className="fill-foreground/95" fillRule="evenodd" />
    </svg>
  );
}
