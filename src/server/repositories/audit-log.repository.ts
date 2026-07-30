import { db } from "@/server/db";
import type { AuditCategory } from "@/../generated/prisma/client";

/** Pure data access for AuditLog. */
export const auditLogRepository = {
  /**
   * Newest first, optionally scoped to one category — desktop-02.md #13.
   * `category === undefined` is an explicit "no filter" (the dropdown's
   * "all" option), decided by the service layer's fail-closed parse, never
   * a fallback for an unrecognized value.
   */
  findMany(category: AuditCategory | undefined, limit: number) {
    return db.auditLog.findMany({
      where: category ? { category } : undefined,
      include: { actor: true },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  },
};
