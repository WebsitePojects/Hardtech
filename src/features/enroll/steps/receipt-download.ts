// Builds a self-contained HTML file of the receipt (all styles inlined, no
// external requests) and triggers a browser download for it. Kept separate
// from receipt-fields.ts (data) and step-receipt.tsx (on-screen render) so
// each module has exactly one reason to change: this one only changes if the
// downloadable artifact's markup or styling changes.
import {
  COMPANY_ADDRESS,
  COMPANY_NAME,
  RECEIPT_STATUS_NOTE,
  getReceiptFields,
  type ReceiptData,
} from "./receipt-fields";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Renders the receipt as a standalone HTML document: inline `<style>` only,
 * no external stylesheet, font, or script — it must open and print correctly
 * offline. Sized as a narrow receipt column on A4 (see globals.css's
 * `@media print` block for the reasoning) so it matches what printing
 * directly from the app produces.
 */
export function buildReceiptHtmlDocument(data: ReceiptData): string {
  const fields = getReceiptFields(data);
  const rows = fields
    .map(
      (field) => `
        <tr>
          <th scope="row">${escapeHtml(field.label)}</th>
          <td${field.emphasis ? ' class="emphasis"' : ""}>${escapeHtml(field.value)}</td>
        </tr>`,
    )
    .join("");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>HardTech Receipt ${escapeHtml(data.referenceCode)}</title>
<style>
  @page { size: A4; margin: 15mm; }
  * { box-sizing: border-box; }
  html, body {
    margin: 0;
    padding: 0;
    background: #ffffff;
    color: #111111;
    font-family: Arial, Helvetica, sans-serif;
  }
  .receipt {
    width: 80mm;
    margin: 24px auto;
    padding: 16px 18px;
    border: 1px solid #cccccc;
  }
  .company {
    text-align: center;
    margin-bottom: 12px;
  }
  .company .name {
    font-size: 15px;
    font-weight: 700;
    margin: 0;
  }
  .company .address {
    font-size: 10px;
    color: #444444;
    margin: 2px 0 0;
  }
  .title {
    text-align: center;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin: 10px 0;
    border-top: 1px dashed #999999;
    border-bottom: 1px dashed #999999;
    padding: 6px 0;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 11px;
  }
  th, td {
    text-align: left;
    padding: 4px 0;
    border-bottom: 1px solid #e5e5e5;
    font-weight: 400;
  }
  th {
    color: #555555;
    white-space: nowrap;
    padding-right: 10px;
  }
  td {
    text-align: right;
    width: 100%;
  }
  td.emphasis {
    font-weight: 700;
  }
  .note {
    margin-top: 12px;
    font-size: 9.5px;
    line-height: 1.4;
    color: #333333;
  }
  .footer {
    margin-top: 10px;
    font-size: 9px;
    color: #777777;
    text-align: center;
  }
</style>
</head>
<body>
  <div class="receipt">
    <div class="company">
      <p class="name">${escapeHtml(COMPANY_NAME)}</p>
      <p class="address">${escapeHtml(COMPANY_ADDRESS)}</p>
    </div>
    <p class="title">Official Receipt</p>
    <table>
      <tbody>${rows}
      </tbody>
    </table>
    <p class="note">${escapeHtml(RECEIPT_STATUS_NOTE)}</p>
    <p class="footer">Downloaded ${escapeHtml(new Date().toLocaleString("en-PH"))}</p>
  </div>
</body>
</html>
`;
}

/**
 * Triggers a browser download of the receipt as a standalone HTML file via a
 * Blob + object URL. The object URL is revoked immediately after the click
 * fires — a leaked blob URL holds the whole document in memory.
 */
export function downloadReceiptHtml(data: ReceiptData): void {
  const html = buildReceiptHtmlDocument(data);
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);

  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `HT-receipt-${data.referenceCode}.html`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);

  URL.revokeObjectURL(url);
}
