import { BookOpen, Check, CreditCard, Receipt, Shield, User } from "lucide-react";

import { cn } from "@/lib/utils";

const STEPS = [
  { step: 1, label: "Select Plan", icon: BookOpen },
  { step: 2, label: "Sign Up", icon: User },
  { step: 3, label: "Payment", icon: CreditCard },
  { step: 4, label: "Receipt", icon: Receipt },
  { step: 5, label: "Verification", icon: Shield },
] as const;

/** Horizontal 5-node stepper for the /enroll wizard (desktop-01 #26, mobile-04 #13). */
export function Stepper({ currentStep }: { currentStep: number }) {
  return (
    <ol className="mx-auto flex w-full max-w-2xl items-start justify-between gap-1">
      {STEPS.map(({ step, label, icon: Icon }, index) => {
        const isComplete = step < currentStep;
        // Step 5 (Verification) uses a distinct amber "in progress" ring
        // instead of green while active (mobile-04 screenshot 30).
        const isActive = step === currentStep;
        const isVerificationActive = isActive && step === 5;

        return (
          <li key={step} className="flex flex-1 flex-col items-center gap-2 text-center">
            <div className="flex w-full items-center">
              <div
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                  isComplete && "border-primary bg-primary text-primary-foreground",
                  isActive &&
                    !isVerificationActive &&
                    "border-primary text-primary ring-4 ring-primary/20",
                  isVerificationActive &&
                    "border-brand-orange text-brand-orange ring-4 ring-brand-orange/20",
                  !isComplete && !isActive && "border-glass-border text-muted-foreground",
                )}
              >
                {isComplete ? (
                  <Check className="size-4" aria-hidden />
                ) : (
                  <Icon className="size-4" aria-hidden />
                )}
              </div>
              {index < STEPS.length - 1 ? (
                <div
                  className={cn(
                    "h-px flex-1",
                    isComplete ? "bg-primary" : "bg-glass-border",
                  )}
                />
              ) : null}
            </div>
            <span
              className={cn(
                "text-[0.7rem] font-medium",
                isActive || isComplete ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
