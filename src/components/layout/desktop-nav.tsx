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
              "relative rounded-full px-4 py-2 font-sub text-sm font-medium transition-colors",
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
        <DropdownMenuTrigger className="group flex items-center gap-1 rounded-full px-4 py-2 font-sub text-sm font-medium text-foreground/80 outline-none transition-colors hover:text-foreground data-open:text-foreground">
          Explore
          <ChevronDown
            className="size-4 transition-transform group-data-open:rotate-180"
            aria-hidden
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" className="w-80 border border-glass-border p-2">
          {exploreNavItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <DropdownMenuItem key={item.href} asChild>
                <Link href={item.href} className="flex items-start gap-3 rounded-lg p-2.5">
                  <span
                    className={cn(
                      "flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted",
                      isActive && "text-neon"
                    )}
                  >
                    <Icon className="size-4" aria-hidden />
                  </span>
                  <span className="flex flex-col gap-0.5">
                    <span
                      className={cn(
                        "text-sm font-semibold",
                        isActive ? "text-neon" : "text-foreground"
                      )}
                    >
                      {item.label}
                    </span>
                    <span className="text-xs text-muted-foreground">
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
