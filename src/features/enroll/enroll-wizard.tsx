"use client";

import { useState } from "react";

import { Card } from "@/components/ui/card";
import { sumCentavos } from "@/features/programs/format-currency";

import { generateReferenceCode } from "./reference-code";
import { Stepper } from "./stepper";
import { StepPayment } from "./steps/step-payment";
import { StepReceipt } from "./steps/step-receipt";
import { StepSelectPlan } from "./steps/step-select-plan";
import { StepSignUp } from "./steps/step-sign-up";
import { StepVerification } from "./steps/step-verification";
import type { EnrollmentActionResult } from "@/app/(marketing)/enroll/actions";
import type { PAYMENT_METHOD_VALUES, SignUpValues } from "./enroll.schema";
import type { EnrollPaymentMethod, EnrollProgram } from "./types";

type PaymentMethodValue = (typeof PAYMENT_METHOD_VALUES)[number];
type WizardStep = 1 | 2 | 3 | 4 | 5;

interface EnrollWizardProps {
  programs: EnrollProgram[];
  paymentMethods: EnrollPaymentMethod[];
}

export function EnrollWizard({ programs, paymentMethods }: EnrollWizardProps) {
  // Minted once per user intent, stable across re-renders and step changes,
  // so a retried submission replays instead of creating a second enrollment.
  // Non-negotiables rule 1. Must stay a useState lazy initializer, not a
  // module-level constant or a value recomputed on every render.
  const [idempotencyKey] = useState(() => crypto.randomUUID());
  const [referenceCode] = useState(() => generateReferenceCode(idempotencyKey));

  const [step, setStep] = useState<WizardStep>(1);
  const [selectedProgramIds, setSelectedProgramIds] = useState<string[]>([]);
  const [signUpValues, setSignUpValues] = useState<SignUpValues | null>(null);
  const selectedPrograms = programs.filter((program) => selectedProgramIds.includes(program.id));
  const totalCentavos = sumCentavos(selectedPrograms.map((program) => program.priceCentavos));

  const [paidMethodValue, setPaidMethodValue] = useState<PaymentMethodValue | null>(null);
  const [submission, setSubmission] = useState<Extract<EnrollmentActionResult, { ok: true }> | null>(null);
  const paidMethod = paymentMethods.find((method) => method.method === paidMethodValue) ?? null;

  return (
    <div className="space-y-8">
      <p className="text-center text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">
        Online Enrollment Portal
      </p>

      <Stepper currentStep={step} />

      <Card className="glass rounded-3xl p-6 sm:p-8">
        {step === 1 ? (
          <StepSelectPlan
            programs={programs}
            selectedProgramIds={selectedProgramIds}
            onChangeSelection={setSelectedProgramIds}
            onContinue={() => setStep(2)}
          />
        ) : null}

        {step === 2 ? (
          <StepSignUp
            defaultValues={signUpValues}
            onBack={() => setStep(1)}
            onContinue={(values) => {
              setSignUpValues(values);
              setStep(3);
            }}
          />
        ) : null}

        {step === 3 ? (
          <StepPayment
            selectedPrograms={selectedPrograms}
            paymentMethods={paymentMethods}
            referenceCode={referenceCode}
            idempotencyKey={idempotencyKey}
            trainee={signUpValues}
            onBack={() => setStep(2)}
            onSuccess={(result) => {
              setSubmission(result);
              setPaidMethodValue(result.paymentMethod);
              setStep(4);
            }}
          />
        ) : null}

        {/* Steps 4 and 5 render after the server confirms the payment write. */}
        {step === 4 && signUpValues && paidMethod && submission ? (
          <StepReceipt
            referenceCode={referenceCode}
            trainee={signUpValues}
            programs={selectedPrograms}
            paymentMethod={paidMethod}
            totalCentavos={totalCentavos}
            submittedAt={new Date()}
            onBack={() => setStep(3)}
            onProceed={() => setStep(5)}
          />
        ) : null}

        {step === 5 ? <StepVerification referenceCode={referenceCode} /> : null}
      </Card>
    </div>
  );
}
