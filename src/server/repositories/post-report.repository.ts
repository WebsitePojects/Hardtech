import { db } from "@/server/db";
import type { Prisma, ReportStatus } from "@/../generated/prisma/client";

/** Pure data access for PostReport. Moderation-queue reads for a future wave's admin surface. */
export const postReportRepository = {
  createIfAbsent(
    data: { postId: string; reporterId: string; reason: import("@/../generated/prisma/client").ReportReason; note?: string },
    client: Prisma.TransactionClient = db,
  ) {
    return client.$queryRaw<{ id: string }[]>`
      INSERT INTO "PostReport" ("id", "postId", "reporterId", "reason", "note", "status", "createdAt")
      VALUES (gen_random_uuid()::text, ${data.postId}, ${data.reporterId}, ${data.reason}::"ReportReason", ${data.note ?? null}, 'PENDING'::"ReportStatus", NOW())
      ON CONFLICT ("postId", "reporterId") DO NOTHING
      RETURNING "id"
    `;
  },
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

  create(data: Prisma.PostReportUncheckedCreateInput, client: Prisma.TransactionClient = db) {
    return client.postReport.create({ data });
  },

  findByPostAndReporter(postId: string, reporterId: string, client: Prisma.TransactionClient = db) {
    return client.postReport.findUnique({ where: { postId_reporterId: { postId, reporterId } } });
  },
};
