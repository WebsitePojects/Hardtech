"use client";

import { useCallback, useEffect } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Dialog, DialogPortal, DialogOverlay } from "@/components/ui/dialog";
import { Dialog as DialogPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";

export interface LightboxImage {
  src: string;
  alt: string;
  /** Optional caption shown under the image. */
  caption?: string;
}

/**
 * Reusable, sitewide image viewer. This is the ONE lightbox for the app —
 * the owner's explicit complaint was that viewing an enrollment payment
 * proof opened a raw `data:`/storage URL in a new browser tab
 * (src/features/dashboard-admin/components/enrollment-review-card.tsx used
 * `<a target="_blank">`). Every place an image needs full-size viewing
 * (enrollment receipts, the gallery grid, ...) renders this component
 * instead of linking out.
 *
 * Built on the existing radix Dialog primitive (src/components/ui/dialog.tsx)
 * rather than a bespoke overlay, so focus trap, Escape-to-close, and
 * scroll-lock come for free and stay consistent with every other modal in
 * the app. Portaled — opening it causes no layout shift in the page behind
 * it.
 *
 * Plain <img>, not next/image: images shown here can be user-uploaded
 * (payment proof) or otherwise not guaranteed to be an allow-listed host in
 * next.config.ts's images.remotePatterns — the same reasoning as
 * features/programs/program-photo.tsx.
 */
export function ImageLightbox({
  images,
  index,
  onIndexChange,
  open,
  onOpenChange,
}: {
  images: LightboxImage[];
  index: number;
  onIndexChange?: (index: number) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const count = images.length;
  const current = images[index] ?? images[0];
  const canNavigate = count > 1 && !!onIndexChange;

  const goPrev = useCallback(() => {
    if (!onIndexChange) return;
    onIndexChange((index - 1 + count) % count);
  }, [index, count, onIndexChange]);

  const goNext = useCallback(() => {
    if (!onIndexChange) return;
    onIndexChange((index + 1) % count);
  }, [index, count, onIndexChange]);

  useEffect(() => {
    if (!open || !canNavigate) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, canNavigate, goPrev, goNext]);

  if (!current) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay className="bg-background/90 backdrop-blur-sm" />
        <DialogPrimitive.Content
          aria-label={current.alt || "Image viewer"}
          className={cn(
            "fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 p-4 outline-none",
            "data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
          )}
        >
          <DialogPrimitive.Title className="sr-only">
            {current.alt || "Image viewer"}
          </DialogPrimitive.Title>
          <DialogPrimitive.Close className="absolute top-4 right-4 z-10 flex size-11 items-center justify-center rounded-full border border-glass-border bg-background/80 text-foreground transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary motion-reduce:transition-none">
            <X className="size-5" aria-hidden />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>

          {canNavigate ? (
            <button
              type="button"
              aria-label="Previous image"
              onClick={goPrev}
              className="absolute left-2 top-1/2 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-glass-border bg-background/80 text-foreground transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary motion-reduce:transition-none sm:left-4"
            >
              <ChevronLeft className="size-5" aria-hidden />
            </button>
          ) : null}

          <img
            src={current.src}
            alt={current.alt}
            className="max-h-[80vh] max-w-[92vw] rounded-lg object-contain shadow-glow-lg"
          />

          {canNavigate ? (
            <button
              type="button"
              aria-label="Next image"
              onClick={goNext}
              className="absolute right-2 top-1/2 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-glass-border bg-background/80 text-foreground transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary motion-reduce:transition-none sm:right-4"
            >
              <ChevronRight className="size-5" aria-hidden />
            </button>
          ) : null}

          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            {current.caption ? <p className="max-w-prose text-center">{current.caption}</p> : null}
            {canNavigate ? (
              <span className="shrink-0 rounded-full border border-glass-border bg-background/80 px-2.5 py-1 text-xs">
                {index + 1}/{count}
              </span>
            ) : null}
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}
