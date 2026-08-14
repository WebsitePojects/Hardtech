"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { exploreNavItems, primaryNavItems } from "./nav-items";

/**
 * Centre nav: Home / About / Forum + an "Explore" dropdown
 * (docs/screens/desktop-01.md #1, #19). The active item gets a filled green
 * pill background per the wave-1 contract; the Explore panel highlights
 * whichever entry matches the current route.
 *
 * Client-only because active-route highlighting needs `usePathname`.
 */
export function DesktopNav() {
  const pathname = usePathname();

  return (
    <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
      {primaryNavItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "relative rounded-full px-4 py-2 font-sub text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-foreground/80 hover:text-foreground"
            )}
          >
            {item.label}
            {item.href === "/forum" && (
              <span
                className="absolute top-1 right-1.5 size-1.5 rounded-full bg-destructive"
                aria-hidden
              />
            )}
          </Link>
        );
      })}

      <DropdownMenu>
        <DropdownMenuTrigger className="group flex items-center gap-1 rounded-full px-4 py-2 font-sub text-sm font-medium text-foreground/80 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background hover:text-foreground data-open:text-foreground motion-reduce:transition-none">
          Explore
          <ChevronDown
            className="size-4 transition-transform motion-reduce:transition-none group-data-open:rotate-180"
            aria-hidden
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          sideOffset={8}
          // py-[9px]: the reference panel measures 260 tall around four 60px
          // rows and a 1px border, which leaves 18px of vertical padding.
          // z-[999999]: top of the app-wide stacking scale documented in
          // navbar-shell.tsx — this menu is attached to the navbar and must
          // render above the navbar's own z-[100000].
          className="w-64 rounded-[16px] border-0 px-0 py-[9px] z-[999999]"
          style={{
            backgroundColor: "var(--menu-bg)",
            border: "1px solid color-mix(in oklab, var(--neon) 12%, transparent)",
            boxShadow:
              "rgba(0, 0, 0, 0.7) 0px 8px 16px 0px, rgba(0, 0, 0, 0.9) 0px 24px 72px 0px, color-mix(in oklab, var(--neon) 4%, transparent) 0px 0px 0px 0.5px inset, color-mix(in oklab, var(--neon) 15%, transparent) 0px 1px 0px 0px inset",
          }}
        >
          {exploreNavItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <DropdownMenuItem
                key={item.href}
                asChild
                className="items-center gap-3 rounded-xl px-3 py-2.5 min-h-11"
              >
                <Link
                  href={item.href}
                  className="flex transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none"
                >
                  <span
                    className="flex size-8 shrink-0 items-center justify-center rounded-lg"
                    style={{
                      background:
                        "linear-gradient(135deg, color-mix(in oklab, var(--neon) 15%, transparent), var(--neon-glow-soft))",
                      border:
                        "1px solid color-mix(in oklab, var(--neon) 20%, transparent)",
                      boxShadow: "0 2px 8px var(--neon-glow-soft) inset",
                    }}
                  >
                    <Icon className="size-3.5 text-neon" aria-hidden />
                  </span>
                  <span className="flex flex-col">
                    <span
                      className={cn(
                        // 16px, measured off the reference. At the shadcn
                        // default of 14px each row loses 2px and the panel
                        // comes up 26px short overall.
                        "text-base font-medium",
                        isActive ? "text-neon" : "text-foreground"
                      )}
                    >
                      {item.label}
                    </span>
                    <span className="text-xs text-text-muted">
                      {item.description}
                    </span>
                  </span>
                </Link>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </nav>
  );
}
