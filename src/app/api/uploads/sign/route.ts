import { NextResponse } from "next/server";

import { getSession } from "@/server/auth/session";
import { checkRateLimit } from "@/server/auth/rate-limit";
import { signUploadRequestSchema } from "@/server/schemas/media.schema";
import { requestUploadTicket } from "@/server/services/media-upload.service";

/**
 * Mints a signed, time-boxed ticket for a direct-to-Cloudinary browser
 * upload. See src/server/storage/signed-upload.ts for why the browser
 * uploads directly to Cloudinary rather than routing the file through this
 * server.
 *
 * Rate-limited per session (rule 5: "rate-limit auth" — the same risk shape
 * applies here even though this isn't a login endpoint): an unlimited
 * signing endpoint is a free signature oracle. Every call mints a fresh,
 * valid Cloudinary signature at no cost beyond a database write, so without
 * a cap a signed-in account could mint them as fast as the network allows.
 *
 * Generic errors only, no stack traces to the client — anything unexpected
 * (e.g. Cloudinary env vars absent) collapses to a single 503, never a
 * propagated error message or stack (rule 6).
 */
export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  const rateLimit = await checkRateLimit(`uploads:sign:${session.userId}`);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many upload requests. Please wait a moment and try again." },
      { status: 429 },
    );
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = signUploadRequestSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  let result;
  try {
    result = await requestUploadTicket({
      ...parsed.data,
      actorId: session.userId,
      actorRole: session.role,
    });
  } catch {
    return NextResponse.json(
      { error: "Upload service unavailable. Please try again later." },
      { status: 503 },
    );
  }

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ ticket: result.ticket, mediaAssetId: result.mediaAssetId });
}
