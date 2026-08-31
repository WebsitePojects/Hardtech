"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";

export type Announcement = { id: string; title: string; body: string; type: string; mediaUrl: string | null; createdAt: string };

type AnnouncementsCardProps = {
  announcements: Announcement[];
  // "mobile": in-flow teaser rendered first inside the hero's content column,
  // visible below 2xl. "floating": the fixed right-rail card, visible at 2xl
  // and up only. hero.tsx mounts one of each so exactly one is ever visible —
  // see the breakpoint note below for why 2xl is the split point.
  variant: "mobile" | "floating";
};

export function AnnouncementsCard({ announcements, variant }: AnnouncementsCardProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    // Scroll-hide is a floating-rail behaviour only: that card sits fixed
    // over page content, so it retreats on scroll-down to stop obscuring
    // whatever the user is reading. The mobile variant is in normal document
    // flow — it can never obscure anything — so it has nothing to hide from.
    if (variant !== "floating") return;

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
  }, [variant]);

  useEffect(() => {
    if (announcements.length < 2) return;
    const timer = window.setInterval(() => setActiveIndex((index) => (index + 1) % announcements.length), 5200);
    return () => window.clearInterval(timer);
  }, [announcements.length]);

  if (announcements.length === 0) return null;
  const announcement = announcements[activeIndex] ?? announcements[0];
  const createdAt = new Date(announcement.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const previous = () => setActiveIndex((activeIndex - 1 + announcements.length) % announcements.length);
  const next = () => setActiveIndex((activeIndex + 1) % announcements.length);
  const mediaUrl = announcement.mediaUrl ?? "/images/home/announcement-june-2026-batch.jpg";

  if (variant === "mobile") {
    // Compact in-flow teaser. No prev/next controls: at this card height
    // (~92px total — p-4 padding plus the 56px thumbnail) there is no room
    // for a second interactive row that still clears the 44px touch-target
    // minimum without inflating the card past the "teaser, not the
    // announcement" budget. Rotation is carried by the existing auto-advance
    // timer instead, and the whole row is one tap target through to the full
    // announcement.
    return (
      <Link
        href={`/announcements/${announcement.id}`}
        // hero-fade-slide is the same load-choreography utility the badge/
        // headline/CTAs use (globals.css "hero load choreography" block):
        // base state is fully visible, motion is additive under
        // prefers-reduced-motion:no-preference, and it self-disables below
        // 640px so true phones never wait on it. --reveal-delay 0.05s places
        // this ahead of the badge's 0.1s since it is now the first element
        // in the column.
        className="hero-fade-slide 2xl:hidden flex w-full items-center gap-3 rounded-2xl border border-primary/40 bg-background/80 p-4 text-left shadow-glow-sm backdrop-blur-md transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary motion-reduce:transition-none"
        style={{ "--reveal-delay": "0.05s" } as React.CSSProperties}
        aria-label={`Read announcement: ${announcement.title}`}
      >
        <Image src={mediaUrl} alt="" width={56} height={56} className="size-14 shrink-0 rounded-lg border border-glass-border object-cover" />
        <div className="min-w-0 flex-1 text-left">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold tracking-wider text-primary">
            <span className="size-1.5 shrink-0 rounded-full bg-primary" aria-hidden /> LIVE UPDATES
            <span className="shrink-0 rounded-full bg-primary/15 px-1.5 py-0.5 text-[9px]">{announcement.type}</span>
          </div>
          <p className="mt-1 truncate text-sm font-semibold leading-snug">{announcement.title}</p>
          <p className="mt-0.5 text-[10px] text-muted-foreground">{createdAt}</p>
        </div>
      </Link>
    );
  }

  return (
    // top-[76px] clears the fixed navbar (h-[68px] in navbar-shell.tsx) with a
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
    // it (verified: 9px gap at exactly 1536). Below 2xl this card is `hidden`
    // and the "mobile" variant of this same component — mounted separately by
    // hero.tsx as the first item in the hero's content column — carries the
    // same content instead. It never overlaps anything because it stacks in
    // normal document flow.
    <aside className="fixed top-[76px] right-3 z-30 hidden w-[min(360px,calc(100vw-1.5rem))] rounded-2xl border border-primary/40 bg-background/80 p-3 shadow-glow-md backdrop-blur-md transition-[opacity,transform,visibility] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none data-[hidden=true]:invisible data-[hidden=true]:pointer-events-none data-[hidden=true]:-translate-y-3 data-[hidden=true]:opacity-0 2xl:block 2xl:top-[84px] 2xl:right-6 2xl:p-5" data-hidden={hidden} aria-hidden={hidden} aria-label="Live updates">
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
      <Link
        href={`/announcements/${announcement.id}`}
        className="mt-4 flex w-full gap-3 rounded-xl text-left transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary motion-reduce:transition-none"
        aria-label={`Read announcement: ${announcement.title}`}
      >
        <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold leading-snug">{announcement.title}</h2>
          <p
            className="mt-1.5 line-clamp-2 overflow-hidden text-[11px] leading-relaxed text-muted-foreground"
          >
            {announcement.body}
          </p>
          <p className="mt-2 text-[10px] text-primary">
            {createdAt} <span className="text-muted-foreground">·</span> Read full update
          </p>
        </div>
        <Image src={mediaUrl} alt="" width={72} height={72} className="size-[72px] shrink-0 rounded-lg border border-glass-border object-cover" />
      </Link>
    </aside>
  );
}
