import { requireRole } from "@/server/auth/session";
import { getDashboardUser, getTraineeOverview } from "@/server/services/dashboard.service";
import { AssignmentsSection } from "@/features/dashboard-trainee/assignments-section";
import { CredentialsSection } from "@/features/dashboard-trainee/credentials-section";
import { EnrolledProgramsSection } from "@/features/dashboard-trainee/enrolled-programs-section";
import { MaterialsSection } from "@/features/dashboard-trainee/materials-section";
import { MyDashboardSection } from "@/features/dashboard-trainee/my-dashboard-section";
import { SessionScheduleSection } from "@/features/dashboard-trainee/session-schedule-section";

export const metadata = {
  title: "Trainee Dashboard | HardTech IT Corp",
};

interface TraineeDashboardSearchParams {
  section?: string;
}

interface TraineeDashboardPageProps {
  searchParams: Promise<TraineeDashboardSearchParams>;
}

const VALID_SECTIONS = [
  "my-dashboard",
  "session-schedule",
  "assignments",
  "enrolled-programs",
  "materials",
  "credentials",
] as const;

type TraineeSection = (typeof VALID_SECTIONS)[number];

/** Fail closed (.claude/rules/00-non-negotiables.md rule 3): any unrecognized
 * `?section=` value falls through to the default tab, never a crash or a
 * blank page — mirrors dashboard-sidebar-nav.tsx's own
 * `items[0]?.id` fallback. */
function parseSection(value: string | undefined): TraineeSection {
  return VALID_SECTIONS.includes(value as TraineeSection) ? (value as TraineeSection) : "my-dashboard";
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
      return <SessionScheduleSection sessions={overview.upcomingSessions} />;
    case "assignments":
      return <AssignmentsSection />;
    case "enrolled-programs":
      return <EnrolledProgramsSection overview={overview} />;
    case "materials":
      return <MaterialsSection materialsCount={overview.materialsCount} />;
    case "credentials":
      return <CredentialsSection displayName={displayName} overview={overview} />;
    case "my-dashboard":
    default:
      return <MyDashboardSection displayName={displayName} overview={overview} />;
  }
}
