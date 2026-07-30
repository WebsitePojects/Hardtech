import { z } from "zod";

/**
 * Boundary validation for marketing.service.ts. The service is what route
 * builders call directly (per docs/contracts/wave-1-marketing.md, "never a
 * repository, never `db` directly"), so it is itself a boundary and parses
 * its input rather than trusting it — see .claude/rules/00-non-negotiables.md
 * rule 4 ("validate at the boundary") and 10-architecture.md.
 */
export const programShortNameSchema = z.string().trim().min(1).max(200);
