"use client";

import { useState, useTransition, type FormEvent } from "react";
import { toast } from "sonner";
import { Mail } from "lucide-react";

import { MorphingButton } from "@/components/ui/morphing-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { requestPasswordReset } from "./actions";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // Non-negotiables rule 1: early-return guard while already in flight,
    // in addition to the `disabled` attribute on the submit button.
    if (isPending) return;

    setError(null);
    startTransition(async () => {
      try {
        const result = await requestPasswordReset({ email });
        setError(result.error ?? null);
      } catch {
        // The action currently always throws — see the TODO(wave-3) comment
        // in actions.ts. Surfaced honestly rather than shown as a success.
        toast.error("Password reset isn't available yet in this build.");
        setError("Password reset isn't available yet — this ships in a later wave.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div className="space-y-1.5">
        <Label htmlFor="forgot-email" className="text-xs tracking-wider text-muted-foreground uppercase">
          Email Address
        </Label>
        <Input
          id="forgot-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@gmail.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          disabled={isPending}
          required
        />
      </div>

      {error ? (
        <p role="alert" aria-live="polite" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <MorphingButton
        type="submit"
        disabled={isPending}
        className="w-full"
        icon={<Mail className="size-4" aria-hidden />}
        // The `role="alert"` element above already announces the actual
        // server/error message the moment `error` is set. Without this
        // flag, MorphingButton's own internal live region would announce
        // its generic "Try Again" label on the same render, so a
        // screen-reader user hears the specific reason immediately followed
        // by a second, less informative announcement competing for
        // priority (see morphing-button.tsx's module doc on the rejected
        // "never announce" fix and why suppression is opt-in per caller).
        // Removing this later reintroduces that double announcement — it is
        // not a redundant flag to tidy up.
        suppressErrorAnnouncement
        // The action currently always throws (see the catch block above),
        // so no code path here ever observes a real "success" — only
        // idle/pending/error occur. The label below is required by
        // MorphingButtonLabels' Record<MorphingButtonState, string> shape
        // but is dead code, not a claim that this state is reachable.
        state={isPending ? "pending" : error ? "error" : "idle"}
        labels={{
          idle: "Send Reset Instructions",
          pending: "Sending…",
          success: "Instructions Sent",
          error: "Try Again",
        }}
      />
    </form>
  );
}
