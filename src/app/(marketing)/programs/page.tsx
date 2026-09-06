import Image from "next/image";
import { Award, Users, Zap } from "lucide-react";

import { createSiteMetadata } from "@/lib/site-origin";
import { Badge } from "@/components/ui/badge";
import { ProgramCard } from "@/features/programs/program-card";
import { getPrograms, getTrainers } from "@/server/services/marketing.service";
import { ScrollReveal } from "@/components/motion/scroll-reveal";

export const metadata = createSiteMetadata({
  title: "Our Core Programs | HardTech IT Corp",
  description:
    "Explore HardTech IT Corp training programs for practical computer and cellphone hardware servicing skills.",
  path: "/programs",
});

const TRUST_ROW = [
  { icon: Award, label: "Skills-First Training" },
  { icon: Users, label: "Expert Trainers" },
  { icon: Zap, label: "Hands-On Labs" },
];

export default async function ProgramsPage() {
  const [programs, trainers] = await Promise.all([getPrograms(), getTrainers()]);

  return (
    <main>
      {/* Restructured from a single `.hero-glow` background utility on this
       * <section> to the same "separate absolute decorative layers, -z below
       * normal content" pattern every other hero in the app uses (see
       * about/hero.tsx, contact-hero.tsx, etc.) — required here specifically
       * because a background PHOTOGRAPH needs to sit between the section's
       * own background and the gradient scrim that protects the heading
       * above it, and a CSS `background` utility applied straight to the
       * section can't be layered against a sibling <Image> element that way.
       * `relative overflow-hidden` is new on this element for that reason;
       * nothing else about the section's box (padding, therefore height)
       * changes, so this is not a layout shift. */}
      <section className="relative overflow-hidden px-4 pt-24 pb-12 sm:pt-28">
        <div
          aria-hidden
          className="hero-photo-fade pointer-events-none absolute inset-x-0 top-0 -z-20 h-[26rem]"
        >
          <Image
            src="/images/gallery/gallery-13.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </div>
        <div className="hero-glow hero-glow-programs hero-photo-navscrim pointer-events-none absolute inset-x-0 top-0 -z-10 h-[26rem]" />
        <ScrollReveal className="mx-auto max-w-3xl space-y-5 text-center">
          <Badge variant="outline" className="border-primary/40 text-primary">
            &#9670; Training Programs
          </Badge>
          <h1 className="font-heading text-4xl font-bold text-foreground sm:text-5xl">
            Our Core <span className="text-primary">Programs</span>
          </h1>
          {/* foreground/85 over photography — see the note in
              src/features/about/hero.tsx; the muted token loses contrast on
              an image ground. */}
          <p className="text-lg text-foreground/85">
            Practical, industry-aligned training programs designed to build real skills and
            launch your technology career — no prior credentials required.
          </p>
          {/* foreground/80 rather than muted: this row sits low in the photo
              band where the scrim has thinned, over the brightest part of
              gallery-13. Muted was unreadable there. */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-2 text-sm text-foreground/80">
            {TRUST_ROW.map(({ icon: Icon, label }) => (
              <span key={label} className="flex items-center gap-1.5">
                <Icon className="size-4 text-primary" aria-hidden />
                {label}
              </span>
            ))}
          </div>
        </ScrollReveal>
      </section>

      <section className="mx-auto max-w-5xl space-y-8 px-4 pb-24">
        {programs.map((program, index) => {
          const trainer = trainers.find((candidate) => candidate.userId === program.primaryTrainerId);
          const trainerName = trainer ? `${trainer.user.firstName} ${trainer.user.lastName}` : null;

          return (
            <ProgramCard
              key={program.id}
              program={program}
              trainerName={trainerName}
              imageSide={index % 2 === 0 ? "left" : "right"}
            />
          );
        })}
      </section>
    </main>
  );
}
