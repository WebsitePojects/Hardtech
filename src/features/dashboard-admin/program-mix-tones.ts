/**
 * Program Mix color ramp, cycled by index rather than hardcoded per program
 * name — `programMix` (src/server/services/dashboard.service.ts) is real
 * data whose length/order is not fixed to exactly 3 (desktop-02.md #2 shows
 * 3 rows; our seed data can have fewer or more active programs).
 *
 * Shared between the server-rendered legend (overview-section.tsx, needs a
 * Tailwind class for the dot) and the client donut chart
 * (admin-analytics-charts.tsx, needs an actual CSS colour string for
 * recharts' `<Cell fill>`, which cannot take a Tailwind class name) so the
 * two never drift out of sync. Every colour is an existing CSS custom
 * property from src/app/globals.css — none invented here.
 */
export const PROGRAM_MIX_TONES = [
  { dotClassName: "bg-primary", chartColor: "var(--primary)" },
  { dotClassName: "bg-primary-light", chartColor: "var(--primary-light)" },
  { dotClassName: "bg-brand-blue", chartColor: "var(--accent-blue)" },
  { dotClassName: "bg-brand-purple", chartColor: "var(--accent-purple)" },
  { dotClassName: "bg-brand-orange", chartColor: "var(--accent-orange)" },
] as const;
