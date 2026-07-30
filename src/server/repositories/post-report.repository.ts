import { db } from "@/server/db";
import type { ReportStatus } from "@/../generated/prisma/client";

/** Pure data access for PostReport. Moderation-queue reads for a future wave's admin surface. */
export const postReportRepository = {
  findManyByStatus(status: ReportStatus) {
    return db.postReport.findMany({
      where: { status },
      include: { reporter: true, post: true },
      orderBy: { createdAt: "desc" },
    });
  },

  countByStatus(status: ReportStatus) {
    return db.postReport.count({ where: { status } });
  },
};
