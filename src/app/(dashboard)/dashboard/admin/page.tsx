import { requireRole } from "@/server/auth/session";
import { DashboardSection } from "@/components/dashboard/dashboard-shell";
import { OverviewSection } from "@/features/dashboard-admin/sections/overview-section";
import { EnrollmentsSection } from "@/features/dashboard-admin/sections/enrollments-section";
import { UserManagementSection } from "@/features/dashboard-admin/sections/user-management-section";
import { TrainerManagementSection } from "@/features/dashboard-admin/sections/trainer-management-section";
import { CertificatesSection } from "@/features/dashboard-admin/sections/certificates-section";
import { AnnouncementsSection } from "@/features/dashboard-admin/sections/announcements-section";
import { AnalyticsSection } from "@/features/dashboard-admin/sections/analytics-section";
import { PaymentMethodsSection } from "@/features/dashboard-admin/sections/payment-methods-section";
import { AuditLogSection } from "@/features/dashboard-admin/sections/audit-log-section";

interface AdminDashboardPageProps {
  // Next 16: searchParams is a Promise (.claude/rules/30-nextjs-16.md #1).
  // No dynamic route params on this page, so PageProps<'/dashboard/admin'>
  // adds nothing over a hand-written shape — same call the FORUM builder
  // made for its own non-dynamic /forum page (src/app/(app)/forum/page.tsx).
  searchParams: Promise<{ section?: string; category?: string }>;
}

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
 * All sections are server-rendered once and their visibility is controlled by
 * the client dashboard shell. This keeps data access on the server while the
 * address bar remains stable as the user moves through the portal.
 */
export default async function AdminDashboardPage(props: AdminDashboardPageProps) {
  await requireRole("ADMIN");

  const { category } = await props.searchParams;

  return (
    <>
      <DashboardSection section="overview"><OverviewSection /></DashboardSection>
      <DashboardSection section="enrollments"><EnrollmentsSection /></DashboardSection>
      <DashboardSection section="user-management"><UserManagementSection /></DashboardSection>
      <DashboardSection section="trainer-management"><TrainerManagementSection /></DashboardSection>
      <DashboardSection section="certificates"><CertificatesSection /></DashboardSection>
      <DashboardSection section="announcements"><AnnouncementsSection /></DashboardSection>
      <DashboardSection section="analytics"><AnalyticsSection /></DashboardSection>
      <DashboardSection section="payment-methods"><PaymentMethodsSection /></DashboardSection>
      <DashboardSection section="audit-log"><AuditLogSection categoryFilter={category} /></DashboardSection>
    </>
  );
}
