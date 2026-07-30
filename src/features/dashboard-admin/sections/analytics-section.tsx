import { CreditCard, ShieldCheck, TrendingUp, Users } from "lucide-react";

import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DashboardStatCard,
  DashboardStatGrid,
} from "@/components/dashboard/dashboard-stat-card";
import { getAdminAnalytics } from "@/server/services/dashboard.service";
import {
  EnrollmentsByMonthChart,
  RevenueTrendChart,
} from "../components/admin-analytics-charts";

/**
 * "Reports & Analytics" (desktop-02.md #11). The sidebar's own nav item
 * reads "Analytics" while this page's H1 reads "Reports & Analytics" — a
 * confirmed, intentional mismatch (mobile-05.md screenshot #20 / open
 * question #5) reproduced as-is, not reconciled.
 */
export async function AnalyticsSection() {
  const analytics = await getAdminAnalytics(6);

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title="Reports & Analytics"
        description="Cohort, revenue and engagement breakdowns"
      />

      {/* NOT SOURCED: dashboard.service has no signup/activation/DAU/ARPU
          reads for this section. */}
      <DashboardStatGrid>
        <DashboardStatCard icon={TrendingUp} value="—" label="New Signups" tone="green" />
        <DashboardStatCard icon={ShieldCheck} value="—" label="Activation Rate" tone="green" />
        <DashboardStatCard icon={Users} value="—" label="Daily Active" tone="blue" />
        <DashboardStatCard icon={CreditCard} value="—" label="ARPU" tone="blue" />
      </DashboardStatGrid>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Enrollments by Month</CardTitle>
          </CardHeader>
          <CardContent>
            {/* TODO(orchestrator): dashboard.service has no monthly
                enrollment-count read, and recharts is not in
                package.json — the bar chart cannot be sourced or
                rendered yet. */}
            <EnrollmentsByMonthChart data={analytics.enrollmentsByMonth} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {/* TODO(orchestrator): same gap as above, for monthly revenue. */}
            <RevenueTrendChart data={analytics.revenueTrend} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
