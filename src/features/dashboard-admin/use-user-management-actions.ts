"use client";

import { useState } from "react";
import { toast } from "sonner";

import type { UserRole, UserStatus } from "@/../generated/prisma/enums";
import { usePendingAction } from "./use-pending-action";
import { ADMIN_ROLE_OPTIONS, ADMIN_STATUS_OPTIONS } from "./confirmed-options";
import {
  removeUser,
  updateUserProgram,
  updateUserRole,
  updateUserStatus,
} from "./mutations/user-mutations";

export type UserManagementItem = {
  id: string;
  name: string;
  initials: string;
  email: string;
  role: UserRole;
  /** null renders the "Select..." placeholder (desktop-02.md #4, "asda z" row). */
  programLabel: string | null;
  status: UserStatus;
};

function isUserRole(value: string): value is UserRole {
  return ADMIN_ROLE_OPTIONS.some((option) => option.value === value);
}

function isUserStatus(value: string): value is UserStatus {
  return ADMIN_STATUS_OPTIONS.some((option) => option.value === value);
}

/**
 * One user's mutation orchestration for "User Management"
 * (desktop-02.md #4-7, mobile-05.md #5-11). Extracted out of the table row
 * so both the >=md `<Table>` row and the <md mobile card render the exact
 * same guarded handlers against the exact same idempotency key — the two
 * are different views of one record, not two independent features, so
 * duplicating the four-handler/four-pending-state block between them would
 * let the two drift. Every Select's onValueChange and the "Remove" Button
 * go through the same disabled/pending/early-return guard
 * (usePendingAction) before calling the wave-4 stub in
 * ./mutations/user-mutations.ts, which always throws. All four controls
 * disable together while one of them is in flight, so an admin cannot fire
 * a second write against the same row mid-save.
 */
export function useUserManagementActions(user: UserManagementItem) {
  const [idempotencyKey] = useState(() => crypto.randomUUID());
  const roleAction = usePendingAction();
  const programAction = usePendingAction();
  const statusAction = usePendingAction();
  const removeAction = usePendingAction();
  const anyPending =
    roleAction.isPending || programAction.isPending || statusAction.isPending || removeAction.isPending;

  async function handleRoleChange(value: string) {
    if (!isUserRole(value)) return;
    await roleAction.run(async () => {
      try {
        const result = await updateUserRole({ userId: user.id, role: value, idempotencyKey });
        if (!result.ok) toast.error(result.error);
      } catch {
        toast.error("Unable to update the user's role.");
      }
    });
  }

  async function handleStatusChange(value: string) {
    if (!isUserStatus(value)) return;
    await statusAction.run(async () => {
      try {
        const result = await updateUserStatus({ userId: user.id, status: value, idempotencyKey });
        if (!result.ok) toast.error(result.error);
      } catch {
        toast.error("Unable to update the user's status.");
      }
    });
  }

  async function handleProgramChange(programId: string) {
    await programAction.run(async () => {
      try {
        const result = await updateUserProgram({ userId: user.id, programId, idempotencyKey });
        if (!result.ok) toast.error(result.error);
      } catch {
        toast.error("Unable to update the user's program.");
      }
    });
  }

  async function handleRemove() {
    if (!window.confirm(`Remove ${user.name}?`)) return;
    await removeAction.run(async () => {
      try {
        const result = await removeUser({ userId: user.id, idempotencyKey });
        if (!result.ok) toast.error(result.error);
      } catch {
        toast.error("Unable to remove the user.");
      }
    });
  }

  return {
    anyPending,
    roleAction,
    programAction,
    statusAction,
    removeAction,
    handleRoleChange,
    handleStatusChange,
    handleProgramChange,
    handleRemove,
  };
}
