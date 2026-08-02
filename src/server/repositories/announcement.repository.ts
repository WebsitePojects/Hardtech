import { db } from "@/server/db";
import type { AnnouncementType } from "@/../generated/prisma/enums";

/** Pure data access for Announcement. */
export const announcementRepository = {
  /** Pinned first, then newest first — desktop-02.md #10 ("Pin important notices to display them first"). */
  findAll() {
    return db.announcement.findMany({
      include: { postedBy: true },
      orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
    });
  },
  create(data: { title: string; body: string; type: AnnouncementType; pinned: boolean; authorId: string; idempotencyKey: string }) {
    return db.announcement.create({ data: { title: data.title, body: data.body, type: data.type, isPinned: data.pinned, postedByUserId: data.authorId, idempotencyKey: data.idempotencyKey } });
  },
  findByIdempotencyKey(idempotencyKey: string) { return db.announcement.findUnique({ where: { idempotencyKey } }); },
  deleteById(id: string) { return db.announcement.delete({ where: { id } }); },
};
