import Link from "next/link";
import { ArrowRight, CircleCheckBig } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * "The HardTech Advantage" checklist, verbatim from
 * docs/screens/desktop-01.md #10 and docs/screens/mobile-01.md #21-22
 * (mobile-01 lists items 4-8 twice across two scroll shots; de-duplicated
 * to the 8 distinct items both slices agree on).
 */
const ADVANTAGES = [
  "Skills-first training — no prior credentials required",
  "Hands-on training with professional-grade equipment",
  "Expert trainers with real industry backgrounds",
  "Small class sizes for personalized attention",
  "Auto-generated e-certificates with QR verification",
  "Business-starter guidance for graduates opening their own shop",
  "Flexible scheduling: morning, afternoon, and weekend",
  "Lifetime alumni access and community support",
] as const;

export function Advantage() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 lg:py-24">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:items-center">
        <div>
          <p className="mb-3 text-xs font-semibold tracking-widest text-primary uppercase">
            WHY CHOOSE US
          </p>
          <h2 className="text-3xl font-bold sm:text-4xl">
            The HardTech <span className="text-primary">Advantage</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            We don&apos;t just certify — we transform careers. Here&apos;s
            why thousands of students trust us.
          </p>
          <Button asChild size="lg" className="mt-6">
            <Link href="/enroll">
              Join HardTech
              <ArrowRight />
            </Link>
          </Button>
        </div>

        <ul className="flex flex-col gap-3">
          {ADVANTAGES.map((advantage) => (
            <li
              key={advantage}
              className="glass flex items-center gap-3 rounded-xl px-4 py-3"
            >
              <CircleCheckBig className="size-5 shrink-0 text-primary" />
              <span>{advantage}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
