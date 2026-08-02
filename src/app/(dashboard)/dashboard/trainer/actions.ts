"use server";

import { updateTag } from "next/cache";
import { getSession } from "@/server/auth/session";
import { createAssignmentSchema, evaluateTraineeSchema } from "@/server/schemas/dashboard-write.schema";
import * as writes from "@/server/services/dashboard-write.service";

export async function evaluateTraineeAction(input: unknown) {
  const parsed = evaluateTraineeSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "Invalid evaluation." };
  const session = await getSession();
  if (!session || session.role !== "TRAINER") return { ok: false as const, error: "Not authorized." };
  const result = await writes.evaluateTrainee({ ...parsed.data, trainerId: session.userId, trainerRole: session.role, rating: parsed.data.rating });
  if (result.ok) updateTag("dashboard");
  return result;
}

export async function createAssignmentAction(input: unknown) {
  const parsed = createAssignmentSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "Invalid assignment." };
  const session = await getSession();
  if (!session || session.role !== "TRAINER") return { ok: false as const, error: "Not authorized." };
  const result = await writes.createAssignment({ ...parsed.data, trainerId: session.userId, trainerRole: session.role });
  if (result.ok) updateTag("dashboard");
  return result;
}
