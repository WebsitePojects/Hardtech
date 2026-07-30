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

      <UpcomingSessionsCard sessions={overview.upcomingSessions} />
    </div>
  );
}
