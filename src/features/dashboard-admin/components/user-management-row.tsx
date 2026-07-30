"use client";

import { toast } from "sonner";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TableCell, TableRow } from "@/components/ui/table";
import type { UserRole, UserStatus } from "@/../generated/prisma/enums";
import { usePendingAction } from "../use-pending-action";
import { ADMIN_PROGRAM_OPTIONS, ADMIN_ROLE_OPTIONS, ADMIN_STATUS_OPTIONS } from "../confirmed-options";
import {
  removeUser,
  updateUserProgram,
  updateUserRole,
  updateUserStatus,
} from "../mutations/user-mutations";

function isUserRole(value: string): value is UserRole {
  return ADMIN_ROLE_OPTIONS.some((option) => option.value === value);
}

function isUserStatus(value: string): value is UserStatus {
  return ADMIN_STATUS_OPTIONS.some((option) => option.value === value);
}

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

/**
 * One row of "User Management" (desktop-02.md #4-7, mobile-05.md #5-11).
 * Every Select's onValueChange and the "Remove" Button go through the same
 * disabled/pending/early-return guard (usePendingAction) before calling
 * the wave-4 stub in ../mutations/user-mutations.ts, which always throws.
 * All four controls disable together while one of them is in flight,
 * so an admin cannot fire a second write against the same row mid-save.
 */
export function UserManagementRow({ user }: { user: UserManagementItem }) {
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
        await updateUserRole({ userId: user.id, role: value });
      } catch {
        toast.error("Updating a user's role isn't wired up yet in this build.");
      }
    });
  }

  async function handleStatusChange(value: string) {
    if (!isUserStatus(value)) return;
    await statusAction.run(async () => {
      try {
        await updateUserStatus({ userId: user.id, status: value });
      } catch {
        toast.error("Updating a user's status isn't wired up yet in this build.");
      }
    });
  }

  async function handleProgramChange(programId: string) {
    await programAction.run(async () => {
      try {
        await updateUserProgram({ userId: user.id, programId });
      } catch {
        toast.error("Updating a user's program isn't wired up yet in this build.");
      }
    });
  }

  async function handleRemove() {
    await removeAction.run(async () => {
      try {
        await removeUser({ userId: user.id });
      } catch {
        toast.error("Removing a user isn't wired up yet in this build.");
      }
    });
  }

  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-2.5">
          <Avatar size="sm">
            <AvatarFallback className="bg-primary/15 text-primary">{user.initials}</AvatarFallback>
          </Avatar>
          <span className="font-medium text-foreground">{user.name}</span>
        </div>
      </TableCell>
      <TableCell className="text-muted-foreground">{user.email}</TableCell>
      <TableCell>
        <Select value={user.role} onValueChange={handleRoleChange} disabled={anyPending}>
          <SelectTrigger size="sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ADMIN_ROLE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell>
        <Select
          value={user.programLabel ?? undefined}
          onValueChange={handleProgramChange}
          disabled={anyPending}
        >
          <SelectTrigger size="sm">
            <SelectValue placeholder="Select..." />
          </SelectTrigger>
          <SelectContent>
            {ADMIN_PROGRAM_OPTIONS.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell>
        <Select value={user.status} onValueChange={handleStatusChange} disabled={anyPending}>
          <SelectTrigger size="sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ADMIN_STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell>
        <Button type="button" variant="destructive" size="sm" disabled={anyPending} onClick={handleRemove}>
          {removeAction.isPending ? "Removing…" : "Remove"}
        </Button>
      </TableCell>
    </TableRow>
  );
}
