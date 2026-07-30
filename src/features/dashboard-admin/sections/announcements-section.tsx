import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { getAdminAnnouncements } from "@/server/services/dashboard.service";
import { AnnouncementCard, type AnnouncementItem } from "../components/announcement-card";
import { AnnouncementForm } from "../components/announcement-form";
import { DataNotConnectedNote } from "../components/data-not-connected-note";

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
}

/**
 * "Announcements" (desktop-02.md #10, mobile-05.md #16-17).
 */
export async function AnnouncementsSection() {
  const announcements: AnnouncementItem[] = (await getAdminAnnouncements()).map((item) => ({
    id: item.id,
    title: item.title,
    body: item.body,
    type: item.type,
    isPinned: item.isPinned,
    postedDateLabel: formatDate(item.createdAt),
  }));

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title="Announcements"
        description="Post public announcements shown on the landing page. Pin important notices to display them first."
      />

      <AnnouncementForm />

      {announcements.length === 0 ? (
        <DataNotConnectedNote detail="No posted announcements found." />
      ) : (
        <div className="space-y-3">
          {announcements.map((item) => (
            <AnnouncementCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
