import type { EnrollmentStatus } from "@/../generated/prisma/enums";

export type TraineeStatusValue = EnrollmentStatus | "NONE";

/**
 * desktop-02.md #22 shows the trainee dashboard's "Status" stat tile as a
 * word ("Active"), not a number. mobile-06.md 14:33:02 confirms it becomes
 * "Graduate" once `EnrollmentStatus` flips to `COMPLETED` (the Liza Cruz
 * persona). Every trainee who reaches this route already has a verified
 * enrollment (payment-verification happens before `/dashboard/trainee` is
 * reachable in the intended flow), so `PENDING_VERIFICATION` / `REJECTED` /
 * `NONE` have no sourced screenshot — their labels below are a plain,
 * literal rendering of the enum, not transcribed design copy. Flagged
 * NOT SOURCED per .claude/rules/20-design-fidelity.md rather than guessed.
 */
export function traineeStatusLabel(status: TraineeStatusValue): string {
  switch (status) {
    case "ACTIVE":
      return "Active"; // desktop-02.md #22
    case "COMPLETED":
      return "Graduate"; // mobile-06.md 14:33:02
    case "PENDING_VERIFICATION":
      return "Pending"; // NOT SOURCED — no trainee-dashboard screenshot of this state
    case "REJECTED":
      return "Rejected"; // NOT SOURCED — no trainee-dashboard screenshot of this state
    case "NONE":
      return "No Program"; // NOT SOURCED — no trainee-dashboard screenshot of this state
    default:
      return "Unknown"; // fail closed (rule 3): never silently pass an unrecognized value through
  }
}
