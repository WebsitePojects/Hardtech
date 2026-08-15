"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Brand custom cursor: a precise neon dot glued to the pointer, plus a
 * larger glass ring that trails it and blooms into a filled, glowing state
 * over anything interactive. Two elements, two jobs — the dot proves
 * precision, the ring proves state.
 *
 * Gated on two independent checks, both re-evaluated live if they change
 * mid-session:
 *   - `(pointer: fine)` — a coarse/touch pointer never gets this; a custom
 *     cursor on a device with no mouse is dead weight at best and actively
 *     confusing at worst.
 *   - `prefers-reduced-motion: reduce` — falls back to the native cursor.
 * Either failing means the component renders nothing and attaches no
 * listeners; it isn't hidden with CSS, it isn't mounted.
 *
 * `pointer-events: none` on both elements (globals.css) so the cursor can
 * never itself intercept a click, and native cursors are suppressed only via
 * the `data-custom-cursor="true"` attribute this component sets on <html> —
 * scoped so nothing else in the app has to know this component exists.
 */
export function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

    function evaluate() {
      setEnabled(fine.matches && !reduced.matches);
    }

    evaluate();
    fine.addEventListener("change", evaluate);
    reduced.addEventListener("change", evaluate);
    return () => {
      fine.removeEventListener("change", evaluate);
      reduced.removeEventListener("change", evaluate);
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    document.documentElement.setAttribute("data-custom-cursor", "true");

    const interactiveSelector =
      'a, button, [role="button"], input, textarea, select, summary, [data-cursor-hover]';

    const coords = { x: 0, y: 0 };
    let hasMoved = false;
    let frame = 0;

    function paint() {
      const transform = `translate3d(${coords.x}px, ${coords.y}px, 0) translate(-50%, -50%)`;
      if (dot) dot.style.transform = transform;
      if (ring) ring.style.transform = transform;
      frame = requestAnimationFrame(paint);
    }
    frame = requestAnimationFrame(paint);

    function onMove(e: PointerEvent) {
      coords.x = e.clientX;
      coords.y = e.clientY;
      if (!hasMoved) {
        hasMoved = true;
        dot?.setAttribute("data-hidden", "false");
        ring?.setAttribute("data-hidden", "false");
      }
    }

    function onOver(e: PointerEvent) {
      if ((e.target as Element | null)?.closest(interactiveSelector)) {
        ring?.setAttribute("data-hover", "true");
      }
    }

    function onOut(e: PointerEvent) {
      if ((e.target as Element | null)?.closest(interactiveSelector)) {
        ring?.setAttribute("data-hover", "false");
      }
    }

    function onDown() {
      ring?.setAttribute("data-active", "true");
    }

    function onUp() {
      ring?.setAttribute("data-active", "false");
    }

    function onLeaveWindow() {
      dot?.setAttribute("data-hidden", "true");
      ring?.setAttribute("data-hidden", "true");
    }

    function onEnterWindow() {
      if (hasMoved) {
        dot?.setAttribute("data-hidden", "false");
        ring?.setAttribute("data-hidden", "false");
      }
    }

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver, { passive: true });
    document.addEventListener("pointerout", onOut, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    document.addEventListener("mouseleave", onLeaveWindow);
    document.addEventListener("mouseenter", onEnterWindow);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerout", onOut);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.removeEventListener("mouseleave", onLeaveWindow);
      document.removeEventListener("mouseenter", onEnterWindow);
      document.documentElement.removeAttribute("data-custom-cursor");
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      <div ref={dotRef} className="custom-cursor-dot" data-hidden="true" aria-hidden />
      <div ref={ringRef} className="custom-cursor-ring" data-hidden="true" aria-hidden />
    </>
  );
}
