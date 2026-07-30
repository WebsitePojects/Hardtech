// Zod schemas for every /enroll boundary. Defined in this feature folder, not
// src/server/schemas/, per the ROUTES-B brief — that directory is DATA's and
// there is no server action for these to guard yet in wave 1. Parse, never
// cast, per .claude/rules/00-non-negotiables.md rule 4.
import { z } from "zod";

// -- Step 1: Select Plan -----------------------------------------------------

export const planSelectionSchema = z.object({
  programIds: z
    .array(z.string().min(1))
    .min(1, { message: "Select at least one program to continue." }),
});
export type PlanSelectionValues = z.infer<typeof planSelectionSchema>;

// -- Step 2: Sign Up ----------------------------------------------------------

const PASSWORD_RULES = [
  { key: "length", label: "At least 8 characters", test: (v: string) => v.length >= 8 },
  { key: "uppercase", label: "One uppercase letter (A–Z)", test: (v: string) => /[A-Z]/.test(v) },
  { key: "lowercase", label: "One lowercase letter (a–z)", test: (v: string) => /[a-z]/.test(v) },
  { key: "number", label: "One number (0–9)", test: (v: string) => /[0-9]/.test(v) },
  {
    key: "special",
    label: "One special character (!@#$...)",
    test: (v: string) => /[!@#$%^&*(),.?":{}|<>_\-+=~`[\]\\/;']/.test(v),
  },
] as const;

/** Exported so Step 2's live checklist renders the exact same rule set the schema enforces. */
export { PASSWORD_RULES };

export const signUpSchema = z
  .object({
    firstName: z.string().trim().min(1, { message: "First name is required." }),
    lastName: z.string().trim().min(1, { message: "Last name is required." }),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email({ message: "Enter a valid email address." })
      .refine((value) => value.endsWith("@gmail.com"), {
        message: "Email must be a @gmail.com address.",
      }),
    phone: z
      .string()
      .trim()
      .regex(/^09\d{2}-?\d{3}-?\d{4}$/, {
        message: "Enter a valid PH mobile number (09XX-XXX-XXXX).",
      }),
    password: z.string().superRefine((value, ctx) => {
      for (const rule of PASSWORD_RULES) {
        if (!rule.test(value)) {
          ctx.addIssue({ code: "custom", message: rule.label });
        }
      }
    }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords match",
    path: ["confirmPassword"],
  });
export type SignUpValues = z.infer<typeof signUpSchema>;

// -- Step 3: Payment ----------------------------------------------------------

export const PAYMENT_METHOD_VALUES = ["GCASH", "MAYA", "BANK_TRANSFER", "CARD"] as const;

export const paymentSelectionSchema = z.object({
  paymentMethod: z.enum(PAYMENT_METHOD_VALUES, {
    error: "Select a payment method to continue.",
  }),
  proof: z
    .instanceof(File, { message: "Upload a screenshot or photo of your payment receipt." })
    .refine((file) => file.size <= 5 * 1024 * 1024, {
      message: "File must be 5 MB or smaller.",
    })
    .refine((file) => ["image/png", "image/jpeg"].includes(file.type), {
      message: "Upload a PNG or JPG file.",
    }),
});
export type PaymentSelectionValues = z.infer<typeof paymentSelectionSchema>;
