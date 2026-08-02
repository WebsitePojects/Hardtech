"use client";

import { useState, useTransition, type FormEvent } from "react";
import { toast } from "sonner";
import { Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
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

      <Button type="submit" disabled={isPending} className="w-full">
        <Mail className="size-4" aria-hidden />
        {isPending ? "Sending…" : "Send Reset Instructions"}
      </Button>
    </form>
  );
}
