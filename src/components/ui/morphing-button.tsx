"use client";

import * as React from "react";
import { AlertCircle, Check, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { EASE_UI_CSS } from "@/components/motion/easing";

/**
 * The four states rule #1 (`.claude/rules/00-non-negotiables.md`) requires
 * every mutating control to move through: disabled+pending while in flight,
 * then a terminal state that tells the user what happened.
 */
export type MorphingButtonState = "idle" | "pending" | "success" | "error";

type MorphingButtonLabels = Record<MorphingButtonState, string>;

export type MorphingButtonProps = Omit<
  React.ComponentProps<typeof Button>,
  "children" | "aria-busy"
> & {
  state: MorphingButtonState;
  /** One label per state — transcribe copy at the call site, never here. */
  labels: MorphingButtonLabels;
  /** Leading icon for the idle state only; pending/success/error own theirs. */
  icon?: React.ReactNode;
  /**
   * Set true when the caller already renders its own `error` announcement
   * (e.g. a `role="alert"` message tied to the same server response) to
   * stop this component's internal live region from also announcing the
   * `error` label. Defaults to false — announce — because the safe default
   * for a caller that does nothing is "the user learns the request failed",
   * not silence. See the module doc for the double-announcement this
   * prevents when set.
   */
  suppressErrorAnnouncement?: boolean;
};

/**
 * Icon + text-colour token pairing per state. Only success/error recolour —
 * idle and pending inherit the button variant's own foreground so this
 * never fights a consumer's chosen `variant`.
 */
const STATE_ICON: Record<Exclude<MorphingButtonState, "idle">, React.ReactNode> = {
  pending: <Loader2 className="size-4 animate-spin motion-reduce:animate-none" />,
  success: <Check className="size-4 text-primary" />,
  error: <AlertCircle className="size-4 text-destructive" />,
};

const STATE_TEXT_CLASS: Record<MorphingButtonState, string> = {
  idle: "",
  pending: "",
  success: "text-primary",
  error: "text-destructive",
};

/**
 * A submit button whose label morphs across idle -> pending -> success/error
 * instead of swapping abruptly, satisfying the "disabled + pending state"
 * half of rule #1. Purely presentational: it receives `state` as a prop and
 * owns no submission logic, no `fetch`, no service import — the caller
 * decides what state means and when it changes.
 *
 * Width-morph technique: all four labels are stacked in the same grid cell
 * (`col-start-1 row-start-1` inside an `inline-grid`) at all times, and only
 * `opacity` switches between them. The grid track therefore always sizes to
 * the widest of the four labels, so the box is exactly as wide on first
 * paint as it will ever be — no measured-width effect, no post-mount
 * reflow, and switching state never shifts the surrounding form. The
 * tradeoff is the button is always as wide as its widest label, which is
 * the correct tradeoff here: a form control that changes width when it
 * finishes is the layout jump this technique exists to prevent.
 *
 * Disabled derivation — only `pending` forces `disabled`, `success` and
 * `error` do not:
 *
 * - `pending` is the rule #1 in-flight guard and is non-negotiable: the
 *   request is live, so the control must be inert.
 * - `error` is a terminal, RETRYABLE state — the whole point of showing an
 *   error is to invite another attempt. An earlier version of this
 *   component disabled on `state !== "idle"`, which included `error`. At a
 *   real call site (`login-form.tsx`) `error` is only ever cleared at the
 *   start of the submit handler, which requires the submit button — so one
 *   failed login permanently bricked the form (click does nothing, and
 *   implicit Enter-key submission is also skipped by the HTML spec once the
 *   form's default button is disabled) until a full page reload. Do not
 *   reintroduce `state !== "idle"` here.
 * - `success` is NOT disabled-by-state, for the identical reason `error` is not:
 *   this component cannot know whether a given call site clears `success`
 *   via a handler gated behind the now-disabled button (the exact shape of
 *   the bug above) or via an unrelated effect. Yes, `success` often
 *   precedes a redirect, where staying disabled would harmlessly prevent a
 *   pointless second submit — but that upside isn't worth risking the same
 *   deadlock class one state over. A call site that truly needs to block
 *   further clicks after success should do it by navigating away or by
 *   passing its own `disabled` prop, not by relying on this component to
 *   infer it from `state`.
 *
 * `disabled` passed in by the consumer (e.g. "form is invalid for other
 * reasons") is merged with the above via `||` in all cases, never replaced.
 *
 * Live-region announcement — `pending` and `success` always announce,
 * `error` announces unless `suppressErrorAnnouncement` is set:
 *
 * The internal `aria-live="polite"` region exists because `pending` ->
 * `success` has no equivalent signal for a screen-reader user otherwise: a
 * sighted user sees the spinner stop and the checkmark appear, and without
 * the announcement that transition is invisible to anyone not looking at
 * the button. That case earns its place unconditionally.
 *
 * `error` was found to double-announce in practice: both adopting call
 * sites (`login-form.tsx`, `forgot-password-form.tsx`) already render their
 * own `role="alert" aria-live="polite"` element with the actual server
 * message ("Invalid email or password") in the same render that flips
 * `state` to `"error"`. A screen reader then reads the specific reason
 * immediately followed by this component's generic button label ("Try
 * Again"), which adds no information and competes with the region that
 * has the real one — worse, `alert`'s assertive-by-default semantics
 * against this region's `status` semantics mean the two aren't even
 * guaranteed to be heard in "reason, then action" order.
 *
 * Rejected fix: silently never announcing `error` from here. That is only
 * safe for callers that render their own error text, which every current
 * caller happens to do — but a future caller that relies solely on this
 * component would ship a failure state a screen-reader user cannot detect
 * at all (the label change alone is not reliably announced; changing an
 * element's accessible name does not by itself trigger a screen reader to
 * speak it). Silence-by-default trades a known, narrow annoyance
 * (redundant speech) for an unbounded, silent one (nothing announced) —
 * the wrong trade for a rule-#1 mutating control.
 *
 * Chosen fix instead: `suppressErrorAnnouncement` (default `false`, i.e.
 * "announce"). A caller that already renders its own error message passes
 * `true` to opt out of the duplicate; a caller that renders nothing gets
 * the safe default and the user still learns the request failed.
 */
export function MorphingButton({
  state,
  labels,
  icon,
  disabled,
  suppressErrorAnnouncement = false,
  className,
  ...buttonProps
}: MorphingButtonProps) {
  const states: MorphingButtonState[] = ["idle", "pending", "success", "error"];

  return (
    <>
      <Button
        {...buttonProps}
        // No `type` override here, deliberately: a bare <button> defaults to
        // type="submit" inside a <form>, which is exactly right for "A
        // submit button whose label morphs..." (see module doc). Forcing
        // "button" would silently break `<form action={...}><MorphingButton
        // .../></form>` — the form would just never submit, with no error.
        // `type` still flows through `buttonProps` so a consumer can opt
        // into type="button" explicitly when this isn't a submit control.
        // Only `pending` forces disabled — see the module doc above for why
        // `error` and `success` deliberately do not, and the real-world
        // deadlock that resulted from disabling on `state !== "idle"`. A
        // consumer-passed `disabled` (e.g. "form invalid") still merges in
        // via `||` regardless of state.
        disabled={disabled || state === "pending"}
        aria-busy={state === "pending"}
        data-state={state}
        className={cn(
          "min-h-11 active:scale-[0.96] motion-reduce:active:scale-100",
          className,
        )}
      >
        <span className="grid items-center justify-items-center">
          {states.map((candidate) => {
            const isActive = candidate === state;
            return (
              <span
                key={candidate}
                // Non-active labels are removed from the accessibility tree
                // so the button's accessible name is exactly the current
                // label, never all four concatenated.
                aria-hidden={!isActive}
                className={cn(
                  "col-start-1 row-start-1 inline-flex items-center gap-1.5 whitespace-nowrap",
                  "transition-opacity duration-200 motion-reduce:transition-none",
                  isActive ? "opacity-100" : "pointer-events-none opacity-0",
                  STATE_TEXT_CLASS[candidate],
                )}
                // Inline style, not a Tailwind arbitrary class: this
                // project's chosen technique for injecting a named curve
                // from @/components/motion/easing, because a
                // dynamically-composed `ease-[${EASE_UI_CSS}]` class isn't
                // statically extractable and has silently computed to
                // nothing here before (.claude/lessons.md, 2026-08-09,
                // "shadow-[...] computed to nothing"). Do not convert this
                // to an arbitrary-value class.
                style={{ transitionTimingFunction: EASE_UI_CSS }}
              >
                {candidate === "idle" ? icon : STATE_ICON[candidate]}
                {labels[candidate]}
              </span>
            );
          })}
        </span>
      </Button>
      {/* Always-mounted live region: screen readers only announce a change
          to text that already exists in the DOM, so this must never be
          conditionally rendered — only its text content changes. `error`
          is withheld when the caller owns its own announcement (see
          `suppressErrorAnnouncement` in the module doc) so a screen-reader
          user hears the specific server message once, not that message
          followed by this button's generic label. */}
      <span className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {state === "idle" || (state === "error" && suppressErrorAnnouncement)
          ? ""
          : labels[state]}
      </span>
    </>
  );
}
