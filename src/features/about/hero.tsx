import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

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
  { value: "3", label: "CORE PROGRAMS" },
] as const;

export function AboutHero() {
  return (
    <section className="relative overflow-hidden">
      <div className="hero-glow pointer-events-none absolute inset-x-0 top-0 -z-10 h-[32rem]" />

      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:items-center lg:py-28">
        <div>
          <Badge variant="outline" className="border-primary/40 text-primary">
            ABOUT HARDTECH
          </Badge>

          <h1 className="mt-4 text-4xl font-bold leading-[1.08] text-balance sm:text-5xl lg:text-6xl">
            Shaping the Next Generation of{" "}
            <span className="text-primary">Tech Experts</span>
          </h1>

          <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground lg:text-xl">
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
        </div>

        <div className="grid grid-cols-2 gap-4">
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
        </div>
      </div>
    </section>
  );
}
