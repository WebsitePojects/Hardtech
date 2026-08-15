import { NextResponse } from "next/server";

import { reapStaleUploads } from "@/server/services/media-purge.service";
import { verifyCronSecret } from "../verify-cron-secret";

/**
 * Reaps abandoned upload reservations. A signed upload ticket
 * (`/api/uploads/sign`) reserves a MediaAsset row before the browser has
 * actually uploaded anything; if the browser never finishes (tab closed,
 * network drop, user gave up), that row sits RESERVED forever unless
 * something moves it into the same PENDING purge queue `purgeDueAssets`
 * drains. Nothing else in this app calls `reapStaleUploads` — see
 * media-purge.service.ts's module doc comment.
 *
 * Triggered by Vercel Cron hourly (see vercel.json) — slower than the purge
 * drain because a stale reservation is not urgent, unlike an already-deleted
 * owner row. Same GET + `Authorization: Bearer $CRON_SECRET` convention as
 * /api/cron/purge-assets; see verify-cron-secret.ts for the shared check.
 * Only GET is implemented — Next returns 405 automatically for any other
 * method on this file.
 */
export async function GET(request: Request) {
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  try {
    // olderThanMinutes: 60 — an upload ticket is short-lived by design (see
    // requestUploadTicket); an hour idle is well past any legitimate
    // in-flight upload, even a large training video on a slow connection.
    // limit: 200 — this is a pure DB update with no Cloudinary network call
    // per row (see reapStaleReservations), so a larger batch is cheap, and
    // an hourly cadence means a batch this size comfortably drains whatever
    // accumulated since the last run.
    const result = await reapStaleUploads({ olderThanMinutes: 60, limit: 200 });
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("[cron/reap-uploads] reap run failed", error);
    return NextResponse.json({ error: "Reap run failed." }, { status: 500 });
  }
}
