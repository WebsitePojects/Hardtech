"use client";

import type * as React from "react";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

interface SelectableCardProps {
  selected: boolean;
  onSelect: () => void;
  /** "radio" for single-select groups (payment method), "checkbox" for multi-select (plan). */
  role: "radio" | "checkbox";
  accentBorder: string;
  accentRing: string;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
}

/**
 * A large, fully-clickable bordered card used for both the multi-select
 * program picker (Step 1) and the single-select payment method grid
 * (Step 3). Renders its own indicator circle rather than a native radio
 * input, matching the design's custom radio/checkmark treatment.
 */
export function SelectableCard({
  selected,
  onSelect,
  role,
  accentBorder,
  accentRing,
  disabled,
  children,
  className,
}: SelectableCardProps) {
  return (
    <button
      type="button"
      role={role}
      aria-checked={selected}
      disabled={disabled}
      onClick={onSelect}
      className={cn(
        "glass-hover relative w-full rounded-2xl border p-4 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        selected ? cn(accentBorder, "ring-2", accentRing) : "border-glass-border",
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "absolute top-4 right-4 flex size-5 items-center justify-center rounded-full border-2",
          selected ? cn(accentBorder, "bg-current") : "border-glass-border",
        )}
      >
        {selected ? <Check className="size-3 text-background" /> : null}
      </span>
      {children}
    </button>
  );
}
