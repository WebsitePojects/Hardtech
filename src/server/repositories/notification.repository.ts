import { db } from "@/server/db";

/**
 * Pure data access for Notification. mobile-03 help ("Reading Your
 * Notifications"): the system keeps the last 20 per user — that retention
 * rule is enforced wherever notifications are inserted (not built this
 * wave), this file just reads.
 */
export const notificationRepository = {
  findManyByUserId(userId: string, take: number) {
    return db.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take,
    });
  },

  countUnreadByUserId(userId: string) {
    return db.notification.count({ where: { userId, isRead: false } });
  },

  createMany(
    rows: {
      userId: string;
      title: string;
      body: string;
      linkUrl?: string | null;
      isRead?: boolean;
    }[],
  ) {
    return db.notification.createMany({ data: rows });
  },
};
