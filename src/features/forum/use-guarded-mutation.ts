"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";

/**
 * Shared guard for every mutating control in this wave
 * (.claude/rules/00-non-negotiables.md rule 1): the returned `isPending`
 * drives both the visual pending state and the `disabled` attribute on the
 * caller's control, and `run` early-returns if a call is already in flight —
 * defense in depth alongside `disabled`, since `disabled` alone can still
 * race a fast double-click/double-tap.
 *
 * Every action this wires up (vote, bookmark, report, post, reply, join) is
 * a `TODO(wave-3)` stub that always throws (see src/features/forum/mutations
 * and src/features/communities/mutations) — this hook only standardises how
 * the UI reacts to that failure so it never falsely reports success.
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
        // Unreachable while every action above always throws — once wave 3
        // wires a real server action, a successful result lands here.
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
