"use client";

import Image from "next/image";
import { useState } from "react";
import { CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";

export type Announcement = { id: string; title: string; body: string; type: string; mediaUrl: string | null; createdAt: string };

export function AnnouncementsCard({ announcements, mobileOnly = false, desktopOnly = false }: { announcements: Announcement[]; mobileOnly?: boolean; desktopOnly?: boolean }) {
  const [activeIndex, setActiveIndex] = useState(0);
  if (announcements.length === 0) return null;
  const announcement = announcements[activeIndex] ?? announcements[0];
  const createdAt = new Date(announcement.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const previous = () => setActiveIndex((activeIndex - 1 + announcements.length) % announcements.length);
  const next = () => setActiveIndex((activeIndex + 1) % announcements.length);
  const mediaUrl = announcement.mediaUrl ?? "/images/home/announcement-june-2026-batch.jpg";

  return (
    // top-[75px] clears the fixed navbar (h-[68px] in navbar-shell.tsx) with a
    // 7px gap — that part was fixed once already (it used to ride up under the
    // bar and cover the account chip) and is correct. z-30 is the "floating
    // page-level card" tier in the stacking scale documented in
    // navbar-shell.tsx, above page content, below all navigation chrome.
    //
    // The float/hide breakpoint is 2xl (1536px), not lg. Measured with real
    // bounding boxes (not guessed): the hero H1 renders up to ~750px wide
    // inside its max-w-5xl (1024px) content column, and that column has zero
    // side margin at the lg minimum width. Centering math means this 360px
    // card, anchored right-6 from the viewport edge, does not clear the H1
    // until the viewport is ~1518px wide — it still overlaps at 1024, 1280,
    // and 1440. 2xl (1536px) is the nearest standard breakpoint that clears
    // it (verified: 9px gap at exactly 1536). Below 2xl the `mobileOnly`
    // instance (rendered in-flow further down the page by
    // features/home/programs-section.tsx) carries the same content instead —
    // it never overlaps anything because it stacks in normal document flow.
    <aside className={`relative right-auto top-auto z-30 mx-auto mb-8 block w-[calc(100%-1rem)] max-w-[360px] rounded-2xl border border-primary/40 bg-background/80 p-3 shadow-glow-md backdrop-blur-md 2xl:absolute 2xl:right-6 2xl:top-[75px] 2xl:mx-0 2xl:mb-0 2xl:block 2xl:w-[360px] 2xl:p-5 ${mobileOnly ? "2xl:hidden" : ""} ${desktopOnly ? "hidden 2xl:block" : ""}`} aria-label="Live updates">
      <div className="flex items-center gap-2 text-[10px] font-semibold tracking-wider text-primary">
        <span className="size-1.5 rounded-full bg-primary" aria-hidden /> LIVE UPDATES
        <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[9px]">{announcement.type}</span>
        <span className="ml-auto flex items-center gap-1 text-muted-foreground">
          <button type="button" aria-label="Previous update" onClick={previous} className="rounded-full border border-glass-border p-0.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary hover:border-primary hover:text-primary motion-reduce:transition-none"><ChevronLeft className="size-3" /></button>
          <span className="h-1.5 w-3 rounded-full bg-primary" />
          <button type="button" aria-label="Next update" onClick={next} className="rounded-full border border-glass-border p-0.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary hover:border-primary hover:text-primary motion-reduce:transition-none"><ChevronRight className="size-3" /></button>
          <span className="ml-1">{activeIndex + 1}/{announcements.length}</span>
        </span>
      </div>
      <div className="mt-4 flex gap-3">
        <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" />
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold leading-snug">{announcement.title}</h2>
          <p className="mt-1.5 line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">{announcement.body}</p>
          <p className="mt-2 text-[10px] text-primary">{createdAt} <span className="text-muted-foreground">·</span> Tap to read more</p>
        </div>
        <Image src={mediaUrl} alt="" width={72} height={72} className="size-[72px] shrink-0 rounded-lg border border-glass-border object-cover" />
      </div>
    </aside>
  );
}
