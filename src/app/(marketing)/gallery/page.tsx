import { createSiteMetadata } from "@/lib/site-origin";
import { getGalleryPhotos } from "@/server/services/marketing.service";
import { GalleryHero } from "@/features/gallery/gallery-hero";
import { PhotoGrid } from "@/features/gallery/photo-grid";

export const metadata = createSiteMetadata({
  title: "Training Gallery | HardTech IT Corp",
  description:
    "See the facilities, workshops, and hands-on learning environment at HardTech IT Corp.",
  path: "/gallery",
});

export default async function GalleryPage() {
  const photos = await getGalleryPhotos();

  return (
    <>
      <GalleryHero />
      <PhotoGrid photos={photos} />
    </>
  );
}
