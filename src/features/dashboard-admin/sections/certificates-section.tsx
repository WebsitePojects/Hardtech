import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import {
  CertificateApprovalCard,
  type CertificateApprovalItem,
} from "../components/certificate-approval-card";
import { DataNotConnectedNote } from "../components/data-not-connected-note";

// NOT SOURCED: dashboard.service has no certificate-request list read
// (only certificateRequestRepository.countByStatus("PENDING") via
// getAdminOverviewStats). Typed and mapped for real below so
// CertificateApprovalCard's mutation guards are exercised by real code.
const CERTIFICATE_REQUESTS: CertificateApprovalItem[] = [];

/**
 * "Certificate Approvals" (desktop-02.md #9, mobile-05.md #15).
 */
export function CertificatesSection() {
  return (
    <div className="space-y-6">
      <DashboardPageHeader title="Certificate Approvals" />

      {CERTIFICATE_REQUESTS.length === 0 ? (
        <DataNotConnectedNote detail="The certificate-request queue has no service read yet." />
      ) : (
        <div className="space-y-3">
          {CERTIFICATE_REQUESTS.map((item) => (
            <CertificateApprovalCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
