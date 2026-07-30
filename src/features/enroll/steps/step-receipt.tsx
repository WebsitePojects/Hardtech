"use client";

import { CheckCircle2, Download, ReceiptText, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatCentavos } from "@/features/programs/format-currency";

import type { EnrollPaymentMethod, EnrollProgram } from "../types";
import type { SignUpValues } from "../enroll.schema";

interface StepReceiptProps {
  referenceCode: string;
  trainee: SignUpValues;
  programs: EnrollProgram[];
  paymentMethod: EnrollPaymentMethod;
  totalCentavos: number;
  submittedAt: Date;
  onBack: () => void;
  onProceed: () => void;
}

function ReceiptRow({ label, value, valueClassName }: { label: string; value: string; valueClassName?: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-glass-border py-2.5 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={valueClassName ?? "text-sm font-semibold text-foreground"}>{value}</span>
    </div>
  );
}

/**
 * Step 4 "Payment Confirmed" receipt (desktop-01 #30-31, mobile-04 #26-29).
 * Presentational only — reachable exclusively once a real submission
 * succeeds, which does not happen in wave 1 (see submit-enrollment.ts).
 * Built now so wave 3 only has to wire data, not design.
 */
export function StepReceipt({
  referenceCode,
  trainee,
  programs,
  paymentMethod,
  totalCentavos,
  submittedAt,
  onBack,
  onProceed,
}: StepReceiptProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <Badge variant="outline" className="border-primary/40 text-primary">
          Step 4 of 5
        </Badge>
        <h2 className="font-heading text-2xl font-semibold text-foreground">Payment Confirmed</h2>
        <p className="text-sm text-muted-foreground">
          Here is your official receipt — save a copy for your records.
        </p>
      </div>

      <div className="flex items-center gap-2.5 rounded-xl border border-primary/30 bg-primary/10 p-3.5 text-sm font-medium text-primary">
        <CheckCircle2 className="size-4 shrink-0" aria-hidden />
        Payment received successfully
      </div>

      <div className="rounded-2xl border border-glass-border bg-surface-secondary/60 p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-primary uppercase">
            <ReceiptText className="size-3.5" aria-hidden />
            Official Receipt
          </span>
          <span className="text-xs text-muted-foreground">
            {submittedAt.toLocaleDateString("en-PH")}
          </span>
        </div>

        <ReceiptRow label="Reference No." value={referenceCode} valueClassName="text-sm font-semibold text-primary" />
        <ReceiptRow label="Trainee" value={`${trainee.firstName} ${trainee.lastName}`} />
        <ReceiptRow label="Email" value={trainee.email} />
        <ReceiptRow label="Phone" value={trainee.phone} />
        <ReceiptRow label="Program" value={programs.map((program) => program.name).join(" + ")} />
        <ReceiptRow label="Schedule" value={programs.map((program) => program.scheduleLabel).join(" / ")} />
        <ReceiptRow label="Payment Method" value={paymentMethod.displayName} />
        <ReceiptRow
          label="Amount Paid"
          value={formatCentavos(totalCentavos, { showCents: true })}
          valueClassName="text-sm font-semibold text-primary"
        />
        <ReceiptRow
          label="Status"
          value="PAID — Pending Verification"
          valueClassName="text-sm font-semibold text-primary"
        />
      </div>

      <Button type="button" variant="outline" className="w-full" onClick={() => window.print()}>
        <Download className="size-4" aria-hidden /> Download Receipt
      </Button>

      <div className="flex gap-2.5 rounded-xl border border-primary/30 bg-primary/10 p-3.5 text-sm text-primary">
        <ShieldCheck className="mt-0.5 size-4 shrink-0" aria-hidden />
        Your payment has been recorded. Next, an administrator will verify your enrollment in
        real time before granting account access.
      </div>

      <Separator />

      <div className="grid grid-cols-2 gap-3">
        <Button type="button" variant="outline" onClick={onBack}>
          <span aria-hidden>&larr;</span> Back
        </Button>
        <Button type="button" onClick={onProceed}>
          Proceed to Verification <span aria-hidden>&rarr;</span>
        </Button>
      </div>
    </div>
  );
}
