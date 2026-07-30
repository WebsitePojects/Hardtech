import type { HelpAccent } from "@/features/help/help-content";

/**
 * Per-role accent mapping. Admin uses --accent-blue, Trainer uses
 * --accent-orange (amber), Trainee uses the site's primary --neon green —
 * the one place on the site the "selected" indicator departs from neon
 * green (docs/screens/mobile-02.md, mobile-03.md).
 *
 * Tailwind needs literal class strings to scan at build time, so this is a
 * static record rather than string interpolation.
 */
export const ACCENT_STYLES: Record<
  HelpAccent,
  {
    text: string;
    border: string;
    ring: string;
    iconBg: string;
    tintBg: string;
  }
> = {
  blue: {
    text: "text-brand-blue",
    border: "border-brand-blue",
    ring: "ring-brand-blue/30",
    iconBg: "bg-brand-blue/15",
    tintBg: "bg-brand-blue/10",
  },
  orange: {
    text: "text-brand-orange",
    border: "border-brand-orange",
    ring: "ring-brand-orange/30",
    iconBg: "bg-brand-orange/15",
    tintBg: "bg-brand-orange/10",
  },
  green: {
    text: "text-primary",
    border: "border-primary",
    ring: "ring-primary/30",
    iconBg: "bg-primary/15",
    tintBg: "bg-primary/10",
  },
};
