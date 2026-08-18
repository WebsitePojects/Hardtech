import Link from "next/link";
import { BadgeCheck, ShieldAlert } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getPublicCertificate } from "@/server/services/certificate-verify.service";

/**
 * Public certificate verification — the destination printed in the QR code.
 *
 * Deliberately unauthenticated: the whole point is that an employer holding a
 * printed certificate can check it without an account. It therefore discloses
 * the minimum that makes verification meaningful (the name on the paper, the
 * programme, the date) and nothing else — no internal ids, no approver, no
 * contact details.
 *
 * An unknown code renders the same "not verified" panel as a rejected one, so
 * the page cannot be used to enumerate which codes exist.
 */
export default async function VerifyCertificatePage(
  props: PageProps<"/verify/[code]">,
) {
  const { code } = await props.params;
  const certificate = await getPublicCertificate(code);

  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-2xl flex-col justify-center px-4 py-16 sm:px-6">
      <Card className="glass rounded-2xl p-6 sm:p-8">
        {certificate ? (
          <>
            <div className="flex items-center gap-3">
              <span
                className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/15"
                aria-hidden
              >
                <BadgeCheck className="size-6 text-primary" />
              </span>
              <div>
                <h1 className="font-heading text-2xl font-semibold text-foreground">
                  Certificate verified
                </h1>
                <p className="text-sm text-muted-foreground">
                  Issued by HardTech IT Corp.
                </p>
              </div>
            </div>

            <dl className="mt-6 space-y-4">
              <div>
                <dt className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  Awarded to
                </dt>
                <dd className="mt-1 text-lg font-semibold text-foreground">
                  {certificate.recipientName}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  Program
                </dt>
                <dd className="mt-1 text-foreground">{certificate.programName}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  Completed
                </dt>
                <dd className="mt-1 text-foreground">{certificate.completedOn}</dd>
              </div>
              <dd className="rounded-xl border border-border/70 bg-muted/30 px-3 py-2 font-mono text-sm text-foreground">
                {certificate.certificateCode}
              </dd>
            </dl>

            <Badge
              variant="outline"
              className="mt-6 gap-1.5 border-primary/40 text-primary"
            >
              <span className="size-1.5 rounded-full bg-primary" aria-hidden />
              Valid
            </Badge>
          </>
        ) : (
          <>
            <div className="flex items-center gap-3">
              <span
                className="flex size-11 shrink-0 items-center justify-center rounded-full bg-destructive/15"
                aria-hidden
              >
                <ShieldAlert className="size-6 text-destructive" />
              </span>
              <div>
                <h1 className="font-heading text-2xl font-semibold text-foreground">
                  Certificate not verified
                </h1>
                <p className="text-sm text-muted-foreground">
                  No valid certificate matches this code.
                </p>
              </div>
            </div>
            <p className="mt-6 text-sm text-muted-foreground">
              Check that the code was entered exactly as printed. If it still does
              not verify, contact HardTech IT Corp. to confirm the document.
            </p>
          </>
        )}

        <p className="mt-8 text-sm text-muted-foreground">
          <Link href="/" className="font-medium text-primary hover:underline">
            Return to HardTech
          </Link>
        </p>
      </Card>
    </main>
  );
}
