import { NextResponse } from "next/server";

import { parseWebhookPayload, verifyWebhookSignature } from "@/server/storage/signed-upload";
import { applyUploadWebhook } from "@/server/services/media-upload.service";

/**
 * Cloudinary's own notification that an upload landed — the authoritative
 * confirmation this app trusts (see applyUploadWebhook's doc comment). No
 * session here: the signature over the raw body IS the authentication
 * (rule 5).
 *
 * Reads the body as text and verifies the signature against THAT EXACT
 * string before doing anything else. Never `request.json()` first — parsing
 * then re-serializing can reorder keys or change whitespace, which changes
 * the hash even though the payload's "meaning" is unchanged (rule 5: "HMAC
 * over the exact raw bytes").
 */
export async function POST(request: Request) {
  const rawBody = await request.text();
  const timestamp = request.headers.get("x-cld-timestamp");
  const signature = request.headers.get("x-cld-signature");

  if (!timestamp || !signature || !verifyWebhookSignature({ rawBody, timestamp, signature })) {
    // Generic body, nothing about which check failed, nothing about the
    // payload logged (rule 6) — a missing header, an expired timestamp, and
    // a genuine hash mismatch all collapse to the same response.
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  const payload = parseWebhookPayload(rawBody);
  if (!payload) {
    // Signature-valid but a shape this app does not recognise (a future
    // Cloudinary notification type, malformed payload, etc). Acknowledge
    // anyway so Cloudinary stops retrying something this app was never
    // going to be able to parse — there is nothing to act on.
    return NextResponse.json({ ok: true });
  }

  try {
    await applyUploadWebhook(payload);
  } catch {
    // A real processing failure (e.g. the database is unreachable). Ask
    // Cloudinary to retry later rather than acknowledging work that never
    // actually happened, and never surface the underlying error to a
    // response body (rule 6).
    return NextResponse.json({ error: "Could not process notification." }, { status: 500 });
  }

  // Valid webhook for an unknown public_id also lands here as a no-op
  // inside applyUploadWebhook — 200 either way, since there is nothing to
  // act on and nothing to gain by distinguishing "unknown" from "applied"
  // to a third party.
  return NextResponse.json({ ok: true });
}
