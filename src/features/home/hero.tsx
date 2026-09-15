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

      <div className="relative z-10 mx-auto flex min-h-[100vh] w-full max-w-6xl items-center px-4 pt-48 pb-10 min-[390px]:pt-52 sm:px-6 sm:pb-14 md:pt-44 lg:min-h-[100dvh] lg:pt-36 2xl:pt-24 2xl:pr-[25rem]">
        <div className="mx-auto max-w-3xl text-center lg:mx-0 lg:max-w-2xl lg:text-left xl:max-w-3xl">
          <p className="hero-fade-slide mb-4 text-xs font-semibold tracking-[0.18em] text-primary uppercase" style={{ "--reveal-delay": "0.05s" } as React.CSSProperties}>
            Practical IT training for your next trade
          </p>
          <h1 className="text-balance text-[2.35rem] font-bold leading-[1.08] tracking-tight min-[390px]:text-[2.6rem] md:text-5xl lg:text-6xl">
            <span className="hero-reveal-line block"><span style={{ "--reveal-delay": "0.2s" } as React.CSSProperties}>Build Your Future</span></span>
            <span className="hero-reveal-line block"><span style={{ "--reveal-delay": "0.4s" } as React.CSSProperties}>in <span className="bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">Modern Technology</span></span></span>
          </h1>
          <div className="relative mt-5 lg:mt-6">
            <div aria-hidden="true" className="pointer-events-none absolute -inset-x-6 -inset-y-5 -z-10 rounded-[2rem] bg-background/90 blur-xl" />
            <p className="hero-fade-slide mx-auto max-w-xl text-base leading-relaxed text-muted-foreground min-[390px]:text-lg lg:mx-0" style={{ "--reveal-delay": "0.6s" } as React.CSSProperties}>
              Learn computer and cellphone hardware servicing through hands-on training built for real work.
            </p>
          </div>
          <div className="hero-fade-slide mx-auto mt-6 flex w-full max-w-sm flex-col justify-center gap-3 sm:w-auto sm:max-w-none sm:flex-row lg:mx-0 lg:justify-start" style={{ "--reveal-delay": "0.8s" } as React.CSSProperties}>
            <Button asChild size="lg" className="min-h-11 w-full sm:w-auto"><Link href="/enroll">Enroll Now<ArrowRight aria-hidden /></Link></Button>
            <Button asChild size="lg" variant="outline" className="min-h-11 w-full border-foreground/30 bg-background/85 text-foreground hover:border-primary hover:bg-background sm:w-auto"><Link href="/programs">Explore Programs<ChevronRight aria-hidden /></Link></Button>
          </div>
        </div>
      </div>

      <AnnouncementsCard announcements={announcements} variant="mobile" />
      <AnnouncementsCard announcements={announcements} variant="floating" />
    </section>
  );
}
