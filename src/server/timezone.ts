export const DEFAULT_USER_TIMEZONE = "Asia/Manila";

/**
 * Validate and normalize an IANA timezone. The browser may provide this value,
 * but the server treats it as untrusted input and falls back safely.
 */
export function normalizeIanaTimeZone(value: unknown): string {
  if (typeof value !== "string") return DEFAULT_USER_TIMEZONE;
  const trimmed = value.trim();
  if (trimmed.length < 1 || trimmed.length > 64) return DEFAULT_USER_TIMEZONE;

  try {
    // Intl throws RangeError for unknown zones. Formatting a fixed date avoids
    // depending on the current instant while still exercising the runtime's
    // canonical timezone database.
    new Intl.DateTimeFormat("en-US", { timeZone: trimmed }).format(new Date("2026-01-01T00:00:00.000Z"));
    return trimmed;
  } catch {
    return DEFAULT_USER_TIMEZONE;
  }
}

export function isValidIanaTimeZone(value: string): boolean {
  return normalizeIanaTimeZone(value) === value.trim();
}
