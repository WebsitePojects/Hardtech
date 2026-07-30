"use server";

import { logout } from "@/server/auth/session";

/**
 * Thin `"use server"` boundary owned by DASH-SHELL. The sidebar's Logout
 * control (src/components/dashboard/dashboard-logout-button.tsx) is a
 * Client Component — it needs `useFormStatus` for its pending/disabled
 * state — so it cannot import `src/server/auth/session` directly. This
 * re-export is the one seam that lets it invoke AUTH's real session-destroy
 * action via a `<form action={...}>`.
 *
 * `logout()` (src/server/auth/session.ts) clears the httpOnly session
 * cookie and calls `redirect("/login")`, which throws internally by design
 * — Next's Server Action / form runtime handles that redirect natively, so
 * nothing here needs to catch it.
 */
export async function logoutAction(): Promise<void> {
  await logout();
}
