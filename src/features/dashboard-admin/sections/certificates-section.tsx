import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { getAdminCertificateRequests } from "@/server/services/dashboard.service";
import {
  CertificateApprovalCard,
  type CertificateApprovalItem,
} from "../components/certificate-approval-card";
import { DataNotConnectedNote } from "../components/data-not-connected-note";

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
}

/**
 * "Certificate Approvals" (desktop-02.md #9, mobile-05.md #15).
 */
export async function CertificatesSection() {
  const requests = await getAdminCertificateRequests();
  const certificateRequests: CertificateApprovalItem[] = [
    ...requests.pending.map((item) => ({ item, status: "pending" as const })),
    ...requests.approved.map((item) => ({ item, status: "approved" as const })),
  ].map(({ item, status }) => ({
    id: item.id,
    traineeName: item.traineeName,
    certificateCode: item.certificateCode,
    programLabel: item.programName,
    trainerName: item.trainerName ?? "Unassigned",
    completedDateLabel: formatDate(item.completedAt),
    status,
  }));

  return (
    <div className="space-y-6">
      <DashboardPageHeader title="Certificate Approvals" />

      {certificateRequests.length === 0 ? (
        <DataNotConnectedNote detail="No certificate requests found." />
      ) : (
        <div className="space-y-3">
          {certificateRequests.map((item) => (
            <CertificateApprovalCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
