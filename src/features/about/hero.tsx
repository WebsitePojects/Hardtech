import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollReveal } from "@/components/motion/scroll-reveal";

/**
 * About hero + stat grid, verbatim from docs/screens/desktop-01.md #6 and
 * docs/screens/mobile-01.md #10-11. All four numbers are static marketing
 * copy — no service function backs a "years of experience" or "master
 * trainers" count, so these are hardcoded rather than derived.
 *
 * Known source inconsistency (flagged, not reconciled): "20+" YEARS OF
 * EXPERIENCE here vs. "Established 2011" on the Our Story card below
 * (2011→2026 is 15 years, not 20+), and "4" MASTER TRAINERS here vs.
 * "50+ Expert Trainers" on /programs (owned by ROUTES-B, not built by this
 * route). Reproduced verbatim per docs/screens/desktop-01.md's own Open
 * Questions #7 and mobile-01.md's Open Questions #4.
 */
const STATS = [
  { value: "20+", label: "YEARS OF EXPERIENCE" },
  { value: "10,000+", label: "PEOPLE TRAINED" },
  { value: "4", label: "MASTER TRAINERS" },
  // Was "3" until I.T. Software Development was discontinued. This is a
  // hardcoded marketing stat, NOT derived from the Program table, so nothing
  // failed when the catalog shrank — the page simply advertised a course that
  // no longer exists. If a program is ever added or retired again, this number
  // has to be changed by hand; it is the only place on this page that counts
  // them. (The other three stats above are deliberately unverified marketing
  // claims — see this file's header comment.)
  { value: "2", label: "CORE PROGRAMS" },
] as const;

export function AboutHero() {
  return (
    <section className="relative overflow-hidden">
      {/* Background photograph (client direction, 2026-08-26: "use of images
       * ... background images with styling"). Own layer, -z-20, so it paints
       * OVER the section's default background but BELOW the gradient scrim
       * below it and the text above that — routed through next/image with
       * `fill` + `sizes` + `priority` (this is the first section on /about,
       * so it is the page's LCP element) per the hard requirement against a
       * raw <img>/CSS url() on an unoptimized JPG this size. Decorative only:
       * empty alt, aria-hidden, pointer-events-none so it can never enter
       * the a11y tree or intercept a click. */}
      <div
        aria-hidden
        className="hero-photo-fade pointer-events-none absolute inset-x-0 top-0 -z-20 h-[32rem]"
      >
        <Image
          src="/images/gallery/gallery-07.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </div>
      {/* Gradient composition on top of the photo — see .hero-glow-about in
       * globals.css for the full three-layer breakdown (scrim sweep +
       * secondary bloom + brand beam). The scrim layer inside it is what
       * keeps the headline legible; the <Image> above carries no
       * opacity/brightness filter of its own. */}
      <div className="hero-glow hero-glow-about hero-photo-navscrim pointer-events-none absolute inset-x-0 top-0 -z-10 h-[32rem]" />

      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:items-center lg:py-28">
        <ScrollReveal>
          <Badge variant="outline" className="border-primary/40 text-primary">
            ABOUT HARDTECH
          </Badge>

          <h1 className="mt-4 text-4xl font-bold leading-[1.08] text-balance sm:text-5xl lg:text-6xl">
            Shaping the Next Generation of{" "}
            <span className="text-primary">Tech Experts</span>
          </h1>

          {/* foreground/85, NOT text-muted-foreground. The muted token is
              tuned for a solid page ground; over a photograph it drops below
              readable contrast — the scrim is near-transparent this far down
              and across, so the paragraph was landing on raw image detail.
              Same substitution on the other two photo heroes (contact,
              programs). Any text placed over photography here needs this. */}
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-foreground/85 lg:text-xl">
            HardTech IT Corporation is a leading provider of IT training and
            services. We specialize in delivering high-quality education and
            support to individuals and businesses.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/programs">
                View Programs
                <ArrowRight />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/contact">
                Contact Us
                <ChevronRight />
              </Link>
            </Button>
          </div>
        </ScrollReveal>

        <ScrollReveal delayMs={80} className="grid grid-cols-2 gap-4">
          {STATS.map((stat) => (
            <Card key={stat.label} className="transition-[border-color,box-shadow,transform] motion-reduce:transition-none lg:hover:-translate-y-1 lg:hover:border-primary/40 lg:hover:shadow-glow-sm">
              <CardContent className="flex flex-col gap-1">
                <p className="text-3xl font-bold text-primary sm:text-4xl">
                  {stat.value}
                </p>
                <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  {stat.label}
                </p>
              </CardContent>
            </Card>
          ))}
        </ScrollReveal>
      </div>
    </section>
  );
}
