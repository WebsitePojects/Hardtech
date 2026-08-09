"use client";

import Link from "next/link";
import { Home } from "lucide-react";

import { cn } from "@/lib/utils";
import type { UserRole } from "@/../generated/prisma/enums";
import { dashboardNavItems } from "./dashboard-nav-items";
import { DashboardLogoutButton } from "./dashboard-logout-button";
import { getInitials } from "./get-initials";
import { roleMeta } from "./role-meta";
import { useDashboardNavigation } from "./dashboard-shell";

export type DashboardSidebarNavProps = {
  role: UserRole;
  /** AUTH's `Session` carries no name (rule 6 — no PII in the session
   * payload), so this is optional and falls back to
   * `roleMeta[role].fallbackDisplayName` when the caller has no real name
   * to pass. See role-meta.ts for why that fallback is verbatim for admin
   * ("Admin Console" is the design's own generic header, not a person's
   * name) but a plain placeholder for trainer/trainee. */
  userName?: string;
  /** Overrides `roleMeta[role].defaultSubtitle` — see role-meta.ts for why
   * only admin/trainee have a safe generic default. */
  subtitle?: string;
  /** Section id -> live count. NOT static: desktop-02.md's nav badges
   * ("Enrollments" 4, "Certificates" 1) are a single screenshot's snapshot
   * of seed data, not part of the design's structure, so they are never
   * hardcoded in dashboard-nav-items.ts — whichever wave-3 page owns real
   * counts passes them in here. */
  badges?: Partial<Record<string, number>>;
  /** AUTH's real `logout()` re-exported as a Server Action by
   * src/app/(dashboard)/actions.ts — see dashboard-logout-button.tsx. */
  logoutAction: () => Promise<void>;
  /** Called after a nav Link is clicked, e.g. to close the mobile Sheet. */
  onNavigate?: () => void;
  className?: string;
};

/**
 * Shared sidebar content for both the desktop persistent rail
 * (dashboard-sidebar.tsx) and the mobile hamburger Sheet
 * (dashboard-mobile-nav.tsx) — one component, two shells, so nav state and
 * markup can never drift between them.
 *
 * Section links are `{basePath}?section={id}` — the design's own dashboards
 * never change the address bar between sections (mobile-05.md route note),
 * so this builder puts section state in a query param on the single
 * per-role route rather than inventing separate URLs wave-3 didn't ask for.
 * Wave-3's dashboard pages read `searchParams.section` to pick content.
 */
export function DashboardSidebarNav({
  role,
  userName,
  subtitle,
  badges,
  logoutAction,
  onNavigate,
  className,
}: DashboardSidebarNavProps) {
  const { activeSection, setActiveSection } = useDashboardNavigation();

  const items = dashboardNavItems[role];
  const meta = roleMeta[role];
  const displayName =
    userName && !meta.alwaysUseFallbackName
      ? role === "TRAINER"
        ? `Mr. ${userName}`
        : userName
      : meta.fallbackDisplayName;
  const initials = meta.avatarInitials ?? getInitials(displayName);

  return (
    <div className={cn("flex h-full flex-col", className)}>
      <div className="flex items-start gap-3 border-b border-glass-border p-4">
        <span
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-full font-heading text-sm font-semibold",
            meta.avatarClassName
          )}
          aria-hidden
        >
          {initials}
        </span>
        <div className="min-w-0">
          <p className="truncate font-heading text-sm font-semibold text-foreground">
            {displayName}
          </p>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className={cn("size-1.5 rounded-full", meta.dotClassName)} aria-hidden />
            {subtitle ?? meta.defaultSubtitle}
          </p>
        </div>
        <button type="button" aria-label="Collapse sidebar" className="ml-auto flex size-7 shrink-0 items-center justify-center rounded-lg border border-glass-border text-muted-foreground hover:bg-glass-hover hover:text-foreground">
          K
        </button>
      </div>

      <p className="px-4 pt-4 pb-2 font-sub text-xs font-semibold tracking-widest text-muted-foreground uppercase">
        {meta.portalLabel}
      </p>

      <nav
        className="flex flex-1 flex-col gap-1 overflow-y-auto px-2 pb-2"
        aria-label={meta.portalLabel}
      >
        {items.map((item) => {
          const isActive = item.id === activeSection;
          const Icon = item.icon;
          const count = badges?.[item.id];

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setActiveSection(item.id);
                onNavigate?.();
              }}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                // text-left is load-bearing: a <button> carries a UA default of
                // text-align:center, which the flex-1 label span inherits. Without
                // it every row's label centres in its leftover space and the list
                // reads ragged, while "Back to Landing" below — an anchor, so
                // left-aligned by default — stays correct and hides the cause.
                "flex items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground/80 transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "hover:bg-glass-hover hover:text-foreground"
              )}
            >
              <Icon className="size-4 shrink-0" aria-hidden />
              <span className="flex-1 truncate">{item.label}</span>
              {typeof count === "number" && count > 0 ? (
                // Neutral, not green. The reference badges are a translucent
                // white chip with near-white text at 11px — measured at
                // rgba(255,255,255,0.1) on rgb(232,237,244). A green fill reads
                // as a call to action; these are just counts.
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-white/10 px-1.5 text-[11px] font-semibold text-text-primary">
                  {count}
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-1 border-t border-glass-border p-2">
        <Link
          href="/"
          onClick={onNavigate}
          // The reference gives both footer rows their own outlined container,
          // which separates them from the borderless section list above.
          className="flex items-center gap-3 rounded-lg border border-glass-border px-3 py-2 text-sm font-medium text-foreground/80 hover:bg-glass-hover hover:text-foreground"
        >
          <Home className="size-4" aria-hidden />
          Back to Landing
        </Link>
        <DashboardLogoutButton action={logoutAction} />
      </div>
    </div>
  );
}
