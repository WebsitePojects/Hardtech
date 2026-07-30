"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { usePendingAction } from "../use-pending-action";
import { approveCertificate, rejectCertificate } from "../mutations/certificate-mutations";

export type CertificateApprovalItem = {
  id: string;
  traineeName: string;
  certificateCode: string;
  programLabel: string;
  trainerName: string;
  completedDateLabel: string;
  status: "pending" | "approved" | "rejected";
};

/**
 * One row of "Certificate Approvals" (desktop-02.md #9, mobile-05.md #15).
 * A terminal "approved" row (e.g. Ben Padilla in the screenshot) renders
 * with no action buttons at all — matching the design's own terminal
 * state, not just a disabled pair.
 */
export function CertificateApprovalCard({ item }: { item: CertificateApprovalItem }) {
  const approve = usePendingAction();
  const reject = usePendingAction();
  const [status, setStatus] = useState(item.status);
  const anyPending = approve.isPending || reject.isPending;

  async function handleApprove() {
    await approve.run(async () => {
      try {
        await approveCertificate({ certificateRequestId: item.id });
        setStatus("approved");
      } catch {
        toast.error("Certificate approval isn't wired up yet in this build.");
      }
    });
  }

  async function handleReject() {
    await reject.run(async () => {
      try {
        await rejectCertificate({ certificateRequestId: item.id, reason: "" });
        setStatus("rejected");
      } catch {
        toast.error("Certificate rejection isn't wired up yet in this build.");
      }
    });
  }

  return (
    <Card className="flex-row flex-wrap items-center justify-between gap-3 p-4">
      <div>
        <p className="text-sm font-semibold text-foreground">
          {item.traineeName} <span className="text-muted-foreground">· {item.certificateCode}</span>
        </p>
        <p className="text-sm text-muted-foreground">
          {item.programLabel} · Trainer: {item.trainerName} · Completed {item.completedDateLabel}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Badge
          variant="outline"
          className={
            status === "approved"
              ? "border-primary/40 text-primary"
              : status === "rejected"
                ? "border-destructive/40 text-destructive"
                : "border-brand-orange/40 text-brand-orange"
          }
        >
          {status}
        </Badge>
        {status === "pending" ? (
          <>
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              aria-label="Approve certificate"
              disabled={anyPending}
              onClick={handleApprove}
              className="border-primary/40 text-primary hover:bg-primary/10"
            >
              <Check className="size-4" aria-hidden />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              aria-label="Reject certificate"
              disabled={anyPending}
              onClick={handleReject}
              className="border-destructive/40 text-destructive hover:bg-destructive/10"
            >
              <X className="size-4" aria-hidden />
            </Button>
          </>
        ) : null}
      </div>
    </Card>
  );
}
