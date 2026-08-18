import type { ProgramWithCurriculum } from "@/server/services/marketing.service";
import { ProgramsCarousel, type ProgramsCarouselProgram } from "./programs-carousel";
import { AnnouncementsCard, type Announcement } from "./announcements-card";

/**
 * "Core Programs" section (docs/screens/desktop-01.md #1-2). The eyebrow/H2
 * wrapper is static and stays a server component; the carousel itself needs
 * "use client" for embla + selected-slide state, kept in a separate file.
 *
 * The active HardTech catalog has exactly 3 public slides: Computer Hardware
 * Servicing, Cellphone Hardware Servicing, and I.T. Software Development.
 * The client carousel also fail-closes to those names so legacy unsupported
 * rows cannot appear while preserving any unrelated dependent records.
 */
export function ProgramsSection({
  programs,
  announcements,
}: {
  programs: ProgramWithCurriculum[];
  announcements: Announcement[];
}) {
  const carouselPrograms: ProgramsCarouselProgram[] = programs.map((program) => ({
    id: program.id,
    name: program.name,
    durationLabel: program.durationLabel,
    marketingEnrolledLabel: program.marketingEnrolledLabel,
    iconName: program.iconName,
    accentColor: program.accentColor,
    imageUrl: program.imageUrl,
  }));

  return (
    <section className="mx-auto w-full max-w-6xl px-4 pt-8 pb-12 sm:px-6 sm:py-14 lg:pb-8 lg:pt-20">
      <div className="text-center">
        <p className="mb-3 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
          WHAT WE OFFER
        </p>
        <h2 className="text-3xl font-bold text-primary sm:text-4xl">
          Core Programs
        </h2>
      </div>
      <div className="mt-6 sm:mt-10">
        <ProgramsCarousel programs={carouselPrograms} />
      </div>
      <AnnouncementsCard announcements={announcements} mobileOnly />
    </section>
  );
}
