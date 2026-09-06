"use server";

import { updateTag } from "next/cache";
import { getSession } from "@/server/auth/session";
import { completeEnrollmentSchema, createAssignmentSchema, evaluateTraineeSchema, setEnrollmentProgressSchema } from "@/server/schemas/dashboard-write.schema";
import * as writes from "@/server/services/dashboard-write.service";
import { completeEnrollment, setEnrollmentProgress } from "@/server/services/enrollment-progress.service";

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

export async function setEnrollmentProgressAction(input: unknown) {
  const parsed = setEnrollmentProgressSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "Invalid progress update." };
  const session = await getSession();
  if (!session || session.role !== "TRAINER") return { ok: false as const, error: "Not authorized." };
  const result = await setEnrollmentProgress({ ...parsed.data, actorId: session.userId, actorRole: session.role });
  if (result.ok) updateTag("dashboard");
  return result;
}

export async function completeEnrollmentAction(input: unknown) {
  const parsed = completeEnrollmentSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "Invalid completion request." };
  const session = await getSession();
  if (!session || session.role !== "TRAINER") return { ok: false as const, error: "Not authorized." };
  const result = await completeEnrollment({ ...parsed.data, actorId: session.userId, actorRole: session.role });
  if (result.ok) updateTag("dashboard");
  return result;
}
