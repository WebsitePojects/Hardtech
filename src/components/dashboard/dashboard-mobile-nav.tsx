"use client";

import { useState } from "react";
import { Menu } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { UserRole } from "@/../generated/prisma/enums";
import { DashboardSidebarNav } from "./dashboard-sidebar-nav";
import { roleMeta } from "./role-meta";

export type DashboardMobileNavProps = {
  role: UserRole;
  userName?: string;
  subtitle?: string;
  badges?: Partial<Record<string, number>>;
  logoutAction: () => Promise<void>;
  className?: string;
};

/**
 * Mobile sticky header: `[hamburger][coloured dot][ROLE PORTAL label]`
 * (docs/screens/mobile-05.md screenshot #1 / #31, "Mobile layout rules").
 * The hamburger opens a left `Sheet` containing the exact same
 * `DashboardSidebarNav` the desktop rail renders — there is no bottom tab
 * bar and no FAB anywhere in this shell, confirmed across the whole
 * mobile-05.md slice.
 */
export function DashboardMobileNav({
  role,
  userName,
  subtitle,
  badges,
  logoutAction,
  className,
}: DashboardMobileNavProps) {
  const [open, setOpen] = useState(false);
  const meta = roleMeta[role];

  return (
    <div
      className={cn(
        "glass sticky top-0 z-40 flex min-h-14 shrink-0 items-center gap-3 px-3 py-2.5 sm:px-4 sm:py-3",
        className
      )}
    >
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Open dashboard menu"
          >
            <Menu className="size-5" aria-hidden />
          </Button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="w-[min(86vw,22rem)] gap-0 border-glass-border bg-surface-secondary p-0 sm:max-w-xs"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>{meta.portalLabel}</SheetTitle>
          </SheetHeader>
          <DashboardSidebarNav
            role={role}
            userName={userName}
            subtitle={subtitle}
            badges={badges}
            logoutAction={logoutAction}
            onNavigate={() => setOpen(false)}
          />
        </SheetContent>
      </Sheet>

      <span className={cn("size-2 rounded-full", meta.dotClassName)} aria-hidden />
      <span className="font-sub text-xs font-semibold tracking-widest text-muted-foreground uppercase">
        {meta.portalLabel}
      </span>
    </div>
  );
}
