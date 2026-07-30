import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { AnnouncementForm } from "../components/announcement-form";
import { AnnouncementCard, type AnnouncementItem } from "../components/announcement-card";
import { DataNotConnectedNote } from "../components/data-not-connected-note";

// NOT SOURCED: dashboard.service has no announcement-list read. The create
// form above is fully real (see announcement-form.tsx); only the
// already-posted list below has nothing to display yet.
const ANNOUNCEMENTS: AnnouncementItem[] = [];

/**
 * "Announcements" (desktop-02.md #10, mobile-05.md #16-17).
 */
export function AnnouncementsSection() {
  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title="Announcements"
        description="Post public announcements shown on the landing page. Pin important notices to display them first."
      />

      <AnnouncementForm />

      {ANNOUNCEMENTS.length === 0 ? (
        <DataNotConnectedNote detail="The posted-announcements list has no service read yet." />
      ) : (
        <div className="space-y-3">
          {ANNOUNCEMENTS.map((item) => (
            <AnnouncementCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
