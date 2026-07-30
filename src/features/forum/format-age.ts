// Relative "age" strings for forum posts/replies, e.g. "434d ago" (every
// example in docs/screens/desktop-01.md #11-13 and desktop-02.md #28-31 is
// phrased in whole days). Falls back to hours/minutes for content newer than
// a day, since the seed data will not always be a year old.
export function formatPostAge(createdAt: string | Date): string {
  const created = typeof createdAt === "string" ? new Date(createdAt) : createdAt;
  const diffMs = Date.now() - created.getTime();
  const diffMinutes = Math.floor(diffMs / 60_000);

  if (diffMinutes < 1) return "just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}
