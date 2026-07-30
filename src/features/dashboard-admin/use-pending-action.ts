"use client";

import { useState } from "react";

/**
 * Shared implementation of non-negotiables rule 1 ("No double-submit,
 * ever"): every mutating control built in this feature is disabled while a
 * request is in flight, shows a pending state, and its handler
 * early-returns if already pending. Extracted here once every admin
 * mutation (enrollment approve/reject, certificate approve/reject, user
 * role/status/program edits, announcement post/delete, payment-method
 * save) needed the identical three-line guard — third repetition, so it is
 * DRY'd into one hook rather than copy-pasted per control.
 *
 * `run` is the guarded wrapper: it early-returns a no-op if a previous call
 * is still pending, otherwise sets `isPending` for the duration of `action`
 * and always clears it in `finally`, regardless of success or throw.
 */
export function usePendingAction() {
  const [isPending, setIsPending] = useState(false);

  async function run(action: () => Promise<void>): Promise<void> {
    // Defense in depth alongside the `disabled` prop callers pass — see
    // step-payment.tsx's identical comment for the established precedent.
    if (isPending) return;

    setIsPending(true);
    try {
      await action();
    } finally {
      setIsPending(false);
    }
  }

  return { isPending, run };
}
