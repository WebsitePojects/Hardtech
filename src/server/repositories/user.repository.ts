import { db } from "@/server/db";
import type { Prisma, UserRole, UserStatus } from "@/../generated/prisma/client";

/** Pure data access for User. No role/eligibility rules — see 10-architecture.md. */
export const userRepository = {
  findById(id: string) {
    return db.user.findUnique({ where: { id } });
  },

  findByEmail(email: string) {
    return db.user.findUnique({ where: { email } });
  },

  findManyByIds(ids: string[]) {
    if (ids.length === 0) return Promise.resolve([]);
    return db.user.findMany({ where: { id: { in: ids } } });
  },

  countAll() {
    return db.user.count();
  },

  countByRole(role: UserRole) {
    return db.user.count({ where: { role } });
  },

  /**
   * Every user plus enough context to derive the admin User Management
   * table's PROGRAM column (desktop-02.md #4) without a per-row query: a
   * trainee's most recent enrollment (with its program) and a trainer's
   * profile (with their primary program). One query — both relations are
   * `include`d.
   */
  findManyWithProgramContext() {
    return db.user.findMany({
      include: {
        enrollmentsAsTrainee: {
          take: 1,
          orderBy: { createdAt: "desc" },
          include: { program: true },
        },
        trainerProfile: { include: { primaryProgram: true } },
      },
      orderBy: { createdAt: "asc" },
    });
  },

  /**
   * Every trainer plus their batches and each batch's enrollments (trainee +
   * program) — feeds the admin Trainer Management roster
   * (desktop-02.md #8: "ASSIGNED TRAINEES" per trainer card). One query, no
   * per-trainer follow-up read.
   */
  findManyTrainersWithRoster() {
    return db.user.findMany({
      where: { role: "TRAINER" },
      include: {
        trainerProfile: { include: { primaryProgram: true } },
        batchesAsTrainer: {
          include: {
            enrollments: { include: { trainee: true, program: true } },
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });
  },

  updateRole(tx: Prisma.TransactionClient, id: string, currentRole: UserRole, role: UserRole) {
    return tx.user.updateMany({ where: { id, role: currentRole }, data: { role } });
  },

  updateStatus(tx: Prisma.TransactionClient, id: string, currentStatus: UserStatus, status: UserStatus) {
    return tx.user.updateMany({ where: { id, status: currentStatus }, data: { status } });
  },

  suspend(tx: Prisma.TransactionClient, id: string) {
    return tx.user.updateMany({ where: { id, status: { not: "SUSPENDED" } }, data: { status: "SUSPENDED" } });
  },

  updateRoleIfNot(tx: Prisma.TransactionClient, id: string, role: UserRole) {
    return tx.user.updateMany({ where: { id, role: { not: role } }, data: { role } });
  },

  updateStatusIfNot(tx: Prisma.TransactionClient, id: string, status: UserStatus) {
    return tx.user.updateMany({ where: { id, status: { not: status } }, data: { status } });
  },
};
