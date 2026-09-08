import { NextResponse } from "next/server";

import { purgeDueAssets } from "@/server/services/media-purge.service";
import { verifyCronSecret } from "../verify-cron-secret";

/**
 * Drains the Cloudinary deletion outbox. An owner's own delete transaction
 * only ever flips its MediaAsset rows to PENDING (see
 * media-purge.service.ts's module doc comment) — nothing else in this app
 * ever calls `purgeDueAssets`. Without this route the outbox never drains
 * and every deleted gallery photo, announcement attachment, or forum upload
 * leaks in Cloudinary forever (rule 7: no fire-and-forget side effects).
 *
 * Triggered by Vercel Cron daily at 03:00 UTC (see vercel.json). Vercel Cron
 * issues a GET request carrying `Authorization: Bearer $CRON_SECRET` when
 * CRON_SECRET is set as a project environment variable, so only GET is
 * implemented here — Next's route handler returns 405 automatically for any
 * HTTP method this file does not export (verified against the existing
 * single-method routes under src/app/api/uploads/**, which rely on the same
 * behaviour rather than hand-rolling a 405 branch).
 */
export async function GET(request: Request) {
  if (!verifyCronSecret(request)) {
    // Same response whether CRON_SECRET is unconfigured or the header is
    // wrong or missing — rule 3 (fail closed) and rule 6 (never reveal which
    // check failed), mirroring /api/uploads/webhook's shape for a bad
    // signature.
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  try {
    // Bounded defaults for one cron tick, not tunable by the caller:
    //   - limit: 50 keeps one invocation well inside a serverless function's
    //     time budget even if every claimed row needs a real Cloudinary
    //     round-trip.
    //   - leaseSeconds: 120 gives a claimed row enough room to finish a
    //     destroy call and its DB write before the lease could expire and
    //     let a second worker reclaim it mid-flight.
    //   - maxAttempts: 5, combined with backoffSeconds' cap of one hour and
    //     this route's daily schedule, bounds a sustained provider outage
    //     to a handful of retries before a row is abandoned to terminal
    //     FAILED rather than retried forever.
    const result = await purgeDueAssets({ limit: 50, leaseSeconds: 120, maxAttempts: 5 });
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    // Log the real error server-side for operability — this route has no
    // untrusted caller once auth passes — but the response body never
    // carries internals (rule 6).
    console.error("[cron/purge-assets] purge run failed", error);
    return NextResponse.json({ error: "Purge run failed." }, { status: 500 });
  }
}
