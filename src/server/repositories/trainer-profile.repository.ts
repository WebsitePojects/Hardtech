import { db } from "@/server/db";
import type { Prisma, TrainerStatus } from "@/../generated/prisma/client";

/**
 * Pure data access for TrainerProfile. Which statuses are "eligible" to show
 * publicly is a business decision — the caller (service layer) supplies the
 * status it wants, this file just runs the read.
 */
export const trainerProfileRepository = {
  findManyByStatus(status: TrainerStatus) {
    return db.trainerProfile.findMany({
      where: { status },
      include: { user: true },
      orderBy: { createdAt: "asc" },
    });
  },

  updatePrimaryProgram(tx: Prisma.TransactionClient, userId: string, programId: string) {
    return tx.trainerProfile.updateMany({ where: { userId, OR: [{ primaryProgramId: { not: programId } }, { primaryProgramId: null }] }, data: { primaryProgramId: programId } });
  },
};
