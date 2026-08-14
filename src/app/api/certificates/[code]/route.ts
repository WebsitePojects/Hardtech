import { NextResponse } from "next/server";

import { getSession } from "@/server/auth/session";
import { certificateCodeSchema } from "@/server/schemas/certificate.schema";
import { getIssuedCertificateForViewer } from "@/server/services/certificate-download.service";

/**
 * Serves the certificate document itself.
 *
 * Renders on demand rather than requiring the Cloudinary copy to exist. That
 * keeps the feature working before storage is configured, and makes Cloudinary
 * what it should be — a CDN and an archive — instead of a hard dependency
 * standing between a graduate and their certificate.
 *
 * Unlike /verify/[code], this is NOT public. The verification page confirms a
 * credential is real and shows only the name, programme and date; this returns
 * the printable artefact, so it requires a session and checks ownership.
 */
export async function GET(
  _request: Request,
  context: RouteContext<"/api/certificates/[code]">,
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  const { code } = await context.params;
  const parsed = certificateCodeSchema.safeParse(code);
  if (!parsed.success) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const result = await getIssuedCertificateForViewer({
    certificateCode: parsed.data,
    viewerId: session.userId,
    viewerRole: session.role,
  });

  // A viewer who may not see this certificate gets the same 404 as one that
  // does not exist. Distinguishing them would let a signed-in trainee discover
  // which certificate codes belong to other people.
  if (!result) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  return new NextResponse(result.svg, {
    status: 200,
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Content-Disposition": `inline; filename="${result.fileName}"`,
      // Private: this is a personal document, so it must never be held in a
      // shared or CDN cache keyed only by URL.
      "Cache-Control": "private, no-store",
    },
  });
}
