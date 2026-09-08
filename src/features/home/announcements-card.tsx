"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";

export type Announcement = { id: string; title: string; body: string; type: string; mediaUrl: string | null; createdAt: string };

type AnnouncementsCardProps = {
  announcements: Announcement[];
  /** The in-flow teaser is intentionally stable. The wide floating rail retains manual browsing. */
  variant: "mobile" | "floating";
};

export function AnnouncementsCard({ announcements, variant }: AnnouncementsCardProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const timerConfig = useMemo(
    () => ({ variant, announcementCount: announcements.length }),
    [variant, announcements.length],
  );

  useEffect(() => {
    const { variant: timerVariant, announcementCount } = timerConfig;
    if (timerVariant !== "floating" || announcementCount < 2) return;
    const timer = window.setInterval(() => setActiveIndex((index) => (index + 1) % announcementCount), 5200);
    return () => window.clearInterval(timer);
  }, [timerConfig]);

  if (announcements.length === 0) return null;
  const announcement = announcements[activeIndex] ?? announcements[0];
  const createdAt = new Date(announcement.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const previous = () => setActiveIndex((activeIndex - 1 + announcements.length) % announcements.length);
  const next = () => setActiveIndex((activeIndex + 1) % announcements.length);
  const mediaUrl = announcement.mediaUrl ?? "/images/home/announcement-june-2026-batch.jpg";

  if (variant === "mobile") {
    return (
      <aside aria-label="Latest update">
        <Link
          href={`/announcements/${announcement.id}`}
          className="hero-fade-slide flex w-full items-center gap-3 rounded-2xl border border-primary/30 bg-background/95 p-3 text-left shadow-glow-sm backdrop-blur-md transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary motion-reduce:transition-none"
          style={{ "--reveal-delay": "0.95s" } as React.CSSProperties}
          aria-label={`Read announcement: ${announcement.title}`}
        >
          <Image
            src={mediaUrl}
            alt=""
            width={48}
            height={48}
            sizes="48px"
            className="size-12 shrink-0 rounded-lg border border-glass-border object-cover"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold tracking-wider text-primary">
              <span className="size-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
              Latest update
              <span className="shrink-0 rounded-full bg-primary/15 px-1.5 py-0.5 text-[9px]">{announcement.type}</span>
            </div>
            <p className="mt-1 truncate text-sm font-semibold leading-snug">{announcement.title}</p>
            <p className="mt-0.5 text-[10px] text-muted-foreground">{createdAt}</p>
          </div>
          <ChevronRight className="size-4 shrink-0 text-primary" aria-hidden />
        </Link>
      </aside>
    );
  }

  return (
    <aside
      className="fixed top-[84px] right-6 z-30 hidden w-[360px] rounded-2xl border border-primary/40 bg-background/95 p-5 shadow-glow-md backdrop-blur-md 2xl:block"
      aria-label="Live updates"
    >
      <div className="flex items-center gap-2 text-[10px] font-semibold tracking-wider text-primary">
        <span className="size-1.5 rounded-full bg-primary" aria-hidden />
        Live updates
        <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[9px]">{announcement.type}</span>
        <span className="ml-auto flex items-center gap-1 text-muted-foreground">
          <button
            type="button"
            aria-label="Previous update"
            onClick={previous}
            className="flex size-11 items-center justify-center rounded-full border border-glass-border text-current transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary hover:border-primary hover:text-primary motion-reduce:transition-none"
          >
            <ChevronLeft className="size-4" aria-hidden />
          </button>
          <button
            type="button"
            aria-label="Next update"
            onClick={next}
            className="flex size-11 items-center justify-center rounded-full border border-glass-border text-current transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary hover:border-primary hover:text-primary motion-reduce:transition-none"
          >
            <ChevronRight className="size-4" aria-hidden />
          </button>
          <span className="ml-1">{activeIndex + 1}/{announcements.length}</span>
        </span>
      </div>
      <Link
        href={`/announcements/${announcement.id}`}
        className="mt-4 flex w-full gap-3 rounded-xl text-left transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary motion-reduce:transition-none"
        aria-label={`Read announcement: ${announcement.title}`}
      >
        <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold leading-snug">{announcement.title}</p>
          <p className="mt-1.5 line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">{announcement.body}</p>
          <p className="mt-2 text-[10px] text-primary">
            {createdAt} <span className="text-muted-foreground">·</span> Read full update
          </p>
        </div>
        <Image
          src={mediaUrl}
          alt=""
          width={72}
          height={72}
          sizes="72px"
          className="size-[72px] shrink-0 rounded-lg border border-glass-border object-cover"
        />
      </Link>
    </aside>
  );
}
