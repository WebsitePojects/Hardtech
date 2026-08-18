"use server";

import { redirect } from "next/navigation";

import { loginSchema } from "@/server/schemas/auth.schema";
import { verifyDemoCredentials } from "@/server/auth/demo-credentials";
import { createSession } from "@/server/auth/session";
import { checkRateLimit } from "@/server/auth/rate-limit";
import { getClientIp } from "@/server/auth/client-ip";
import { db } from "@/server/db";
import { normalizeIanaTimeZone } from "@/server/timezone";

export interface LoginActionResult {
  ok: false;
  error: string;
}

// Identical message for every failure mode — unknown email, demo auth
// disabled in production, a suspended account, or (once this stops being
// demo auth) a wrong password. Rule 5: "Return generic auth errors" —
// never reveal *why*, which would otherwise leak whether an email exists.
const GENERIC_ERROR = "Invalid email or password.";
const RATE_LIMITED_ERROR = "Too many sign-in attempts. Please wait a moment and try again.";

/**
 * The login mutation. Note on non-negotiables rule 2 ("every mutating
 * endpoint is duplicate-safe"): a double-fire of this action is safe by
 * construction, not by an added guard — it never inserts a row. It reads a
 * user, then calls `createSession`, which does nothing but overwrite the
 * same signed cookie with equivalent content. Two concurrent calls with the
 * same credentials converge on the same outcome; there is no unique
 * constraint to violate and no partial side effect that only one call
 * should perform. The double-submit protection that *does* apply here is
 * client-side (disabled + pending + early-return in login-form.tsx, rule 1)
 * plus the rate limiter below, which caps how many attempts one caller gets
 * regardless of intent.
 */
export async function loginAction(rawInput: unknown): Promise<LoginActionResult> {
  const parsed = loginSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { ok: false, error: GENERIC_ERROR };
  }

  const ip = await getClientIp();
  const rateLimit = checkRateLimit(`login:${ip}`);
  if (!rateLimit.allowed) {
    return { ok: false, error: RATE_LIMITED_ERROR };
  }

  const user = await verifyDemoCredentials(parsed.data.email, parsed.data.password);
  if (!user) {
    return { ok: false, error: GENERIC_ERROR };
  }

  const timezone = parsed.data.timezone ? normalizeIanaTimeZone(parsed.data.timezone) : null;
  if (timezone) {
    await db.user.updateMany({
      where: { id: user.id, timezone: { not: timezone } },
      data: { timezone },
    });
  }

  await createSession(user.id, user.role, { rememberMe: parsed.data.rememberMe });

  // Not inside a try/catch: redirect() throws a special Next control-flow
  // value that must propagate, never be caught and swallowed.
  redirect("/dashboard");
}
