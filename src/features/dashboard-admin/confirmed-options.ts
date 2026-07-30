import type { UserRole, UserStatus } from "@/../generated/prisma/enums";

/**
 * Option sets confirmed by opening the actual dropdowns in
 * docs/screens/desktop-02.md #5-7 (User Management Role/Program/Status
 * selects) and mobile-05.md #7-11 (same selects, mobile). These are
 * structural UI enums the build brief explicitly confirmed verbatim, not
 * fetched/invented data — unlike a user row's own name/email/program,
 * which is real per-record data this builder has no read for (see
 * DataNotConnectedNote usages).
 */
export const ADMIN_ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: "TRAINEE", label: "trainee" },
  { value: "TRAINER", label: "trainer" },
  { value: "ADMIN", label: "admin" },
];

export const ADMIN_STATUS_OPTIONS: { value: UserStatus; label: string }[] = [
  { value: "ACTIVE", label: "active" },
  { value: "PENDING", label: "pending" },
  { value: "SUSPENDED", label: "suspended" },
];

/**
 * "Program catalog confirmed (5 programs)" — desktop-02.md #6. These are
 * the short labels shown inside the admin dropdown, distinct from each
 * Program's full marketing title used elsewhere (e.g. "Computer Hardware"
 * here vs. "Computer Hardware Servicing" on /programs).
 */
export const ADMIN_PROGRAM_OPTIONS: string[] = [
  "Computer Hardware",
  "Cellphone Repair",
  "Software Dev",
  "Networking Basics",
  "CCTV Installation",
];

/** User Management's top filter Select (mobile-05.md #7): a role filter,
 * with its own separate labels from the per-row Role select above. */
export const ADMIN_ROLE_FILTER_OPTIONS = ["All roles", "Admins", "Trainers", "Trainees"];
