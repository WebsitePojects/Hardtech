// Plain, serializable shapes passed from the /enroll server component into
// the "use client" wizard. Prisma's `Decimal` (Program.priceAmount) is a
// class instance and does not survive the server/client boundary cleanly, so
// the page converts it to integer centavos before handing data down — see
// src/features/programs/format-currency.ts.
import type { PaymentMethod } from "@/../generated/prisma/enums";

export interface EnrollProgram {
  id: string;
  name: string;
  durationLabel: string;
  scheduleLabel: string;
  priceCentavos: number;
  iconName: string | null;
  accentColor: string | null;
  curriculumTopics: string[];
}

export interface EnrollPaymentMethod {
  method: PaymentMethod;
  displayName: string;
  note: string | null;
  accountNumber: string | null;
  accountName: string | null;
  bankName: string | null;
}
