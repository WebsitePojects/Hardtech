import { headers } from "next/headers";

/**
 * Best-effort client IP for rate-limiting (rule 5: "rate-limit auth"). Next's
 * Server Actions don't expose the raw request/socket, so this reads the
 * `x-forwarded-for` header a reverse proxy sets, falling back to
 * `x-real-ip`, falling back to a constant bucket if neither is present (e.g.
 * plain `next dev` with no proxy in front of it — every request shares one
 * bucket locally, which is fine for a dev box and never happens in a real
 * deployment sitting behind a load balancer/CDN).
 *
 * `x-forwarded-for` can contain a client-supplied list of comma-separated
 * hops; only the first entry (closest to the client) is used, and it is not
 * itself trusted as an identity — it only keys an in-memory counter.
 */
export async function getClientIp(): Promise<string> {
  const headerList = await headers();

  const forwardedFor = headerList.get("x-forwarded-for");
  if (forwardedFor) {
    const first = forwardedFor.split(",")[0]?.trim();
    if (first) return first;
  }

  const realIp = headerList.get("x-real-ip");
  if (realIp) return realIp.trim();

  return "unknown";
}
