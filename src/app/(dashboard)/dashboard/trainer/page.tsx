import { requireRole } from "@/server/auth/session";
import {
  getDashboardUser,
  getTrainerAssignments,
  getTrainerBatchOptions,
  getTrainerCalendarSessions,
  getTrainerModules,
  getTrainerOverview,
  getTrainerTraineeRoster,
} from "@/server/services/dashboard.service";
import { AssignmentsSection } from "@/features/dashboard-trainer/sections/assignments-section";
import { CalendarSection, type TrainerCalendarSessionView } from "@/features/dashboard-trainer/sections/calendar-section";
import { ModulesSection } from "@/features/dashboard-trainer/sections/modules-section";
import { MyTraineesSection } from "@/features/dashboard-trainer/sections/my-trainees-section";
import { OverviewSection } from "@/features/dashboard-trainer/sections/overview-section";
import { DashboardSection } from "@/components/dashboard/dashboard-shell";

export const metadata = {
  title: "Trainer Dashboard | HardTech IT Corp",
};

function toCalendarView(
  sessions: Awaited<ReturnType<typeof getTrainerCalendarSessions>>,
): TrainerCalendarSessionView[] {
  return sessions.map((session) => ({
    id: session.id,
    title: session.title,
    sessionType: session.sessionType,
    sessionDate: session.sessionDate.toISOString().slice(0, 10),
    startTime: session.startTime,
    location: session.location,
  }));
}

export default async function TrainerDashboardPage() {
  const session = await requireRole("TRAINER");
  const [user, overview, sessions, trainees, assignments, modules, batches] = await Promise.all([
    getDashboardUser(session.userId),
    getTrainerOverview(session.userId),
    getTrainerCalendarSessions(session.userId, session.role),
    getTrainerTraineeRoster(session.userId, session.role),
    getTrainerAssignments(session.userId, session.role),
    getTrainerModules(session.userId, session.role),
    getTrainerBatchOptions(session.userId, session.role),
  ]);
  const displayName = user?.name ? `Mr. ${user.name}` : "Trainer";

  return (
    <>
      <DashboardSection section="overview"><OverviewSection displayName={displayName} overview={overview} /></DashboardSection>
      <DashboardSection section="calendar"><CalendarSection sessions={toCalendarView(sessions)} batches={batches} /></DashboardSection>
      <DashboardSection section="my-trainees"><MyTraineesSection trainees={trainees} /></DashboardSection>
      <DashboardSection section="assignments"><AssignmentsSection assignments={assignments} batches={batches} /></DashboardSection>
      <DashboardSection section="modules"><ModulesSection modules={modules} batches={batches} /></DashboardSection>
    </>
  );
}
