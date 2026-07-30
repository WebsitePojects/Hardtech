"use server";

import { forgotPasswordSchema } from "@/server/schemas/auth.schema";
import { checkRateLimit } from "@/server/auth/rate-limit";
import { getClientIp } from "@/server/auth/client-ip";

export interface ForgotPasswordActionResult {
  ok: false;
  error: string;
}

const GENERIC_ERROR = "Something went wrong. Please try again.";
const RATE_LIMITED_ERROR = "Too many requests. Please wait a moment and try again.";

/**
 * Real guards, stubbed side effect — same pattern as
 * src/features/enroll/submit-enrollment.ts in wave 1: build the disabled/
 * pending/rate-limit/validation wiring for real, then stop at a
 * `TODO(wave-3)` rather than faking a successful password-reset email.
 *
 * Why it stops here: a real implementation needs a single-use, time-boxed
 * reset token persisted server-side (no `PasswordResetToken` model exists in
 * prisma/schema.prisma — that file is orchestrator-owned this wave, not
 * AUTH's to add to) plus an outbound email integration (none exists in this
 * project yet). Claiming "check your email" without either would be exactly
 * the kind of faked successful write non-negotiables rule 7 and the wave-2
 * contract's "never fake a successful write" forbid — it would look done
 * and ship a UI nobody could ever debug when no email arrives.
 *
 * What IS real and enforced below, so this isn't a bare stub:
 *   - zod validation at the boundary (rule 4)
 *   - IP rate-limiting (rule 5) — the resource this endpoint would consume
 *     once wired up (email sends, or a signed-URL crypto op) is exactly the
 *     kind of thing worth rate-limiting even before it exists
 *   - no user-enumeration signal: every code path returns the same shape of
 *     response regardless of whether `email` belongs to a real account
 */
export async function requestPasswordReset(
  rawInput: unknown,
): Promise<ForgotPasswordActionResult> {
  const parsed = forgotPasswordSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { ok: false, error: GENERIC_ERROR };
  }

  const ip = await getClientIp();
  const rateLimit = checkRateLimit(`forgot-password:${ip}`);
  if (!rateLimit.allowed) {
    return { ok: false, error: RATE_LIMITED_ERROR };
  }

  throw new Error(
    "TODO(wave-3): password reset is not implemented yet — no PasswordResetToken " +
      "model and no email integration exist. This build stops at the validated, " +
      "rate-limited guard on purpose rather than faking a sent email.",
  );
}
