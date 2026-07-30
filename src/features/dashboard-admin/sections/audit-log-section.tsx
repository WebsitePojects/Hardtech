import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataNotConnectedNote } from "../components/data-not-connected-note";

/** desktop-02.md #13 + mobile-05.md #27-28: "all" plus the 7 confirmed
 * audit categories visible in the open dropdown before it's cut off by the
 * viewport. schema.prisma's AuditCategory enum additionally declares FORUM
 * and COMMUNITY, but neither appears in the sourced screenshots' dropdown,
 * so they are not added here — see this builder's return report. */
const AUDIT_CATEGORY_OPTIONS = [
  "all",
  "user",
  "enrollment",
  "payment",
  "certificate",
  "calendar",
  "module",
  "system",
];

/**
 * "Audit Log" (desktop-02.md #13, mobile-05.md #25-28). Read-only — no
 * mutating controls on this page.
 */
export function AuditLogSection() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <DashboardPageHeader
          title="Audit Log"
          description="All changes captured chronologically"
        />
        <Select defaultValue="all">
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {AUDIT_CATEGORY_OPTIONS.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* NOT SOURCED: dashboard.service has no audit-log entry read. */}
      <DataNotConnectedNote detail="Audit log entries have no service read yet." />
    </div>
  );
}
