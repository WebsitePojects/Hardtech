"use client";

import { useState } from "react";
import { Calendar, CheckCircle2, ImageIcon, Wallet, XCircle } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ImageLightbox } from "@/components/image-lightbox";
import type { PaymentMethod } from "@/../generated/prisma/enums";
import { usePendingAction } from "../use-pending-action";
import { approveEnrollment, rejectEnrollment } from "../mutations/enrollment-mutations";

export type EnrollmentReviewItem = {
  id: string;
  traineeName: string;
  enrollmentRef: string;
  programName: string;
  paymentMethod: PaymentMethod;
  amountLabel: string;
  dateLabel: string;
  receiptUrl: string | null;
};

/**
 * One row of "Enrollments & Payment Verification" (desktop-02.md #3,
 * mobile-05.md #1). Both actions are wired to the real
 * disabled/pending/early-return guard (non-negotiables rule 1) via
 * `usePendingAction`, then call the wave-4 stub in
 * ../mutations/enrollment-mutations.ts, which always throws — see that
 * file's header comment for why this never fakes a successful approval.
 */
export function EnrollmentReviewCard({ item }: { item: EnrollmentReviewItem }) {
  const approve = usePendingAction();
  const reject = usePendingAction();
  const [resolved, setResolved] = useState<"approved" | "rejected" | null>(null);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const anyPending = approve.isPending || reject.isPending;

  async function handleApprove() {
    await approve.run(async () => {
      try {
        await approveEnrollment({ enrollmentId: item.id });
        setResolved("approved");
        toast.success("Enrollment approved — payment verified.");
      } catch {
        toast.error("Enrollment approval isn't wired up yet in this build.");
      }
    });
  }

  async function handleReject() {
    await reject.run(async () => {
      try {
        await rejectEnrollment({ enrollmentId: item.id, reason: "" });
        setResolved("rejected");
        toast.success("Enrollment rejected.");
      } catch {
        toast.error("Enrollment rejection isn't wired up yet in this build.");
      }
    });
  }

  return (
    <Card className="gap-3 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-foreground">
            {item.traineeName} <span className="text-muted-foreground">· {item.enrollmentRef}</span>
          </p>
          <p className="text-sm text-muted-foreground">{item.programName}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Wallet className="size-3.5" aria-hidden />
              {item.paymentMethod}
            </span>
            <span className="font-semibold text-primary">{item.amountLabel}</span>
            <span className="flex items-center gap-1.5">
              <Calendar className="size-3.5" aria-hidden />
              {item.dateLabel}
            </span>
          </div>
          {item.receiptUrl ? (
            <>
              {/*
                Opens the receipt in the app's shared ImageLightbox instead
                of a raw browser tab — this was the owner's explicit
                complaint (payment proof used to open as a bare data:/
                storage URL via <a target="_blank">). See
                src/components/image-lightbox.tsx.
              */}
              <button
                type="button"
                onClick={() => setReceiptOpen(true)}
                className="mt-1.5 inline-flex items-center gap-1.5 text-sm text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <ImageIcon className="size-3.5" aria-hidden />
                View uploaded receipt
              </button>
              <ImageLightbox
                open={receiptOpen}
                onOpenChange={setReceiptOpen}
                index={0}
                images={[
                  {
                    src: item.receiptUrl,
                    alt: `Payment receipt uploaded by ${item.traineeName} for ${item.enrollmentRef}`,
                  },
                ]}
              />
            </>
          ) : null}
        </div>

        <div className="flex flex-col items-end gap-2">
          <Badge
            variant="outline"
            className={
              resolved === "approved"
                ? "border-primary/40 text-primary"
                : resolved === "rejected"
                  ? "border-destructive/40 text-destructive"
                  : "border-brand-orange/40 text-brand-orange"
            }
          >
            {resolved ?? "pending"}
          </Badge>
          {resolved === null ? (
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                disabled={anyPending}
                onClick={handleApprove}
              >
                <CheckCircle2 className="size-3.5" aria-hidden />
                {approve.isPending ? "Verifying…" : "Verify & Approve"}
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                disabled={anyPending}
                onClick={handleReject}
              >
                <XCircle className="size-3.5" aria-hidden />
                {reject.isPending ? "Rejecting…" : "Reject"}
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </Card>
  );
}
