import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { TraineeOverview } from "@/server/services/dashboard.service";

export type EnrolledProgramsSectionProps = {
  overview: TraineeOverview;
};

function formatStartDate(date: Date | null): string {
  if (!date) return "—";
  return date.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
}

/**
 * desktop-02.md #25, mobile-06.md 14:32:33: "Enrolled Programs" — one card
 * per enrollment (badge "ENROLLED" + plain "Active"/"Graduate" — simpler
 * than the Dashboard's checkmarked "✓ Active Trainee" pill), completion
 * bar, and a START/SESSIONS/MATERIALS stat row.
 *
 * `getTraineeOverview` returns a single "active program" summary (its own
 * doc comment: a trainee can hold several simultaneous enrollments, but the
 * dashboard shows one), which matches every sourced screenshot — Carlos
 * Reyes never shows more than one enrolled-program card. START/SESSIONS/
 * MATERIALS reuse the same already-fetched numbers as the Dashboard section
 * (`startDate`, `sessionsAheadCount`, `materialsCount`) rather than
 * re-deriving them.
 */
export function EnrolledProgramsSection({ overview }: EnrolledProgramsSectionProps) {
  const program = overview.activeProgram;
  const isGraduate = overview.status === "COMPLETED";

  return (
    <div className="space-y-6">
      <DashboardPageHeader title="Enrolled Programs" />

      {!program ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No enrolled programs yet.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <Badge variant="outline" className="border-primary/40 text-primary tracking-wide uppercase">
                Enrolled
              </Badge>
              <Badge variant="outline">{isGraduate ? "Graduate" : "Active"}</Badge>
            </div>

            <div>
              <h3 className="font-heading text-xl font-semibold text-foreground">{program.programName}</h3>
              <p className="text-sm text-muted-foreground">
                {program.trainerName ? `Trainer: ${program.trainerName}` : null}
                {program.trainerName && program.batchLabel ? " · " : null}
                {program.batchLabel}
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Completion</span>
                <span className="font-semibold text-foreground">{program.progressPercent}%</span>
              </div>
              <Progress value={program.progressPercent} />
            </div>

            <div className="grid grid-cols-3 gap-3 border-t border-glass-border pt-4">
              <div>
                <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">Start</p>
                <p className="text-sm font-medium text-foreground">{formatStartDate(program.startDate)}</p>
              </div>
              <div>
                <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">Sessions</p>
                <p className="text-sm font-medium text-foreground">{overview.sessionsAheadCount}</p>
              </div>
              <div>
                <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">Materials</p>
                <p className="text-sm font-medium text-foreground">{overview.materialsCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
