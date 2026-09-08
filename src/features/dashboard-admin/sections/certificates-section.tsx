import { Award, CheckCircle2, XCircle } from "lucide-react";

import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { DashboardStatCard, DashboardStatGrid } from "@/components/dashboard/dashboard-stat-card";
import { getAdminCertificateQueue, getAdminQueuePrograms, type AdminOperationalQueueParams } from "@/server/services/dashboard.service";
import { CertificateApprovalCard, type CertificateApprovalItem } from "../components/certificate-approval-card";
import { DataNotConnectedNote } from "../components/data-not-connected-note";
import { OperationalQueueFilters, OperationalQueuePagination } from "../components/operational-queue-controls";

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
}

/** Certificate actions and terminal review history deliberately never share a list. */
export async function CertificatesSection(params: AdminOperationalQueueParams) {
  const [result, programs] = await Promise.all([getAdminCertificateQueue(params), getAdminQueuePrograms()]);
  const items: CertificateApprovalItem[] = result.items.map((item) => ({
    id: item.certificateRequestId,
    traineeName: item.traineeName,
    certificateCode: item.certificateCode,
    programLabel: item.programName,
    trainerName: item.trainerName ?? "Unassigned",
    completedDateLabel: formatDate(item.completedAt),
    status: item.status.toLowerCase() as CertificateApprovalItem["status"],
  }));
  const values = { view: params.view === "history" ? "history" : "queue", search: params.search ?? "", status: params.status ?? "ALL", program: params.program ?? "", from: params.from ?? "", to: params.to ?? "" };
  const statusOptions = values.view === "queue"
    ? [{ value: "ALL", label: "Pending only" }, { value: "PENDING", label: "Pending" }]
    : [{ value: "ALL", label: "All reviewed" }, { value: "APPROVED", label: "Approved" }, { value: "REJECTED", label: "Rejected" }];
  return (
    <div className="space-y-6">
      <DashboardPageHeader title="Certificate Approvals" />
      <DashboardStatGrid desktopColumns={3}>
        <DashboardStatCard icon={Award} value={result.summary.pending} label="Pending Review" tone="amber" />
        <DashboardStatCard icon={CheckCircle2} value={result.summary.approved} label="Approved" tone="green" />
        <DashboardStatCard icon={XCircle} value={result.summary.rejected} label="Rejected" tone="red" />
      </DashboardStatGrid>
      <OperationalQueueFilters section="certificates" prefix="c" values={values} statusOptions={statusOptions} programs={programs} />
      {items.length === 0 ? <DataNotConnectedNote detail={values.view === "queue" ? "No pending certificate requests match these filters." : "No reviewed certificate requests match these filters."} /> : <div className="space-y-3">{items.map((item) => <CertificateApprovalCard key={item.id} item={item} />)}</div>}
      {result.total > 0 ? <OperationalQueuePagination section="certificates" prefix="c" page={result.page} totalPages={result.totalPages} total={result.total} pageSize={result.pageSize} /> : null}
    </div>
  );
}
