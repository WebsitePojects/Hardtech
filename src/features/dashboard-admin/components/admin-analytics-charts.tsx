"use client";

import { useEffect, useId, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { PROGRAM_MIX_TONES } from "../program-mix-tones";

type EnrollmentPoint = { month: string; count: number };
type RevenuePoint = { month: string; total: number };
type OverviewPoint = { month: string; enrollments: number; revenue: number };
export type ProgramMixSlice = { id: string; label: string; value: number };

const axisClassName = "fill-muted-foreground text-[11px]";
const chartOne = "var(--chart-1)";

/**
 * The reference's combo chart colours (measured on the live reference,
 * docs/research/02-reference-behavior.md): revenue is the saturated
 * `rgb(0,255,136)` green the design hardcodes (registered as
 * `--cyber-green-rgb` in globals.css — do not paste the hex again),
 * enrollments is the reference's hardcoded `rgb(100,180,255)`, registered as
 * `--chart-blue-rgb`. Deliberately not `--accent-blue` (`#60a5fa`), which is
 * close enough to look right in isolation and wrong side by side; that token
 * still owns UI chrome.
 */
const revenueGreen = "rgb(var(--cyber-green-rgb))";
const enrollmentsBlue = "rgb(var(--chart-blue-rgb))";

function shortMonth(label: string): string {
  return label.split(" ")[0] ?? label;
}

/**
 * Compact axis-tick formatting so a label never overflows the small width
 * recharts reserves for the Y axis. Ours previously rendered raw 4-5 digit
 * peso amounts (e.g. "16000") at `width={34}` with no left margin, which
 * pushed the right-anchored tick text left past x=0 and got clipped to its
 * last 3 digits ("000", "500", ...) — the reference renders short labels
 * ("16", "12", "8"...) that always fit. `formatPesoCompact` in
 * ../format-peso.ts does the same k-suffix compaction for stat tiles; this
 * is the chart-axis-specific sibling (also formats bare counts, not just
 * pesos, since this same axis type is reused for enrollment counts).
 */
function formatAxisTick(value: number): string {
  if (Math.abs(value) >= 1000) {
    const inThousands = value / 1000;
    return `${inThousands % 1 === 0 ? inThousands : inThousands.toFixed(1)}k`;
  }
  return value.toLocaleString("en-US");
}

const tooltipStyle = {
  background: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius)",
  color: "var(--card-foreground)",
};

