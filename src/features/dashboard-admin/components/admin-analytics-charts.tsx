"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type EnrollmentPoint = { month: string; count: number };
type RevenuePoint = { month: string; total: number };
type OverviewPoint = { month: string; enrollments: number; revenue: number };

const axisClassName = "fill-muted-foreground text-[11px]";
const chartOne = "var(--chart-1)";
const chartTwo = "var(--chart-2)";

function shortMonth(label: string): string {
  return label.split(" ")[0] ?? label;
}

const tooltipStyle = {
  background: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius)",
  color: "var(--card-foreground)",
};

export function OverviewRevenueEnrollmentsChart({ data }: { data: OverviewPoint[] }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="month" tickFormatter={shortMonth} tickLine={false} axisLine={false} className={axisClassName} />
          <YAxis tickLine={false} axisLine={false} className={axisClassName} width={34} />
          <Tooltip contentStyle={tooltipStyle} />
          <Area
            type="monotone"
            dataKey="revenue"
            name="revenue"
            stroke={chartOne}
            fill={chartOne}
            fillOpacity={0.24}
          />
          <Line
            type="monotone"
            dataKey="enrollments"
            name="enrollments"
            stroke={chartTwo}
            strokeWidth={2}
            dot={{ r: 3, fill: chartTwo, stroke: chartTwo }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function EnrollmentsByMonthChart({ data }: { data: EnrollmentPoint[] }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="month" tickFormatter={shortMonth} tickLine={false} axisLine={false} className={axisClassName} />
          <YAxis tickLine={false} axisLine={false} className={axisClassName} width={34} />
          <Tooltip contentStyle={tooltipStyle} />
          <Bar dataKey="count" name="enrollments" fill={chartOne} radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function RevenueTrendChart({ data }: { data: RevenuePoint[] }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="month" tickFormatter={shortMonth} tickLine={false} axisLine={false} className={axisClassName} />
          <YAxis tickLine={false} axisLine={false} className={axisClassName} width={34} />
          <Tooltip contentStyle={tooltipStyle} />
          <Area
            type="monotone"
            dataKey="total"
            name="revenue"
            stroke={chartOne}
            fill={chartOne}
            fillOpacity={0.24}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
