// TODO(wave-4): see enrollment-mutations.ts for the pattern this follows.
// Trainer Management's "ASSIGNED TRAINEES" list (desktop-02.md #8,
// mobile-05.md #13) shows a per-row remove ("X") action that unassigns a
// trainee from a trainer's batch. This is a batch reassignment
// (Enrollment.batchId -> null or a different batch), not a delete of the
// Enrollment or User row — wave-4 should implement it as a targeted UPDATE
// on the one enrollment row, guarded on it still belonging to the batch
// being edited, so a stale/duplicate click cannot unassign a trainee who
// was already moved elsewhere in the meantime.

export interface RemoveAssignedTraineeInput {
  enrollmentId: string;
  batchId: string;
  idempotencyKey?: string;
}

export async function removeAssignedTrainee(input: RemoveAssignedTraineeInput) {
  return removeAssignedTraineeAction(input);
}
import { removeAssignedTraineeAction } from "@/app/(dashboard)/dashboard/admin/actions";