/** Disables recharts' own mount/update animations for `prefers-reduced-motion: reduce`. */
function usePrefersReducedMotion(): boolean {
  // Lazy initializer, not an effect: reads the real value on the client's
  // first render and stays `false` (safe default) during SSR, where
  // `window` does not exist. The effect below only *subscribes* to future
  // changes — it never calls setState synchronously in its own body.
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = (event: MediaQueryListEvent) => setPrefersReducedMotion(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  return prefersReducedMotion;
}

/**
 * "Revenue & Enrollments" (Overview). `data.revenue` arrives already scaled
 * to thousands by the caller (overview-section.tsx's presentation-layer
 * mapping, not the service) — the reference shares one Y axis between a
 * peso revenue series and a single-digit enrollment-count series, which only
 * reads legibly when both are the same order of magnitude (reference
 * tooltip: "revenue: 10" next to a "₱10.0k" stat card). Both series render
 * as gradient-filled `<Area>`s, not an area+line combo — measured on the
 * live reference: both `revenue` and `enrollments` are
 * `.recharts-area-area`/`.recharts-area-curve`, zero `.recharts-dot`s exist.
 */
export function OverviewRevenueEnrollmentsChart({ data }: { data: OverviewPoint[] }) {
  const prefersReducedMotion = usePrefersReducedMotion();
  // Sanitized: useId()'s colons are valid in an `id` attribute but not worth
  // risking inside a `url(#...)` fill reference across renderers.
  const rawId = useId().replace(/:/g, "");
  const revenueGradientId = `${rawId}-revenue-fill`;
  const enrollmentsGradientId = `${rawId}-enrollments-fill`;
  const accessibleLabel = data
    .map((point) => `${point.month}: revenue ${point.revenue}, enrollments ${point.enrollments}`)
    .join("; ");

  return (
    <div
      className="h-72 w-full"
      role="img"
      aria-label={`Revenue in thousands of pesos and enrollment counts by month: ${accessibleLabel}`}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 12, left: 4, bottom: 0 }}>
          <defs>
            <linearGradient id={revenueGradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={revenueGreen} stopOpacity={0.4} />
              <stop offset="100%" stopColor={revenueGreen} stopOpacity={0} />
            </linearGradient>
            <linearGradient id={enrollmentsGradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={enrollmentsBlue} stopOpacity={0.35} />
              <stop offset="100%" stopColor={enrollmentsBlue} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="month" tickFormatter={shortMonth} tickLine={false} axisLine={false} className={axisClassName} />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={44}
            tickFormatter={formatAxisTick}
            className={axisClassName}
          />
          <Tooltip contentStyle={tooltipStyle} />
          <Area
            type="monotone"
            dataKey="revenue"
            name="revenue"
            stroke={revenueGreen}
            fill={`url(#${revenueGradientId})`}
            isAnimationActive={!prefersReducedMotion}
          />
          <Area
            type="monotone"
            dataKey="enrollments"
            name="enrollments"
            stroke={enrollmentsBlue}
            fill={`url(#${enrollmentsGradientId})`}
            isAnimationActive={!prefersReducedMotion}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function EnrollmentsByMonthChart({ data }: { data: EnrollmentPoint[] }) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const accessibleLabel = data.map((point) => `${point.month}: ${point.count}`).join("; ");

  return (
    <div
      className="h-72 w-full"
      role="img"
      aria-label={`Enrollments by month: ${accessibleLabel}`}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 12, left: 4, bottom: 0 }}>
          <XAxis dataKey="month" tickFormatter={shortMonth} tickLine={false} axisLine={false} className={axisClassName} />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={44}
            tickFormatter={formatAxisTick}
            className={axisClassName}
          />
          <Tooltip contentStyle={tooltipStyle} />
          <Bar
            dataKey="count"
            name="enrollments"
            fill={chartOne}
            radius={[6, 6, 0, 0]}
            isAnimationActive={!prefersReducedMotion}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function RevenueTrendChart({ data }: { data: RevenuePoint[] }) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const accessibleLabel = data.map((point) => `${point.month}: ${point.total}`).join("; ");

  return (
    <div
      className="h-72 w-full"
      role="img"
      aria-label={`Revenue trend by month: ${accessibleLabel}`}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 12, left: 4, bottom: 0 }}>
          <XAxis dataKey="month" tickFormatter={shortMonth} tickLine={false} axisLine={false} className={axisClassName} />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={44}
            tickFormatter={formatAxisTick}
            className={axisClassName}
          />
          <Tooltip contentStyle={tooltipStyle} />
          <Area
            type="monotone"
            dataKey="total"
            name="revenue"
            stroke={chartOne}
            fill={chartOne}
            fillOpacity={0.24}
            isAnimationActive={!prefersReducedMotion}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function ProgramMixTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { name?: string; value?: number }[];
}) {
  if (!active || !payload?.length) return null;
  const slice = payload[0];
  return (
    <div style={tooltipStyle} className="px-3 py-1.5 text-xs">
      {slice.name}: {slice.value}
    </div>
  );
}

/**
 * Program Mix donut (desktop-02.md #2 / ADM-REF-Overview.png): a hollow-centre
 * recharts pie, one `<Cell>` per program cycling `PROGRAM_MIX_TONES`. The
 * text legend (dot / label / count) is rendered by the caller since it needs
 * no client boundary — only the SVG chart does.
 */
export function ProgramMixDonutChart({ data }: { data: ProgramMixSlice[] }) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const accessibleLabel = data.map((slice) => `${slice.label} ${slice.value}`).join(", ");

  return (
    <div
      className="h-48 w-full"
      role="img"
      aria-label={`Program mix by active enrollments: ${accessibleLabel}`}
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="label"
            innerRadius="62%"
            outerRadius="92%"
            paddingAngle={2}
            strokeWidth={0}
            isAnimationActive={!prefersReducedMotion}
          >
            {data.map((slice, index) => (
              <Cell
                key={slice.id}
                fill={PROGRAM_MIX_TONES[index % PROGRAM_MIX_TONES.length].chartColor}
              />
            ))}
          </Pie>
          <Tooltip content={<ProgramMixTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
