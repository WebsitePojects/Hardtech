import { Calendar, FileText, Star, Users } from "lucide-react";

import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { DashboardStatCard, DashboardStatGrid } from "@/components/dashboard/dashboard-stat-card";
import type { TrainerOverview } from "@/server/services/dashboard.service";
import { UpcomingSessionsCard } from "@/features/dashboard-trainee/upcoming-sessions-card";

export function OverviewSection({
  displayName,
  overview,
}: {
  displayName: string;
  overview: TrainerOverview;
}) {
  return (
    <div className="space-y-6">
      <DashboardPageHeader title={`Welcome, ${displayName}`} description={overview.batchLabel ?? undefined} />

      <DashboardStatGrid>
        <DashboardStatCard icon={Users} value={overview.assignedTraineeCount} label="Assigned Trainees" />
        <DashboardStatCard icon={Calendar} value={overview.upcomingSessionCount} label="Upcoming Sessions" />
        <DashboardStatCard icon={FileText} value={overview.modulesUploadedCount} label="Modules Uploaded" />
        <DashboardStatCard icon={Star} value={overview.evaluationCount} label="Evaluations" />
      </DashboardStatGrid>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.7fr)]">
        <UpcomingSessionsCard sessions={overview.upcomingSessions} className="min-w-0 lg:col-span-2" />
      </div>
    </div>
  );
}
