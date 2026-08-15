import Link from "next/link";
import { ArrowRight, ChevronRight, CircleCheckBig } from "lucide-react";

import { getAdminAnnouncements } from "@/server/services/dashboard.service";
import { Button } from "@/components/ui/button";
import { AnnouncementsCard } from "./announcements-card";

const TRUST_ITEMS = [
  { label: "Skills-First Training", colorClass: "text-primary" },
  { label: "QR Certificates", colorClass: "text-brand-blue" },
  { label: "Job Placement Assist", colorClass: "text-brand-purple" },
] as const;

export async function HomeHero() {
  const announcements = (await getAdminAnnouncements()).slice(0, 2).map((announcement) => ({
    id: announcement.id,
    title: announcement.title,
    body: announcement.body,
    type: announcement.type,
    mediaUrl: announcement.mediaUrl,
    createdAt: announcement.createdAt.toISOString(),
  }));

  return (
    <section className="relative overflow-hidden">
      <div className="hero-glow pointer-events-none absolute inset-x-0 top-0 -z-10 h-[36rem]" />
      {/*
        pt-20 (80px): the navbar is `fixed` (navbar-shell.tsx) and reserves no
        flow space, so this section starts at viewport y=0 — directly behind
        the bar's own h-[68px] row. Below lg the hero's status badge is the
        first child here; measured at 390px it used to render at y:32-58,
        fully inside the navbar's y:0-68 opaque-logo strip (logo box measured
        at y:15-55) and both were visible through each other. pt-20 puts the
        badge at y:80, 12px clear of the navbar. Unchanged at lg+ (pt-24),
        where the badge already cleared (measured at 768px: badge top 64 vs
        navbar bottom 55).
      */}
      <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-4 px-4 pt-20 pb-8 text-center sm:gap-6 sm:px-6 sm:pb-16 lg:max-w-5xl lg:gap-7 lg:pt-24 lg:pb-24">
        {/*
          vgldesign hero load choreography (globals.css, "hero load
          choreography" block): fires once on mount, on its own timeline —
          not the scroll-reveal system. Each headline line masks up from
          translateY(100%); the badge and CTA row slide in from the left.
          Staggered via inline --reveal-delay custom properties (badge 0.1s,
          headline lines 0.3s/0.5s, subtext 0.9s, CTAs 1.1s) so the eye
          finishes reading before the button asks for a click, matching the
          measured cadence in vgldesign technique #2. Pure CSS — no
          "use client" needed, this stays a Server Component.
        */}
        <div
          className="hero-fade-slide inline-flex items-center gap-1.5 rounded-full border border-primary/40 px-3 py-1 text-xs font-semibold tracking-wide text-primary"
          style={{ "--reveal-delay": "0.1s" } as React.CSSProperties}
        >
          <span className="size-1.5 rounded-full bg-primary" aria-hidden />
          ENROLLMENTS OPEN - 2026
        </div>
        <h1 className="text-4xl font-bold leading-[1.08] text-balance sm:text-5xl lg:text-7xl">
          <span className="hero-reveal-line block">
            <span style={{ "--reveal-delay": "0.3s" } as React.CSSProperties}>Build Your Future</span>
          </span>
          <span className="hero-reveal-line block">
            <span style={{ "--reveal-delay": "0.5s" } as React.CSSProperties}>
              in <span className="bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">Modern Technology</span>
            </span>
          </span>
        </h1>
        <p
          className="hero-fade-slide max-w-2xl text-lg leading-relaxed text-muted-foreground lg:text-xl"
          style={{ "--reveal-delay": "0.9s" } as React.CSSProperties}
        >
          Get professionally trained in Computer Hardware Servicing, Cellphone Repair, and I.T. Software Development through immersive hands-on learning.
        </p>
        <div
          className="hero-fade-slide flex flex-col gap-3 sm:flex-row"
          style={{ "--reveal-delay": "1.1s" } as React.CSSProperties}
        >
          <Button asChild size="lg"><Link href="/enroll">Enroll Now<ArrowRight /></Link></Button>
          <Button asChild size="lg" variant="outline"><Link href="/programs">Explore Programs<ChevronRight /></Link></Button>
        </div>
        <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-2 text-sm text-muted-foreground">
          {TRUST_ITEMS.map((item) => <li key={item.label} className="flex items-center gap-1.5"><CircleCheckBig className={`size-4 ${item.colorClass}`} />{item.label}</li>)}
        </ul>
      </div>
      <AnnouncementsCard announcements={announcements} />
    </section>
  );
}
