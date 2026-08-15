import { timingSafeEqual } from "node:crypto";

/**
 * Constant-time shared-secret check for the two cron-triggered routes under
 * this directory (`purge-assets`, `reap-uploads`).
 *
 * Vercel Cron Jobs issue a GET request with `Authorization: Bearer
 * $CRON_SECRET` whenever `CRON_SECRET` is set as a project environment
 * variable — that is the exact header this checks, so no separate
 * `x-cron-secret` convention is needed.
 *
 * Fails closed in every direction, and deliberately returns the same
 * `false` for all of them so a caller cannot distinguish one failure mode
 * from another (rule 3: fail closed: rule 6: never reveal which check
 * failed) — mirrors the shape of `verifyWebhookSignature` in
 * `src/server/storage/signed-upload.ts`:
 *   - `CRON_SECRET` is not configured in the environment at all.
 *   - The `Authorization` header is missing.
 *   - The header does not use the `Bearer ` scheme.
 *   - The provided secret does not match, compared in constant time.
 *
 * Never call this and then log or return the header value — it is exactly
 * as sensitive as the secret it is compared against (rule 6).
 */
export function verifyCronSecret(request: Request): boolean {
  const configured = process.env.CRON_SECRET;
  if (!configured) return false;

  const header = request.headers.get("authorization");
  if (!header) return false;

  const scheme = "Bearer ";
  if (!header.startsWith(scheme)) return false;
  const provided = header.slice(scheme.length);

  const providedBuffer = Buffer.from(provided);
  const expectedBuffer = Buffer.from(configured);

  // timingSafeEqual throws on mismatched lengths rather than returning
  // false, so an attacker-controlled length must be handled first (same
  // guard verifyWebhookSignature uses).
  if (providedBuffer.length !== expectedBuffer.length) return false;

  return timingSafeEqual(providedBuffer, expectedBuffer);
}
