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
