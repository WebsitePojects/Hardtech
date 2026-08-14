import { db } from "@/server/db";
import type { Prisma, UserRole, UserStatus } from "@/../generated/prisma/client";

/**
 * Untrusted-by-construction filter shape for the paginated User Management
 * list. Building a `where` clause from a role/search pair is query
 * construction, not a business rule (no eligibility, approval, or pricing
 * `if` lives here) — see 10-architecture.md's "a repository never contains
 * business rules" for the line this stays on the right side of. Validating
 * the *raw* request input is the service's job (dashboard.service.ts); by
 * the time a `UserListFilter` reaches here, `role` is already a real
 * `UserRole` or absent, and `search` is already trimmed.
 */
export type UserListFilter = {
  search?: string;
  role?: UserRole;
};

function userListWhere(filter: UserListFilter): Prisma.UserWhereInput {
  const clauses: Prisma.UserWhereInput[] = [];
  if (filter.role) clauses.push({ role: filter.role });
  if (filter.search) {
    const term = filter.search;
    clauses.push({
      OR: [
        { firstName: { contains: term, mode: "insensitive" } },
        { lastName: { contains: term, mode: "insensitive" } },
        { email: { contains: term, mode: "insensitive" } },
      ],
    });
  }
  return clauses.length > 0 ? { AND: clauses } : {};
}

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
   *
   * Bounded with `skip`/`take` (offset pagination, not a cursor) plus an
   * optional filter — see `countUsersWithFilter` for why offset was chosen
   * over a cursor. Previously ran with no `take` at all and shipped the
   * entire `User` table to the browser on every admin dashboard load; see
   * the DEFECT-USER-LIST brief this change ships under.
   */
  findManyWithProgramContext(params: { skip: number; take: number } & UserListFilter) {
    return db.user.findMany({
      where: userListWhere(params),
      include: {
        enrollmentsAsTrainee: {
          take: 1,
          orderBy: { createdAt: "desc" },
          include: { program: true },
        },
        trainerProfile: { include: { primaryProgram: true } },
      },
      orderBy: { createdAt: "asc" },
      skip: params.skip,
      take: params.take,
    });
  },

  /**
   * Total rows matching the same filter `findManyWithProgramContext` above
   * will apply — the pagination UI needs this to compute `totalPages` and
   * to disable Prev/Next at the ends. Kept separate from the unfiltered
   * `countAll()` below, which backs the Admin Overview "Total users" stat
   * and must stay exactly that: every user, no filter.
   */
  countUsersWithFilter(filter: UserListFilter) {
    return db.user.count({ where: userListWhere(filter) });
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
