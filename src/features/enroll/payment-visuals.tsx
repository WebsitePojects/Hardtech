// Token-based visual resolution for a payment method row, keyed off the
// fixed 4-value PaymentMethod enum. Exhaustive switch with a neutral
// fallback branch — fails closed (never crashes, never renders raw data) if
// a future enum member isn't handled here yet.
//
// Returns JSX directly per branch rather than a component reference for the
// caller to render dynamically — see the comment in
// src/features/programs/program-visuals.tsx for why (React Compiler's
// react-hooks/static-components check).
import { CreditCard, Landmark, Smartphone, Wallet } from "lucide-react";
import type { PaymentMethod } from "@/../generated/prisma/enums";

export function renderPaymentIcon(method: PaymentMethod, className?: string) {
  switch (method) {
    case "GCASH":
      return <Smartphone className={className} aria-hidden />;
    case "MAYA":
      return <Wallet className={className} aria-hidden />;
    case "BANK_TRANSFER":
      return <Landmark className={className} aria-hidden />;
    case "CARD":
      return <CreditCard className={className} aria-hidden />;
    default:
      return <Wallet className={className} aria-hidden />;
  }
}

export function paymentTint(method: PaymentMethod): string {
  switch (method) {
    case "GCASH":
    case "MAYA":
      return "bg-brand-blue/10 text-brand-blue";
    case "BANK_TRANSFER":
      return "bg-brand-orange/10 text-brand-orange";
    case "CARD":
      return "bg-primary/10 text-primary";
    default:
      return "bg-muted text-muted-foreground";
  }
}
