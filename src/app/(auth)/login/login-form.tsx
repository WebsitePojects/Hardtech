"use client";

import { useState, useTransition, type FormEvent } from "react";
import Link from "next/link";
import { Eye, EyeOff, LogIn } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
      const result = await loginAction({ email, password, rememberMe });
      // A successful login redirects server-side and this line never runs;
      // only the failure path returns a value.
      setError(result.error);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div className="space-y-1.5">
        <Label htmlFor="login-email" className="text-xs tracking-wider text-muted-foreground uppercase">
          Email Address
        </Label>
        <Input
          id="login-email"
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

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="login-password" className="text-xs tracking-wider text-muted-foreground uppercase">
            Password
          </Label>
          <Link href="/forgot-password" className="text-sm font-medium text-primary hover:underline">
            Forgot password?
          </Link>
        </div>
        <div className="relative">
          <Input
            id="login-password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={isPending}
            required
            className="pr-9"
          />
          <button
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            disabled={isPending}
            className="absolute inset-y-0 right-2.5 flex items-center text-muted-foreground hover:text-foreground disabled:opacity-50"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </div>

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

      <Button type="submit" disabled={isPending} className="w-full">
        <LogIn className="size-4" aria-hidden />
        {isPending ? "Signing In…" : "Sign In to Dashboard"}
      </Button>
    </form>
  );
}
