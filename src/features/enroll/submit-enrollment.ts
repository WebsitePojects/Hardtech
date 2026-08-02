import { submitEnrollmentAction, type EnrollmentActionResult } from "@/app/(marketing)/enroll/actions";
import type { PaymentMethod } from "@/../generated/prisma/enums";

export interface SubmitEnrollmentInput {
  idempotencyKey: string;
  programIds: string[];
  trainee: { firstName: string; lastName: string; email: string; phone: string; password: string; confirmPassword: string };
  paymentMethod: PaymentMethod;
  proof: File;
}

export async function submitEnrollment(input: SubmitEnrollmentInput): Promise<EnrollmentActionResult> {
  return submitEnrollmentAction(input);
}
