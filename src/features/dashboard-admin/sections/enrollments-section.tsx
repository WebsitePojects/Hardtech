import { CheckCircle2, Image as ImageIcon, UserPlus, Wallet } from "lucide-react";

import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import {
  DashboardStatCard,
  DashboardStatGrid,
} from "@/components/dashboard/dashboard-stat-card";
import { getAdminPendingEnrollmentQueue } from "@/server/services/dashboard.service";
import {
  EnrollmentReviewCard,
  type EnrollmentReviewItem,
} from "../components/enrollment-review-card";
import { DataNotConnectedNote } from "../components/data-not-connected-note";

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
}

function formatPeso(amount: number): string {
  return `₱${amount.toLocaleString("en-PH")}`;
}

/**
 * "Enrollments & Payment Verification" (desktop-02.md #3, mobile-05.md
 * #1/#3).
 */
export async function EnrollmentsSection() {
  const pendingEnrollments: EnrollmentReviewItem[] = (await getAdminPendingEnrollmentQueue()).map((item) => ({
    id: item.paymentId,
    traineeName: item.trainee.name,
    enrollmentRef: item.referenceCode,
    programName: item.programs.join(", "),
    paymentMethod: item.paymentMethod,
    amountLabel: formatPeso(item.amount),
    dateLabel: formatDate(item.submittedAt),
    receiptUrl: item.proofImageUrl,
  }));

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title="Enrollments & Payment Verification"
        description="Review each uploaded receipt and approve to officially enroll the trainee. Approval also verifies their payment."
      />

      <DashboardStatGrid>
        <DashboardStatCard icon={Wallet} value="-" label="Total Verified" tone="green" />
        <DashboardStatCard icon={UserPlus} value={pendingEnrollments.length} label="Pending Review" tone="amber" />
        <DashboardStatCard icon={ImageIcon} value="-" label="Missing Proof" tone="red" />
        <DashboardStatCard icon={CheckCircle2} value="-" label="Approved" tone="green" />
      </DashboardStatGrid>

      {pendingEnrollments.length === 0 ? (
        <DataNotConnectedNote detail="No pending enrollments found." />
      ) : (
        <div className="space-y-3">
          {pendingEnrollments.map((item) => (
            <EnrollmentReviewCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
