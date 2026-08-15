"use client";

/**
 * The heavy half of the preloader. This file is the only one in the
 * preloader that imports `three`, and it is reached exclusively through a
 * `next/dynamic(..., { ssr: false })` import from preload-sequence.tsx — it
 * never ships in the initial/shared bundle and never runs on the server.
 *
 * Renderer setup only. Geometry construction lives in create-chip-model.ts.
 *
 * Timeline (all durations in ms, budget < 2000ms total):
 *   enter (260)  -> wrapper fades/scales in on EASE_DRAMA
 *   spin  (900)  -> chip spins up ~1.25 turns, easeOutCubic deceleration
 *   hold  (220)  -> chip settles into a slow idle spin
 *   exit  (320)  -> wrapper fades/scales out on EASE_DRAMA, then onComplete
 *   total ≈ 1700ms
 */

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { createChipModel } from "./create-chip-model";
import { EASE_DRAMA_CSS } from "@/components/motion/easing";

const INTRO_MS = 260;
const SPIN_MS = 900;
const HOLD_MS = 220;
const OUTRO_MS = 320;
const SPIN_TURNS = 1.25;
const IDLE_RAD_PER_MS = 0.00045;

function easeOutCubic(t: number): number {
  const clamped = Math.min(1, Math.max(0, t));
  return 1 - Math.pow(1 - clamped, 3);
}

export type ChipSceneProps = {
  onComplete: () => void;
};

export function ChipScene({ onComplete }: ChipSceneProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [stage, setStage] = useState<"enter" | "hold" | "exit">("enter");

  // Stage timeline — deterministic setTimeout chain rather than
  // transitionend listeners, so the total preloader budget is exact and not
  // at the mercy of a dropped animationend event on a busy main thread.
  useEffect(() => {
    let raf1 = 0;
    let raf2 = 0;
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setStage("hold"));
    });
    const toExit = setTimeout(() => setStage("exit"), INTRO_MS + SPIN_MS + HOLD_MS);
    const toComplete = setTimeout(
      () => onComplete(),
      INTRO_MS + SPIN_MS + HOLD_MS + OUTRO_MS,
    );
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      clearTimeout(toExit);
      clearTimeout(toComplete);
    };
  }, [onComplete]);

  // Renderer lifecycle — independent of `stage`, runs continuously from
  // mount to unmount so the spin never restarts or stutters on a state
  // change.
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let renderer: THREE.WebGLRenderer;
    let frameId = 0;
    let disposed = false;
    let disposeModel: (() => void) | null = null;

    try {
      const size = mount.clientWidth || 240;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 20);
      camera.position.set(2.6, 2.1, 2.6);
      camera.lookAt(0, 0.15, 0);

      const ambient = new THREE.AmbientLight(0xffffff, 1.15);
      const key = new THREE.DirectionalLight(0xffffff, 2.6);
      key.position.set(3, 4, 2);
      const fill = new THREE.DirectionalLight(0xbfe8cf, 0.9);
      fill.position.set(-2.5, 1.5, 2.5);
      const rim = new THREE.PointLight(0x4ade80, 14, 14, 2);
      rim.position.set(-2, 1.2, -1.5);
      scene.add(ambient, key, fill, rim);

      const { group, dispose } = createChipModel();
      disposeModel = dispose;
      group.rotation.x = -0.34;
      scene.add(group);

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(size, size);
      renderer.setClearColor(0x000000, 0);
      mount.appendChild(renderer.domElement);

      const handleResize = () => {
        const next = mount.clientWidth || size;
        renderer.setSize(next, next);
      };
      window.addEventListener("resize", handleResize);

      const start = performance.now();
      const tick = () => {
        if (disposed) return;
        const elapsed = performance.now() - start;

        if (elapsed < SPIN_MS) {
          group.rotation.y = easeOutCubic(elapsed / SPIN_MS) * SPIN_TURNS * Math.PI * 2;
        } else {
          group.rotation.y =
            SPIN_TURNS * Math.PI * 2 + (elapsed - SPIN_MS) * IDLE_RAD_PER_MS;
        }

        renderer.render(scene, camera);
        frameId = requestAnimationFrame(tick);
      };
      frameId = requestAnimationFrame(tick);

      return () => {
        disposed = true;
        cancelAnimationFrame(frameId);
        window.removeEventListener("resize", handleResize);
        disposeModel?.();
        renderer.dispose();
        if (renderer.domElement.parentNode === mount) {
          mount.removeChild(renderer.domElement);
        }
      };
    } catch {
      // WebGL unavailable or context creation failed — fail open. The
      // preloader must never block the page it is decorating.
      onComplete();
      return;
    }
  }, [onComplete]);

  const active = stage === "hold";
  const opacity = active ? 1 : 0;
  const scale = stage === "enter" ? 0.92 : stage === "exit" ? 1.05 : 1;
  const durationMs = stage === "exit" ? OUTRO_MS : INTRO_MS;

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
        backgroundImage:
          "radial-gradient(ellipse at center, rgba(74,222,128,0.14) 0%, transparent 65%)",
      }}
    >
      <div
        ref={mountRef}
        style={{
          width: "min(260px, 42vw)",
          height: "min(260px, 42vw)",
          opacity,
          transform: `scale(${scale})`,
          transition: `opacity ${durationMs}ms ${EASE_DRAMA_CSS}, transform ${durationMs}ms ${EASE_DRAMA_CSS}`,
          willChange: "opacity, transform",
        }}
      />
    </div>
  );
}
