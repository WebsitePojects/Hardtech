"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { PaymentMethod } from "@/../generated/prisma/enums";
import { usePendingAction } from "../use-pending-action";
import { savePaymentMethod } from "../mutations/payment-method-mutations";

export type PaymentMethodFieldConfig = {
  method: PaymentMethod;
  displayName: string;
  /** "Number" (GCash/Maya) or "Bank" (Bank Transfer) — Card has neither. */
  numberFieldLabel: "Number" | "Bank" | null;
  /** Bank Transfer alone shows both "Bank" and a separate "Account Number". */
  hasSeparateAccountNumber: boolean;
};

/**
 * One payment-method card (desktop-02.md #12, mobile-05.md #21-24).
 * Field *values* (the real GCash number, account name, etc.) are admin-
 * editable data this builder has no read for — see
 * src/server/services/dashboard.service.ts's scope note — so every field
 * starts blank rather than showing a screenshot-transcribed number that
 * would silently go stale the moment a real save lands. Field *labels*
 * and the per-method field set are structural and are reproduced exactly.
 */
export function PaymentMethodCard({ config }: { config: PaymentMethodFieldConfig }) {
  const [idempotencyKey] = useState(() => crypto.randomUUID());
  const [numberValue, setNumberValue] = useState("");
  const [accountNumberValue, setAccountNumberValue] = useState("");
  const [accountNameValue, setAccountNameValue] = useState("");
  const [noteValue, setNoteValue] = useState("");
  const [isEnabled, setIsEnabled] = useState(false);
  const save = usePendingAction();

  async function handleSave() {
    await save.run(async () => {
      try {
        const result = await savePaymentMethod({
          method: config.method,
          displayName: config.displayName,
          accountNumber:
            config.numberFieldLabel === "Number"
              ? numberValue || null
              : config.hasSeparateAccountNumber
                ? accountNumberValue || null
                : null,
          bankName: config.numberFieldLabel === "Bank" ? numberValue || null : null,
          accountName: accountNameValue || null,
          note: noteValue || null,
          isEnabled,
          idempotencyKey,
        });
        if (!result.ok) toast.error(result.error);
      } catch {
        toast.error("Unable to save the payment method.");
      }
    });
  }

  return (
    <Card className="gap-3 p-4">
      <CardHeader className="flex-row items-center justify-between px-0">
        <CardTitle>{config.displayName}</CardTitle>
        <label className="flex items-center gap-2 text-sm text-foreground">
          <Checkbox checked={isEnabled} onCheckedChange={(checked) => setIsEnabled(checked === true)} />
          Enabled
        </label>
      </CardHeader>
      <CardContent className="space-y-3 px-0">
        <Field label="Display Name" value={config.displayName} readOnly />
        {config.numberFieldLabel ? (
          <Field
            label={config.numberFieldLabel}
            value={numberValue}
            onChange={setNumberValue}
          />
        ) : null}
        {config.hasSeparateAccountNumber ? (
          <Field label="Account Number" value={accountNumberValue} onChange={setAccountNumberValue} />
        ) : null}
        <Field label="Account Name" value={accountNameValue} onChange={setAccountNameValue} />
        <Field
          label="Note (optional, admin-only)"
          value={noteValue}
          onChange={setNoteValue}
          placeholder="e.g. limit ₱50k/day"
        />
        <Button type="button" variant="outline" size="sm" disabled={save.isPending} onClick={handleSave}>
          <Check className="size-3.5" aria-hidden />
          {save.isPending ? "Saving…" : "Save changes"}
        </Button>
      </CardContent>
    </Card>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  readOnly,
}: {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Input
        value={value}
        placeholder={placeholder}
        readOnly={readOnly}
        disabled={readOnly}
        onChange={onChange ? (event) => onChange(event.target.value) : undefined}
      />
    </div>
  );
}
