import Link from "next/link";
import { Award, CreditCard, History, UserPlus, Users } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  DashboardStatCard,
  DashboardStatGrid,
} from "@/components/dashboard/dashboard-stat-card";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { getAdminAnalytics, getAdminOverviewStats } from "@/server/services/dashboard.service";
import { OverviewRevenueEnrollmentsChart } from "../components/admin-analytics-charts";
import { formatPesoCompact } from "../format-peso";
import { DataNotConnectedNote } from "../components/data-not-connected-note";

/** desktop-02.md #2: 3-segment legend (green / light green / blue) — cycled
 * by index rather than hardcoded per program name, since `programMix` is
 * real data whose length/order is not fixed to exactly 3. */
const PROGRAM_MIX_TONES = ["bg-primary", "bg-primary-light", "bg-brand-blue", "bg-brand-purple", "bg-brand-orange"];

/**
 * "System Overview" (desktop-02.md #2). The only admin section with a real
 * data source — see src/server/services/dashboard.service.ts's own
 * docstring for why the other 8 sections are structure-only.
 */
export async function OverviewSection() {
  const [stats, analytics] = await Promise.all([getAdminOverviewStats(), getAdminAnalytics(6)]);
  const totalProgramMix = stats.programMix.reduce((sum, row) => sum + row.activeEnrollmentCount, 0);
  const chartData = analytics.enrollmentsByMonth.map((row, index) => ({
    month: row.month,
    enrollments: row.count,
    revenue: analytics.revenueTrend[index]?.total ?? 0,
  }));

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title="System Overview"
        description="HardTech IT Corp — operations at a glance"
      />

      <DashboardStatGrid>
        <DashboardStatCard icon={Users} value={stats.totalUsers} label="Total Users" tone="green" />
        <DashboardStatCard
          icon={UserPlus}
          value={stats.pendingEnrollments}
          label="Pending Enrolls"
          tone="amber"
        />
        <DashboardStatCard
          icon={CreditCard}
          value={formatPesoCompact(stats.revenueMtd)}
          label="Revenue (MTD)"
          tone="green"
        />
        <DashboardStatCard
          icon={Award}
          value={stats.pendingCertificateRequests}
          label="Cert Requests"
          tone="blue"
        />
      </DashboardStatGrid>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Revenue &amp; Enrollments</CardTitle>
            <CardDescription>Last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            {/* TODO(orchestrator): dashboard.service has no monthly
                revenue/enrollment trend read, and recharts is not in
                package.json (docs/research/01-design-source.md lists it,
                but it's absent from this build's dependencies) — the
                combo area+line chart cannot be sourced or rendered yet. */}
            {chartData.length === 0 ? (
              <DataNotConnectedNote detail="Monthly revenue/enrollment history returned no buckets." />
            ) : (
              <OverviewRevenueEnrollmentsChart data={chartData} />
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Program Mix</CardTitle>
            <CardDescription>Active enrollments</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.programMix.length === 0 ? (
              <DataNotConnectedNote detail="No active enrollments found." />
            ) : (
              <div className="space-y-3">
                <div className="flex h-2.5 overflow-hidden rounded-full bg-muted">
                  {stats.programMix.map((row, index) => (
                    <span
                      key={row.programId}
                      className={PROGRAM_MIX_TONES[index % PROGRAM_MIX_TONES.length]}
                      style={{
                        width: `${totalProgramMix === 0 ? 0 : (row.activeEnrollmentCount / totalProgramMix) * 100}%`,
                      }}
                      aria-hidden
                    />
                  ))}
                </div>
                <ul className="space-y-2">
                  {stats.programMix.map((row, index) => (
                    <li key={row.programId} className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-foreground">
                        <span
                          className={`size-2.5 shrink-0 rounded-full ${PROGRAM_MIX_TONES[index % PROGRAM_MIX_TONES.length]}`}
                          aria-hidden
                        />
                        {row.programName}
                      </span>
                      <span className="font-medium text-foreground">{row.activeEnrollmentCount}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <QuickLinkCard
          href="/dashboard/admin?section=user-management"
          icon={Users}
          heading="Manage Users"
          subtext={`${stats.totalUsers} total`}
        />
        <QuickLinkCard
          href="/dashboard/admin?section=enrollments"
          icon={UserPlus}
          heading="Approve Enrolls"
          subtext={`${stats.pendingEnrollments} pending`}
        />
        <QuickLinkCard
          href="/dashboard/admin?section=certificates"
          icon={Award}
          heading="Approve Certs"
          subtext={`${stats.pendingCertificateRequests} pending`}
        />
        <QuickLinkCard
          href="/dashboard/admin?section=audit-log"
          icon={History}
          // NOT SOURCED: dashboard.service has no audit-log count read.
          heading="Audit Log"
          subtext="— events"
        />
      </div>
    </div>
  );
}

function QuickLinkCard({
  href,
  icon: Icon,
  heading,
  subtext,
}: {
  href: string;
  icon: typeof Users;
  heading: string;
  subtext: string;
}) {
  return (
    <Link href={href}>
      <Card className="flex-row items-center gap-3 p-4 transition-colors hover:bg-glass-hover">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary" aria-hidden>
          <Icon className="size-4.5" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">{heading}</p>
          <p className="truncate text-xs text-muted-foreground">{subtext}</p>
        </div>
      </Card>
    </Link>
  );
}
