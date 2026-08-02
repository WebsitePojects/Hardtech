// TODO(wave-4): see enrollment-mutations.ts for the pattern this follows.
// User Management (desktop-02.md #4-7) edits four independent fields per
// row via inline Selects (role, program, status) plus a "Remove" button.
// Unlike approve/reject, these are plain column assignments, not a
// workflow with a "current state" to guard against — a retry that sets
// `role = 'TRAINER'` twice is already idempotent by construction (rule 2:
// "a unique constraint plus out-of-transaction recovery" isn't needed here
// because there is no side effect that fires only once; the row simply
// ends up with the value it was set to). Wave-4 must still recompute the
// target enum server-side and fail closed on anything outside UserRole /
// UserStatus / the real Program catalog — never trust the client-sent
// value as-is even though it came from a closed Select (rule 4).
//
// `removeUser` is a destructive action (Trainer Management's per-trainee
// "X" and User Management's "Remove" both read this way in the
// screenshots) — wave-4 must decide there whether "Remove" means a status
// change (suspend) or a real delete/restrict per the FK `onDelete`
// behaviour already declared in prisma/schema.prisma (`Restrict` on most
// User relations), not this file's concern.

import type { UserRole, UserStatus } from "@/../generated/prisma/enums";
import { removeUserAction, updateUserProgramAction, updateUserRoleAction, updateUserStatusAction } from "@/app/(dashboard)/dashboard/admin/actions";

export interface UpdateUserRoleInput {
  userId: string;
  role: UserRole;
  idempotencyKey?: string;
}

export interface UpdateUserProgramInput {
  userId: string;
  programId: string;
  idempotencyKey?: string;
}

export interface UpdateUserStatusInput {
  userId: string;
  status: UserStatus;
  idempotencyKey?: string;
}

export interface RemoveUserInput {
  userId: string;
  idempotencyKey?: string;
}

export async function updateUserRole(input: UpdateUserRoleInput) {
  return updateUserRoleAction(input);
}

export async function updateUserProgram(input: UpdateUserProgramInput) {
  return updateUserProgramAction(input);
}

export async function updateUserStatus(input: UpdateUserStatusInput) {
  return updateUserStatusAction(input);
}

export async function removeUser(input: RemoveUserInput) {
  return removeUserAction(input);
}
