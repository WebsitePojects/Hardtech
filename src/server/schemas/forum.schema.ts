import { z } from "zod";

/**
 * Boundary validation for forum.service.ts. The service is the read surface
 * the FORUM builder calls directly, so — same precedent as
 * marketing.schema.ts — it re-parses its own input rather than trusting the
 * caller's TypeScript types at runtime. See .claude/rules/00-non-negotiables.md
 * rule 3 ("fail closed") and rule 4 ("validate at the boundary").
 *
 * An unrecognized category/sort value is never allowed to silently widen a
 * query (e.g. "ignore the filter and return everything") — safeParse failure
 * is treated by the service as "no rows match", never as "no filter".
 */

export const forumCategorySchema = z.enum([
  "GENERAL_DISCUSSION",
  "QA_HELP",
  "RESOURCES_TIPS",
  "TROUBLESHOOTING",
  "CAREER_JOBS",
  "ANNOUNCEMENTS",
]);

export const forumSortSchema = z.enum(["recent", "trending"]);

/** Prisma cuid()-shaped ids — non-empty is the practical floor for a fail-closed check. */
export const idSchema = z.string().trim().min(1).max(200);

export const slugSchema = z
  .string()
  .trim()
  .min(1)
  .max(200)
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Not a valid slug");
