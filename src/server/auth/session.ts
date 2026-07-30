import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import type { UserRole } from "@/../generated/prisma/enums";

import {
  SESSION_COOKIE_NAME,
  sessionLifetimeMs,
  signSessionToken,
  verifySessionToken,
} from "./session-token";

export interface Session {
  userId: string;
  role: UserRole;
}

/**
 * Mints a new signed session cookie and sets it. Called only from the login
 * server action (src/app/(auth)/login/actions.ts) after
 * `verifyDemoCredentials` resolves a real user.
 *
 * httpOnly + SameSite=Lax + Secure-in-production, signed with AUTH_SECRET,
 * carrying only `{ userId, role, exp }` — no email, no name, nothing a
 * client script or a stolen-cookie replay could use beyond "is this session
 * valid and what does it authorize" (rule 6: never put PII in a
 * client-readable... and even though httpOnly keeps JS out, the payload is
 * signed, not encrypted, so the same non-sensitive-payload discipline
 * applies).
 */
export async function createSession(
  userId: string,
  role: UserRole,
  options: { rememberMe: boolean },
): Promise<void> {
  const lifetimeMs = sessionLifetimeMs(options.rememberMe);
  const token = signSessionToken({
    userId,
    role,
    exp: Date.now() + lifetimeMs,
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: Math.floor(lifetimeMs / 1000),
  });
}

/**
 * Reads and verifies the session cookie. Returns `null` for: no cookie, a
 * malformed/unsigned/tampered token, or an expired one — every failure mode
 * collapses to the same "no session" result, never a partial/degraded one
 * (rule 3: fail closed).
 */
export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  const payload = verifySessionToken(token);
  if (!payload) return null;

  return { userId: payload.userId, role: payload.role };
}

/**
 * Contracted for other wave-2 builders (docs/contracts/wave-2-app.md): any
 * server component or server action gating a route behind "must be signed
 * in" calls this and gets back a real session or is redirected to /login.
 * Never returns `null` — that's the point of the name.
 */
export async function requireSession(): Promise<Session> {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

/**
 * Same contract, plus a role check. Used by role-scoped dashboard routes
 * (`/dashboard/trainee`, `/dashboard/trainer`, `/dashboard/admin` — wave 3)
 * and by any wave-2 server action that must only run for one role.
 *
 * Redirects to `/login` on a role mismatch too, per the explicit contract
 * ("requireSession and requireRole redirect to /login when unsatisfied") —
 * not to `/dashboard`, even though that reads slightly less friendly for a
 * signed-in user who just hit the wrong section. `proxy.ts` is the layer
 * that gives wrong-role dashboard visitors the nicer "redirect to your own
 * dashboard" experience; this function is the hard server-side boundary and
 * keeps its contract simple and unambiguous for every caller.
 */
export async function requireRole(role: UserRole): Promise<Session> {
  const session = await requireSession();
  if (session.role !== role) redirect("/login");
  return session;
}

/**
 * Clears the session cookie and redirects to /login. Exported for
 * DASH-SHELL's sidebar "Logout" control (every role's sidebar has one —
 * docs/screens/desktop-02.md #2/#14/#22) to call from its own server action
 * without needing to touch src/server/auth/** itself.
 */
export async function logout(): Promise<never> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  redirect("/login");
}
