"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { CheckCircle2, Circle, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

import { PASSWORD_RULES, signUpSchema, type SignUpValues } from "../enroll.schema";

interface StepSignUpProps {
  defaultValues: SignUpValues | null;
  onBack: () => void;
  onContinue: (values: SignUpValues) => void;
}

const DEFAULTS: SignUpValues = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
};

export function StepSignUp({ defaultValues, onBack, onContinue }: StepSignUpProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: defaultValues ?? DEFAULTS,
  });

  // useWatch (not the `watch()` function useForm() returns) so the React
  // Compiler can memoize this subscription safely — `watch()` is a plain
  // function reference RHF can't guarantee is stable across renders.
  const password = useWatch({ control, name: "password" }) ?? "";
  const confirmPassword = useWatch({ control, name: "confirmPassword" }) ?? "";

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onContinue)} noValidate>
      <div className="space-y-2 text-center">
        <Badge variant="outline" className="border-primary/40 text-primary">
          Step 2 of 5
        </Badge>
        <h2 className="font-heading text-2xl font-semibold text-foreground">Sign Up</h2>
        <p className="text-sm text-muted-foreground">
          Create your trainee account to continue.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="firstName" className="text-xs tracking-wide text-muted-foreground uppercase">
            First Name
          </Label>
          <Input id="firstName" placeholder="Juan" {...register("firstName")} />
          {errors.firstName ? (
            <p className="text-xs text-destructive">{errors.firstName.message}</p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="lastName" className="text-xs tracking-wide text-muted-foreground uppercase">
            Last Name
          </Label>
          <Input id="lastName" placeholder="Dela Cruz" {...register("lastName")} />
          {errors.lastName ? (
            <p className="text-xs text-destructive">{errors.lastName.message}</p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-xs tracking-wide text-muted-foreground uppercase">
            Email Address (@gmail.com)
          </Label>
          <Input id="email" type="email" placeholder="juan@gmail.com" {...register("email")} />
          {errors.email ? <p className="text-xs text-destructive">{errors.email.message}</p> : null}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="phone" className="text-xs tracking-wide text-muted-foreground uppercase">
            Phone Number
          </Label>
          <Input id="phone" placeholder="09XX-XXX-XXXX" {...register("phone")} />
          {errors.phone ? <p className="text-xs text-destructive">{errors.phone.message}</p> : null}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-xs tracking-wide text-muted-foreground uppercase">
            Password
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute top-1/2 right-2.5 -translate-y-1/2 text-muted-foreground"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label
            htmlFor="confirmPassword"
            className="text-xs tracking-wide text-muted-foreground uppercase"
          >
            Confirm Password
          </Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              {...register("confirmPassword")}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((v) => !v)}
              className="absolute top-1/2 right-2.5 -translate-y-1/2 text-muted-foreground"
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
            >
              {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          {errors.confirmPassword ? (
            <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
          ) : null}
        </div>

        <div className="rounded-xl border border-glass-border bg-surface-secondary/60 p-4">
          <ul className="space-y-1.5">
            {PASSWORD_RULES.map((rule) => {
              const satisfied = rule.test(password);
              return (
                <li
                  key={rule.key}
                  className={cn(
                    "flex items-center gap-2 text-sm",
                    satisfied ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  {satisfied ? (
                    <CheckCircle2 className="size-4" aria-hidden />
                  ) : (
                    <Circle className="size-4" aria-hidden />
                  )}
                  {rule.label}
                </li>
              );
            })}
            <li
              className={cn(
                "flex items-center gap-2 text-sm",
                confirmPassword.length > 0 && confirmPassword === password
                  ? "text-primary"
                  : "text-muted-foreground",
              )}
            >
              {confirmPassword.length > 0 && confirmPassword === password ? (
                <CheckCircle2 className="size-4" aria-hidden />
              ) : (
                <Circle className="size-4" aria-hidden />
              )}
              Passwords match
            </li>
          </ul>
        </div>

        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Sign in here
          </Link>
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button type="button" variant="outline" onClick={onBack}>
          <span aria-hidden>&larr;</span> Back
        </Button>
        <Button type="submit">
          Continue <span aria-hidden>&rarr;</span>
        </Button>
      </div>
    </form>
  );
}
