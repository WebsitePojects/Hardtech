import { GraduationCap, Lock, ShieldCheck } from "lucide-react";

import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { TraineeOverview } from "@/server/services/dashboard.service";
import { CredentialCard } from "./credential-card";

export type CredentialsSectionProps = {
  displayName: string;
  overview: TraineeOverview;
};

/**
 * desktop-02.md #27, mobile-06.md 14:32:50-14:33:18: "My Credentials" — two
 * badge cards (Verified Trainee, Trained Graduate) plus an Official
 * E-Certificate row with a 3-state lifecycle (Locked -> Pending Approval ->
 * an approved state never captured in the screenshot corpus).
 *
 * `dashboard.service.ts` exposes no `CertificateRequest` read at all — only
 * `TraineeOverview.status`, the trainee's own `EnrollmentStatus`. That IS
 * real, already-fetched data, so the two badge cards are driven by it
 * (ACTIVE or COMPLETED -> Verified Trainee earned; COMPLETED -> Trained
 * Graduate earned) rather than invented — this mirrors exactly what every
 * sourced screenshot shows for each persona's real status.
 *
 * The Official E-Certificate row's Pending Approval / Approved states need
 * the actual `CertificateRequest` row (status, requestedAt) that no service
 * export returns, so this never claims either without evidence. It renders
 * the sourced, verbatim "Locked" copy for every non-graduate (a real,
 * data-backed condition), and an honest, clearly-provisional line — not
 * invented product copy — once `status` is `COMPLETED`, since repeating
 * "Locked" for a graduate would be a known-false statement (mobile-06.md
 * 14:33:18 shows Locked always clears on graduation).
 *
 * TODO(orchestrator): dashboard.service lacks a trainee certificate-request
 * read (CertificateRequest.status scoped to the trainee's active
 * enrollment). Wire the real Pending Approval / Approved states once it
 * exists.
 */
export function CredentialsSection({ displayName, overview }: CredentialsSectionProps) {
  const program = overview.activeProgram;
  const isVerified = overview.status === "ACTIVE" || overview.status === "COMPLETED";
  const isGraduate = overview.status === "COMPLETED";

  return (
    <div className="space-y-6">
      <DashboardPageHeader title="My Credentials" description="Badges and e-certificate from HardTech IT Corp" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <CredentialCard
          icon={ShieldCheck}
          earned={isVerified}
          tone="green"
          heading="VERIFIED TRAINEE"
          name={displayName}
          subtext={program?.batchLabel ?? ""}
        />
        <CredentialCard
          icon={GraduationCap}
          earned={isGraduate}
          tone="blue"
          heading="TRAINED GRADUATE"
          name={displayName}
          subtext={
            isGraduate
              ? (program?.batchLabel ?? "")
              : `${program?.programName ?? "Program"} · ${overview.overallProgressPercent}% complete`
          }
          helperText={isGraduate ? undefined : "Awarded after completing training & certificate approval"}
        />
      </div>

      <Card>
        <CardContent className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span
              className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground"
              aria-hidden
            >
              <Lock className="size-4" />
            </span>
            <div>
              <p className="text-sm font-semibold text-foreground">Official E-Certificate</p>
              <p className="text-sm text-muted-foreground">
                {isGraduate
                  ? "Certificate status isn't available in this build yet."
                  : "Unlocks once your trainer marks your training as completed"}
              </p>
            </div>
          </div>
          {!isGraduate ? (
            <Badge variant="outline" className="text-muted-foreground">
              🔒 Locked
            </Badge>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
