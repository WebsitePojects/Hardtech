import { db } from "@/server/db";

/** Pure data access for GalleryPhoto. */
export const galleryPhotoRepository = {
  findAllOrdered() {
    return db.galleryPhoto.findMany({ orderBy: { sortOrder: "asc" } });
  },
};
