"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { AlertCircle, Copy, Trash2, UploadCloud } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { formatCentavos, sumCentavos } from "@/features/programs/format-currency";

import { paymentSelectionSchema, type PAYMENT_METHOD_VALUES } from "../enroll.schema";
import { paymentTint, renderPaymentIcon } from "../payment-visuals";
import { SelectableCard } from "../selectable-card";
import { submitEnrollment } from "../submit-enrollment";
import type { EnrollPaymentMethod, EnrollProgram } from "../types";
import type { SignUpValues } from "../enroll.schema";
import type { EnrollmentActionResult } from "@/app/(marketing)/enroll/actions";

type PaymentMethodValue = (typeof PAYMENT_METHOD_VALUES)[number];

interface StepPaymentProps {
  selectedPrograms: EnrollProgram[];
  paymentMethods: EnrollPaymentMethod[];
  referenceCode: string;
  idempotencyKey: string;
  trainee: SignUpValues | null;
  onBack: () => void;
  onSuccess: (result: Extract<EnrollmentActionResult, { ok: true }> & { paymentMethod: PaymentMethodValue }) => void;
}

function copyToClipboard(value: string, label: string) {
  navigator.clipboard
    .writeText(value)
    .then(() => toast.success(`${label} copied`))
    .catch(() => toast.error(`Could not copy ${label.toLowerCase()}`));
}

function CopyRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-glass-border py-2.5 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <span className="font-mono text-sm font-semibold text-foreground">{value}</span>
        <button
          type="button"
          onClick={() => copyToClipboard(value, label)}
          className="text-muted-foreground hover:text-foreground"
          aria-label={`Copy ${label}`}
        >
          <Copy className="size-3.5" aria-hidden />
        </button>
      </div>
    </div>
  );
}

