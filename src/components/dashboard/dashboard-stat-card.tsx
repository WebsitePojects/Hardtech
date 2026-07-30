import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

type StatTone = "green" | "amber" | "blue" | "red" | "purple";

/**
 * Tone -> token classes. Every stat card across desktop-02.md uses one of
 * these five coloured icon circles (green, amber, red, blue; purple is not
 * seen on a stat tile in the sourced screenshots but is included for parity
 * with the admin avatar accent — mark any purple stat tile NOT SOURCED if a
 * wave-3 builder reaches for it).
 */
const toneClassNames: Record<StatTone, string> = {
  green: "bg-primary/15 text-primary",
  amber: "bg-brand-orange/15 text-brand-orange",
  blue: "bg-brand-blue/15 text-brand-blue",
  red: "bg-destructive/15 text-destructive",
  purple: "bg-brand-purple/15 text-brand-purple",
};

export type DashboardStatCardProps = {
  icon: LucideIcon;
  /** e.g. "7", "₱10.0k", "Active" — desktop-02.md #22 shows a text value
   * ("Active") alongside numeric ones, so this is intentionally not
   * number-only. */
  value: string | number;
  label: string;
  tone?: StatTone;
  className?: string;
};

/**
 * Stat tile: coloured icon circle (top-left) + bold value + muted label
 * (docs/screens/desktop-02.md, every dashboard overview/section). Purely
 * presentational and prop-driven — wave-3 supplies the real value/label per
 * section; this component invents no data.
 */
export function DashboardStatCard({
  icon: Icon,
  value,
  label,
  tone = "green",
  className,
}: DashboardStatCardProps) {
  return (
    <Card className={cn("gap-3 p-4", className)}>
      <span
        className={cn(
          "flex size-9 items-center justify-center rounded-full",
          toneClassNames[tone]
        )}
        aria-hidden
      >
        <Icon className="size-4.5" />
      </span>
      <p className="font-heading text-2xl font-semibold text-foreground">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </Card>
  );
}

export type DashboardStatGridProps = {
  children: React.ReactNode;
  /** Column count at `lg`+. Always 2 columns below `lg` regardless of this
   * value — docs/screens/mobile-05.md "Mobile layout rules": "Stat cards
   * always tile 2 columns x N rows on mobile (never 4-across)". */
  desktopColumns?: 2 | 3 | 4;
  className?: string;
};

export function DashboardStatGrid({
  children,
  desktopColumns = 4,
  className,
}: DashboardStatGridProps) {
  const desktopColsClassName =
    desktopColumns === 2
      ? "lg:grid-cols-2"
      : desktopColumns === 3
        ? "lg:grid-cols-3"
        : "lg:grid-cols-4";

  return (
    <div className={cn("grid grid-cols-2 gap-4", desktopColsClassName, className)}>
      {children}
    </div>
  );
}
