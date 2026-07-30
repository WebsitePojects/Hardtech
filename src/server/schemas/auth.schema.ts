import { z } from "zod";

/**
 * Boundary validation for every AUTH input (.claude/rules/00-non-negotiables.md
 * rule 4: "Validate at the boundary"). Server actions in src/app/(auth)/**
 * parse `unknown` through these schemas before touching anything else —
 * parse, don't cast.
 */

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Enter your email address.")
    .email("Enter a valid email address."),
  // Length-bounded only, never a strength check: in demo mode the password
  // content is ignored entirely (see verifyDemoCredentials). The bound just
  // stops pathologically large request bodies, not weak-password rejection.
  password: z.string().min(1, "Enter your password.").max(200),
  rememberMe: z.boolean().optional().default(false),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Enter your email address.")
    .email("Enter a valid email address."),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
