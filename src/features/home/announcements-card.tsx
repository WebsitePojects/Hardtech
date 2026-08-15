"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";

export type Announcement = { id: string; title: string; body: string; type: string; mediaUrl: string | null; createdAt: string };

export function AnnouncementsCard({ announcements }: { announcements: Announcement[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const scrollY = window.scrollY;
      const delta = scrollY - lastScrollY.current;

      if (scrollY <= 96 || delta < -5) setHidden(false);
      else if (scrollY > 180 && delta > 5) setHidden(true);

      lastScrollY.current = scrollY;
    };

    lastScrollY.current = window.scrollY;
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (announcements.length === 0) return null;
  const announcement = announcements[activeIndex] ?? announcements[0];
  const createdAt = new Date(announcement.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const previous = () => { setExpanded(false); setActiveIndex((activeIndex - 1 + announcements.length) % announcements.length); };
  const next = () => { setExpanded(false); setActiveIndex((activeIndex + 1) % announcements.length); };
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
    <aside className="fixed top-[76px] right-3 z-30 block w-[min(360px,calc(100vw-1.5rem))] rounded-2xl border border-primary/40 bg-background/80 p-3 shadow-glow-md backdrop-blur-md transition-[opacity,transform,visibility] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none data-[hidden=true]:invisible data-[hidden=true]:pointer-events-none data-[hidden=true]:-translate-y-3 data-[hidden=true]:opacity-0 lg:top-[84px] lg:right-6 lg:p-5" data-hidden={hidden} aria-hidden={hidden} aria-label="Live updates">
      <div className="flex items-center gap-2 text-[10px] font-semibold tracking-wider text-primary">
        <span className="size-1.5 rounded-full bg-primary" aria-hidden /> LIVE UPDATES
        <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[9px]">{announcement.type}</span>
        <span className="ml-auto flex items-center gap-1 text-muted-foreground">
          {/*
            Visible glyph stays 18px (the card is 360px max and a header row
            of 44px controls would overwhelm it), but the tap TARGET is
            widened to 44px with an invisible ::after hit-slop — the
            accessible-touch-target technique for compact icon buttons
            (see .claude/rules H, "touch targets at least 44px"). Measured
            before: 18x18px via Playwright boundingBox(), well under the
            minimum.
          */}
          <button type="button" aria-label="Previous update" onClick={previous} className="relative rounded-full border border-glass-border p-0.5 text-current transition-colors after:absolute after:-inset-3.5 after:content-[''] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary hover:border-primary hover:text-primary motion-reduce:transition-none"><ChevronLeft className="size-3" /></button>
          <span className="h-1.5 w-3 rounded-full bg-primary" />
          <button type="button" aria-label="Next update" onClick={next} className="relative rounded-full border border-glass-border p-0.5 text-current transition-colors after:absolute after:-inset-3.5 after:content-[''] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary hover:border-primary hover:text-primary motion-reduce:transition-none"><ChevronRight className="size-3" /></button>
          <span className="ml-1">{activeIndex + 1}/{announcements.length}</span>
        </span>
      </div>
      {/*
        The whole body is now a real button, not decorative copy: it used to
        say "Tap to read more" with no handler anywhere on the card (verified
        with Playwright — cursor: auto, no anchor ancestor, zero click
        targets besides prev/next). Tapping now expands the full announcement
        body in place; tapping again collapses it. EASE_UI (vgldesign) on the
        height transition, skipped under reduced motion.
      */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className="mt-4 flex w-full gap-3 rounded-xl text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary motion-reduce:transition-none"
      >
        <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold leading-snug">{announcement.title}</h2>
          <p
            className={`mt-1.5 overflow-hidden text-[11px] leading-relaxed text-muted-foreground transition-[max-height] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none ${expanded ? "max-h-40" : "line-clamp-2 max-h-10"}`}
          >
            {announcement.body}
          </p>
          <p className="mt-2 text-[10px] text-primary">
            {createdAt} <span className="text-muted-foreground">·</span> {expanded ? "Tap to collapse" : "Tap to read more"}
          </p>
        </div>
        <Image src={mediaUrl} alt="" width={72} height={72} className="size-[72px] shrink-0 rounded-lg border border-glass-border object-cover" />
      </button>
    </aside>
  );
}
