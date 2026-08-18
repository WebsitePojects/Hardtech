"use client";

import { useState, useTransition, type FormEvent } from "react";
import Link from "next/link";
import { Eye, EyeOff, LogIn } from "lucide-react";

import { MorphingButton } from "@/components/ui/morphing-button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

import { AnimatedField } from "./animated-field";
import { loginAction } from "./actions";

/**
 * docs/screens/desktop-02.md #1 / docs/screens/mobile-04.md #11-12: the
 * reference `/login` ships pre-filled with the Admin demo email, so the
 * email default below is transcribed verbatim. The password field is
 * pre-filled too, but it's rendered masked (dots) in every screenshot — its
 * literal characters are not recoverable from any capture, and per the
 * "TEST CREDENTIALS" box any value authenticates, so the default here is an
 * arbitrary 7-character placeholder chosen only to match the dot count seen
 * on screen, not a transcribed value. Flagged in the wave-2 return report.
 */
const DEFAULT_EMAIL = "admin@gmail.com";
const DEFAULT_PASSWORD = "demo123";

export function LoginForm() {
  const [email, setEmail] = useState(DEFAULT_EMAIL);
  const [password, setPassword] = useState(DEFAULT_PASSWORD);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // Non-negotiables rule 1: early-return guard while a request is already
    // in flight, on top of the `disabled` attribute on the submit button
    // below (defense in depth — the attribute can lag a fast double-click).
    if (isPending) return;

    setError(null);
    startTransition(async () => {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const result = await loginAction({ email, password, rememberMe, timezone });
      // A successful login redirects server-side and this line never runs;
      // only the failure path returns a value.
      setError(result.error);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <AnimatedField
        id="login-email"
        name="email"
        type="email"
        label="Email Address"
        autoComplete="email"
        placeholder="you@gmail.com"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        disabled={isPending}
        error={Boolean(error)}
        required
      />

      <AnimatedField
        id="login-password"
        name="password"
        type={showPassword ? "text" : "password"}
        label="Password"
        labelExtra={
          <Link href="/forgot-password" className="text-sm font-medium text-primary hover:underline">
            Forgot password?
          </Link>
        }
        autoComplete="current-password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        disabled={isPending}
        error={Boolean(error)}
        required
        rightAdornment={
          <button
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            disabled={isPending}
            className="absolute inset-y-0 right-2.5 flex items-center text-muted-foreground hover:text-foreground disabled:opacity-50"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        }
      />

      <div className="flex items-center gap-2">
        <Checkbox
          id="login-remember"
          checked={rememberMe}
          onCheckedChange={(checked) => setRememberMe(checked === true)}
          disabled={isPending}
        />
        <Label htmlFor="login-remember" className="text-sm font-normal text-muted-foreground">
          Remember me for 30 days
        </Label>
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
        icon={<LogIn className="size-4" aria-hidden />}
        // The `role="alert"` element above already announces the actual
        // server error ("Invalid email or password") the moment `error` is
        // set. Without this flag, MorphingButton's own internal live region
        // would announce its generic "Try Again" label on the same render,
        // so a screen-reader user hears the specific reason immediately
        // followed by a second, less informative announcement competing for
        // priority (see morphing-button.tsx's module doc on the rejected
        // "never announce" fix and why suppression is opt-in per caller).
        // Removing this later reintroduces that double announcement — it is
        // not a redundant flag to tidy up.
        suppressErrorAnnouncement
        // A successful login redirects server-side (see the comment above
        // `setError` in handleSubmit), so "success" never actually renders
        // here — only idle/pending/error occur. The label below is required
        // by MorphingButtonLabels' Record<MorphingButtonState, string> shape
        // but is dead code, not a claim that this state is reachable.
        state={isPending ? "pending" : error ? "error" : "idle"}
        labels={{
          idle: "Sign In to Dashboard",
          pending: "Signing In…",
          success: "Signed In",
          error: "Try Again",
        }}
      />
    </form>
  );
}
