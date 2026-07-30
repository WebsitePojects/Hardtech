import { CheckCircle2, Image as ImageIcon, UserPlus, Wallet } from "lucide-react";

import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import {
  DashboardStatCard,
  DashboardStatGrid,
} from "@/components/dashboard/dashboard-stat-card";
import {
  EnrollmentReviewCard,
  type EnrollmentReviewItem,
} from "../components/enrollment-review-card";
import { DataNotConnectedNote } from "../components/data-not-connected-note";

// NOT SOURCED: dashboard.service exposes no read for the pending
// enrollment queue or its stat breakdown (Total Verified / Pending Review
// / Missing Proof / Approved) — see that module's docstring. The list is
// typed and mapped for real below so EnrollmentReviewCard's mutation
// guards are exercised by real code, not dead code; it is simply fed no
// rows until that read exists.
const PENDING_ENROLLMENTS: EnrollmentReviewItem[] = [];

/**
 * "Enrollments & Payment Verification" (desktop-02.md #3, mobile-05.md
 * #1/#3).
 */
export function EnrollmentsSection() {
  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title="Enrollments & Payment Verification"
        description="Review each uploaded receipt and approve to officially enroll the trainee. Approval also verifies their payment."
      />

      <DashboardStatGrid>
        <DashboardStatCard icon={Wallet} value="—" label="Total Verified" tone="green" />
        <DashboardStatCard icon={UserPlus} value="—" label="Pending Review" tone="amber" />
        <DashboardStatCard icon={ImageIcon} value="—" label="Missing Proof" tone="red" />
        <DashboardStatCard icon={CheckCircle2} value="—" label="Approved" tone="green" />
      </DashboardStatGrid>

      {PENDING_ENROLLMENTS.length === 0 ? (
        <DataNotConnectedNote detail="The pending-enrollment queue has no service read yet." />
      ) : (
        <div className="space-y-3">
          {PENDING_ENROLLMENTS.map((item) => (
            <EnrollmentReviewCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
