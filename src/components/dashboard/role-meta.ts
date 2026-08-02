import type { UserRole } from "@/../generated/prisma/enums";

/**
 * Per-role sidebar/header chrome.
 *
 * `portalLabel` and the dot colours are transcribed from
 * docs/screens/desktop-02.md (sidebar section labels "ADMIN PORTAL" /
 * "TRAINER PORTAL" / "TRAINEE PORTAL") and docs/screens/mobile-05.md, which
 * confirms the mobile sticky header pattern `[hamburger][dot][ROLE PORTAL]`
 * is colour-coded per role: purple for admin, green for trainer
 * (mobile-05.md screenshot #31 + "Mobile layout rules"). Trainee's mobile
 * dot colour is not in mobile-05.md's slice (no trainee screenshot there);
 * confirmed green instead via docs/screens/mobile-06.md line 219
 * ("hamburger + green dot + TRAINEE PORTAL").
 *
 * `defaultSubtitle` is the role-title line under the name in the sidebar
 * header. "Super Admin" (desktop-02.md #2) and "Active Trainee"
 * (desktop-02.md #22) are transcribed verbatim and read as generic role
 * labels rather than one person's title. The trainer screenshot instead
 * shows "Owner & Lead Trainer" (desktop-02.md #14) — that is Henry Gomata
 * Lopez's own credential, not a generic trainer label, so it is NOT reused
 * here as a fallback for every trainer. "Trainer" is used instead as a
 * plain, non-invented placeholder pending a real per-trainer title (that
 * data lives in trainer-profile records, outside this builder's ownership —
 * flagged for whichever builder wires the real trainer dashboard).
 *
 * The active-nav-item highlight itself is green-tinted regardless of role
 * (desktop-02.md #2: "Overview ... active/selected, green-tinted
 * background" on the *admin* sidebar, whose avatar/dot are purple) — that
 * styling lives inline in dashboard-sidebar-nav.tsx, not here.
 *
 * `fallbackDisplayName` exists because AUTH's `Session`
 * (src/server/auth/session.ts) is intentionally `{ userId, role }` only —
 * no name, no email — per rule 6 (never carry PII in a session payload).
 * This builder has no user-profile fetch to call (that's a repository/
 * service concern outside `src/app/(dashboard)/**` and
 * `src/components/dashboard/**`), so the sidebar header falls back to a
 * plain role noun rather than inventing or guessing a person's name. NOT
 * SOURCED as a personalized greeting — wave-3 pages already render the real
 * "Welcome, <name>" H1 as page content (e.g. desktop-02.md #14, #22) from
 * data they fetch themselves; this is only the chrome fallback for the one
 * piece of UI (the sidebar header) this builder owns without that data.
 */
export const roleMeta: Record<
  UserRole,
  {
    portalLabel: string;
    defaultSubtitle: string;
    fallbackDisplayName: string;
    dotClassName: string;
    avatarClassName: string;
  }
> = {
  ADMIN: {
    portalLabel: "ADMIN PORTAL",
    defaultSubtitle: "Super Admin",
    fallbackDisplayName: "Admin Console",
    dotClassName: "bg-primary",
    avatarClassName: "bg-brand-purple/20 text-brand-purple",
  },
  TRAINER: {
    portalLabel: "TRAINER PORTAL",
    defaultSubtitle: "Owner & Lead Trainer",
    fallbackDisplayName: "Trainer",
    dotClassName: "bg-primary",
    avatarClassName: "bg-primary/20 text-primary",
  },
  TRAINEE: {
    portalLabel: "TRAINEE PORTAL",
    defaultSubtitle: "Active Trainee",
    fallbackDisplayName: "Trainee",
    dotClassName: "bg-primary",
    avatarClassName: "bg-primary/20 text-primary",
  },
};
