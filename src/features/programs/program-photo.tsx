"use client";

import { useState } from "react";
import { ImageOff } from "lucide-react";

interface ProgramPhotoProps {
  src: string;
  alt: string;
}

/**
 * Renders a Program's photo with a graceful fallback if the DATA-seeded
 * `imageUrl` 404s or points at a host that blocks hotlinking. Plain <img>,
 * not next/image: next.config.ts (images.remotePatterns) is orchestrator-
 * owned and the URL's host isn't guaranteed to be allow-listed, so
 * next/image would throw at runtime for an unconfigured domain.
 *
 * A small "use client" leaf (not the whole ProgramCard) so the error
 * handler — which only works client-side — stays pushed as far down the
 * tree as possible, per .claude/rules/10-architecture.md.
 */
export function ProgramPhoto({ src, alt }: ProgramPhotoProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="flex size-full flex-col items-center justify-center gap-1.5 bg-surface-secondary text-muted-foreground">
        <ImageOff className="size-6" aria-hidden />
        <span className="text-xs">Photo unavailable</span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- dynamic, DB-seeded URL; see comment above
    <img
      src={src}
      alt={alt}
      className="size-full object-cover"
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}
