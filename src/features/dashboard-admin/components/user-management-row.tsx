"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TableCell, TableRow } from "@/components/ui/table";
import { ADMIN_PROGRAM_OPTIONS, ADMIN_ROLE_OPTIONS, ADMIN_STATUS_OPTIONS } from "../confirmed-options";
import { useUserManagementActions, type UserManagementItem } from "../use-user-management-actions";

export type { UserManagementItem };

/**
 * One >=md `<Table>` row of "User Management" (desktop-02.md #4-7). Below
 * `md`, `UserManagementCard` (../components/user-management-card.tsx)
 * renders the same record as a card instead — see
 * `useUserManagementActions` for why the mutation handlers live in one
 * shared hook rather than being duplicated per view.
 */
export function UserManagementRow({ user }: { user: UserManagementItem }) {
  const {
    anyPending,
    removeAction,
    handleRoleChange,
    handleStatusChange,
    handleProgramChange,
    handleRemove,
  } = useUserManagementActions(user);

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
