// Single source of truth for what a receipt shows. The on-screen card, the
// print stylesheet's printable region, and the standalone downloadable HTML
// file all render the SAME field list from here — so adding, renaming, or
// reordering a receipt field never has to happen in three places and cannot
// drift between the versions.
import { OFFICES } from "@/features/contact/offices";
import { formatCentavos } from "@/features/programs/format-currency";

import type { EnrollPaymentMethod, EnrollProgram } from "../types";
import type { SignUpValues } from "../enroll.schema";

export interface ReceiptData {
  referenceCode: string;
  trainee: SignUpValues;
  programs: EnrollProgram[];
  paymentMethod: EnrollPaymentMethod;
  totalCentavos: number;
  submittedAt: Date;
}

export interface ReceiptField {
  label: string;
  value: string;
  /** Marks the handful of fields the design renders in bold/primary. */
  emphasis: boolean;
}

export const COMPANY_NAME = "HardTech IT Corp";

// Reuses the address already declared for the contact page rather than
// hardcoding a second copy that can drift from it.
const MAIN_OFFICE = OFFICES.find((office) => office.id === "main");
export const COMPANY_ADDRESS = MAIN_OFFICE?.addressFull ?? "";

// A receipt is a financial record, not a confirmation of enrollment. Payment
// has landed; an administrator still has to verify the enrollment before it
// is real. Every surface that renders the receipt must say exactly this and
// nothing stronger.
export const RECEIPT_STATUS_LABEL = "PAID — Pending Verification";
export const RECEIPT_STATUS_NOTE =
  "This receipt confirms payment only. Enrollment is pending administrator verification before account access is granted.";

export function getReceiptFields(data: ReceiptData): ReceiptField[] {
  return [
    { label: "Reference No.", value: data.referenceCode, emphasis: true },
    {
      label: "Trainee",
      value: `${data.trainee.firstName} ${data.trainee.lastName}`,
      emphasis: false,
    },
    { label: "Email", value: data.trainee.email, emphasis: false },
    { label: "Phone", value: data.trainee.phone, emphasis: false },
    {
      label: "Program",
      value: data.programs.map((program) => program.name).join(" + "),
      emphasis: false,
    },
    {
      label: "Schedule",
      value: data.programs.map((program) => program.scheduleLabel).join(" / "),
      emphasis: false,
    },
    { label: "Payment Method", value: data.paymentMethod.displayName, emphasis: false },
    {
      label: "Amount Paid",
      value: formatCentavos(data.totalCentavos, { showCents: true }),
      emphasis: true,
    },
    { label: "Status", value: RECEIPT_STATUS_LABEL, emphasis: true },
  ];
}
