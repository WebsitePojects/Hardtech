import { getPrograms, getTestimonials } from "@/server/services/marketing.service";
import { HomeHero } from "@/features/home/hero";
import { ProgramsSection } from "@/features/home/programs-section";
import { WhyHardTech } from "@/features/home/why-hardtech";
import { Testimonials } from "@/features/home/testimonials";

export default async function HomePage() {
  const [programs, testimonials] = await Promise.all([
    getPrograms(),
    getTestimonials(),
  ]);

  return (
    <>
      <HomeHero />
      <ProgramsSection programs={programs} />
      <WhyHardTech />
      <Testimonials testimonials={testimonials} />
    </>
  );
}
