import { z } from "zod";

export const enrollmentSubmissionSchema = z.object({
  idempotencyKey: z.string().trim().min(1).max(200),
  programIds: z.array(z.string().trim().min(1)).min(1).max(3),
  trainee: z.object({
    firstName: z.string().trim().min(1).max(100),
    lastName: z.string().trim().min(1).max(100),
    email: z.string().trim().toLowerCase().email().max(320),
    phone: z.string().trim().min(1).max(30),
    password: z.string().min(8).max(200),
    confirmPassword: z.string().min(8).max(200),
  }).refine((value) => value.password === value.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  }),
  paymentMethod: z.enum(["GCASH", "MAYA", "BANK_TRANSFER", "CARD"]),
  proof: z.instanceof(File)
    .refine((file) => file.size <= 5 * 1024 * 1024, "File must be 5 MB or smaller.")
    .refine((file) => file.type === "image/png" || file.type === "image/jpeg", "Upload a PNG or JPG file."),
});

export type EnrollmentSubmissionInput = z.infer<typeof enrollmentSubmissionSchema>;
