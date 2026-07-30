import { requireRole } from "@/server/auth/session";
import {
  getDashboardUser,
  getTraineeAssignments,
  getTraineeCertificateStatus,
  getTraineeMaterials,
  getTraineeOverview,
} from "@/server/services/dashboard.service";
import { AssignmentsSection } from "@/features/dashboard-trainee/assignments-section";
import { CredentialsSection } from "@/features/dashboard-trainee/credentials-section";
import { EnrolledProgramsSection } from "@/features/dashboard-trainee/enrolled-programs-section";
import { MaterialsSection } from "@/features/dashboard-trainee/materials-section";
import { MyDashboardSection } from "@/features/dashboard-trainee/my-dashboard-section";
import { SessionScheduleSection } from "@/features/dashboard-trainee/session-schedule-section";
import type { TraineeAssignmentListItem, TraineeSessionView } from "@/features/dashboard-trainee/types";

export const metadata = {
  title: "Trainee Dashboard | HardTech IT Corp",
};

interface TraineeDashboardSearchParams {
  section?: string;
}

interface TraineeDashboardPageProps {
  searchParams: Promise<TraineeDashboardSearchParams>;
}

type TraineeSection =
  | "my-dashboard"
  | "session-schedule"
  | "assignments"
  | "enrolled-programs"
  | "materials"
  | "credentials";

/** Fail closed (.claude/rules/00-non-negotiables.md rule 3): unrecognized
 * `?section=` value falls through to the default tab, never a crash or a
 * blank page — mirrors dashboard-sidebar-nav.tsx's own
 * `items[0]?.id` fallback. */
function parseSection(value: string | undefined): TraineeSection {
  switch (value) {
    case "my-dashboard":
    case "session-schedule":
    case "assignments":
    case "enrolled-programs":
    case "materials":
    case "credentials":
      return value;
    default:
      return "my-dashboard";
  }
}

function toSessionView(sessions: Awaited<ReturnType<typeof getTraineeOverview>>["upcomingSessions"]): TraineeSessionView[] {
  return sessions.map((session) => ({
    id: session.id,
    title: session.title,
    sessionType: session.sessionType,
    sessionDate: session.sessionDate.toISOString().slice(0, 10),
    startTime: session.startTime,
    location: session.location,
  }));
}

function toAssignmentView(
  assignments: Awaited<ReturnType<typeof getTraineeAssignments>>,
): TraineeAssignmentListItem[] {
  return assignments.map((assignment) => ({
    id: assignment.id,
    title: assignment.title,
    instructions: assignment.instructions,
    dueDate: assignment.dueDate.toISOString().slice(0, 10),
    dueTime: assignment.dueTime,
    allowedSubmissionTypes: assignment.allowedSubmissionTypes,
    submission: assignment.submission
      ? {
          submissionLink: assignment.submission.submissionLink,
          submittedAt: assignment.submission.submittedAt.toLocaleDateString("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric",
          }),
        }
      : null,
  }));
}

/**
 * `/dashboard/trainee` — the trainee role's single real route. Section
 * switching is `?section=<id>` query state written by DASH-SHELL's
 * `DashboardSidebarNav` (`src/components/dashboard/dashboard-nav-items.ts`);
 * this page reads it and renders one of the six sections.
 *
 * `requireRole("TRAINEE")` re-checks authorization on the server
 * independently of the `(dashboard)` layout's own `requireSession()` call
 * (.claude/rules/00-non-negotiables.md rule 5 — one gate is not enough,
 * every gated route re-checks its own role).
 */
export default async function TraineeDashboardPage(props: TraineeDashboardPageProps) {
  const session = await requireRole("TRAINEE");

  const searchParams = await props.searchParams;
  const section = parseSection(searchParams.section);

  const [user, overview] = await Promise.all([
    getDashboardUser(session.userId),
    getTraineeOverview(session.userId),
  ]);

  const displayName = user?.name ?? "Trainee";

  switch (section) {
    case "session-schedule":
      return <SessionScheduleSection sessions={toSessionView(overview.upcomingSessions)} />;
    case "assignments": {
      const assignments = await getTraineeAssignments(session.userId, session.role);
      return <AssignmentsSection assignments={toAssignmentView(assignments)} />;
    }
    case "enrolled-programs":
      return <EnrolledProgramsSection overview={overview} />;
    case "materials": {
      const materials = await getTraineeMaterials(session.userId, session.role);
      return <MaterialsSection materials={materials} />;
    }
    case "credentials": {
      const certificateStatus = await getTraineeCertificateStatus(session.userId, session.role);
      return <CredentialsSection displayName={displayName} overview={overview} certificateStatus={certificateStatus} />;
    }
    case "my-dashboard":
      return <MyDashboardSection displayName={displayName} overview={overview} />;
    default:
      return <MyDashboardSection displayName={displayName} overview={overview} />;
  }
}
