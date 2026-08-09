"use client";

import { useFormStatus } from "react-dom";
import { LogOut } from "lucide-react";

function LogoutSubmitButton() {
  // useFormStatus only reports the enclosing <form>'s pending state when
  // called from a component nested inside it, hence the split component
  // (rule 1: disabled + pending state while the request is in flight).
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-disabled={pending}
      // text-left because a <button> centres its text by default; border to
      // match the reference, which outlines both sidebar footer rows.
      className="flex w-full items-center gap-3 rounded-lg border border-glass-border px-3 py-2 text-left text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 disabled:pointer-events-none disabled:opacity-50"
    >
      <LogOut className="size-4" aria-hidden />
      Logout
    </button>
  );
}

export type DashboardLogoutButtonProps = {
  /** AUTH's real `logout()` (src/server/auth/session.ts), re-exported as a
   * Server Action by src/app/(dashboard)/actions.ts so this Client
   * Component never imports src/server/auth/** directly. */
  action: () => Promise<void>;
  className?: string;
};

/**
 * Real Logout control (docs/screens/desktop-02.md #2/#14/#22 — every role's
 * sidebar has one). `<form action={action}>` is the supported Next.js
 * pattern for invoking a Server Action from a Client Component: submitting
 * disables the button for the duration of the request via
 * `useFormStatus`, and because the button is disabled the instant it's
 * clicked, a second click cannot fire before the first completes — rule 1's
 * "disabled + pending + early-return" guard, satisfied by the platform
 * rather than hand-rolled state. `logout()` is idempotent (clearing an
 * already-cleared cookie and redirecting again is a no-op), so it needs no
 * additional duplicate-safety layer per rule 2.
 */
export function DashboardLogoutButton({ action, className }: DashboardLogoutButtonProps) {
  return (
    <form action={action} className={className}>
      <LogoutSubmitButton />
    </form>
  );
}
