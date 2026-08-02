import { SiteLogo } from "./site-logo";
import { DesktopNav } from "./desktop-nav";
import { NavbarActions, type NavbarUser } from "./navbar-actions";
import { MobileNav } from "./mobile-nav";
import { getSession } from "@/server/auth/session";
import { getDashboardUser } from "@/server/services/dashboard.service";
import { getInitials } from "@/components/dashboard/get-initials";

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

/**
 * Floating pill-shaped glass navbar, horizontally centred and detached from
 * the viewport edge (docs/screens/desktop-01.md #1). Sticky rather than
 * fixed so it participates in normal flow and simply keeps a 1rem gap from
 * the top on scroll — the `.glass` backdrop-blur lets page content bleed
 * through underneath it, matching the mobile captures.
 *
 * Server component: only the two children that need interactivity
 * (`DesktopNav` for the Explore dropdown + active-route highlighting,
 * `MobileNav` for the drawer) are client components.
 */
export async function Navbar() {
  const session = await getSession();
  const userRecord = session ? await getDashboardUser(session.userId) : null;
  const user: NavbarUser | null = session && userRecord
    ? { initials: getInitials(userRecord.name), roleLabel: roleLabel(session.role) }
    : null;

  return (
    <div className="sticky top-4 z-50 mx-auto w-full max-w-7xl px-4 sm:px-6">
      <header className="glass mx-auto flex w-full max-w-7xl items-center justify-between gap-3 rounded-full px-4 py-2 sm:px-6">
        <SiteLogo />
        <DesktopNav />
        <div className="flex items-center gap-2">
          <NavbarActions user={user} />
          <MobileNav user={user} />
        </div>
      </header>
    </div>
  );
}
