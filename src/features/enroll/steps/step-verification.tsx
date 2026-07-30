"use client";

import Link from "next/link";
import { CheckCircle2, Loader2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface StepVerificationProps {
  referenceCode: string;
  /** How many of the 5 checklist rows are complete. Static in wave 1 — see note below. */
  completedCount?: number;
}

const CHECKLIST = [
  "Payment received & logged",
  "Receipt generated",
  "Admin notified in real time",
  "Enrollment verified by admin",
  "Account access granted",
];

/**
 * Step 5 "Awaiting Admin Verification" (desktop-01 #32, mobile-04 #30-32).
 * Presentational only, same as Step 4 — unreachable in wave 1 because
 * submitEnrollment always throws. The real build (wave 3) replaces the
 * static `completedCount` with live polling of admin verification state.
 */
export function StepVerification({ referenceCode, completedCount = 3 }: StepVerificationProps) {
  return (
    <div className="space-y-6 text-center">
      <Badge variant="outline" className="border-primary/40 text-primary">
        Step 5 of 5
      </Badge>

      <div className="flex justify-center">
        <div className="flex size-20 items-center justify-center rounded-full border-4 border-brand-orange/30">
          <Loader2 className="size-8 animate-spin text-brand-orange" aria-hidden />
        </div>
      </div>

      <div className="space-y-1.5">
        <h2 className="font-heading text-2xl font-semibold text-brand-orange">
          Awaiting Admin Verification…
        </h2>
        <p className="text-sm font-semibold text-foreground">
          An administrator is reviewing your payment
        </p>
        <p className="mx-auto max-w-md text-sm text-muted-foreground">
          This usually takes only a few seconds. Please keep this page open — we&apos;ll grant
          you account access as soon as your payment is confirmed.
        </p>
      </div>

      <ul className="mx-auto max-w-sm space-y-2 text-left">
        {CHECKLIST.map((item, index) => {
          const done = index < completedCount;
          return (
            <li key={item} className="flex items-center gap-2.5 text-sm">
              {done ? (
                <CheckCircle2 className="size-4 shrink-0 text-primary" aria-hidden />
              ) : (
                <Loader2 className="size-4 shrink-0 animate-spin text-muted-foreground" aria-hidden />
              )}
              <span className={cn(done ? "text-foreground" : "text-muted-foreground")}>{item}</span>
            </li>
          );
        })}
      </ul>

      <div className="rounded-2xl border border-glass-border bg-surface-secondary/60 p-4">
        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          Reference Number
        </p>
        <p className="font-mono text-lg font-bold text-primary">{referenceCode}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button type="button" disabled={completedCount < CHECKLIST.length}>
          Enter My Account <span aria-hidden>&rarr;</span>
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href="/">Back to Home</Link>
        </Button>
      </div>
    </div>
  );
}
