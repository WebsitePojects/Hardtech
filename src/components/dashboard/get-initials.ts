/**
 * Two-letter initials for the sidebar avatar circle, matching the
 * colored-initials pattern used throughout the dashboard screenshots
 * ("AD", "HL", "CR", "MS", ...). Pure string helper, no I/O.
 */
export function getInitials(name: string): string {
  const parts = name
    .trim()
    .replace(/^(?:Mr|Mrs|Ms|Dr|Engr)\.?\s+/i, "")
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) return "";
  if (parts.length === 1) {
    const word = parts[0] ?? "";
    return word.slice(0, 2).toUpperCase();
  }

  return `${parts[0]?.[0] ?? ""}${parts.at(-1)?.[0] ?? ""}`.toUpperCase();
}
