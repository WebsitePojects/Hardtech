import type { ProgramWithCurriculum } from "@/server/services/marketing.service";
import { ProgramsCarousel, type ProgramsCarouselProgram } from "./programs-carousel";

/**
 * "Core Programs" section (docs/screens/desktop-01.md #1-2). The eyebrow/H2
 * wrapper is static and stays a server component; the carousel itself needs
 * "use client" for embla + selected-slide state, kept in a separate file.
 *
 * The design's dot pagination shows exactly 3 slides (Computer Hardware
 * Servicing, Cellphone Hardware Servicing, I.T. Software Development), but
 * the Program model (prisma/schema.prisma) has 5 rows and no "core"/
 * "featured" boolean to filter by. getPrograms() returns the full catalog,
 * so this renders whatever DATA seeds — likely 5 slides, not the
 * screenshot's 3. Flagged rather than inventing a filter field.
 */
export function ProgramsSection({
  programs,
}: {
  programs: ProgramWithCurriculum[];
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
    <section className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 lg:pb-8 lg:pt-20">
      <div className="text-center">
        <p className="mb-3 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
          WHAT WE OFFER
        </p>
        <h2 className="text-3xl font-bold text-primary sm:text-4xl">
          Core Programs
        </h2>
      </div>
      <div className="mt-10">
        <ProgramsCarousel programs={carouselPrograms} />
      </div>
    </section>
  );
}