export function StepPayment({
  selectedPrograms,
  paymentMethods,
  referenceCode,
  idempotencyKey,
  trainee,
  onBack,
  onSuccess,
}: StepPaymentProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodValue | null>(null);
  const [proof, setProof] = useState<File | null>(null);
  const [proofPreviewUrl, setProofPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalCentavos = sumCentavos(selectedPrograms.map((program) => program.priceCentavos));
  const selectedMethod = paymentMethods.find((method) => method.method === paymentMethod) ?? null;

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    if (proofPreviewUrl) URL.revokeObjectURL(proofPreviewUrl);
    setProof(file);
    setProofPreviewUrl(file ? URL.createObjectURL(file) : null);
    setError(null);
  }

  function removeProof() {
    if (proofPreviewUrl) URL.revokeObjectURL(proofPreviewUrl);
    setProof(null);
    setProofPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleConfirmPayment() {
    // Non-negotiable rule 1: early-return if a request is already in flight,
    // in addition to the `disabled` attribute below (defense in depth).
    if (isSubmitting) return;

    const parsed = paymentSelectionSchema.safeParse({ paymentMethod, proof });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check the payment details and try again.");
      return;
    }
    if (!trainee) {
      setError("Sign-up details are missing — go back and complete Step 2.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await submitEnrollment({
        idempotencyKey,
        programIds: selectedPrograms.map((program) => program.id),
        trainee,
        paymentMethod: parsed.data.paymentMethod,
        proof: parsed.data.proof,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      onSuccess({ ...result, paymentMethod: parsed.data.paymentMethod });
    } catch {
      toast.error("Could not record your enrollment.");
      setError("Could not record your enrollment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const canConfirm = paymentMethod !== null && proof !== null && !isSubmitting;

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <Badge variant="outline" className="border-primary/40 text-primary">
          Step 3 of 5
        </Badge>
        <h2 className="font-heading text-2xl font-semibold text-foreground">
          Choose Payment Method
        </h2>
        <p className="text-sm text-muted-foreground">
          Select how you would like to pay your enrollment fee.
        </p>
      </div>

      <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4">
        <p className="text-sm text-muted-foreground">
          {selectedPrograms.length === 1
            ? "Enrolling in"
            : `Enrolling in ${selectedPrograms.length} programs`}
        </p>
        <ul className="mt-2 space-y-1.5">
          {selectedPrograms.map((program) => (
            <li key={program.id} className="flex items-center justify-between text-sm">
              <span className="text-foreground">{program.name}</span>
              <span className="font-medium text-foreground">
                {formatCentavos(program.priceCentavos)}
              </span>
            </li>
          ))}
        </ul>
        <Separator className="my-3" />
        <div className="flex items-center justify-between">
          <span className="font-semibold text-foreground">Total</span>
          <span className="text-xl font-bold text-primary">
            {formatCentavos(totalCentavos)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {paymentMethods.map((method) => {
          const selected = paymentMethod === method.method;

          return (
            <SelectableCard
              key={method.method}
              role="radio"
              selected={selected}
              onSelect={() => setPaymentMethod(method.method)}
              accentBorder="border-primary"
              accentRing="ring-primary/30 text-primary"
              className="pr-10"
            >
              <div className="flex items-center gap-3">
                <div className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg", paymentTint(method.method))}>
                  {renderPaymentIcon(method.method, "size-4")}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{method.displayName}</p>
                  {method.note ? (
                    <p className="text-xs text-muted-foreground">{method.note}</p>
                  ) : null}
                </div>
              </div>
            </SelectableCard>
          );
        })}
      </div>

      {selectedMethod ? (
        <div className="space-y-4">
          <div className="rounded-2xl border border-glass-border bg-surface-secondary/60 p-4">
            <h3 className="mb-1 text-sm font-semibold text-foreground">Send payment to:</h3>
            {selectedMethod.accountNumber ? (
              <CopyRow label="Number" value={selectedMethod.accountNumber} />
            ) : null}
            {selectedMethod.accountName ? (
              <CopyRow label="Account Name" value={selectedMethod.accountName} />
            ) : null}
            {selectedMethod.bankName ? (
              <CopyRow label="Bank" value={selectedMethod.bankName} />
            ) : null}
            <CopyRow label="Amount" value={formatCentavos(totalCentavos)} />
            <CopyRow label="Reference" value={referenceCode} />
          </div>

          <div className="flex gap-2.5 rounded-xl border border-brand-orange/30 bg-brand-orange/10 p-3.5 text-sm text-brand-orange">
            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
            Include the Reference No. in your payment remarks so we can match your payment
            quickly.
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground">Upload Proof of Payment</h3>
            <p className="text-sm text-muted-foreground">
              Screenshot or photo of your GCash payment receipt. The admin will check this
              before approving.
            </p>

            {proof && proofPreviewUrl ? (
              <div className="flex items-center gap-3 rounded-xl border border-glass-border p-3">
                {/* eslint-disable-next-line @next/next/no-img-element -- local object URL preview, not a remote image */}
                <img
                  src={proofPreviewUrl}
                  alt="Proof of payment preview"
                  className="size-16 rounded-lg object-cover"
                />
                <span className="flex-1 truncate text-sm text-muted-foreground">{proof.name}</span>
                <Button type="button" variant="destructive" size="sm" onClick={removeProof}>
                  <Trash2 className="size-3.5" aria-hidden /> Remove
                </Button>
              </div>
            ) : (
              <label className="flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border border-dashed border-glass-border p-8 text-center hover:border-primary/40">
                <UploadCloud className="size-6 text-muted-foreground" aria-hidden />
                <span className="text-sm font-semibold text-foreground">
                  Click to upload screenshot
                </span>
                <span className="text-xs text-muted-foreground">PNG or JPG · up to 5 MB</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg"
                  className="sr-only"
                  onChange={handleFileChange}
                />
              </label>
            )}
          </div>
        </div>
      ) : null}

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="grid grid-cols-2 gap-3">
        <Button type="button" variant="outline" onClick={onBack} disabled={isSubmitting}>
          <span aria-hidden>&larr;</span> Back
        </Button>
        <Button type="button" disabled={!canConfirm} onClick={handleConfirmPayment}>
          {isSubmitting ? "Confirming…" : "Confirm Payment"} <span aria-hidden>&rarr;</span>
        </Button>
      </div>
    </div>
  );
}
