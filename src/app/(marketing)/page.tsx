import { createSiteMetadata } from "@/lib/site-origin";
import { getPrograms, getTestimonials } from "@/server/services/marketing.service";
import { HomeHero } from "@/features/home/hero";
import { EnrollmentJourney } from "@/features/home/enrollment-journey";
import { ProgramsSection } from "@/features/home/programs-section";
import { WhyHardTech } from "@/features/home/why-hardtech";
import { Testimonials } from "@/features/home/testimonials";

export const metadata = createSiteMetadata({
  title: "HardTech IT Corp",
  description:
    "Comprehensive training in computer and cellphone hardware servicing, featuring online enrollment, interactive dashboards, and a sleek, futuristic design.",
  path: "/",
});

export default async function HomePage() {
  const [programs, testimonials] = await Promise.all([
    getPrograms(),
    getTestimonials(),
  ]);

  return (
    <>
      <HomeHero />
      <ProgramsSection programs={programs} />
      <EnrollmentJourney />
      <WhyHardTech />
      <Testimonials testimonials={testimonials} />
    </>
  );
}
