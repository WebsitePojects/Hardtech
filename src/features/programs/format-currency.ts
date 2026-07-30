// Money formatting for PHP amounts stored as Prisma `Decimal`.
//
// Rule (see wave-1 contract): the schema stores money as `Decimal` — format
// it, never do float arithmetic on it. Every function below either operates
// on integer centavos (safe integer math) or converts a single Decimal to a
// display string in one shot. Nothing here sums floats.

const wholePhp = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const centsPhp = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Parses a canonical decimal string (e.g. "5000", "5000.00", "-12.3") into
 * integer centavos using string splitting only — no float parsing of the
 * combined value, so there is no float-rounding exposure.
 */
export function parseCentavos(decimalString: string): number {
  const trimmed = decimalString.trim();
  const negative = trimmed.startsWith("-");
  const unsigned = negative ? trimmed.slice(1) : trimmed;
  const [wholePart, fractionPart = ""] = unsigned.split(".");
  const cents = `${fractionPart}00`.slice(0, 2);
  const whole = Number.parseInt(wholePart || "0", 10);
  const centsValue = Number.parseInt(cents || "0", 10);
  const total = whole * 100 + centsValue;
  return negative ? -total : total;
}

/**
 * Converts a Prisma `Decimal` (or anything with the same `toFixed` shape) to
 * integer centavos via its exact string form. Structural typing keeps this
 * module free of a runtime dependency on the Prisma Decimal class.
 */
export function decimalToCentavos(decimal: { toFixed(dp: number): string }): number {
  return parseCentavos(decimal.toFixed(2));
}

/** Sums integer centavos. Safe integer addition — never floats. */
export function sumCentavos(values: readonly number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

/**
 * Formats integer centavos as PHP currency, e.g. `formatCentavos(500000)` ->
 * "₱5,000" or, with `showCents`, "₱5,000.00".
 */
export function formatCentavos(
  centavos: number,
  options: { showCents?: boolean } = {},
): string {
  const amount = centavos / 100;
  return options.showCents ? centsPhp.format(amount) : wholePhp.format(amount);
}
