import { z } from "zod";

import { dashboardNavItems } from "@/components/dashboard/dashboard-nav-items";

/**
 * The 9 admin section ids, sourced from DASH-SHELL's own nav list
 * (src/components/dashboard/dashboard-nav-items.ts) rather than
 * re-declared here, so this file can never drift from the sidebar links
 * that produce `?section=<id>`.
 */
export const ADMIN_SECTION_IDS = dashboardNavItems.ADMIN.map((item) => item.id) as [
  string,
  ...string[],
];

export const adminSectionSchema = z.enum(ADMIN_SECTION_IDS);

export type AdminSectionId = z.infer<typeof adminSectionSchema>;

/**
 * Fail-closed per .claude/rules/00-non-negotiables.md #3: `section` is
 * user-controlled query state, not an authorization input, but an
 * unrecognized value must still resolve to one deterministic, known-good
 * section rather than rendering whatever string a visitor typed. It never
 * falls through to "render nothing" or reflects the raw value.
 */
export function parseAdminSection(value: string | undefined): AdminSectionId {
  const parsed = adminSectionSchema.safeParse(value);
  return parsed.success ? parsed.data : "overview";
}
