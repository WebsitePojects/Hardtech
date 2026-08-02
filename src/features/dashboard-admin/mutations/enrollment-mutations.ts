import { rejectPaymentAction, verifyPaymentAction } from "@/app/(dashboard)/dashboard/admin/actions";
// TODO(wave-4): replace with real server actions once the admin mutation
// pipeline exists. Deliberately NOT server actions and do NOT touch the
// database — see src/features/enroll/submit-enrollment.ts for the
// established precedent this file follows exactly.
//
// Non-negotiables rule 2: "Verify & Approve" and "Reject" are a state
// transition, not a boolean, and desktop-02.md's "3 Approved" vs. "3 still
// pending" toast confirms this is a real workflow. When wave-4 implements
// this it must be a conditional UPDATE guarded on the row's current
// status — e.g.
//   UPDATE "Enrollment" SET status = 'ACTIVE'
//   WHERE id = $1 AND status = 'PENDING_VERIFICATION'
// and the matching EnrollmentPayment -> VERIFIED transition, so that two
// admins clicking "Verify & Approve" on the same row at once cannot both
// fire the approval side effects (notification, audit log entry) — only
// the UPDATE that actually flips a row from PENDING_VERIFICATION wins.
// EnrollmentPayment_no_self_verification (schema.prisma) already blocks a
// trainee verifying their own payment; this must not fight that constraint.
// No client-minted idempotency key is needed here (unlike /enroll's
// create): the guard is the conditional UPDATE itself, keyed on
// `enrollmentId`, not on a per-attempt token.

export interface ApproveEnrollmentInput {
  enrollmentId: string;
}

export interface RejectEnrollmentInput {
  enrollmentId: string;
  reason: string;
}

export async function approveEnrollment(input: ApproveEnrollmentInput) {
  const result = await verifyPaymentAction({ paymentId: input.enrollmentId });
  if (!result.ok) throw new Error(result.error);
  return result;
}

export async function rejectEnrollment(input: RejectEnrollmentInput) {
  const result = await rejectPaymentAction({ paymentId: input.enrollmentId, reason: input.reason });
  if (!result.ok) throw new Error(result.error);
  return result;
}
