import { NextResponse } from "next/server";

import { getSession } from "@/server/auth/session";
import { confirmUploadRequestSchema } from "@/server/schemas/media.schema";
import { confirmUpload } from "@/server/services/media-upload.service";

/**
 * The browser's optimistic report that its direct-to-Cloudinary upload
 * landed, called immediately after that upload resolves so the UI can show
 * the file without waiting on Cloudinary's async webhook. Not the
 * authoritative confirmation — see confirmUpload's own doc comment for why,
 * and /api/uploads/webhook for the authoritative path.
 */
export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = confirmUploadRequestSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  let result;
  try {
    result = await confirmUpload({ ...parsed.data, actorId: session.userId });
  } catch {
    return NextResponse.json(
      { error: "Could not confirm upload. Please try again." },
      { status: 500 },
    );
  }

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
