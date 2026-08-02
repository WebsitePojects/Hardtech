// TODO(wave-4): see enrollment-mutations.ts for the pattern this follows.
// "Save changes" per Payment Methods card (desktop-02.md #12) is an
// upsert-by-`method` (PaymentMethodConfig.method is @unique in
// prisma/schema.prisma) — a plain column assignment like the User
// Management selects, idempotent by construction, no client-minted
// idempotency key needed. Wave-4 still recomputes/validates every field
// server-side (rule 4) rather than trusting the form payload as-is.

import type { PaymentMethod } from "@/../generated/prisma/enums";
import { savePaymentMethodAction } from "@/app/(dashboard)/dashboard/admin/actions";

export interface SavePaymentMethodInput {
  method: PaymentMethod;
  displayName: string;
  accountNumber: string | null;
  accountName: string | null;
  bankName: string | null;
  note: string | null;
  isEnabled: boolean;
  idempotencyKey?: string;
}

export async function savePaymentMethod(input: SavePaymentMethodInput) {
  return savePaymentMethodAction(input);
}
