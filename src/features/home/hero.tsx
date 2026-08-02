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
      <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-4 px-4 py-8 text-center sm:gap-6 sm:px-6 sm:py-16 lg:py-20">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 px-3 py-1 text-xs font-semibold tracking-wide text-primary">
          <span className="size-1.5 rounded-full bg-primary" aria-hidden />
          ENROLLMENTS OPEN - 2026
        </div>
        <h1 className="text-4xl font-bold text-balance sm:text-5xl lg:text-6xl">
          Build Your Future
          <br />
          in <span className="bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">Modern Technology</span>
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          Get professionally trained in Computer Hardware Servicing, Cellphone Repair, and I.T. Software Development through immersive hands-on learning.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg"><Link href="/enroll">Enroll Now<ArrowRight /></Link></Button>
          <Button asChild size="lg" variant="outline"><Link href="/programs">Explore Programs<ChevronRight /></Link></Button>
        </div>
        <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-2 text-sm text-muted-foreground">
          {TRUST_ITEMS.map((item) => <li key={item.label} className="flex items-center gap-1.5"><CircleCheckBig className={`size-4 ${item.colorClass}`} />{item.label}</li>)}
        </ul>
      </div>
      <AnnouncementsCard announcements={announcements} desktopOnly />
    </section>
  );
}
