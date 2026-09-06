import Link from "next/link";
import { ArrowRight, ChevronRight, CircleCheckBig } from "lucide-react";

import { getAdminAnnouncements } from "@/server/services/dashboard.service";
import { Button } from "@/components/ui/button";
import { AnnouncementsCard } from "./announcements-card";
import { HeroBackground } from "./hero-background";

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
    <section className="hero-full-bleed relative flex flex-col overflow-hidden pt-20 lg:pt-24">
      {/*
        Fills the viewport at every screen size (client requirement). Two
        things this can't be done with alone:
        - `100vh` on mobile Safari/Chrome includes the collapsing URL bar's
          space, so it overflows the *actual* visible area and the page
          jump-scrolls the moment the bar collapses. `100dvh` tracks the
          real visible viewport instead. `min-height`, not `height`: a fixed
          height would force this section to clip or internally scroll on a
          short landscape phone (740x360) where the content genuinely can't
          fit in one screen's worth of height — `min-height` instead lets
          the section (and the page under it) grow taller and scroll
          normally, so nothing is ever cut off.
        - Stacking two Tailwind arbitrary-value utilities for the same
          property (`min-h-[100vh] min-h-[100dvh]`) doesn't reliably
          guarantee cascade order, since Tailwind's own utility sort isn't a
          documented contract to build a fallback on. A plain `<style>`
          block is real CSS text parsed top to bottom: browsers without
          `dvh` support treat that whole declaration as invalid and keep the
          `vh` value above it, which is the standard "just let it fail"
          feature-fallback pattern for viewport units.
      */}
      <style>{`.hero-full-bleed { min-height: 100vh; min-height: 100dvh; }`}</style>
      <HeroBackground />
      {/*
        pt-20/lg:pt-24 (80/96px) lives on the section itself, not the
        centred column below, so navbar clearance (navbar-shell.tsx is
        `fixed` and reserves no flow space) is a fixed reservation at the
        very top regardless of how tall the centred content turns out to
        be — centring the column inside the *remaining* height (the
        `flex-1` div below) can never re-encroach on that space. Originally
        this padding lived on the content column when the layout was
        top-aligned rather than centred; moved up 2026-08-31 when the hero
        was made full-viewport. Value unchanged from the last measured pass
        (see the removed status-badge note in git history) — re-measure if
        this is ever revisited.
      */}
      {/*
        px-4/sm:px-6 (16px/24px) is plain content-column padding — the frame
        that used to require an extra safe-area margin here is gone (see
        .claude/lessons.md and this feature's removal history). No other
        element in this column insets from the viewport edge, so there is
        nothing left to clear but ordinary edge-to-text breathing room.
      */}
      <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center gap-4 px-4 pb-8 text-center sm:gap-6 sm:px-6 sm:pb-16 lg:max-w-5xl lg:gap-7 lg:pb-24">
        {/*
          vgldesign hero load choreography (globals.css, "hero load
          choreography" block): fires once on mount, on its own timeline —
          not the scroll-reveal system. Each headline line masks up from
          translateY(100%); the CTA row slides in from the left. Staggered
          via inline --reveal-delay custom properties (mobile teaser 0.05s,
          headline lines 0.2s/0.4s, subtext 0.6s, CTAs 0.8s) so the eye
          finishes reading before the button asks for a click, matching the
          measured cadence in vgldesign technique #2. Restaged 2026-08-31
          after the status badge (previously 0.1s, between the teaser and
          headline) was removed — closing that gap keeps even ~0.2s spacing
          instead of leaving a 0.05s->0.3s hole. Pure CSS — no "use client"
          needed, this stays a Server Component.
        */}
        {/*
          In-flow mobile/tablet/laptop teaser: first item in this column, so
          it reserves its own space above the headline instead of floating
          over it. Only `announcements` (plain serialized data) crosses the
          Server->Client boundary — never a function — per the /forum
          incident in the lessons log. Hidden at 2xl, where the floating
          right-rail variant below takes over; see announcements-card.tsx for
          why 2xl is the split.
        */}
        <AnnouncementsCard announcements={announcements} variant="mobile" />
        <h1 className="text-4xl font-bold leading-[1.08] text-balance sm:text-5xl lg:text-7xl">
          <span className="hero-reveal-line block">
            <span style={{ "--reveal-delay": "0.2s" } as React.CSSProperties}>Build Your Future</span>
          </span>
          <span className="hero-reveal-line block">
            <span style={{ "--reveal-delay": "0.4s" } as React.CSSProperties}>
              in <span className="bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">Modern Technology</span>
            </span>
          </span>
        </h1>
        {/*
          Contrast fix (measured against the client's screenshot, then
          re-measured with real pixel sampling — see the task receipt): the
          brightest WebGL line pixels behind the subheading pushed contrast
          as low as 1.07:1 in places — effectively invisible — against the
          4.5:1 body-text floor. The H1 wasn't affected (bold white reads
          fine over the same animation) so only this element gets treated.

          Two layers, not one gradient: an earlier single-radial-gradient
          version looked right but measured wrong — its 50%->100% fade
          started *inside* the paragraph's own edges (a radial gradient's
          percentage stops are relative to the box's far corner, not its
          near edge, so a box only modestly larger than the text left the
          fade zone overlapping real glyphs at the ends of each line).
          Splitting the job removes that failure mode instead of re-tuning
          percentages that would only hold for this exact text length:
          - the solid inner layer is *fully* opaque (not merely high-alpha)
            across the entire text box: a translucent version of this same
            layer measured fine by eye but still let a WebGL line's bright
            core bleed through at just enough pixels to fail 4.5:1 at three
            of the four verified viewports (a thin anti-aliased line edge
            can carry very high per-channel brightness even at a few
            percent pass-through). Full opacity removes the bleed-through
            question entirely instead of re-tuning the alpha by eye;
          - the blurred outer halo is purely the "soft vignette, not a hard
            box" read the brief asks for, and carries none of the contrast
            guarantee — it can be as soft as it likes.
          Both keyed off the `--background` token (the page's own
          near-black) at alpha, never a new colour, reusing the
          `-z-10`-behind-in-flow-content pattern HeroBackground already
          establishes one level up. Scoped tightly to the paragraph, not
          the H1 or CTAs, and nowhere near "full-screen darken."
        */}
        <div className="relative">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -inset-x-12 -inset-y-8 -z-20 rounded-[2rem] bg-background/45 blur-2xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -inset-x-8 -inset-y-6 -z-10 rounded-xl bg-background"
          />
          <p
            className="hero-fade-slide max-w-2xl text-lg leading-relaxed text-muted-foreground lg:text-xl"
            style={{ "--reveal-delay": "0.6s" } as React.CSSProperties}
          >
            Get professionally trained in Computer Hardware Servicing and Cellphone Repair through immersive hands-on learning.
          </p>
        </div>
        <div
          className="hero-fade-slide flex flex-col gap-3 sm:flex-row"
          style={{ "--reveal-delay": "0.8s" } as React.CSSProperties}
        >
          <Button asChild size="lg"><Link href="/enroll">Enroll Now<ArrowRight /></Link></Button>
          <Button asChild size="lg" variant="outline"><Link href="/programs">Explore Programs<ChevronRight /></Link></Button>
        </div>
        <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-2 text-sm text-muted-foreground">
          {TRUST_ITEMS.map((item) => <li key={item.label} className="flex items-center gap-1.5"><CircleCheckBig className={`size-4 ${item.colorClass}`} />{item.label}</li>)}
        </ul>
      </div>
      <AnnouncementsCard announcements={announcements} variant="floating" />
    </section>
  );
}
