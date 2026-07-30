import { db } from "@/server/db";

/** Pure data access for Announcement. */
export const announcementRepository = {
  /** Pinned first, then newest first — desktop-02.md #10 ("Pin important notices to display them first"). */
  findAll() {
    return db.announcement.findMany({
      include: { postedBy: true },
      orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
    });
  },
};
