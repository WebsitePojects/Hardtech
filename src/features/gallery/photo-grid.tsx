import Image from "next/image";

import type { GalleryPhoto } from "@/../generated/prisma/client";

export function PhotoGrid({ photos }: { photos: GalleryPhoto[] }) {
  if (photos.length === 0) {
    return null;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-surface-secondary ring-1 ring-glass-border"
          >
            <Image
              src={photo.imageUrl}
              alt={photo.caption ?? "HardTech training photo"}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
