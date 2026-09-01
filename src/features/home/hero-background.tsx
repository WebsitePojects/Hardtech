"use client";

import { useEffect, useRef, useState } from "react";
import FloatingLines from "@/components/FloatingLines";

// Client-specified brand gradient for the hero WebGL lines — verbatim hex
// values from the brief, kept in one named constant so the "why" (client
// spec, not a token) travels with the value. This is the ONE permitted
// exception to the token-only colour rule in
// .claude/rules/20-design-fidelity.md: do not fold these into CSS custom
// properties, and do not "fix" them toward --primary or --hero-glow-* just
// because they're visually adjacent to that ramp.
const HERO_LINES_GRADIENT: string[] = ["#00bc59", "#00bf5b", "#008e43"];

/**
 * Hero background layer: mounts the WebGL FloatingLines effect, or a static
 * fallback, behind the hero's content column.
 *
 * Client component boundary for hero.tsx (a Server Component) — only plain,
 * serializable props are defined here and nothing crosses back the other
 * way, per the /forum incident in the lessons log (a function prop crossing
 * Server->Client throws at render, not at typecheck).
 *
 * Mount gate: the WebGL canvas (real threejs renderer + a per-frame RAF
 * loop) only mounts when BOTH are true —
 *   1. the visitor has no `prefers-reduced-motion: reduce` preference, and
 *   2. this layer is actually in the viewport (IntersectionObserver).
 * Reduced-motion renders the static fallback instead of the canvas, not a
 * slowed-down version of it. Scrolling the hero out of view unmounts the
 * canvas so the RAF loop and renderer stop costing anything once a
 * mid-range phone has scrolled past it — see FloatingLines.tsx's cleanup
 * (cancelAnimationFrame, ResizeObserver.disconnect, pointer listener
 * removal, geometry/material/renderer.dispose(), forceContextLoss(), and
 * DOM node removal) for what that unmount actually releases.
 */
export function HeroBackground() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [renderCanvas, setRenderCanvas] = useState(false);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let isIntersecting = false;

    const evaluate = () => setRenderCanvas(isIntersecting && !motionQuery.matches);

    const observer = new IntersectionObserver(
      ([entry]) => {
        isIntersecting = entry.isIntersecting;
        evaluate();
      },
      { threshold: 0 },
    );
    if (containerRef.current) observer.observe(containerRef.current);

    // Safari < 14 lacks addEventListener on MediaQueryList; every target
    // browser floor in .claude/rules/30-nextjs-16.md (Safari 16.4+) has it.
    motionQuery.addEventListener("change", evaluate);

    return () => {
      observer.disconnect();
      motionQuery.removeEventListener("change", evaluate);
    };
  }, []);

  return (
    // Fixed defect 1: was `inset-x-0 top-0 h-[36rem]` — a hard 576px cap left
    // over from the old flat radial-gradient div, from before the hero
    // became full-viewport. `inset-0` instead fills the parent
    // `.hero-full-bleed` section exactly, at whatever height that section
    // actually renders at (min-height:100dvh, or taller still on a short
    // landscape phone where the content column forces it to grow — see
    // hero.tsx's own [@media(max-height:480px)] comments). FloatingLines'
    // ResizeObserver watches this container's own box, so it re-syncs the
    // canvas/shader resolution whenever that box's size changes for any
    // reason (viewport resize, orientation change, or the section growing
    // to fit content) — verified in the Playwright pass rather than assumed.
    <div ref={containerRef} className="absolute inset-0 -z-10">
      {renderCanvas ? (
        // No pointer-events-none on this branch: the client asked for
        // `interactive` cursor-bend behaviour, which needs
        // pointermove/pointerleave to actually reach FloatingLines' canvas.
        // Leaving it hit-testable is safe here specifically because this
        // div is `-z-10` inside `section` (position: relative) in
        // hero.tsx: CSS stacking always paints non-positioned in-flow
        // content (the H1, CTAs, trust row, mobile announcements teaser)
        // above a negative-z-index sibling regardless of that sibling's
        // pointer-events, so this layer can only ever receive pointer input
        // in the empty margin around that content — never over a CTA. The
        // floating AnnouncementsCard variant is `position: fixed` with its
        // own z-30 stacking context and is likewise always above this
        // layer, click-wise, independent of DOM order.
        <FloatingLines
          linesGradient={HERO_LINES_GRADIENT}
          animationSpeed={1}
          interactive
          bendRadius={5}
          bendStrength={-0.5}
          mouseDamping={0.09}
          parallax={false}
          parallaxStrength={0.2}
        />
      ) : (
        // Static, token-driven fallback — the same two classes the div this
        // component replaces used together (see globals.css: ".hero-glow"
        // is the shared 9-section base, ".hero-glow-home" is the home
        // hero's own directional composition, layered on top by design).
        // Used for prefers-reduced-motion, for the brief gap before the
        // visibility check resolves on first mount, and once the canvas has
        // been unmounted after scrolling past.
        <div className="hero-glow hero-glow-home pointer-events-none h-full w-full" />
      )}
    </div>
  );
}
