"use client";

import { useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, Download, Printer, ReceiptText, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import { downloadReceiptHtml } from "./receipt-download";
import {
  COMPANY_ADDRESS,
  COMPANY_NAME,
  getReceiptFields,
  type ReceiptData,
  type ReceiptField,
} from "./receipt-fields";
import type { EnrollPaymentMethod, EnrollProgram } from "../types";
import type { SignUpValues } from "../enroll.schema";

interface StepReceiptProps {
  referenceCode: string;
  trainee: SignUpValues;
  programs: EnrollProgram[];
  paymentMethod: EnrollPaymentMethod;
  totalCentavos: number;
  submittedAt: Date;
  onBack: () => void;
  onProceed: () => void;
}

function ReceiptRow({ label, value, valueClassName }: { label: string; value: string; valueClassName?: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-glass-border py-2.5 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={valueClassName ?? "text-sm font-semibold text-foreground"}>{value}</span>
    </div>
  );
}

/**
 * The print-only rendition of the receipt, portaled to a direct child of
 * `<body>` rather than rendered in place.
 *
 * It has to live there, not deep inside the wizard card, because of how
 * Chromium's PRINT pagination pass (not the normal screen compositor)
 * clips content: an ancestor collapsed for print with `height: 0` still
 * clips any `position: absolute` descendant along the paint tree during
 * pagination, even though that descendant's actual CSS containing block is
 * further up (e.g. `<body>`) and `getComputedStyle` on the live DOM still
 * reports it as visible — that mismatch between the screen compositor and
 * the print pipeline is exactly what made the first version of this fix
 * silently render a BLANK page (confirmed by inflating the generated PDF's
 * content stream: one opaque white-fill operator, zero `Tj`/`BT` text
 * operators — nothing was actually painted).
 *
 * Portaling sidesteps the whole problem: once this is a sibling of the
 * navbar/page content rather than nested inside it, `globals.css` only has
 * to hide `body`'s OTHER direct children with a plain `display: none` —
 * true removal from the render tree, not a clip-prone collapse — and this
 * block renders as an ordinary, un-positioned element in that empty flow.
 */
function ReceiptPrintPortal({
  companyName,
  companyAddress,
  fields,
  submittedAt,
}: {
  companyName: string;
  companyAddress: string;
  fields: ReceiptField[];
  submittedAt: Date;
}) {
  // `document.body` does not exist during SSR, and a portal target must be
  // resolved on the client only. useSyncExternalStore's server snapshot
  // (false) then client snapshot (true) gives that without the "setState
  // inside an effect" cascading-render pattern a plain useState+useEffect
  // mount flag would trigger.
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  if (!mounted) return null;

  return createPortal(
    <div id="enroll-receipt-print" className="hidden print:block">
      <p className="receipt-print-company">{companyName}</p>
      <p className="receipt-print-address">{companyAddress}</p>
      <p className="receipt-print-title">Official Receipt</p>
      <table>
        <tbody>
          {fields.map((field) => (
            <tr key={field.label}>
              <th scope="row">{field.label}</th>
              <td className={field.emphasis ? "receipt-print-emphasis" : undefined}>{field.value}</td>
            </tr>
          ))}
          <tr>
            <th scope="row">Date</th>
            <td>{submittedAt.toLocaleString("en-PH")}</td>
          </tr>
        </tbody>
      </table>
      <p className="receipt-print-note">
        This receipt confirms payment only. Enrollment is pending administrator verification
        before account access is granted.
      </p>
    </div>,
    document.body,
  );
}

/**
 * Step 4 "Payment Confirmed" receipt (desktop-01 #30-31, mobile-04 #26-29).
 * Presentational only. Reached after a real submission succeeds — see
 * submit-enrollment.ts and enroll-wizard.tsx, which only renders this step
 * once the server has confirmed the payment write.
 *
 * Renders three things from the one field list in receipt-fields.ts so they
 * cannot drift apart:
 *   1. The on-screen card (below), matching docs/screens exactly.
 *   2. A print-only block (`#enroll-receipt-print`), hidden on screen and
 *      shown only under `@media print` (globals.css) via `window.print()`.
 *   3. A standalone downloadable HTML file (receipt-download.ts).
 */
export function StepReceipt({
  referenceCode,
  trainee,
  programs,
  paymentMethod,
  totalCentavos,
  submittedAt,
  onBack,
  onProceed,
}: StepReceiptProps) {
  const receiptData: ReceiptData = {
    referenceCode,
    trainee,
    programs,
    paymentMethod,
    totalCentavos,
    submittedAt,
  };
  const fields = getReceiptFields(receiptData);

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <Badge variant="outline" className="border-primary/40 text-primary">
          Step 4 of 5
        </Badge>
        <h2 className="font-heading text-2xl font-semibold text-foreground">Payment Confirmed</h2>
        <p className="text-sm text-muted-foreground">
          Here is your official receipt — save a copy for your records.
        </p>
      </div>

      <div className="flex items-center gap-2.5 rounded-xl border border-primary/30 bg-primary/10 p-3.5 text-sm font-medium text-primary">
        <CheckCircle2 className="size-4 shrink-0" aria-hidden />
        Payment received successfully
      </div>

      <div className="rounded-2xl border border-glass-border bg-surface-secondary/60 p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-primary uppercase">
            <ReceiptText className="size-3.5" aria-hidden />
            Official Receipt
          </span>
          <span className="text-xs text-muted-foreground">
            {submittedAt.toLocaleDateString("en-PH")}
          </span>
        </div>

        {fields.map((field) => (
          <ReceiptRow
            key={field.label}
            label={field.label}
            value={field.value}
            valueClassName={field.emphasis ? "text-sm font-semibold text-primary" : undefined}
          />
        ))}
      </div>

      {/* Print-only render of the same fields, portaled to <body> — see
          ReceiptPrintPortal's doc comment for why. Shown by globals.css's
          `@media print` block, which hides `body`'s other direct children
          (navbar, page content, both buttons below) so `window.print()`
          produces one legible, black-on-white sheet instead of the whole
          dark-themed app. */}
      <ReceiptPrintPortal
        companyName={COMPANY_NAME}
        companyAddress={COMPANY_ADDRESS}
        fields={fields}
        submittedAt={submittedAt}
      />

      <div className="grid grid-cols-2 gap-3">
        <Button type="button" variant="outline" onClick={() => window.print()}>
          <Printer className="size-4" aria-hidden /> Print Receipt
        </Button>
        <Button type="button" variant="outline" onClick={() => downloadReceiptHtml(receiptData)}>
          <Download className="size-4" aria-hidden /> Download Receipt
        </Button>
      </div>

      <div className="flex gap-2.5 rounded-xl border border-primary/30 bg-primary/10 p-3.5 text-sm text-primary">
        <ShieldCheck className="mt-0.5 size-4 shrink-0" aria-hidden />
        Your payment has been recorded. Next, an administrator will verify your enrollment in
        real time before granting account access.
      </div>

      <Separator />

      <div className="grid grid-cols-2 gap-3">
        <Button type="button" variant="outline" onClick={onBack}>
          <span aria-hidden>&larr;</span> Back
        </Button>
        <Button type="button" onClick={onProceed}>
          Proceed to Verification <span aria-hidden>&rarr;</span>
        </Button>
      </div>
    </div>
  );
}
