"use server";

import { updateTag } from "next/cache";

import { getSession } from "@/server/auth/session";
import { enrollmentSubmissionSchema } from "@/server/schemas/enrollment.schema";
import { submitEnrollment as submitEnrollmentService } from "@/server/services/enrollment.service";

export type EnrollmentActionResult =
  | { ok: true; paymentId: string; referenceCode: string; totalAmount: string; enrollmentIds: string[] }
  | { ok: false; error: string };

export async function submitEnrollmentAction(rawInput: unknown): Promise<EnrollmentActionResult> {
  const parsed = enrollmentSubmissionSchema.safeParse(rawInput);
  if (!parsed.success) return { ok: false, error: "Check the enrollment details and try again." };

  const session = await getSession();
  if (session && session.role !== "TRAINEE") return { ok: false, error: "Only trainee accounts may enroll." };

  try {
    const proofBytes = Buffer.from(await parsed.data.proof.arrayBuffer()).toString("base64");
    const result = await submitEnrollmentService({
      ...parsed.data,
      proofImageUrl: `data:${parsed.data.proof.type};base64,${proofBytes}`,
    });
    updateTag("enrollments");
    updateTag("enrollment-payments");
    return { ok: true, ...result };
  } catch {
    return { ok: false, error: "We could not record your enrollment. Please try again." };
  }
}
