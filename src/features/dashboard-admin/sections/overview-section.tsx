import { Award, CreditCard, History, UserPlus, Users } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  DashboardStatCard,
  DashboardStatGrid,
} from "@/components/dashboard/dashboard-stat-card";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { getAdminAnalytics, getAdminOverviewStats } from "@/server/services/dashboard.service";
import {
  OverviewRevenueEnrollmentsChart,
  ProgramMixDonutChart,
} from "../components/admin-analytics-charts";
import { formatPesoCompact } from "../format-peso";
import { DataNotConnectedNote } from "../components/data-not-connected-note";
import { DashboardSectionButton } from "@/components/dashboard/dashboard-section-button";
import { PROGRAM_MIX_TONES } from "../program-mix-tones";

/**
 * "System Overview" (desktop-02.md #2). The only admin section with a real
 * data source — see src/server/services/dashboard.service.ts's own
 * docstring for why the other 8 sections are structure-only.
 */
export async function OverviewSection() {
  const [stats, analytics] = await Promise.all([getAdminOverviewStats(), getAdminAnalytics(6)]);
  const programMixSlices = stats.programMix.map((row) => ({
    id: row.programId,
    label: row.programName,
    value: row.activeEnrollmentCount,
  }));
  // Presentation-only scaling: the combo chart shares one Y axis between a
  // whole-peso revenue series and a single-digit enrollment-count series
  // (getAdminAnalytics keeps returning whole pesos — this does not touch the
  // service). Dividing by 1000 here matches the reference, whose own
  // tooltip reads "revenue: 10" beside a "₱10.0k" stat card, and keeps the
  // enrollments curve from being crushed flat against the axis.
  const chartData = analytics.enrollmentsByMonth.map((row, index) => ({
    month: row.month,
    enrollments: row.count,
    revenue: (analytics.revenueTrend[index]?.total ?? 0) / 1000,
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
                <ProgramMixDonutChart data={programMixSlices} />
                <ul className="space-y-2">
                  {stats.programMix.map((row, index) => (
                    <li key={row.programId} className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-foreground">
                        <span
                          className={`size-2.5 shrink-0 rounded-full ${PROGRAM_MIX_TONES[index % PROGRAM_MIX_TONES.length].dotClassName}`}
                          aria-hidden
                        />
                        {row.programName}
                      </span>
                      <span className="font-medium text-primary">{row.activeEnrollmentCount}</span>
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
          section="user-management"
          icon={Users}
          heading="Manage Users"
          subtext={`${stats.totalUsers} total`}
        />
        <QuickLinkCard
          section="enrollments"
          icon={UserPlus}
          heading="Approve Enrolls"
          subtext={`${stats.pendingEnrollments} pending`}
        />
        <QuickLinkCard
          section="certificates"
          icon={Award}
          heading="Approve Certs"
          subtext={`${stats.pendingCertificateRequests} pending`}
        />
        <QuickLinkCard
          section="audit-log"
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
  section,
  icon: Icon,
  heading,
  subtext,
}: {
  section: string;
  icon: typeof Users;
  heading: string;
  subtext: string;
}) {
  return (
    <DashboardSectionButton section={section} className="block w-full text-left">
      <Card className="gap-2 p-4 transition-colors hover:bg-glass-hover">
        <Icon className="size-5 shrink-0 text-primary" aria-hidden />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">{heading}</p>
          <p className="truncate text-xs text-muted-foreground">{subtext}</p>
        </div>
      </Card>
    </DashboardSectionButton>
  );
}
