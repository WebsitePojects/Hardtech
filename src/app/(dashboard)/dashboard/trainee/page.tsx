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
import { DashboardSection } from "@/components/dashboard/dashboard-shell";

export const metadata = {
  title: "Trainee Dashboard | HardTech IT Corp",
};

/** Fail closed (.claude/rules/00-non-negotiables.md rule 3): unrecognized
 * `?section=` value falls through to the default tab, never a crash or a
 * blank page — mirrors dashboard-sidebar-nav.tsx's own
 * `items[0]?.id` fallback. */
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
export default async function TraineeDashboardPage() {
  const session = await requireRole("TRAINEE");

  const [user, overview, assignments, materials, certificateStatus] = await Promise.all([
    getDashboardUser(session.userId),
    getTraineeOverview(session.userId),
    getTraineeAssignments(session.userId, session.role),
    getTraineeMaterials(session.userId, session.role),
    getTraineeCertificateStatus(session.userId, session.role),
  ]);

  const displayName = user?.name ?? "Trainee";

  return (
    <>
      <DashboardSection section="my-dashboard"><MyDashboardSection displayName={displayName} overview={overview} /></DashboardSection>
      <DashboardSection section="session-schedule"><SessionScheduleSection sessions={toSessionView(overview.upcomingSessions)} /></DashboardSection>
      <DashboardSection section="assignments"><AssignmentsSection assignments={toAssignmentView(assignments)} /></DashboardSection>
      <DashboardSection section="enrolled-programs"><EnrolledProgramsSection overview={overview} /></DashboardSection>
      <DashboardSection section="materials"><MaterialsSection materials={materials} /></DashboardSection>
      <DashboardSection section="credentials"><CredentialsSection displayName={displayName} overview={overview} certificateStatus={certificateStatus} /></DashboardSection>
    </>
  );
}
