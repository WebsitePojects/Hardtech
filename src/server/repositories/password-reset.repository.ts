import { db } from "@/server/db";

export const passwordResetRepository = {
  create(data: { userId: string; tokenHash: string; expiresAt: Date }) { return db.passwordResetToken.create({ data }); },
  consume(tokenHash: string, now: Date) {
    return db.passwordResetToken.updateMany({ where: { tokenHash, usedAt: null, expiresAt: { gt: now } }, data: { usedAt: now } });
  },
};
