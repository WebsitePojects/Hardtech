import { db } from "@/server/db";
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

/**
 * ============================================================================
 * THE ONE PERMISSIVE FUNCTION IN THIS CODEBASE. READ BEFORE TOUCHING.
 * ============================================================================
 *
 * The reference Figma Make site is an unauthenticated demo: `/login` ships
 * a visible "TEST CREDENTIALS" box listing admin@gmail.com / trainer@gmail.com
 * / trainee@gmail.com with the caption "Password: any value"
 * (docs/screens/desktop-02.md #1, docs/screens/mobile-04.md #12). That is
 * the product spec, not an accident, and docs/contracts/wave-2-app.md
 * requires reproducing it exactly. So: **this function does not check the
 * password at all.** Any non-empty string (already enforced by
 * loginSchema) authenticates a *known* seeded email.
 *
 * Everything downstream of this function is real: the session is a signed,
 * httpOnly cookie (src/server/auth/session.ts), `/dashboard/*` is
 * role-gated server-side on every request (proxy.ts + requireRole()), the
 * login action is rate-limited (src/server/auth/rate-limit.ts), and auth
 * errors are generic regardless of *why* a login failed (unknown email,
 * disabled demo mode, or a suspended account all return the identical
 * message — no user-enumeration signal).
 *
 * FAIL-CLOSED GATE (non-negotiables rule 3 — "unrecognized state rejects"):
 * this whole function is a no-op in production unless an operator has
 * explicitly opted back in.
 *
 *   - `NODE_ENV !== "production"` (local dev, CI, preview builds): demo auth
 *     is ON by default, no env var needed — that's what makes the seeded
 *     demo accounts usable out of the box while building this app.
 *   - `NODE_ENV === "production"`: demo auth is OFF unless `DEMO_AUTH` is
 *     the exact string `"true"`. Anything else — unset, `"1"`, `"yes"`,
 *     `"TRUE"` — rejects every login. There is no code path in a real
 *     production deployment that authenticates a user without a real
 *     password check unless someone has deliberately set `DEMO_AUTH=true`,
 *     which only makes sense for a public marketing/staging demo of this
 *     exact product, never for handling real trainee data.
 */
function isDemoAuthEnabled(): boolean {
  if (process.env.NODE_ENV !== "production") return true;
  return process.env.DEMO_AUTH === "true";
}

/**
 * Looks up `email` and, if demo auth is enabled and the email matches a real
 * seeded user, returns that user's id/role — regardless of `password`'s
 * value. Returns `null` for: demo auth disabled, no such user, or a
 * suspended account. The caller (the login action) must not distinguish
 * between these cases in the message it shows the user.
 */
export async function verifyDemoCredentials(
  email: string,
  password: string,
): Promise<DemoAuthenticatedUser | null> {
  // `password` is intentionally unread — see the comment block above. Kept
  // as a real parameter (not dropped from the signature) so the moment this
  // function is ever replaced with a real credential check, the call sites
  // don't need to change, only this body does.
  void password;

  if (!isDemoAuthEnabled()) return null;

  const user = await db.user.findUnique({
    where: { email },
    select: { id: true, role: true, status: true },
  });

  if (!user) return null;
  // A suspended account (desktop-02.md #4/#7 — User Management Status
  // column) exists specifically to lock someone out; honour it even though
  // the password check is skipped in demo mode.
  if (user.status === "SUSPENDED") return null;

  return { id: user.id, role: user.role };
}
