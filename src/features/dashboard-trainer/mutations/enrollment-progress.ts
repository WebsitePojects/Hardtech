import { completeEnrollmentAction, setEnrollmentProgressAction } from "@/app/(dashboard)/dashboard/trainer/actions";

export async function setEnrollmentProgress(input: { enrollmentId: string; progressPercent: number; idempotencyKey: string }) {
  const result = await setEnrollmentProgressAction(input);
  if (!result.ok) throw new Error(result.error);
  return result;
}

export async function completeEnrollment(input: { enrollmentId: string; idempotencyKey: string }) {
  const result = await completeEnrollmentAction(input);
  if (!result.ok) throw new Error(result.error);
  return result;
}
