import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { getAdminAuditLog } from "@/server/services/dashboard.service";
import { AuditLogCategoryFilter } from "../components/audit-log-category-filter";
import { DataNotConnectedNote } from "../components/data-not-connected-note";

const CATEGORY_LABELS: Record<string, string> = {
  USER: "user",
  ENROLLMENT: "enrollment",
  PAYMENT: "payment",
  CERTIFICATE: "certificate",
  CALENDAR: "calendar",
  MODULE: "module",
  SYSTEM: "system",
  FORUM: "forum",
  COMMUNITY: "community",
};

function toServiceCategory(value: string | undefined): string | undefined {
  if (value === undefined || value === "all") return undefined;
  return value.toUpperCase();
}

function formatTimestamp(date: Date): string {
  return date.toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

/**
 * "Audit Log" (desktop-02.md #13, mobile-05.md #25-28). Read-only.
 */
export async function AuditLogSection({ categoryFilter }: { categoryFilter?: string }) {
  const entries = await getAdminAuditLog(toServiceCategory(categoryFilter), 50);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <DashboardPageHeader
          title="Audit Log"
          description="All changes captured chronologically"
        />
        <AuditLogCategoryFilter value={categoryFilter} />
      </div>

      {entries.length === 0 ? (
        <DataNotConnectedNote detail="No audit log entries found for this filter." />
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <Card key={entry.id} className="flex-row flex-wrap items-start justify-between gap-3 p-4">
              <div className="min-w-0 space-y-1">
                <Badge variant="outline">{CATEGORY_LABELS[entry.category] ?? "unknown"}</Badge>
                <p className="text-sm font-semibold text-foreground">{entry.action}</p>
                {entry.description ? (
                  <p className="text-sm text-muted-foreground">{entry.description}</p>
                ) : null}
                {entry.referenceId ? (
                  <p className="text-xs text-muted-foreground">{entry.referenceId}</p>
                ) : null}
              </div>
              <p className="text-sm text-muted-foreground">
                {entry.actorName ?? "System"} &middot; {formatTimestamp(entry.createdAt)}
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
