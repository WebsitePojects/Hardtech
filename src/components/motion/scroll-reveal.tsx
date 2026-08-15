"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { EASE_REVEAL_CSS, REVEAL_OFFSET_PX } from "./easing";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/**
 * Reads the reduced-motion preference as an external store rather than
 * mirroring it into state from an effect. Mirroring meant the first paint
 * always claimed "motion is fine" and then corrected itself a tick later,
 * which is both a wasted render and, for someone who asked for less motion,
 * a flash of exactly the thing they opted out of.
 *
 * `getServerSnapshot` returns false because the server has no media queries;
 * the client subscribes on hydration and takes over immediately.
 */
function usePrefersReducedMotion(): boolean {
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

type ScrollRevealProps = {
  children: React.ReactNode;
  className?: string;
  /** Stagger delay in ms — pair with vgldesign's measured 80ms per child. */
  delayMs?: number;
  durationMs?: number;
  axis?: "y" | "x";
  /**
   * Set this true for any element that can sit in the LAST VIEWPORT-HEIGHT
   * of a page — a footer's closing element, the last card in a short list,
   * anything below which there is no more page.
   *
   * Found on the footer's ghost wordmark (src/components/layout/footer.tsx):
   * the default observer uses `rootMargin: "0px 0px -80px 0px"`, which
   * shrinks the viewport it tests intersection against by 80px at the
   * bottom. That's the right trigger-a-little-early feel for a normal
   * scroll-down reveal, but it silently breaks for an element positioned
   * near the true end of the document — on a short page, the document can
   * run out of scrollable distance before that element ever satisfies "15%
   * visible inside a viewport 80px shorter than the real one," and
   * `entry.isIntersecting` never fires. The element then sits at its
   * pre-trigger opacity: 0 forever. This is *worse* than not wrapping it in
   * `ScrollReveal` at all — the content is invisible instead of merely
   * unanimated, and nothing in the console or the render tree says why.
   *
   * `nearBottom` uses `rootMargin: "0px"` (no shrinkage — the real
   * viewport) and `threshold: 0` (any pixel counts, not 15%) instead of the
   * default. That is enough margin of error for an element with nowhere
   * further to scroll to. It still won't fire before mount if the element
   * is server-rendered already inside the initial viewport, which is
   * correct — nothing to reveal from off-screen in that case.
   *
   * Rule for the next person adding a `ScrollReveal`: if the element can be
   * the last thing on a page (or close to it — check at 390x844, the
   * shortest viewport this project supports), either pass `nearBottom` or
   * don't wrap it. Do not ship a reveal that can go permanently invisible;
   * that failure mode has already happened once and cost a real debugging
   * pass to find.
   */
  nearBottom?: boolean;
};

/**
 * vgldesign technique #1 — attribute-driven scroll reveal, ported to a
 * per-element IntersectionObserver instead of the single-document-observer
 * form, since this wraps arbitrary React children rather than static markup.
 * Pre-trigger state is the measured 48px `translateY` (or 28px `translateX`
 * for the horizontal variant) at 0 opacity, animating in on `EASE_REVEAL`.
 * Fires once — `observer.disconnect()` after the first intersection, so it
 * never re-hides content the user has already seen.
 *
 * Reduced motion: skips the observer and the transform entirely and renders
 * pre-revealed, with only a 200ms opacity fade on mount — the "plain,
 * instant (or ~200ms opacity fade)" degradation vgldesign requires for every
 * technique in this category (as opposed to smooth-scroll/parallax/mask
 * reveal/preloaders, which must not run at all).
 */
export function ScrollReveal({
  children,
  className,
  delayMs = 0,
  durationMs = 700,
  axis = "y",
  nearBottom = false,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [hasIntersected, setHasIntersected] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    // Nothing to observe when motion is reduced — visibility is derived
    // below instead. Setting state here would be a synchronous setState in
    // an effect, which cascades an extra render for no benefit.
    if (reducedMotion) return;

    const el = ref.current;
    if (!el) return;

    // See the `nearBottom` prop doc above: the default -80px bottom
    // rootMargin can never be satisfied by an element with no more page
    // below it to scroll through, which leaves it stuck at opacity: 0.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasIntersected(true);
          observer.disconnect();
        }
      },
      nearBottom
        ? { threshold: 0, rootMargin: "0px" }
        : { threshold: 0.15, rootMargin: "0px 0px -80px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [reducedMotion, nearBottom]);

  // Derived, not stored: reduced motion means "already revealed" without a
  // state write, so the element never renders hidden for a frame first.
  const visible = reducedMotion || hasIntersected;

  const hiddenTransform =
    axis === "y" ? `translateY(${REVEAL_OFFSET_PX}px)` : "translateX(-28px)";

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translate(0, 0)" : hiddenTransform,
        transition: reducedMotion
          ? "opacity 200ms " + EASE_REVEAL_CSS
          : `opacity ${durationMs}ms ${EASE_REVEAL_CSS} ${delayMs}ms, transform ${durationMs}ms ${EASE_REVEAL_CSS} ${delayMs}ms`,
        willChange: "opacity, transform",
      }}
    >
      {children}
    </div>
  );
}
