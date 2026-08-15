"use client";

import * as React from "react";
import { useCallback, useState, useSyncExternalStore } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { EASE_UI_CSS } from "@/components/motion/easing";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/**
 * Same useSyncExternalStore-based read as scroll-reveal.tsx's
 * usePrefersReducedMotion — not mirrored into state via an effect, so the
 * first paint never briefly claims "motion is fine" for someone who asked
 * for less of it. Duplicated locally (rather than imported) because
 * scroll-reveal.tsx doesn't export it; behavior is identical on purpose.
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

type AnimatedFieldProps = {
  id: string;
  label: string;
  /** Rendered on the right of the label row — used for the "Forgot password?" link. */
  labelExtra?: React.ReactNode;
  /** Rendered inside the input's relative container — used for the show/hide toggle. */
  rightAdornment?: React.ReactNode;
  /** Set when the field should show the destructive-tinted error treatment. */
  error?: boolean;
} & Omit<React.ComponentProps<typeof Input>, "id">;

/**
 * Wraps the shared shadcn Label + Input (both untouched) with:
 *  - a label that shifts colour (muted -> primary, or -> destructive on
 *    error) and translates up 2px on focus/when the field has a value —
 *    subtle, on-brand "floating" motion, not a full Material overlay (the
 *    label stays in its existing above-the-input slot so the measured
 *    layout in page.tsx/login-form.tsx doesn't shift).
 *  - a border/ring transition timed on EASE_UI (200ms) instead of the
 *    instant snap the shared Input's default `transition-colors` gives a
 *    box-shadow change (box-shadow isn't one of the properties
 *    `transition-colors` covers, so the focus ring previously jumped).
 *  - the destructive-tinted border+ring shadcn/ui already wires up via
 *    `aria-invalid` on Input — reused here instead of inventing a new colour.
 *  - prefers-reduced-motion: transform is skipped entirely and the colour
 *    change drops to a short, non-EASE_UI 120ms linear fade.
 */
export function AnimatedField({
  id,
  label,
  labelExtra,
  rightAdornment,
  error = false,
  className,
  onFocus,
  onBlur,
  value,
  ...inputProps
}: AnimatedFieldProps) {
  const [focused, setFocused] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  const hasValue = typeof value === "string" ? value.length > 0 : Boolean(value);
  const active = focused || hasValue;

  const labelTransition = reducedMotion
    ? "color 120ms linear"
    : `color 200ms ${EASE_UI_CSS}, transform 200ms ${EASE_UI_CSS}`;

  const inputTransition = reducedMotion
    ? "border-color 120ms linear, box-shadow 120ms linear"
    : `border-color 200ms ${EASE_UI_CSS}, box-shadow 200ms ${EASE_UI_CSS}`;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <Label
          htmlFor={id}
          className={cn(
            "text-xs tracking-wider uppercase",
            error
              ? "text-destructive"
              : active
                ? "text-primary"
                : "text-muted-foreground",
          )}
          style={{
            transition: labelTransition,
            transform: active && !reducedMotion ? "translateY(-2px)" : "translateY(0)",
          }}
        >
          {label}
        </Label>
        {labelExtra}
      </div>
      <div className="relative">
        <Input
          id={id}
          value={value}
          aria-invalid={error || undefined}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          className={cn(rightAdornment ? "pr-9" : undefined, className)}
          style={{ transition: inputTransition }}
          {...inputProps}
        />
        {rightAdornment}
      </div>
    </div>
  );
}
