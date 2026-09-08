import { Award, Clock, Download, GraduationCap, Lock, ShieldCheck } from "lucide-react";

import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { TraineeCertificateStatus, TraineeOverview } from "@/server/services/dashboard.service";
import { CredentialCard } from "./credential-card";

export type CredentialsSectionProps = {
  displayName: string;
  overview: TraineeOverview;
  certificateStatus: TraineeCertificateStatus | null;
};

type CertificateDisplayState = "LOCKED" | "PENDING" | "APPROVED" | "REJECTED";

function getCertificateState(certificateStatus: TraineeCertificateStatus | null): CertificateDisplayState {
  if (!certificateStatus) return "LOCKED";

  switch (certificateStatus.status) {
    case "PENDING":
      return "PENDING";
    case "APPROVED":
      return "APPROVED";
    case "REJECTED":
      return "REJECTED";
    default:
      return "LOCKED";
  }
}

export function CredentialsSection({ displayName, overview, certificateStatus }: CredentialsSectionProps) {
  const program = overview.activeProgram;
  const isVerified = overview.status === "ACTIVE" || overview.status === "COMPLETED";
  const isGraduate = overview.status === "COMPLETED";
  const certificateState = getCertificateState(certificateStatus);

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
              ? `${program?.programName ?? "Program"} · ${overview.overallProgressPercent}% complete`
              : `${program?.programName ?? "Program"} · ${overview.overallProgressPercent}% complete`
          }
          helperText={isGraduate ? undefined : "Awarded after completing training & certificate approval"}
        />
      </div>

      <Card>
        <CardContent className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span
              className={cn(
                "flex size-9 shrink-0 items-center justify-center rounded-full",
                certificateState === "PENDING"
                  ? "bg-brand-orange/15 text-brand-orange"
                : certificateState === "APPROVED"
                  ? "bg-primary/15 text-primary"
                : certificateState === "REJECTED"
                  ? "bg-destructive/15 text-destructive"
                  : "bg-muted text-muted-foreground",
              )}
              aria-hidden
            >
              {certificateState === "PENDING" ? (
                <Clock className="size-4" />
              ) : certificateState === "APPROVED" ? (
                <Award className="size-4" />
              ) : certificateState === "REJECTED" ? (
                <Lock className="size-4" />
              ) : (
                <Lock className="size-4" />
              )}
            </span>
            <div>
              <p className="text-sm font-semibold text-foreground">Official E-Certificate</p>
              <p className="text-sm text-muted-foreground">
                {certificateState === "PENDING"
                  ? "Your certificate request is awaiting admin approval"
                  : certificateState === "APPROVED"
                    ? (certificateStatus?.certificateCode ?? "")
                    : certificateState === "REJECTED"
                      ? "Certificate request rejected"
                    : "Unlocks once your trainer marks your training as completed"}
              </p>
            </div>
          </div>
          {certificateState === "PENDING" ? (
            <Badge variant="outline" className="border-brand-orange/40 bg-brand-orange/10 text-brand-orange">
              Pending Approval
            </Badge>
          ) : certificateState === "APPROVED" ? (
            certificateStatus?.certificateCode ? (
              <Button asChild variant="outline" size="sm" className="border-primary/40 bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary">
                <a href={`/api/certificates/${encodeURIComponent(certificateStatus.certificateCode)}`}>
                  <Download className="size-3" aria-hidden /> Download certificate
                </a>
              </Button>
            ) : null
          ) : certificateState === "REJECTED" ? (
            <Badge variant="destructive">Rejected</Badge>
          ) : !isGraduate ? (
            <Badge variant="outline" className="text-muted-foreground">
              🔒 Locked
            </Badge>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
