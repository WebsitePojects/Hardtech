import { evaluateTraineeAction } from "@/app/(dashboard)/dashboard/trainer/actions";
import type { EvaluateTraineeInput as DashboardEvaluateTraineeInput } from "@/server/schemas/dashboard-write.schema";

export type EvaluateTraineeInput = DashboardEvaluateTraineeInput & { traineeId: string };

export async function evaluateTrainee(input: EvaluateTraineeInput) {
  const result = await evaluateTraineeAction(input);
  if (!result.ok) throw new Error(result.error);
  return result;
}
