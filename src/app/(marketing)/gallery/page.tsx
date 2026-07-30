import { getGalleryPhotos } from "@/server/services/marketing.service";
import { GalleryHero } from "@/features/gallery/gallery-hero";
import { PhotoGrid } from "@/features/gallery/photo-grid";

export default async function GalleryPage() {
  const photos = await getGalleryPhotos();

  return (
    <>
      <GalleryHero />
      <PhotoGrid photos={photos} />
    </>
  );
}
