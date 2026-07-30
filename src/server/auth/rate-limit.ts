/**
 * Fixed-window rate limiter for auth endpoints (rule 5: "rate-limit auth").
 *
 * THIS IS AN IN-MEMORY, SINGLE-PROCESS LIMITER. It is acceptable for this
 * wave because the dev/staging target is one Next.js server process. It is
 * NOT acceptable for a real production deployment: every server instance
 * (and every cold start / redeploy) gets its own empty `Map`, so a limit of
 * 5 attempts/minute becomes 5 × (number of instances) attempts/minute, and a
 * restart resets everyone's counter to zero. Production needs a shared store
 * (Redis/Upstash, or the platform's own edge rate limiter) keyed the same
 * way (bucket key -> count + window start), swapped in behind the same
 * `checkRateLimit` signature so callers don't change.
 */

interface Window {
  count: number;
  windowStartMs: number;
}

const WINDOW_MS = 60_000;
const MAX_ATTEMPTS_PER_WINDOW = 5;

const buckets = new Map<string, Window>();

// Cheap unbounded-growth guard for the in-memory Map: if it somehow
// accumulates far more distinct keys than any real dev/staging session would
// produce, drop the oldest-looking entries rather than leak memory forever.
// Not a concern for the shared store this becomes in production.
const MAX_TRACKED_KEYS = 10_000;

export interface RateLimitResult {
  allowed: boolean;
  retryAfterMs: number;
}

export function checkRateLimit(key: string): RateLimitResult {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || now - existing.windowStartMs >= WINDOW_MS) {
    buckets.set(key, { count: 1, windowStartMs: now });
    if (buckets.size > MAX_TRACKED_KEYS) {
      const oldestKey = buckets.keys().next().value;
      if (oldestKey !== undefined) buckets.delete(oldestKey);
    }
    return { allowed: true, retryAfterMs: 0 };
  }

  if (existing.count >= MAX_ATTEMPTS_PER_WINDOW) {
    return {
      allowed: false,
      retryAfterMs: existing.windowStartMs + WINDOW_MS - now,
    };
  }

  existing.count += 1;
  return { allowed: true, retryAfterMs: 0 };
}
