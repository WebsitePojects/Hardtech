import { assignEnrollmentToBatchAction } from "@/app/(dashboard)/dashboard/admin/actions";

export async function assignEnrollmentToBatch(input: {
  enrollmentId: string;
  batchId: string;
  idempotencyKey: string;
}) {
  const result = await assignEnrollmentToBatchAction(input);
  if (!result.ok) throw new Error(result.error);
  return result;
}
