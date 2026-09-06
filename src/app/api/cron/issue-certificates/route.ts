import { NextResponse } from "next/server";

import {
  CERTIFICATE_RECOVERY_BATCH_SIZE,
  reissuePendingCertificates,
} from "@/server/services/certificate-issue.service";
import { verifyCronSecret } from "../verify-cron-secret";

type RecoveryRunner = typeof reissuePendingCertificates;

/**
 * Drains approved certificate requests whose document upload did not finish.
 * The certificate row remains the durable work item until its conditional
 * asset attachment succeeds, so failed storage calls are retried by a later
 * schedule instead of being lost after an approval has committed.
 */
export function createIssueCertificatesCronHandler(
  recover: RecoveryRunner = reissuePendingCertificates,
) {
  return async function GET(request: Request) {
    if (!verifyCronSecret(request)) {
      return NextResponse.json({ error: "Not authorized." }, { status: 401 });
    }

    try {
      // Fixed, server-side cap only: cron callers cannot turn one invocation
      // into an unbounded render/upload burst.
      const result = await recover({ limit: CERTIFICATE_RECOVERY_BATCH_SIZE });
      return NextResponse.json(result, { status: 200 });
    } catch {
      // Never expose or log request credentials or provider internals.
      return NextResponse.json({ error: "Certificate issuance recovery failed." }, { status: 500 });
    }
  };
}

export const GET = createIssueCertificatesCronHandler();
