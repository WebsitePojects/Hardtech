"use client";

/**
 * CSS-only brand moment for the two paths that must not run the Three.js
 * sequence: `prefers-reduced-motion: reduce` and the low-end-device
 * heuristic (see detectPreloadMode in preload-sequence.tsx). No WebGL, no
 * `three` import — this file has zero bundle cost beyond the component
 * itself and the already-shipped logo PNG.
 *
 * `instant` collapses the hold to effectively nothing: per vgldesign,
 * preloaders are skipped entirely under reduced motion, not merely
 * shortened, so this renders a near-instant single opacity fade rather than
 * the fuller brand hold used for the low-end-device path.
 */

import { useEffect, useState } from "react";
import { EASE_DRAMA_CSS } from "@/components/motion/easing";

const FULL_ENTER_MS = 220;
const FULL_HOLD_MS = 480;
const FULL_EXIT_MS = 260;

const INSTANT_ENTER_MS = 80;
const INSTANT_HOLD_MS = 260;
const INSTANT_EXIT_MS = 120;

export type StaticFallbackProps = {
  onComplete: () => void;
  /** True for the reduced-motion path; false for the low-end-device path. */
  instant: boolean;
};

export function StaticFallback({ onComplete, instant }: StaticFallbackProps) {
  const enterMs = instant ? INSTANT_ENTER_MS : FULL_ENTER_MS;
  const holdMs = instant ? INSTANT_HOLD_MS : FULL_HOLD_MS;
  const exitMs = instant ? INSTANT_EXIT_MS : FULL_EXIT_MS;

  const [stage, setStage] = useState<"enter" | "hold" | "exit">("enter");

  useEffect(() => {
    let raf1 = 0;
    let raf2 = 0;
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setStage("hold"));
    });
    const toExit = setTimeout(() => setStage("exit"), enterMs + holdMs);
    const toComplete = setTimeout(() => onComplete(), enterMs + holdMs + exitMs);
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      clearTimeout(toExit);
      clearTimeout(toComplete);
    };
  }, [enterMs, holdMs, exitMs, onComplete]);

  const opacity = stage === "hold" ? 1 : 0;
  const durationMs = stage === "exit" ? exitMs : enterMs;

  return (
    <div
      role="status"
      aria-label="Loading HardTech"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#080d12",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- fixed-position
          one-shot overlay outside layout flow; next/image's responsive
          sizing machinery is unneeded cost here. */}
      <img
        src="/images/brand/hardtech-logo.png"
        alt="HardTech"
        width={120}
        height={120}
        style={{
          width: "min(120px, 28vw)",
          height: "auto",
          opacity,
          filter: "drop-shadow(0 0 32px rgba(74, 222, 128, 0.35))",
          transition: `opacity ${durationMs}ms ${EASE_DRAMA_CSS}`,
        }}
      />
    </div>
  );
}
