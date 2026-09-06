"use server";

import { forgotPasswordSchema } from "@/server/schemas/auth.schema";
import { checkRateLimit } from "@/server/auth/rate-limit";
import { getClientIp } from "@/server/auth/client-ip";
import { requestPasswordReset as createPasswordReset } from "@/server/services/password-reset.service";

export interface ForgotPasswordActionResult { ok: true; error?: string; }

const GENERIC_ERROR = "Something went wrong. Please try again.";
const RATE_LIMITED_ERROR = "Too many requests. Please wait a moment and try again.";

export async function requestPasswordReset(rawInput: unknown): Promise<ForgotPasswordActionResult | { ok: false; error: string }> {
  const parsed = forgotPasswordSchema.safeParse(rawInput);
  if (!parsed.success) return { ok: false, error: GENERIC_ERROR };
  const ip = await getClientIp();
  const rateLimit = await checkRateLimit(`forgot-password:${ip}`);
  if (!rateLimit.allowed) return { ok: false, error: RATE_LIMITED_ERROR };
  return createPasswordReset(parsed.data.email);
}
