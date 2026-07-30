import { requireRole } from "@/server/auth/session";
import {
  getDashboardUser,
  getTrainerAssignments,
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

export const metadata = {
  title: "Trainer Dashboard | HardTech IT Corp",
};

interface TrainerDashboardSearchParams {
  section?: string;
}

interface TrainerDashboardPageProps {
  searchParams: Promise<TrainerDashboardSearchParams>;
}

type TrainerSection = "overview" | "calendar" | "my-trainees" | "assignments" | "modules";

function parseSection(value: string | undefined): TrainerSection {
  switch (value) {
    case "overview":
    case "calendar":
    case "my-trainees":
    case "assignments":
    case "modules":
      return value;
    default:
      return "overview";
  }
}

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

export default async function TrainerDashboardPage(props: TrainerDashboardPageProps) {
  const session = await requireRole("TRAINER");
  const searchParams = await props.searchParams;
  const section = parseSection(searchParams.section);

  const [user, overview] = await Promise.all([
    getDashboardUser(session.userId),
    getTrainerOverview(session.userId),
  ]);
  const displayName = user?.name ?? "Trainer";

  switch (section) {
    case "calendar": {
      const sessions = await getTrainerCalendarSessions(session.userId, session.role);
      return <CalendarSection sessions={toCalendarView(sessions)} />;
    }
    case "my-trainees": {
      const trainees = await getTrainerTraineeRoster(session.userId, session.role);
      return <MyTraineesSection trainees={trainees} />;
    }
    case "assignments": {
      const assignments = await getTrainerAssignments(session.userId, session.role);
      return <AssignmentsSection assignments={assignments} />;
    }
    case "modules": {
      const modules = await getTrainerModules(session.userId, session.role);
      return <ModulesSection modules={modules} />;
    }
    case "overview":
      return <OverviewSection displayName={displayName} overview={overview} />;
    default:
      return <OverviewSection displayName={displayName} overview={overview} />;
  }
}
