import { createHmac, timingSafeEqual } from "node:crypto";

import type { UserRole } from "@/../generated/prisma/enums";

/**
 * Signs and verifies the session cookie's contents. Deliberately has no
 * dependency on `next/headers` or `next/server` so the exact same code runs
 * in both the app runtime (src/server/auth/session.ts, via `cookies()`) and
 * `proxy.ts` (which reads `NextRequest.cookies` directly and cannot call
 * `next/headers`'s `cookies()`). One verification implementation, not two
 * that could drift apart.
 *
 * Session content: `{ userId, role, exp }`, base64url-encoded, HMAC-SHA256
 * signed with AUTH_SECRET. Never put anything sensitive in the payload —
 * the cookie is httpOnly so JS can't read it, but the payload itself is only
 * *signed*, not encrypted, so it must stay non-sensitive (rule 6: never log
 * or return secrets/tokens/PII — the same bar applies to "don't put PII in a
 * signed-but-readable cookie").
 */

export const SESSION_COOKIE_NAME = "hardtech_session";

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export interface SessionPayload {
  userId: string;
  role: UserRole;
  /** Epoch milliseconds. Checked on every verify — a stale cookie the browser
   *  somehow retained past its lifetime is rejected even if the signature is
   *  still valid. */
  exp: number;
}

/** 30 days if "remember me" was checked, otherwise 1 day. */
export function sessionLifetimeMs(rememberMe: boolean): number {
  return rememberMe ? THIRTY_DAYS_MS : ONE_DAY_MS;
}

function getSecret(): string | null {
  const secret = process.env.AUTH_SECRET;
  // Fail closed: no secret means we can neither sign nor trust anything
  // claiming to be a valid session, per rule 3 (unrecognized state rejects).
  return secret && secret.length > 0 ? secret : null;
}

function base64UrlEncode(input: string): string {
  return Buffer.from(input, "utf8").toString("base64url");
}

function base64UrlDecode(input: string): string | null {
  try {
    return Buffer.from(input, "base64url").toString("utf8");
  } catch {
    return null;
  }
}

function sign(payloadB64: string, secret: string): string {
  return createHmac("sha256", secret).update(payloadB64).digest("base64url");
}

/**
 * Constant-time signature comparison (rule 5: "compare secrets in constant
 * time"). `timingSafeEqual` requires equal-length buffers, so an unequal
 * length is treated as a mismatch up front rather than thrown.
 */
function signaturesMatch(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export function signSessionToken(payload: SessionPayload): string {
  const secret = getSecret();
  if (!secret) {
    throw new Error(
      "AUTH_SECRET is not set. Refusing to sign a session token without it.",
    );
  }
  const payloadB64 = base64UrlEncode(JSON.stringify(payload));
  const signature = sign(payloadB64, secret);
  return `${payloadB64}.${signature}`;
}

/**
 * Returns the decoded payload if the token's signature is valid and it has
 * not expired, otherwise `null`. Never throws — every caller (proxy.ts,
 * session.ts) treats `null` as "no session" and fails closed.
 */
export function verifySessionToken(token: string): SessionPayload | null {
  const secret = getSecret();
  if (!secret) return null;

  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [payloadB64, signature] = parts;

  const expectedSignature = sign(payloadB64, secret);
  if (!signaturesMatch(signature, expectedSignature)) return null;

  const json = base64UrlDecode(payloadB64);
  if (!json) return null;

  try {
    const parsed = JSON.parse(json) as Partial<SessionPayload>;
    if (
      typeof parsed.userId !== "string" ||
      typeof parsed.role !== "string" ||
      typeof parsed.exp !== "number"
    ) {
      return null;
    }
    // Fail closed on an unrecognized role rather than trusting it (rule 3).
    if (parsed.role !== "TRAINEE" && parsed.role !== "TRAINER" && parsed.role !== "ADMIN") {
      return null;
    }
    if (Date.now() >= parsed.exp) return null;

    return { userId: parsed.userId, role: parsed.role, exp: parsed.exp };
  } catch {
    return null;
  }
}
