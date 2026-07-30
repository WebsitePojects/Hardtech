import { requireRole } from "@/server/auth/session";
import { parseAdminSection } from "@/features/dashboard-admin/section-ids";
import { OverviewSection } from "@/features/dashboard-admin/sections/overview-section";
import { EnrollmentsSection } from "@/features/dashboard-admin/sections/enrollments-section";
import { UserManagementSection } from "@/features/dashboard-admin/sections/user-management-section";
import { TrainerManagementSection } from "@/features/dashboard-admin/sections/trainer-management-section";
import { CertificatesSection } from "@/features/dashboard-admin/sections/certificates-section";
import { AnnouncementsSection } from "@/features/dashboard-admin/sections/announcements-section";
import { AnalyticsSection } from "@/features/dashboard-admin/sections/analytics-section";
import { PaymentMethodsSection } from "@/features/dashboard-admin/sections/payment-methods-section";
import { AuditLogSection } from "@/features/dashboard-admin/sections/audit-log-section";
import type { AdminSectionId } from "@/features/dashboard-admin/section-ids";

interface AdminDashboardPageProps {
  // Next 16: searchParams is a Promise (.claude/rules/30-nextjs-16.md #1).
  // No dynamic route params on this page, so PageProps<'/dashboard/admin'>
  // adds nothing over a hand-written shape — same call the FORUM builder
  // made for its own non-dynamic /forum page (src/app/(app)/forum/page.tsx).
  searchParams: Promise<{ section?: string; category?: string }>;
}

const SECTION_RENDERERS: Record<AdminSectionId, (category?: string) => React.ReactNode> = {
  overview: () => <OverviewSection />,
  enrollments: () => <EnrollmentsSection />,
  "user-management": () => <UserManagementSection />,
  "trainer-management": () => <TrainerManagementSection />,
  certificates: () => <CertificatesSection />,
  announcements: () => <AnnouncementsSection />,
  analytics: () => <AnalyticsSection />,
  "payment-methods": () => <PaymentMethodsSection />,
  "audit-log": (category) => <AuditLogSection categoryFilter={category} />,
};

/**
 * `/dashboard/admin` — content only. The `(dashboard)` layout
 * (src/app/(dashboard)/layout.tsx, owned by DASH-SHELL) already renders
 * the sidebar/mobile-nav shell and has already called `requireSession()`.
 *
 * `requireRole("ADMIN")` re-checks authorization here regardless (rule 5:
 * "server-side authorization on every route" — one gate is not enough).
 * The sidebar's role chip and nav links are display only; a TRAINER or
 * TRAINEE session hitting this URL directly is redirected to `/login` by
 * this call, never shown admin content.
 *
 * Section switching is `?section=<id>` on this single route
 * (dashboard-sidebar-nav.tsx). `parseAdminSection` fails closed to
 * "overview" for values outside the 9 known ids (rule 3).
 */
export default async function AdminDashboardPage(props: AdminDashboardPageProps) {
  await requireRole("ADMIN");

  const { section, category } = await props.searchParams;
  const activeSection = parseAdminSection(section);

  return <>{SECTION_RENDERERS[activeSection](category)}</>;
}
