// Client-side preview reference code, format `HT-ENR-######` (mobile-04
// screenshot 23: "auto-generated code, format HT-ENR-######"). This is
// display-only convenience shown on Step 3's "Send payment to" panel before
// any submission — it is derived from the wizard's idempotency key, not
// persisted, and is NOT the record of a successful enrollment. Wave 3's real
// server action issues the authoritative reference code once a payment
// actually lands.
export function generateReferenceCode(idempotencyKey: string): string {
  const digits = idempotencyKey.replace(/[^0-9]/g, "");
  const seed = digits.length >= 6 ? digits.slice(0, 6) : idempotencyKey.slice(0, 6);
  const numeric = Array.from(seed)
    .map((char) => char.charCodeAt(0) % 10)
    .join("")
    .padEnd(6, "0")
    .slice(0, 6);
  return `HT-ENR-${numeric}`;
}
