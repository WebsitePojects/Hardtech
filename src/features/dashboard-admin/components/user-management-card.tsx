"use client";

import type { ReactNode } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ADMIN_PROGRAM_OPTIONS, ADMIN_ROLE_OPTIONS, ADMIN_STATUS_OPTIONS } from "../confirmed-options";
import { useUserManagementActions, type UserManagementItem } from "../use-user-management-actions";

/**
 * A field label above a full-width, thumb-sized control — the mobile
 * substitute for a `<TableHead>` column header, which has nowhere to live
 * once the row becomes a card.
 */
function FieldLabel({ htmlFor, children }: { htmlFor: string; children: ReactNode }) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-xs font-medium tracking-wide text-muted-foreground uppercase"
    >
      {children}
    </label>
  );
}

/**
 * 44px is the Apple HIG / Material minimum touch target. shadcn's
 * SelectTrigger ships `data-[size=default]:h-8` (32px) — too small for a
 * thumb. `!h-11` forces the override regardless of the data-attribute
 * selector's specificity (see .claude/lessons.md, "arbitrary Tailwind
 * value computed to nothing" — measure, don't assume a plain className
 * wins the cascade).
 */
const TOUCH_TRIGGER = "!h-11 w-full";

/**
 * Below `md`, one card per user replaces the `<Table>` row
 * (`UserManagementRow`, ../components/user-management-row.tsx) — a data
 * table on a 390px viewport means hidden columns and horizontal scrubbing
 * to read a single record, which is what the original Figma Make mobile
 * capture actually shipped (docs/screens/mobile-05.md #6: "the table is
 * wider than the viewport and scrolls horizontally"). This card carries
 * the same fields — identity, role, program, status, remove — as one
 * scannable unit instead: no column is hidden, none require horizontal
 * scroll to reach. See `useUserManagementActions` for why the mutation
 * handlers are a shared hook rather than being re-implemented here.
 */
export function UserManagementCard({ user }: { user: UserManagementItem }) {
  const {
    anyPending,
    removeAction,
    handleRoleChange,
    handleStatusChange,
    handleProgramChange,
    handleRemove,
  } = useUserManagementActions(user);

  const roleFieldId = `user-role-${user.id}`;
  const programFieldId = `user-program-${user.id}`;
  const statusFieldId = `user-status-${user.id}`;

  return (
    <Card className="gap-4 p-4">
      <div className="flex items-start gap-3">
        <Avatar size="lg" className="mt-0.5 shrink-0">
          <AvatarFallback className="bg-primary/15 text-primary">{user.initials}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-foreground">{user.name}</p>
          <p className="truncate text-sm text-muted-foreground">{user.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <FieldLabel htmlFor={roleFieldId}>Role</FieldLabel>
          <Select value={user.role} onValueChange={handleRoleChange} disabled={anyPending}>
            <SelectTrigger id={roleFieldId} className={TOUCH_TRIGGER}>
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
        </div>

        <div className="space-y-1.5">
          <FieldLabel htmlFor={statusFieldId}>Status</FieldLabel>
          <Select value={user.status} onValueChange={handleStatusChange} disabled={anyPending}>
            <SelectTrigger id={statusFieldId} className={TOUCH_TRIGGER}>
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
        </div>
      </div>

      <div className="space-y-1.5">
        <FieldLabel htmlFor={programFieldId}>Program</FieldLabel>
        <Select
          value={user.programLabel ?? undefined}
          onValueChange={handleProgramChange}
          disabled={anyPending}
        >
          <SelectTrigger id={programFieldId} className={TOUCH_TRIGGER}>
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
      </div>

      <Button
        type="button"
        variant="destructive"
        disabled={anyPending}
        onClick={handleRemove}
        className="h-11 w-full motion-safe:transition-transform motion-safe:active:scale-[0.98]"
      >
        {removeAction.isPending ? "Removing…" : "Remove"}
      </Button>
    </Card>
  );
}
