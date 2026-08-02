import { createAssignmentAction } from "@/app/(dashboard)/dashboard/trainer/actions";
import type { CreateAssignmentInput as DashboardCreateAssignmentInput } from "@/server/schemas/dashboard-write.schema";

export type CreateAssignmentInput = DashboardCreateAssignmentInput;

export async function createAssignment(input: CreateAssignmentInput) {
  const result = await createAssignmentAction(input);
  if (!result.ok) throw new Error(result.error);
  return result;
}
