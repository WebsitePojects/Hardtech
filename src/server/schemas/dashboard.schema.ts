import { z } from "zod";

/**
 * Boundary validation for dashboard.service.ts. Same precedent as
 * marketing.schema.ts / forum.schema.ts — the service re-parses its own
 * input rather than trusting the caller's TypeScript types at runtime.
 */
export const userIdSchema = z.string().trim().min(1).max(200);

export const notificationLimitSchema = z
  .number()
  .int()
  .min(1)
  .max(20) // mobile-03 help: "The system keeps your last 20 notifications."
  .default(20);

/**
 * The three platform roles, re-validated at the service boundary the same
 * way every other input here is — a caller passing an untyped/untrusted
 * value (e.g. from a session payload) must never silently pass through as
 * "any role". See .claude/rules/00-non-negotiables.md rule 3 ("fail closed").
 */
export const viewerRoleSchema = z.enum(["TRAINEE", "TRAINER", "ADMIN"]);

/**
 * The 9 confirmed Audit Log categories (desktop-02.md #13 dropdown; the
 * "all" option in that dropdown is UI-only and represented here as
 * "no filter", never as a stored/accepted enum value). An unrecognized
 * category string must reject, not silently widen to "all rows".
 */
export const auditCategorySchema = z.enum([
  "USER",
  "ENROLLMENT",
  "PAYMENT",
  "CERTIFICATE",
  "CALENDAR",
  "MODULE",
  "SYSTEM",
  "FORUM",
  "COMMUNITY",
]);

export const auditLogLimitSchema = z.number().int().min(1).max(200).default(50);

/** Bound on how far back a monthly analytics series can be requested. */
export const analyticsMonthsBackSchema = z.number().int().min(1).max(24).default(6);

/**
 * Shared, deliberately small request shape for the two admin operational
 * queues. URL values are always untrusted strings: callers use this schema
 * before a value reaches a repository `where`, `skip`, or `take` clause.
 *
 * Date-only filters are parsed as UTC midnights. Invalid dates and inverted
 * ranges fail closed in the service to an empty result, rather than silently
 * widening an administrator's queue.
 */
export const adminQueuePageSchema = z.coerce.number().int().min(1).catch(1);
export const adminQueueSearchSchema = z.string().trim().max(120).catch("");
export const adminQueueProgramIdSchema = z.string().trim().min(1).max(200);
export const paymentQueueStatusSchema = z.enum(["ALL", "SUBMITTED", "VERIFIED", "REJECTED"]);
export const certificateQueueStatusSchema = z.enum(["ALL", "PENDING", "APPROVED", "REJECTED"]);
export const adminQueueDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .transform((value, ctx) => {
    const date = new Date(`${value}T00:00:00.000Z`);
    if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
      ctx.addIssue({ code: "custom", message: "Invalid calendar date." });
      return z.NEVER;
    }
    return date;
  });

/** Clamp only after the filtered total is known, preventing a forged/stale
 * page number from becoming an out-of-range database offset. */
export function adminQueuePagination(total: number, requestedPage: number, pageSize: number) {
  const totalPages = Math.max(1, Math.ceil(Math.max(0, total) / pageSize));
  const page = Math.min(Math.max(requestedPage, 1), totalPages);
  return { page, totalPages, skip: (page - 1) * pageSize };
}
