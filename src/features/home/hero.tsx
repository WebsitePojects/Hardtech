import Link from "next/link";
import { ArrowRight, ChevronRight, CircleCheckBig } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

/**
 * Home hero. Copy is verbatim from docs/screens/desktop-01.md #1 and
 * docs/screens/mobile-01.md #1 (both slices agree word for word).
 *
 * The hero also carries a "Live Updates" announcement widget in the source
 * design (top-right floating card, its own mini-carousel). It is not built
 * here: it reads from an Announcement feed and the wave-1 contract's
 * marketing.service surface (getPrograms/getTrainers/getTestimonials/
 * getGalleryPhotos/getFaqs/getPaymentMethods) has no announcements query.
 * Building it would mean importing a repository directly, which the
 * contract forbids. Flagged in the return report instead of stubbed.
 */
const TRUST_ITEMS = [
  { label: "Skills-First Training", colorClass: "text-primary" },
  { label: "QR Certificates", colorClass: "text-brand-blue" },
  { label: "Job Placement Assist", colorClass: "text-brand-purple" },
] as const;

export function HomeHero() {
  return (
    <section className="relative overflow-hidden">
      <div className="hero-glow pointer-events-none absolute inset-x-0 top-0 -z-10 h-[36rem]" />

      <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-6 px-4 py-24 text-center sm:px-6 lg:py-32">
        <Badge
          variant="outline"
          className="gap-1.5 border-primary/40 text-primary"
        >
          <span className="size-1.5 rounded-full bg-primary" aria-hidden />
          ENROLLMENTS OPEN — 2026
        </Badge>

        <h1 className="text-4xl font-bold text-balance sm:text-5xl lg:text-6xl">
          Build Your Future
          <br />
          in{" "}
          <span className="bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
            Modern Technology
          </span>
        </h1>

        <p className="max-w-2xl text-lg text-muted-foreground">
          Get professionally trained in Computer Hardware Servicing,
          Cellphone Repair, and I.T. Software Development through immersive
          hands-on learning.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/enroll">
              Enroll Now
              <ArrowRight />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/programs">
              Explore Programs
              <ChevronRight />
            </Link>
          </Button>
        </div>

        <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-2 text-sm text-muted-foreground">
          {TRUST_ITEMS.map((item) => (
            <li key={item.label} className="flex items-center gap-1.5">
              <CircleCheckBig className={`size-4 ${item.colorClass}`} />
              {item.label}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
