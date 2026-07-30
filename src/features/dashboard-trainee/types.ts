import type { SubmissionType } from "@/../generated/prisma/enums";

/**
 * Shape of one trainer-posted assignment as the trainee dashboard would need
 * to render it (desktop-02.md #24, mobile-06.md 14:32:26 — "Assignments").
 *
 * No read for this exists on `dashboard.service.ts` yet (DATA-2 owns that
 * file; its own scope note says the Overview page is all it covers so far).
 * This type lets `assignment-submission-form.tsx` be built for real now —
 * guards, idempotency key, the works — instead of stubbing with `any`, so
 * wave 4 only has to wire the read and the mutation, not design the form.
 * See `assignments-section.tsx` for the TODO(orchestrator) this depends on.
 */
export type TraineeAssignmentListItem = {
  id: string;
  title: string;
  instructions: string;
  dueDate: Date;
  dueTime: string;
  allowedSubmissionTypes: SubmissionType[];
};
