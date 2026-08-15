"use client";

import { useState } from "react";
import Image from "next/image";
import { Expand } from "lucide-react";

import { ImageLightbox, type LightboxImage } from "@/components/image-lightbox";
import { cn } from "@/lib/utils";
import type { GalleryPhoto } from "@/../generated/prisma/client";

type TileSize = "large" | "wide" | "tall" | "normal";

const SIZE_CLASSES: Record<TileSize, string> = {
  large: "col-span-2 row-span-2",
  wide: "col-span-2 row-span-1",
  tall: "col-span-1 row-span-2",
  normal: "col-span-1 row-span-1",
};

/**
 * Bento rhythm, derived from the real photo data rather than picked at
 * random (per docs/screens spec, order follows `sortOrder`/index):
 *  - The very first photo (index 0) opens the grid as a large anchor tile —
 *    it is the lab establishing shot.
 *  - Any photo whose caption records a certificate or graduation moment gets
 *    a wide "featured" tile. A hardware-repair training company's strongest
 *    proof-of-training-quality signal is trainees actually finishing and
 *    holding certificates, so those moments get more visual weight than a
 *    generic workstation shot.
 *  - Any close-up (soldering, a board on the bench) gets a tall "detail"
 *    tile — the texture of hands-on repair work is exactly what a flat
 *    uniform grid was hiding.
 *  - Everything else is a standard tile.
 */
function tileSize(photo: GalleryPhoto, index: number): TileSize {
  const caption = photo.caption ?? "";
  if (index === 0) return "large";
  if (/certificate|graduat/i.test(caption)) return "wide";
  if (/close-up/i.test(caption)) return "tall";
  return "normal";
}

export function PhotoGrid({ photos }: { photos: GalleryPhoto[] }) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  if (photos.length === 0) {
    return null;
  }

  const lightboxImages: LightboxImage[] = photos.map((photo) => ({
    src: photo.imageUrl,
    alt: photo.caption ?? "HardTech training photo",
    caption: photo.caption ?? undefined,
  }));

  return (
    <>
      <div className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="grid grid-cols-2 auto-rows-[132px] grid-flow-row-dense gap-3 sm:grid-cols-3 sm:auto-rows-[170px] sm:gap-4 lg:grid-cols-4 lg:auto-rows-[200px]">
          {photos.map((photo, index) => {
            const size = tileSize(photo, index);
            return (
              <button
                key={photo.id}
                type="button"
                onClick={() => {
                  setActiveIndex(index);
                  setOpen(true);
                }}
                aria-label={`View photo: ${photo.caption ?? "HardTech training photo"}`}
                className={cn(
                  "group relative block overflow-hidden rounded-xl bg-surface-secondary text-left ring-1 ring-glass-border transition-[box-shadow,transform,border-color] duration-300 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary lg:hover:-translate-y-0.5 lg:hover:shadow-glow-md lg:hover:ring-[var(--glass-border-strong)]",
                  SIZE_CLASSES[size],
                )}
              >
                <Image
                  src={photo.imageUrl}
                  alt={photo.caption ?? "HardTech training photo"}
                  fill
                  sizes="(min-width: 1024px) 40vw, (min-width: 640px) 50vw, 100vw"
                  loading={index < 4 ? "eager" : "lazy"}
                  className="object-cover transition-transform duration-500 motion-reduce:transition-none lg:group-hover:scale-[1.04]"
                />

                <span className="glass pointer-events-none absolute top-2.5 right-2.5 flex size-8 items-center justify-center rounded-full text-foreground opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none">
                  <Expand className="size-3.5" aria-hidden />
                </span>

                {photo.caption ? (
                  <span className="glass pointer-events-none absolute inset-x-0 bottom-0 translate-y-full px-3 py-2.5 opacity-0 transition-[opacity,transform] duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100 motion-reduce:transition-none">
                    <span className="line-clamp-2 text-xs leading-snug text-foreground sm:text-sm">
                      {photo.caption}
                    </span>
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      <ImageLightbox
        images={lightboxImages}
        index={activeIndex}
        onIndexChange={setActiveIndex}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}
