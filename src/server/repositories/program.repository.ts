import { db } from "@/server/db";
import type { Prisma } from "@/../generated/prisma/client";

/**
 * Pure data access for the Program catalog. No eligibility/business rules —
 * see .claude/rules/10-architecture.md. The service layer decides which
 * queries to run and why; this file only knows how to run them.
 */

const withCurriculumTopics = {
  curriculumTopics: { orderBy: { sortOrder: "asc" } },
} satisfies Prisma.ProgramInclude;

export const programRepository = {
  /** Minimal option list for server-rendered admin queue filters. */
  findAllQueueOptions() {
    return db.program.findMany({
      select: { id: true, shortName: true },
      orderBy: { createdAt: "asc" },
    });
  },

  /** All programs, catalog order (insertion order — Program has no sortOrder column). */
  findAll() {
    return db.program.findMany({
      include: withCurriculumTopics,
      orderBy: { createdAt: "asc" },
    });
  },

  /**
   * `shortName` is not a unique column in the schema (only `name` is), so
   * this is a `findFirst`, not a `findUnique`.
   */
  findByShortName(shortName: string) {
    return db.program.findFirst({
      where: { shortName },
      include: withCurriculumTopics,
    });
  },
};
