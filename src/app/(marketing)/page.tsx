import { getPrograms, getTestimonials } from "@/server/services/marketing.service";
import { getAdminAnnouncements } from "@/server/services/dashboard.service";
import { HomeHero } from "@/features/home/hero";
import { ProgramsSection } from "@/features/home/programs-section";
import { WhyHardTech } from "@/features/home/why-hardtech";
import { Testimonials } from "@/features/home/testimonials";

export default async function HomePage() {
  const [programs, testimonials, announcements] = await Promise.all([
    getPrograms(),
    getTestimonials(),
    getAdminAnnouncements(),
  ]);

  const homeAnnouncements = announcements.slice(0, 2).map((announcement) => ({
    id: announcement.id,
    title: announcement.title,
    body: announcement.body,
    type: announcement.type,
    mediaUrl: announcement.mediaUrl,
    createdAt: announcement.createdAt.toISOString(),
  }));

  return (
    <>
      <HomeHero />
      <ProgramsSection programs={programs} announcements={homeAnnouncements} />
      <WhyHardTech />
      <Testimonials testimonials={testimonials} />
    </>
  );
}
