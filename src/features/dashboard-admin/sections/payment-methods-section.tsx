import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { PaymentMethodCard, type PaymentMethodFieldConfig } from "../components/payment-method-card";
import { DataNotConnectedNote } from "../components/data-not-connected-note";

/** The 4 payment methods (schema.prisma PaymentMethod enum) and their
 * per-method field set, transcribed from desktop-02.md #12 /
 * mobile-05.md #21-24. Method identity + field layout is structural; the
 * saved values inside each field are not (see PaymentMethodCard). */
const PAYMENT_METHOD_CONFIGS: PaymentMethodFieldConfig[] = [
  { method: "GCASH", displayName: "GCash", numberFieldLabel: "Number", hasSeparateAccountNumber: false },
  { method: "MAYA", displayName: "Maya", numberFieldLabel: "Number", hasSeparateAccountNumber: false },
  {
    method: "BANK_TRANSFER",
    displayName: "Bank Transfer",
    numberFieldLabel: "Bank",
    hasSeparateAccountNumber: true,
  },
  {
    method: "CARD",
    displayName: "Credit / Debit Card",
    numberFieldLabel: null,
    hasSeparateAccountNumber: false,
  },
];

/**
 * "Payment Methods" (desktop-02.md #12, mobile-05.md #21-24).
 */
export function PaymentMethodsSection() {
  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title="Payment Methods"
        description="Update the numbers, account names, and details that appear in the enrollment payment page. Changes apply instantly."
      />

      <DataNotConnectedNote detail="Saved payment-method values have no service read yet — fields below start blank." />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {PAYMENT_METHOD_CONFIGS.map((config) => (
          <PaymentMethodCard key={config.method} config={config} />
        ))}
      </div>
    </div>
  );
}
