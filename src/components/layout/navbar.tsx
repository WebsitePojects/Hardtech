import { SiteLogo } from "./site-logo";
import { DesktopNav } from "./desktop-nav";
import { NavbarActions } from "./navbar-actions";
import { MobileNav } from "./mobile-nav";

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
export function Navbar() {
  return (
    <div className="sticky top-4 z-50 mx-auto w-full max-w-7xl px-4 sm:px-6">
      <header className="glass mx-auto flex w-full max-w-6xl items-center justify-between gap-2 rounded-full px-3 py-2 sm:px-4">
        <SiteLogo />
        <DesktopNav />
        <div className="flex items-center gap-2">
          <NavbarActions />
          <MobileNav />
        </div>
      </header>
    </div>
  );
}
