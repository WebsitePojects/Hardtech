"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { DashboardLogoutButton } from "@/components/dashboard/dashboard-logout-button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { NavbarUser } from "./navbar-actions";
import { exploreNavItems, primaryNavItems } from "./nav-items";

/**
 * Mobile hamburger trigger + two-tier drawer (docs/screens/mobile-01.md #9):
 * flat top-level items (Home / About / Forum), an "Explore" icon+text
 * sub-group, then Login / Enroll Now pinned at the bottom. No bottom tab bar
 * anywhere per the contract.
 *
 * Client-only because active-route highlighting needs `usePathname`. Each
 * nav row is wrapped in `SheetClose` so tapping a link also closes the
 * drawer (the layout persists across marketing routes, so an uncontrolled
 * sheet would otherwise stay open after navigation).
 */
export function MobileNav({ user, logoutAction }: { user: NavbarUser | null; logoutAction: () => Promise<void> }) {
  const pathname = usePathname();

  return (
    <Sheet>
      <SheetTrigger asChild>
        {/*
          shadcn's `size="icon"` is `size-8` (32px) — under the 44px touch
          target floor. `size-11` here overrides it at this call site only
          (twMerge resolves the conflict in favor of the later class, same
          pattern as user-management-filters.tsx) rather than changing the
          shared primitive's default for every other icon button in the app.
        */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-11 border border-glass-border bg-glass md:hidden"
          aria-label="Open menu"
        >
          <Menu className="size-5" aria-hidden />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="flex flex-col gap-0 border-glass-border bg-surface p-0"
      >
        {/*
          No SiteLogo here. The outer fixed Navbar (navbar-shell.tsx, z-100000)
          stays visible and rendered above this drawer's own z-50 content the
          whole time it's open — see the stacking-scale comment in
          navbar-shell.tsx. Rendering a second logo in this header used to
          show two overlapping "HardTech / IT CORP." lockups side by side
          (measured: outer logo at x:17-141, this header's at x:114.5-374,
          same y range). SheetTitle is required by radix for a11y even
          without a visible logo, so it stays as a screen-reader-only label.

          pt-20 (80px): with the logo gone this header collapsed to just
          padding, which pulled the first nav row up to y:49 — inside the
          outer navbar's y:0-68 row (h-[68px] in navbar-shell.tsx), clipping
          the top of the "Home" pill under the logo's bounding box. Same
          80px clearance value used for the same reason in hero.tsx.
        */}
        <SheetHeader className="border-b border-glass-border px-4 pt-[max(1.25rem,env(safe-area-inset-top))] pb-4">
          <SheetTitle className="sr-only">Site navigation</SheetTitle>
          {user && (
            <div className="mt-3 flex items-center gap-2 rounded-full bg-glass px-3 py-2 text-left">
              <span className="flex size-7 items-center justify-center rounded-full bg-primary/15 font-sub text-xs font-semibold text-neon">
                {user.initials}
              </span>
              <span className="font-sub text-sm font-medium text-foreground">
                {user.roleLabel}
              </span>
            </div>
          )}
        </SheetHeader>

        <nav
          className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto p-4"
          aria-label="Primary"
        >
          {primaryNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <SheetClose key={item.href} asChild>
                <Link
                  href={item.href}
                  className={cn(
                    "relative rounded-full px-4 py-2.5 font-sub text-sm font-medium",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground/80"
                  )}
                >
                  {item.label}
                  {item.href === "/forum" && (
                    <span
                      className="absolute top-2.5 right-4 size-2 rounded-full bg-destructive"
                      aria-hidden
                    />
                  )}
                </Link>
              </SheetClose>
            );
          })}

          <p className="mt-4 mb-1 px-4 font-sub text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            Explore
          </p>

          {exploreNavItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <SheetClose key={item.href} asChild>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-4 py-2.5",
                    isActive ? "text-neon" : "text-foreground/80"
                  )}
                >
                  <Icon className="size-4" aria-hidden />
                  <span className="font-sub text-sm font-medium">{item.label}</span>
                </Link>
              </SheetClose>
            );
          })}
        </nav>

        <div className="flex flex-col gap-2 border-t border-glass-border p-4">
          {user ? (
            <>
              <SheetClose asChild>
                <Link
                  href={user.dashboardHref}
                  className={cn(buttonVariants({ variant: "outline" }), "w-full justify-start")}
                >
                  Back to dashboard
                </Link>
              </SheetClose>
              <DashboardLogoutButton action={logoutAction} className="w-full" />
            </>
          ) : (
            <>
              <SheetClose asChild>
                <Link href="/login" className={cn(buttonVariants({ variant: "outline" }), "w-full")}>
                  Login
                </Link>
              </SheetClose>
              <SheetClose asChild>
                <Link href="/enroll" className={cn(buttonVariants(), "w-full")}>
                  Enroll Now
                </Link>
              </SheetClose>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
