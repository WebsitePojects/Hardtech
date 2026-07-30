import { redirect } from "next/navigation";

import { getSession } from "@/server/auth/session";

/**
 * Role router for `/dashboard`.
 *
 * Fail-closed per .claude/rules/00-non-negotiables.md #3: a missing session
 * or any role value other than the three recognized `UserRole` members
 * falls through to the `default` branch and redirects to `/login`. It never
 * falls through to a default dashboard. This switch is exhaustive over the
 * `UserRole` enum plus the `undefined` case for "no session" — there is no
 * branch that can render a dashboard for an unrecognized role.
 */
export default async function DashboardIndexPage() {
  const session = await getSession();

  switch (session?.role) {
    case "ADMIN":
      redirect("/dashboard/admin");
    case "TRAINER":
      redirect("/dashboard/trainer");
    case "TRAINEE":
      redirect("/dashboard/trainee");
    default:
      redirect("/login");
  }
}
