export function formatDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function formatDisplayDate(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
}

export function formatFileSize(bytes: number): string {
  const megabytes = bytes / (1024 * 1024);
  if (megabytes >= 10) return `${Math.round(megabytes)} MB`;
  return `${megabytes.toFixed(1)} MB`;
}
