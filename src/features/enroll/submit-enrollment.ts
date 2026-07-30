// TODO(wave-3): replace with a real call once auth and the mutation pipeline
// exist. This must stay idempotent on `idempotencyKey` — see
// .claude/rules/00-non-negotiables.md rule 1 and 2, and
// prisma/schema.prisma's EnrollmentPayment.idempotencyKey. A retry with the
// same key must replay the original result, never create a second
// EnrollmentPayment/Enrollment row. The amount is never sent from here —
// only program identifiers; the server recomputes the total from
// Program.priceAmount (rule 4: never trust a client-sent price).
//
// Deliberately NOT a server action and does NOT touch the database. It only
// throws, so /enroll's Step 3 "Confirm Payment" can exercise the real
// disabled/pending/idempotency-key wiring in wave 1 without faking success.
import type { PaymentMethod } from "@/../generated/prisma/enums";

export interface SubmitEnrollmentInput {
  idempotencyKey: string;
  programIds: string[];
  trainee: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
  };
  paymentMethod: PaymentMethod;
  proof: File;
}

export async function submitEnrollment(input: SubmitEnrollmentInput): Promise<never> {
  // Intentionally unused: this stub never reaches the database. Referenced
  // via `void` (rather than an underscore-prefixed name) purely to keep the
  // real parameter name and shape visible for wave 3, without an unused-var
  // warning — the signature is the point of this file, not the body.
  void input;
  throw new Error(
    "TODO(wave-3): enrollment submission is not implemented yet. " +
      "This build stops at the disabled/pending guard on purpose.",
  );
}
