import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";

import { getAdminAnnouncements } from "@/server/services/dashboard.service";
import { Button } from "@/components/ui/button";

import { AnnouncementsCard } from "./announcements-card";
import { HeroBackground } from "./hero-background";

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
    <section className="hero-full-bleed relative isolate overflow-hidden">
      <style>{`.hero-full-bleed { min-height: 100vh; min-height: 100dvh; }`}</style>
      <HeroBackground />

      <div className="relative z-10 mx-auto grid min-h-[100vh] w-full max-w-6xl items-center gap-8 px-4 pt-24 pb-10 sm:px-6 sm:pt-28 sm:pb-14 lg:min-h-[100dvh] lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-10 lg:pt-24 2xl:grid-cols-1 2xl:pr-[25rem]">
        <div className="max-w-3xl text-center lg:text-left">
          <p className="hero-fade-slide mb-4 text-xs font-semibold tracking-[0.18em] text-primary uppercase" style={{ "--reveal-delay": "0.05s" } as React.CSSProperties}>
            Practical IT training for your next trade
          </p>
          <h1 className="text-balance text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
            <span className="hero-reveal-line block"><span style={{ "--reveal-delay": "0.2s" } as React.CSSProperties}>Build Your Future</span></span>
            <span className="hero-reveal-line block"><span style={{ "--reveal-delay": "0.4s" } as React.CSSProperties}>in <span className="bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">Modern Technology</span></span></span>
          </h1>
          <div className="relative mt-5 lg:mt-6">
            <div aria-hidden="true" className="pointer-events-none absolute -inset-x-6 -inset-y-5 -z-10 rounded-[2rem] bg-background/90 blur-xl" />
            <p className="hero-fade-slide max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg" style={{ "--reveal-delay": "0.6s" } as React.CSSProperties}>
              Learn computer and cellphone hardware servicing through hands-on training built for real work.
            </p>
          </div>
          <div className="hero-fade-slide mt-6 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start" style={{ "--reveal-delay": "0.8s" } as React.CSSProperties}>
            <Button asChild size="lg"><Link href="/enroll">Enroll Now<ArrowRight aria-hidden /></Link></Button>
            <Button asChild size="lg" variant="outline" className="border-foreground/30 bg-background/85 text-foreground hover:border-primary hover:bg-background"><Link href="/programs">Explore Programs<ChevronRight aria-hidden /></Link></Button>
          </div>
        </div>

        <div className="w-full max-w-md justify-self-center lg:justify-self-end 2xl:hidden">
          <AnnouncementsCard announcements={announcements} variant="mobile" />
        </div>
      </div>

      <AnnouncementsCard announcements={announcements} variant="floating" />
    </section>
  );
}
