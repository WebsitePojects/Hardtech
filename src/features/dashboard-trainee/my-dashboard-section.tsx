import Link from "next/link";
import { Calendar, FileText, GraduationCap, ShieldCheck } from "lucide-react";

import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { DashboardStatCard, DashboardStatGrid } from "@/components/dashboard/dashboard-stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { TraineeOverview } from "@/server/services/dashboard.service";
import { DemoPersonaBanner } from "./demo-persona-banner";
import { traineeStatusLabel } from "./status-display";
import { UpcomingSessionsCard } from "./upcoming-sessions-card";

export type MyDashboardSectionProps = {
  displayName: string;
  overview: TraineeOverview;
};

/**
 * desktop-02.md #22, mobile-06.md 14:32:09/14:32:12/14:33:02-06: "My
 * Dashboard" — demo banner, "Welcome, <name>" heading, 4 stat tiles, the
 * active-program card, and Upcoming Sessions.
 *
 * The graduate variant (congrats banner replacing the session list, badge
 * text swapping to "Graduate") is entirely `overview.status === "COMPLETED"`
 * driven — real data, not a hardcoded persona branch — so it renders
 * correctly for *any* trainee who graduates, not just the Liza Cruz demo
 * row. mobile-06.md's Open Questions flags Liza's stale "Sessions Ahead: 4"
 * despite an empty session list as a demo-data bug; since this stat comes
 * straight from `overview.sessionsAheadCount` (computed from the same
 * upcoming-sessions query, not copied from the screenshot), that
 * inconsistency has no way to reproduce here.
 */
export function MyDashboardSection({ displayName, overview }: MyDashboardSectionProps) {
  const isGraduate = overview.status === "COMPLETED";
  const program = overview.activeProgram;

  return (
    <div className="space-y-6">
      <DemoPersonaBanner displayName={displayName} />

      <DashboardPageHeader title={`Welcome, ${displayName}`} description={program?.batchLabel ?? undefined} />

      <DashboardStatGrid>
        <DashboardStatCard
          icon={GraduationCap}
          value={`${overview.overallProgressPercent}%`}
          label="Overall Progress"
        />
        <DashboardStatCard
          icon={Calendar}
          value={overview.sessionsAheadCount}
          label="Sessions Ahead"
          tone="blue"
        />
        <DashboardStatCard icon={FileText} value={overview.materialsCount} label="Materials" tone="amber" />
        <DashboardStatCard icon={ShieldCheck} value={traineeStatusLabel(overview.status)} label="Status" />
      </DashboardStatGrid>

      {isGraduate ? (
        <Card className="border border-brand-blue/30 bg-brand-blue/5">
          <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <span
                className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-blue/15 text-brand-blue"
                aria-hidden
              >
                <GraduationCap className="size-5" />
              </span>
              <div>
                <p className="font-heading text-sm font-semibold text-foreground">
                  Training Completed — Congratulations!
                </p>
                <p className="text-sm text-muted-foreground">
                  You&apos;re no longer assigned to active sessions for {program?.programName ?? "your program"}.
                  You may enroll in a new program below.
                </p>
              </div>
            </div>
            <Button asChild>
              <Link href="/programs">Browse Programs</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {program ? (
        <Card>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <Badge variant="outline" className="border-primary/40 text-primary tracking-wide uppercase">
                Active Program
              </Badge>
              <Badge variant="outline" className="border-primary/40 text-primary">
                ✓ {isGraduate ? "Graduate" : "Active Trainee"}
              </Badge>
            </div>
            <h3 className="font-heading text-xl font-semibold text-foreground">{program.programName}</h3>
            <p className="text-sm text-muted-foreground">
              {program.trainerName ? `Trainer: ${program.trainerName}` : null}
              {program.trainerName && program.batchLabel ? " · " : null}
              {program.batchLabel}
            </p>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Program Progress</span>
                <span className="font-semibold text-foreground">{program.progressPercent}%</span>
              </div>
              <Progress value={program.progressPercent} />
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No active program yet.
          </CardContent>
        </Card>
      )}

      {isGraduate ? (
        <Card>
          <CardContent className="py-6 text-center text-sm text-muted-foreground">
            You&apos;ve completed training. No active class sessions are assigned to you.
          </CardContent>
        </Card>
      ) : (
        <UpcomingSessionsCard sessions={overview.upcomingSessions} />
      )}
    </div>
  );
}
