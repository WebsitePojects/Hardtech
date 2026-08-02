"use server";

import { updateTag } from "next/cache";
import { getSession } from "@/server/auth/session";
import { submitAssignmentSchema } from "@/server/schemas/dashboard-write.schema";
import { submitAssignment } from "@/server/services/dashboard-write.service";

export async function submitAssignmentAction(input: unknown) {
  const parsed = submitAssignmentSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "Invalid submission." };
  const session = await getSession();
  if (!session || session.role !== "TRAINEE") return { ok: false as const, error: "Not authorized." };
  const result = await submitAssignment({ ...parsed.data, traineeId: session.userId, traineeRole: session.role });
  if (result.ok) updateTag("dashboard");
  return result;
}
