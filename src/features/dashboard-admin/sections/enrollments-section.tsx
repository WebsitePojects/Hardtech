import { CheckCircle2, Image as ImageIcon, UserPlus, Wallet } from "lucide-react";

import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { DashboardStatCard, DashboardStatGrid } from "@/components/dashboard/dashboard-stat-card";
import { getAdminPaymentQueue, getAdminQueuePrograms, getPaymentProofUrl, type AdminOperationalQueueParams } from "@/server/services/dashboard.service";
import { EnrollmentReviewCard, type EnrollmentReviewItem } from "../components/enrollment-review-card";
import { DataNotConnectedNote } from "../components/data-not-connected-note";
import { OperationalQueueFilters, OperationalQueuePagination } from "../components/operational-queue-controls";

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
}

function formatPeso(amount: number): string {
  return `₱${amount.toLocaleString("en-PH")}`;
}

/** Payment actions and terminal review history are separate, bounded reads. */
export async function EnrollmentsSection(params: AdminOperationalQueueParams) {
  const [result, programs] = await Promise.all([getAdminPaymentQueue(params), getAdminQueuePrograms()]);
  // Receipt URLs remain a separate, one-row read. The queue holds at most 12
  // cards, so this cannot turn an operational backlog into an unbounded page.
  const proofUrls = params.view === "history"
    ? result.items.map(() => null)
    : await Promise.all(result.items.map((item) => getPaymentProofUrl(item.paymentId)));
  const items: EnrollmentReviewItem[] = result.items.map((item, index) => ({
    id: item.paymentId,
    traineeName: item.traineeName,
    enrollmentRef: item.referenceCode,
    programName: item.programNames.join(", "),
    paymentMethod: item.paymentMethod,
    amountLabel: formatPeso(item.amount),
    dateLabel: formatDate(item.reviewedAt ?? item.submittedAt),
    receiptUrl: proofUrls[index],
    status: item.status,
  }));
  const values = { view: params.view === "history" ? "history" : "queue", search: params.search ?? "", status: params.status ?? "ALL", program: params.program ?? "", from: params.from ?? "", to: params.to ?? "" };
  const statusOptions = values.view === "queue"
    ? [{ value: "ALL", label: "Pending only" }, { value: "SUBMITTED", label: "Submitted" }]
    : [{ value: "ALL", label: "All reviewed" }, { value: "VERIFIED", label: "Verified" }, { value: "REJECTED", label: "Rejected" }];

  return (
    <div className="space-y-6">
      <DashboardPageHeader title="Enrollments & Payment Verification" description="Review each uploaded receipt and approve to officially enroll the trainee." />
      <DashboardStatGrid>
        <DashboardStatCard icon={Wallet} value={result.summary.verified} label="Total Verified" tone="green" />
        <DashboardStatCard icon={UserPlus} value={result.summary.pending} label="Pending Review" tone="amber" />
        <DashboardStatCard icon={ImageIcon} value={result.summary.missingProof} label="Missing Proof" tone="red" />
        <DashboardStatCard icon={CheckCircle2} value={result.summary.rejected} label="Rejected" tone="red" />
      </DashboardStatGrid>
      <OperationalQueueFilters section="enrollments" prefix="p" values={values} statusOptions={statusOptions} programs={programs} />
      {items.length === 0 ? <DataNotConnectedNote detail={values.view === "queue" ? "No pending payments match these filters." : "No reviewed payments match these filters."} /> : <div className="space-y-3">{items.map((item) => <EnrollmentReviewCard key={item.id} item={item} />)}</div>}
      {result.total > 0 ? <OperationalQueuePagination section="enrollments" prefix="p" page={result.page} totalPages={result.totalPages} total={result.total} pageSize={result.pageSize} /> : null}
    </div>
  );
}
