import type { UserRole } from "@/../generated/prisma/enums";
import { cn } from "@/lib/utils";
import { DashboardSidebarNav } from "./dashboard-sidebar-nav";

export type DashboardSidebarProps = {
  role: UserRole;
  userName?: string;
  subtitle?: string;
  badges?: Partial<Record<string, number>>;
  logoutAction: () => Promise<void>;
  className?: string;
};

/**
 * Persistent left rail for `lg`+ viewports (docs/screens/desktop-02.md: a
 * fixed left Sidebar shared across every page of a given role's
 * dashboard). Hidden below `lg` — DashboardMobileNav takes over there via a
 * hamburger-triggered Sheet, never a second copy of this component.
 */
export function DashboardSidebar({
  role,
  userName,
  subtitle,
  badges,
  logoutAction,
  className,
}: DashboardSidebarProps) {
  return (
    <aside
      className={cn(
        "sticky top-0 z-30 h-screen w-72 shrink-0 border-r border-glass-border bg-surface-secondary",
        className
      )}
    >
      <DashboardSidebarNav
        role={role}
        userName={userName}
        subtitle={subtitle}
        badges={badges}
        logoutAction={logoutAction}
      />
    </aside>
  );
}
