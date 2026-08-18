// Relative "age" strings for the conversation list and thread timestamps.
// Deliberately not imported from src/features/forum/format-age.ts — features
// do not import each other's internals (10-architecture.md), and this needs
// a slightly different presentation (clock time once a message is a day old,
// vs. forum's whole-days-forever style).
export function formatRelativeTime(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60_000);

  if (diffMinutes < 1) return "now";
  if (diffMinutes < 60) return `${diffMinutes}m`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d`;

  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

/** Full timestamp for a message bubble's tooltip/aria-label. */
export function formatFullTimestamp(date: Date): string {
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
