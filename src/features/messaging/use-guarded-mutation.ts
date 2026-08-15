"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";

/**
 * Copied verbatim from src/features/forum/use-guarded-mutation.ts — kept
 * feature-scoped rather than shared, matching this codebase's convention
 * that features don't import each other's internals
 * (.claude/rules/10-architecture.md).
 *
 * Shared guard for every mutating control (.claude/rules/00-non-negotiables.md
 * rule 1): the returned `isPending` drives both the visual pending state and
 * the `disabled` attribute on the caller's control, and `run` early-returns
 * if a call is already in flight — defense in depth alongside `disabled`,
 * since `disabled` alone can still race a fast double-click/double-tap.
 *
 * Every action this wires up (send, mark-read, get-or-create) is a
 * "use server" wrapper around a Server Action that does not exist yet (see
 * mutations/*.ts) — this hook only standardises how the UI reacts to that
 * failure so it never falsely reports success.
 */
export function useGuardedMutation<Args extends unknown[]>(
  action: (...args: Args) => Promise<unknown>,
  notWiredMessage = "This isn't wired up yet — it ships in a later build.",
) {
  const [isPending, setIsPending] = useState(false);

  const run = useCallback(
    async (...args: Args) => {
      if (isPending) return;
      setIsPending(true);
      try {
        const result = await action(...args);
        if (
          typeof result === "object" &&
          result !== null &&
          "ok" in result &&
          result.ok === false &&
          "error" in result &&
          typeof result.error === "string"
        ) {
          toast.error(result.error);
        }
      } catch {
        toast.error(notWiredMessage);
      } finally {
        setIsPending(false);
      }
    },
    [action, isPending, notWiredMessage],
  );

  return { isPending, run };
}
