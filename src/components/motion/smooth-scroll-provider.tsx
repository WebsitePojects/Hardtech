"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";
import gsap from "gsap";

/**
 * Sitewide smooth scroll, driven by Lenis and ticked off GSAP's shared
 * ticker — the standard Lenis+GSAP pairing — instead of Lenis's own rAF
 * loop, so any GSAP-driven animation added later (ScrollTrigger) stays on
 * the same clock rather than drifting against a second one. `autoRaf` is
 * left off; `gsap.ticker.add` supplies the frame instead, and
 * `gsap.ticker.lagSmoothing(0)` stops GSAP silently skipping frames after a
 * tab-switch stall, which would otherwise make Lenis's scroll position jump.
 *
 * Hard gated on `prefers-reduced-motion: reduce`. Lenis 1.3 ships its own
 * `respectReducedMotion` option, but that still constructs the instance and
 * attaches listeners — it only disables the smoothing internally. vgldesign's
 * non-negotiable is stricter: a smooth-scroll library "must not initialise
 * at all" under reduced motion. So this component never calls `new Lenis()`
 * when the query matches (checked at mount, and re-checked live if the OS
 * setting changes while the page is open) and native scroll runs untouched.
 */
export function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    let tick: ((time: number) => void) | null = null;

    function start() {
      if (lenisRef.current) return;

      const lenis = new Lenis({ autoRaf: false });
      lenisRef.current = lenis;

      tick = (time: number) => {
        // gsap.ticker reports elapsed time in seconds; Lenis expects ms.
        lenis.raf(time * 1000);
      };
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);

      if (process.env.NODE_ENV !== "production") {
        // Debug/verification hook only — dead-code-eliminated in production
        // builds, never relied on by app logic.
        (window as unknown as { __lenis?: Lenis }).__lenis = lenis;
      }
    }

    function stop() {
      if (tick) {
        gsap.ticker.remove(tick);
        tick = null;
      }
      lenisRef.current?.destroy();
      lenisRef.current = null;
      if (process.env.NODE_ENV !== "production") {
        delete (window as unknown as { __lenis?: Lenis }).__lenis;
      }
    }

    function sync() {
      if (mql.matches) {
        stop();
      } else {
        start();
      }
    }

    sync();
    mql.addEventListener("change", sync);

    return () => {
      mql.removeEventListener("change", sync);
      stop();
    };
  }, []);

  return <>{children}</>;
}
