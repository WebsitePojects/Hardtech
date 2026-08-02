import Image from "next/image";

import type { GalleryPhoto } from "@/../generated/prisma/client";

export function PhotoGrid({ photos }: { photos: GalleryPhoto[] }) {
  if (photos.length === 0) {
    return null;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
      <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="relative mb-4 block aspect-auto break-inside-avoid overflow-hidden rounded-xl bg-surface-secondary ring-1 ring-glass-border"
          >
            <Image
              src={photo.imageUrl}
              alt={photo.caption ?? "HardTech training photo"}
              width={1200}
              height={1600}
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              loading="eager"
              className="block h-auto w-full object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
