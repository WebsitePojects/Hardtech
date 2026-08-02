import { redirect } from "next/navigation";

import { requireSession } from "@/server/auth/session";
import { getDashboardUser } from "@/server/services/dashboard.service";
import { DashboardMobileNav } from "@/components/dashboard/dashboard-mobile-nav";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { getAdminOverviewStats } from "@/server/services/dashboard.service";
import type { UserRole } from "@/../generated/prisma/enums";
import { logoutAction } from "./actions";

const RECOGNIZED_ROLES: readonly UserRole[] = ["ADMIN", "TRAINER", "TRAINEE"];

/**
 * Authenticated shell for every `/dashboard/*` route (this layout, the
 * `/dashboard` router, and `/dashboard/{trainee,trainer,admin}` from
 * wave-3 all render inside it).
 *
 * `requireSession()` (src/server/auth/session.ts) is the server-side
 * authorization gate (.claude/rules/00-non-negotiables.md #5): it returns a
 * real `Session` or redirects to `/login` itself, so this file never sees
 * an unauthenticated request. `Session` is intentionally `{ userId, role }`
 * only — no name/email (rule 6, no PII in the session payload), so the
 * user's display name is looked up server-side, keyed on `session.userId`,
 * through the service layer per .claude/rules/10-architecture.md (never a
 * repository or `db` import from this file).
 *
 * `getDashboardUser(userId)` is a signature this builder needs but does not
 * own — DATA-2 owns `src/server/services/dashboard.service.ts` and had not
 * shipped a user-lookup export as of this edit. Coded against the contract:
 * `getDashboardUser(userId: string): Promise<{ userId: string; name: string;
 * role: UserRole } | null>`, reading `userRepository.findById` (already
 * present in src/server/repositories/user.repository.ts) and shaping
 * `${firstName} ${lastName}` into `name`. Until DATA-2 adds it, this import
 * fails to resolve — expected, per the coordinator's note, not a bug in
 * this file. `user` is nullable here on purpose: a missing profile row
 * (deleted user, stale session) degrades to role-meta.ts's
 * `fallbackDisplayName` rather than throwing, since a display name is
 * cosmetic, not an authorization input.
 *
 * The role rendered here comes off the session on the server. It is never
 * read from a client-visible chip, and a role outside the three recognized
 * enum members fails closed to `/login` rather than falling through to a
 * default dashboard (rule 3) — this is a second, independent check from the
 * `/dashboard` router's own (rule 5: one gate is not enough), and matters
 * here specifically because this layout also wraps wave-3's
 * `/dashboard/{admin,trainer,trainee}` pages.
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession();

  if (!RECOGNIZED_ROLES.includes(session.role)) {
    redirect("/login");
  }

  const user = await getDashboardUser(session.userId);
  const adminStats = session.role === "ADMIN" ? await getAdminOverviewStats() : null;

  return (
    <DashboardShell role={session.role}>
      <div className="relative flex min-h-screen bg-surface">
        <div className="dashboard-glow pointer-events-none fixed inset-0 -z-10" aria-hidden />

        <DashboardSidebar
          role={session.role}
          userName={user?.name}
          logoutAction={logoutAction}
          badges={adminStats ? { enrollments: adminStats.pendingEnrollments, certificates: adminStats.pendingCertificateRequests } : undefined}
          className="hidden lg:flex"
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <DashboardMobileNav
            role={session.role}
            userName={user?.name}
            logoutAction={logoutAction}
            badges={adminStats ? { enrollments: adminStats.pendingEnrollments, certificates: adminStats.pendingCertificateRequests } : undefined}
            className="lg:hidden"
          />
          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-6">{children}</main>
        </div>
      </div>
    </DashboardShell>
  );
}
