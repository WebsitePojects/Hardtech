import type { LucideIcon } from "lucide-react";
import {
  Award,
  BarChart3,
  Calendar,
  ClipboardList,
  CreditCard,
  FileText,
  GraduationCap,
  History,
  LayoutGrid,
  Megaphone,
  ShieldCheck,
  UserCog,
  UserPlus,
  Users,
} from "lucide-react";

import type { UserRole } from "@/../generated/prisma/enums";

/**
 * Per-role sidebar section lists, transcribed verbatim from
 * docs/screens/desktop-02.md (sidebar nav lists for all three dashboards)
 * and cross-checked against docs/screens/mobile-05.md's hamburger Sheet nav
 * (admin, screenshot #2). Do not rename or "clean up" a label even where it
 * looks inconsistent with a page's own heading — the admin "Analytics" nav
 * item vs. its "Reports & Analytics" H1 is a confirmed, intentional mismatch
 * (mobile-05.md screenshot #20 / open question #5) and both are reproduced
 * as-is.
 *
 * `id` is an internal section key, not part of the source design. Wave-3
 * dashboard pages read it (via the `?section=` query param this builder's
 * nav writes — see dashboard-sidebar-nav.tsx) to decide which section's
 * content to render for the single per-role URL. mobile-05.md confirms all
 * admin sections are "internal view state driven by the hamburger Sheet
 * nav, not separate URLs — the address bar never changes."
 *
 * Icon choices are this builder's best match to each screenshot's described
 * icon shape (e.g. "people/gear icon" -> UserCog). Exact lucide icon names
 * were never specified in the design source, so — unlike the labels —
 * treat these as approximate, not verbatim.
 */
export type DashboardNavItem = {
  id: string;
  label: string;
  icon: LucideIcon;
};

export const dashboardNavItems: Record<UserRole, DashboardNavItem[]> = {
  ADMIN: [
    { id: "overview", label: "Overview", icon: LayoutGrid },
    { id: "enrollments", label: "Enrollments", icon: UserPlus },
    { id: "user-management", label: "User Management", icon: Users },
    { id: "trainer-management", label: "Trainer Management", icon: UserCog },
    { id: "certificates", label: "Certificates", icon: Award },
    { id: "announcements", label: "Announcements", icon: Megaphone },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "payment-methods", label: "Payment Methods", icon: CreditCard },
    { id: "audit-log", label: "Audit Log", icon: History },
  ],
  TRAINER: [
    { id: "overview", label: "Overview", icon: LayoutGrid },
    { id: "calendar", label: "Calendar", icon: Calendar },
    { id: "my-trainees", label: "My Trainees", icon: Users },
    { id: "assignments", label: "Assignments", icon: ClipboardList },
    { id: "modules", label: "Modules", icon: FileText },
  ],
  TRAINEE: [
    { id: "my-dashboard", label: "My Dashboard", icon: LayoutGrid },
    { id: "session-schedule", label: "Session Schedule", icon: Calendar },
    { id: "assignments", label: "Assignments", icon: ClipboardList },
    { id: "enrolled-programs", label: "Enrolled Programs", icon: GraduationCap },
    { id: "materials", label: "Materials", icon: FileText },
    { id: "credentials", label: "Credentials", icon: ShieldCheck },
  ],
};

/** The one real route per role — sections are query state on top of this. */
export const dashboardBasePath: Record<UserRole, string> = {
  ADMIN: "/dashboard/admin",
  TRAINER: "/dashboard/trainer",
  TRAINEE: "/dashboard/trainee",
};
