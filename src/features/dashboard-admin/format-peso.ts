/**
 * Compact peso formatting for admin stat tiles — docs/screens/desktop-02.md
 * #2 ("₱10.0k" Revenue MTD) and #3 ("₱15.0k" Total Verified) both use a
 * one-decimal "k" suffix once the amount reaches four figures, while
 * screenshot #3's per-enrollment amounts stay uncompacted ("₱5,000").
 * `AdminOverviewStats.revenueMtd` (src/server/services/dashboard.service.ts)
 * is already in whole pesos, not centavos, so this takes a plain number.
 */
export function formatPesoCompact(amount: number): string {
  if (amount >= 1000) {
    return `₱${(amount / 1000).toFixed(1)}k`;
  }
  return `₱${amount.toLocaleString("en-PH")}`;
}
