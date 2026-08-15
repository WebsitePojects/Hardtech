import { NavbarShell } from "./navbar-shell";
import { SiteLogo } from "./site-logo";
import { DesktopNav } from "./desktop-nav";
import { NavbarActions, type NavbarUser } from "./navbar-actions";
import { MobileNav } from "./mobile-nav";
import { getSession } from "@/server/auth/session";
import { getDashboardUser } from "@/server/services/dashboard.service";
import { getInitials } from "@/components/dashboard/get-initials";
import { logoutAction } from "@/app/(dashboard)/actions";

function roleLabel(role: "ADMIN" | "TRAINER" | "TRAINEE"): string {
  switch (role) {
    case "ADMIN":
      return "Admin";
    case "TRAINER":
      return "Trainer";
    case "TRAINEE":
      return "Trainee";
  }
}

function dashboardHref(role: "ADMIN" | "TRAINER" | "TRAINEE"): string {
  return role === "ADMIN" ? "/dashboard/admin" : role === "TRAINER" ? "/dashboard/trainer" : "/dashboard/trainee";
}

/**
 * The navbar emerges on scroll: flat and full-bleed at the top of the page,
 * condensing into a floating glass pill once scrolled. `NavbarShell` owns that
 * behaviour and the measured geometry behind it
 * (docs/research/02-reference-behavior.md).
 *
 * This component stays on the server. It renders the shell's children — logo,
 * nav, actions — and passes them down as already-rendered nodes, so only the
 * thin shell and the two genuinely interactive children (`DesktopNav` for the
 * Explore dropdown and active-route highlighting, `MobileNav` for the drawer)
 * ship as client components.
 */
export async function Navbar() {
  const session = await getSession();
  const userRecord = session ? await getDashboardUser(session.userId) : null;
  const user: NavbarUser | null = session && userRecord
    ? { initials: getInitials(userRecord.name), roleLabel: roleLabel(session.role), dashboardHref: dashboardHref(session.role) }
    : null;

  return (
    <NavbarShell>
      <SiteLogo />
      <DesktopNav />
      <div className="flex items-center gap-2">
        <NavbarActions user={user} />
        <MobileNav user={user} logoutAction={logoutAction} />
      </div>
    </NavbarShell>
  );
}
