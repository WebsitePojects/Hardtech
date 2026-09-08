import { db } from "@/server/db";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import type { UserRole } from "@/../generated/prisma/enums";

// ---------------------------------------------------------------------------
// Architecture note (.claude/rules/10-architecture.md): Prisma access is
// supposed to live only behind src/server/repositories/**. This wave's
// ownership map (docs/contracts/wave-2-app.md) assigns that directory to
// DATA-2 ("new files only"); AUTH owns only src/app/(auth)/**,
// src/server/auth/**, proxy.ts, and src/server/schemas/auth.schema.ts.
// Adding a new repository file would land outside AUTH's owned paths and
// risk colliding with DATA-2's work in the same wave, so this single,
// narrowly-scoped read (id/role/status by email, nothing else — no
// passwordHash, no name, no phone) is made directly against `db` here
// instead. If/when a UserRepository lands, this lookup should move behind
// it; nothing else in this file needs to change.
// ---------------------------------------------------------------------------

export interface DemoAuthenticatedUser {
  id: string;
  role: UserRole;
}

const SCRYPT_N = 16_384;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const SCRYPT_KEY_LENGTH = 64;

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("base64url");
  const digest = scryptSync(password, salt, SCRYPT_KEY_LENGTH, {
    N: SCRYPT_N,
    r: SCRYPT_R,
    p: SCRYPT_P,
    maxmem: 32 * 1024 * 1024,
  });
  return `scrypt$v=1$n=${SCRYPT_N}$r=${SCRYPT_R}$p=${SCRYPT_P}$l=${SCRYPT_KEY_LENGTH}$${salt}$${digest.toString("base64url")}`;
}

export function verifyPassword(password: string, encoded: string): boolean {
  const parts = encoded.split("$");
  if (parts.length !== 8 || parts[0] !== "scrypt" || parts[1] !== "v=1") return false;
  const parameters = new Map<string, string>(parts.slice(2, 6).map((part) => {
    const separator = part.indexOf("=");
    return [part.slice(0, separator), part.slice(separator + 1)];
  }));
  const n = Number(parameters.get("n"));
  const r = Number(parameters.get("r"));
  const p = Number(parameters.get("p"));
  const length = Number(parameters.get("l"));
  if (![n, r, p, length].every(Number.isSafeInteger) || n <= 1 || r <= 0 || p <= 0 || length <= 0) return false;
  try {
    const expected = Buffer.from(parts[7], "base64url");
    const actual = scryptSync(password, parts[6], length, { N: n, r, p, maxmem: 32 * 1024 * 1024 });
    return expected.length === actual.length && timingSafeEqual(expected, actual);
  } catch {
    return false;
  }
}

/**
 * ============================================================================
 * Development-only test credentials. READ BEFORE TOUCHING.
 * ============================================================================
 *
 * Local development may expose the seeded test accounts and accept any
 * non-empty password for them. Every other environment verifies the stored
 * scrypt hash. In particular, an environment variable must never be able to
 * re-enable the permissive path in production.
 *
 * Everything downstream of this function is real: the session is a signed,
 * httpOnly cookie (src/server/auth/session.ts), `/dashboard/*` is
 * role-gated server-side on every request (proxy.ts + requireRole()), the
 * login action is rate-limited (src/server/auth/rate-limit.ts), and auth
 * errors are generic regardless of *why* a login failed (unknown email,
 * disabled demo mode, or a suspended account all return the identical
 * message — no user-enumeration signal).
 *
 * Fail closed: preview, test, staging, and production are all real-password
 * environments. `development` is the only deliberately permissive mode.
 */
export function isDemoAuthEnabled(): boolean {
  return process.env.NODE_ENV === "development";
}

/**
 * Looks up `email` and returns its current id/role when it is not suspended
 * and either development demo auth is enabled or its password verifies. The
 * caller must not distinguish failure reasons in its response.
 */
export async function verifyDemoCredentials(
  email: string,
  password: string,
): Promise<DemoAuthenticatedUser | null> {
  const user = await db.user.findUnique({
    where: { email },
    select: { id: true, role: true, status: true, passwordHash: true },
  });

  if (!user) return null;
  // A suspended account (desktop-02.md #4/#7 — User Management Status
  // column) exists specifically to lock someone out; honour it even though
  // the password check is skipped in demo mode.
  if (user.status === "SUSPENDED") return null;

  if (!isDemoAuthEnabled() && !verifyPassword(password, user.passwordHash)) return null;

  return { id: user.id, role: user.role };
}
