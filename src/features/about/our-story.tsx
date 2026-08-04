import Image from "next/image";

/**
 * "Our Story" section, verbatim copy from docs/screens/desktop-01.md #7 and
 * docs/screens/mobile-01.md #12-13 (both slices agree word for word,
 * including the bold span in paragraph 1).
 *
 * Photo: docs/research/01-design-source.md lists exactly one remote raster
 * asset in the whole source bundle — the Unsplash URL used below — matching
 * this section's "group of trainees/trainers holding certificates" photo.
 * next.config.ts already restricts remotePatterns to images.unsplash.com.
 *
 * Known source inconsistency (flagged, not reconciled): "Established 2011"
 * here vs. "20+ Years of Experience" on the hero stat grid above — 2011 to
 * 2026 is 15 years, not 20+. See about/hero.tsx for the full note.
 */
export function OurStory() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 lg:py-24">
      <div className="grid gap-10 overflow-hidden rounded-2xl border border-glass-border shadow-glow-sm lg:grid-cols-2 lg:gap-0">
        <div className="relative flex flex-col">
          <div className="relative aspect-4/3 w-full">
            <Image
              src="/images/gallery/gallery-02.jpg"
              alt="HardTech trainees and trainers holding completion certificates"
              fill
              className="object-cover"
            />
          </div>
          <div className="bg-card p-4">
            <p className="font-semibold text-primary">HardTech IT Corp.</p>
            <p className="text-sm text-muted-foreground">Established 2011</p>
          </div>
        </div>

        <div className="flex flex-col justify-center gap-4 p-6 lg:p-10">
          <p className="text-xs font-semibold tracking-widest text-primary uppercase">
            OUR STORY
          </p>
          <h2 className="text-3xl font-bold sm:text-4xl">
            From a Vision to a <span className="text-primary">Movement</span>
          </h2>

          <p className="text-muted-foreground">
            HardTech IT Corp. was born from a simple conviction:{" "}
            <strong className="font-semibold text-foreground">
              everyone deserves access to quality technology education.
            </strong>{" "}
            Founded by a group of passionate engineers and educators, we set
            out to bridge the gap between classroom theory and industry
            reality.
          </p>

          <p className="text-muted-foreground">
            What started as a single room with three trainers has grown into
            a community of working technicians and developers, serving
            thousands of graduates across three specialized hands-on
            programs.
          </p>

          <p className="text-muted-foreground">
            Today, most of our 10,000+ trained learners run their own
            mobile, desktop, and electronics servicing businesses — exactly
            the independent, skills-first outcome HardTech was built for.
          </p>
        </div>
      </div>
    </section>
  );
}
