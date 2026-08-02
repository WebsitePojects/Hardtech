import { createHash, randomBytes } from "node:crypto";

import { Prisma } from "@/../generated/prisma/client";
import type { PaymentMethod } from "@/../generated/prisma/enums";

import { enrollmentPaymentRepository } from "@/server/repositories/enrollment-payment.repository";
import { enrollmentRepository } from "@/server/repositories/enrollment.repository";

export interface EnrollmentServiceInput {
  idempotencyKey: string;
  programIds: string[];
  trainee: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
  };
  paymentMethod: PaymentMethod;
  proofImageUrl: string;
}

export interface EnrollmentServiceResult {
  paymentId: string;
  referenceCode: string;
  totalAmount: string;
  enrollmentIds: string[];
}

function passwordHash(password: string): string {
  return createHash("sha256").update(password).digest("hex");
}

function referenceCode(): string {
  return `HT-ENR-${randomBytes(4).toString("hex").toUpperCase()}`;
}

export async function submitEnrollment(input: EnrollmentServiceInput): Promise<EnrollmentServiceResult> {
  const normalizedEmail = input.trainee.email.trim().toLowerCase();
  const programs = await enrollmentRepository.findProgramsByIds(input.programIds);
  if (programs.length !== input.programIds.length) throw new Error("One or more programs are unavailable.");

  const uniqueProgramIds = new Set(input.programIds);
  if (uniqueProgramIds.size !== input.programIds.length) throw new Error("Duplicate programs are not allowed.");

  const totalAmount = programs.reduce(
    (total, program) => total.add(program.priceAmount),
    new Prisma.Decimal(0),
  );
  const user = await enrollmentRepository.findOrCreateApplicant({
    email: normalizedEmail,
    firstName: input.trainee.firstName.trim(),
    lastName: input.trainee.lastName.trim(),
    phone: input.trainee.phone.trim(),
    passwordHash: passwordHash(input.trainee.password),
  });

  try {
    const created = await enrollmentPaymentRepository.createWithEnrollments({
      traineeId: user.id,
      idempotencyKey: input.idempotencyKey,
      referenceCode: referenceCode(),
      paymentMethod: input.paymentMethod,
      totalAmount,
      proofImageUrl: input.proofImageUrl,
      programs: programs.map((program) => ({ id: program.id, priceAmount: program.priceAmount })),
    });
    return {
      paymentId: created.id,
      referenceCode: created.referenceCode,
      totalAmount: created.totalAmount.toString(),
      enrollmentIds: created.enrollments.map((enrollment) => enrollment.id),
    };
  } catch (error) {
    if (!isUniqueViolation(error)) throw error;
    const existing = await enrollmentPaymentRepository.findByIdempotencyKey(input.idempotencyKey);
    if (!existing) throw new Error("Enrollment could not be replayed.");
    return {
      paymentId: existing.id,
      referenceCode: existing.referenceCode,
      totalAmount: existing.totalAmount.toString(),
      enrollmentIds: existing.enrollments.map((enrollment) => enrollment.id),
    };
  }
}

function isUniqueViolation(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}
