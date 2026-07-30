import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { SESSION_COOKIE_NAME, verifySessionToken } from "@/server/auth/session-token";
import type { UserRole } from "@/../generated/prisma/enums";

/**
 * Next 16 renamed `middleware.ts` to `proxy.ts` — file, export name, and
 * runtime all changed (.claude/rules/30-nextjs-16.md §2). The export must be
 * named `proxy`; runtime is `nodejs` and is not configurable in this
 * version, so plain `node:crypto` verification (via session-token.ts) works
 * here exactly as it does in the app runtime.
 *
 * IMPORTANT: this is a CONVENIENCE REDIRECT, not the authorization boundary.
 * It exists so an unauthenticated or wrong-role visit to `/dashboard/*`
 * bounces immediately instead of rendering a page that then has to redirect
 * itself. Every dashboard route and every mutating server action re-checks
 * the session on the server via requireSession()/requireRole()
 * (src/server/auth/session.ts) regardless of what happens here — a bug or a
 * bypassed matcher in this file can only ever fail toward "you get sent to
 * /login and have to sign in again," never toward granting access a route's
 * own server-side check would refuse. See the Next docs' own warning that a
 * proxy matcher change can silently remove coverage for a route
 * (node_modules/next/dist/docs/.../file-conventions/proxy.md, "Execution
 * order").
 *
 * `/dashboard/trainee` | `/dashboard/trainer` | `/dashboard/admin` are wave-3
 * routes and don't exist yet, but the matcher and the role map below already
 * cover them so nothing here needs to change when they land. `/dashboard`
 * itself (this wave's role router, owned by DASH-SHELL) only needs a valid
 * session, not a specific role.
 */

const ROLE_BY_DASHBOARD_SEGMENT: Record<string, UserRole> = {
  admin: "ADMIN",
  trainer: "TRAINER",
  trainee: "TRAINEE",
};

export function proxy(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? verifySessionToken(token) : null;

  if (!session) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // /dashboard/<segment>/... -> ["", "dashboard", "<segment>", ...]
  const segment = request.nextUrl.pathname.split("/")[2];
  const requiredRole = segment ? ROLE_BY_DASHBOARD_SEGMENT[segment] : undefined;

  if (requiredRole && session.role !== requiredRole) {
    // Signed in, just the wrong section — send them to the role router
    // rather than back to /login (which would just bounce them straight
    // back here anyway, since they do have a valid session).
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
