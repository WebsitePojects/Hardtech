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

  /**
   * Internal/admin read. Callers must make an explicit authorization decision
   * before exposing these records because this includes drafts and archives.
   */
  findAll() {
    return db.program.findMany({
      include: withCurriculumTopics,
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }, { id: "asc" }],
    });
  },

  /** The only catalog query allowed for public marketing routes. */
  findPublishedCatalog() {
    return db.program.findMany({
      where: { catalogStatus: "PUBLISHED" },
      include: withCurriculumTopics,
      orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    });
  },

  /**
   * Minimal, bounded projection for crawler-facing metadata. Keeping this
   * separate from the full catalog prevents a sitemap request from loading
   * curriculum or other display data it never renders.
   */
  findPublishedSitemapRows(take: number) {
    return db.program.findMany({
      where: { catalogStatus: "PUBLISHED" },
      select: { slug: true, updatedAt: true },
      orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
      take,
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
      orderBy: { createdAt: "asc" },
    });
  },

  /** Public lookup by the legacy route identifier, constrained to published rows. */
  findPublishedByShortName(shortName: string) {
    return db.program.findFirst({
      where: { shortName, catalogStatus: "PUBLISHED" },
      include: withCurriculumTopics,
      orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    });
  },

  /** Public route lookup by the immutable catalog identifier. */
  findPublishedBySlug(slug: string) {
    return db.program.findFirst({
      where: { slug, catalogStatus: "PUBLISHED" },
      include: withCurriculumTopics,
    });
  },
};
