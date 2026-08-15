"use client";

/**
 * <PreloadSequence /> — the only export the rest of the app should import.
 *
 * Integration contract (for whoever wires this into layout.tsx):
 *
 *   import dynamic from "next/dynamic";
 *   const PreloadSequence = dynamic(
 *     () => import("@/components/three/preload-sequence").then(m => m.PreloadSequence),
 *     { ssr: false },
 *   );
 *   ...
 *   <PreloadSequence onComplete={() => {}} />   // drop it anywhere in the tree;
 *                                                 // it overlays, it doesn't gate.
 *
 * - Props: `{ onComplete?: () => void }`. `onComplete` fires once, exactly
 *   when the preloader's own exit transition finishes and it is about to
 *   render `null`. Optional — the component unmounts itself regardless.
 * - sessionStorage key: `hardtech-preloader-shown`. Set by this component
 *   itself the moment its sequence finishes (or immediately, on any of the
 *   skip paths below) — callers never need to set it.
 * - Renders `null` on the server and stays `null` on the client whenever any
 *   gate below routes to "gone" — no placeholder, no layout shift.
 *
 * Reference-object decision (img2threejs): the HardTech mark
 * (public/images/brand/hardtech-logo.png) is a flat badge — gear outline,
 * PCB-trace linework, an Android/Apple glyph pair, two lines of set type,
 * transparent background, no depth/shading cues anywhere in it. There's no
 * volumetric form hiding in that silhouette; extruding it would yield a flat
 * medallion whose only "3D" quality is a bevel on the outline, not a real
 * sculpted object. That is precisely the case the brief's fallback
 * anticipates, so this build uses a procedural technology object instead: a
 * QFP-style CPU package (substrate, lid, glowing die, PCB traces, instanced
 * lead pins, pin-1 indicator — see create-chip-model.ts) finished in
 * HardTech's brand green (#4ade80, the dark-theme --neon value, since dark
 * is this app's primary/verified theme per 20-design-fidelity.md). It is
 * built entirely from `three` primitives — no downloaded mesh, texture, or
 * GLB.
 *
 * Three independent gates run before any Three.js code is even requested:
 *   1. sessionStorage — already shown this session -> render nothing.
 *   2. prefers-reduced-motion -> CSS-only near-instant static frame, no spin.
 *   3. low-end-device heuristic -> CSS-only static brand fade, no WebGL.
 * Only when all three pass does the component request the `chip-scene`
 * chunk via next/dynamic(..., { ssr: false }), so the `three` runtime is
 * fetched, parsed, and executed only for the sessions that actually get to
 * see it — never in the shared/critical bundle. Measured cost: the
 * `chip-scene` chunk (three.js + this factory, minified) is ~520KB raw /
 * ~132KB gzip; the always-loaded gateway (this file + the static fallback,
 * `three` excluded) is ~2.2KB raw / ~1.2KB gzip. See the build report for
 * full methodology.
 */

import { Component, type ReactNode, useCallback, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { StaticFallback } from "./preloader-static-fallback";

export const PRELOADER_SESSION_KEY = "hardtech-preloader-shown";

const ChipScene = dynamic(() => import("./chip-scene").then((m) => m.ChipScene), {
  ssr: false,
});

type Mode = "gone" | "static-instant" | "static-brand" | "three";

function readSessionFlag(): boolean {
  try {
    return sessionStorage.getItem(PRELOADER_SESSION_KEY) === "1";
  } catch {
    // Storage blocked (private mode / disabled) — fail open to "not shown"
    // rather than throwing; worst case the brand moment repeats.
    return false;
  }
}

function writeSessionFlag(): void {
  try {
    sessionStorage.setItem(PRELOADER_SESSION_KEY, "1");
  } catch {
    // Best-effort. Nothing else to do if storage is unavailable.
  }
}

/**
 * Low-end heuristic: any ONE signal being low routes to the static
 * fallback. `hardwareConcurrency` and `deviceMemory` are treated as unknown
 * (not "assume high-end") when unsupported/undefined — Safari and older
 * browsers omit both, and this must not treat "unknown" as "fast". Viewport
 * width is the always-available proxy: a narrow viewport is either a phone
 * or a squeezed window, and either way a full WebGL spin-up is the wrong
 * trade for it.
 */
function detectMode(): Mode {
  if (typeof window === "undefined") return "gone";
  if (readSessionFlag()) return "gone";

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reducedMotion) return "static-instant";

  const cores = navigator.hardwareConcurrency;
  const lowCores = typeof cores === "number" && cores > 0 && cores <= 4;

  const deviceMemory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  const lowMemory = typeof deviceMemory === "number" && deviceMemory <= 4;

  const narrowViewport = window.innerWidth <= 480;

  if (lowCores || lowMemory || narrowViewport) return "static-brand";

  return "three";
}

class PreloaderErrorBoundary extends Component<
  { onError: () => void; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    // Never let a Three.js/runtime error brick the page it's decorating.
    this.props.onError();
  }

  render() {
    if (this.state.failed) return null;
    return this.props.children;
  }
}

export type PreloadSequenceProps = {
  onComplete?: () => void;
};

export function PreloadSequence({ onComplete }: PreloadSequenceProps) {
  const mode = useMemo(() => detectMode(), []);
  const [visible, setVisible] = useState(mode !== "gone");

  const finish = useCallback(() => {
    writeSessionFlag();
    setVisible(false);
    onComplete?.();
  }, [onComplete]);

  if (!visible || mode === "gone") return null;

  if (mode === "static-instant") {
    return <StaticFallback onComplete={finish} instant />;
  }

  if (mode === "static-brand") {
    return <StaticFallback onComplete={finish} instant={false} />;
  }

  return (
    <PreloaderErrorBoundary onError={finish}>
      <ChipScene onComplete={finish} />
    </PreloaderErrorBoundary>
  );
}
