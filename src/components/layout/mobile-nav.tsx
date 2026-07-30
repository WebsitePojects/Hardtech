"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SiteLogo } from "./site-logo";
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
export function MobileNav() {
  const pathname = usePathname();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="border border-glass-border bg-glass md:hidden"
          aria-label="Open menu"
        >
          <Menu className="size-5" aria-hidden />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="flex flex-col gap-0 border-glass-border bg-surface p-0"
      >
        <SheetHeader className="border-b border-glass-border p-4">
          <SheetTitle asChild>
            <SiteLogo size="sm" />
          </SheetTitle>
        </SheetHeader>

        <nav
          className="flex flex-1 flex-col gap-1 overflow-y-auto p-4"
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
        </div>
      </SheetContent>
    </Sheet>
  );
}
