"use server";

import { updateTag } from "next/cache";

import { getSession } from "@/server/auth/session";
import { getClientIp } from "@/server/auth/client-ip";
import { checkRateLimit } from "@/server/auth/rate-limit";
import { enrollmentSubmissionSchema } from "@/server/schemas/enrollment.schema";
import { submitEnrollment as submitEnrollmentService } from "@/server/services/enrollment.service";

export type EnrollmentActionResult =
  | { ok: true; paymentId: string; referenceCode: string; totalAmount: string; enrollmentIds: string[] }
  | { ok: false; error: string };

export async function submitEnrollmentAction(rawInput: unknown): Promise<EnrollmentActionResult> {
  // Server Actions are public POST endpoints. Consume a shared, hashed IP
  // bucket before parsing or reading a supplied file so malformed requests
  // cannot bypass the public enrollment limit.
  const rateLimit = await checkRateLimit(`enroll:${await getClientIp()}`);
  if (!rateLimit.allowed) return { ok: false, error: "Please wait a moment and try again." };

  const parsed = enrollmentSubmissionSchema.safeParse(rawInput);
  if (!parsed.success) return { ok: false, error: "Check the enrollment details and try again." };

  const session = await getSession();
  if (session && session.role !== "TRAINEE") return { ok: false, error: "Only trainee accounts may enroll." };

  try {
    const proofBytes = Buffer.from(await parsed.data.proof.arrayBuffer());
    const result = await submitEnrollmentService({
      ...parsed.data,
      actor: session,
      proof: { bytes: proofBytes, mimeType: parsed.data.proof.type },
    });
    updateTag("enrollments");
    updateTag("enrollment-payments");
    return { ok: true, ...result };
  } catch {
    return { ok: false, error: "We could not record your enrollment. Please try again." };
  }
}
