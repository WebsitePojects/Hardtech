import Link from "next/link";
import { ArrowRight, ChevronRight, CircleCheckBig } from "lucide-react";

import { getAdminAnnouncements } from "@/server/services/dashboard.service";
import { Button } from "@/components/ui/button";
import { AnnouncementsCard } from "./announcements-card";
import { HeroBackground } from "./hero-background";
import { HeroFrame } from "./hero-frame";
import { HeroFrameChrome } from "./hero-frame-chrome";

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
      <HeroFrame />
      {/*
        HeroFrameChrome renders the in-frame header/scroll-down/social
        controls that live inside HeroFrame's frame and hand off to the
        real navbar on scroll (see that file's own doc comment for the
        occlusion strategy and hero-frame.tsx for the ScrollTrigger driving
        the handoff). Only plain JSX crosses this Server->Client boundary —
        no props at all, let alone a function — per the /forum incident in
        the lessons log: both client components below are fully
        self-contained and coordinate with each other only through a DOM
        attribute (`html[data-hero-open]`), never through React props.
      */}
      <HeroFrameChrome />
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
        Horizontal padding here is a safe-area against HeroFrame, not a
        typography choice. HeroFrame is `fixed inset-5 sm:inset-8` — its
        border sits 20px off the viewport edge below the `sm` breakpoint and
        32px at `sm` and up — and it paints at z-[9000], above this column.
        px-9/sm:px-12 (36px/48px) each clear their matching frame inset by a
        real 16px, not by rounding up to it, so the border line can never
        land on a glyph even if either value is retuned later. Keep these two
        paddings numerically ahead of HeroFrame's two insets by that same
        margin if either file changes.

        The `max-height` variant is HeroFrame's *vertical* safe-area case.
        HeroFrame insets from all four edges, not just the two handled
        above, and on a short landscape phone (740x360, the specific
        below-500px-tall shape this section is required to support by
        scrolling rather than clipping — see the min-height comment on the
        section) this column's item stack (teaser, H1, subheading, CTAs,
        trust row) is naturally taller than the room between HeroFrame's top
        and bottom borders. Measured before this fix: the frame's bottom
        border sat at y=330 while the subheading's own box ran 304.7-359.6,
        straddling it — and the gap below the border down to the true
        viewport edge (330-360, 30px) is shorter than the subheading's own
        height (~55px), so pushing the subheading *down* past the border
        can't work — it would land mostly off-screen instead (verified by
        re-measuring: contrast collapsed to ~1:1 because most of the box was
        outside the captured viewport). The only geometry that keeps the
        text fully visible AND off the border is shrinking the stack so it
        finishes clear of y=330 on its own — and only the two gaps *above*
        the subheading (teaser-to-H1, H1-to-subheading) contribute to that,
        since `gap` is one CSS property and the two gaps below it don't move
        it. `gap-2` cuts each of those two gaps from ~22.5px to ~7.5px,
        verified empirically in Playwright rather than computed by hand
        (this codebase has twice been burned by rem-scaling assumptions not
        matching rendered pixels — see `.claude/lessons.md`, 2026-07-29 and
        2026-08-09 entries). `gap-0` was tried first and does clear the
        border, but it also zeroes the H1-to-subheading gap specifically,
        and the subheading's own opaque contrast scrim (the two divs above,
        off-limits per the task's hard constraints) intentionally extends
        past the subheading's own box on every side — with zero gap it bled
        up into the H1's line, and a screenshot pixel-sample caught the
        H1's green gradient text inside what should have been a clean
        background sample. `gap-2` leaves enough room for that scrim to
        clear the H1 line above it; the rest of the needed space comes from
        hiding the announcements teaser below, not from gap size. This
        doesn't touch `pt-20` (navbar clearance, preserved per the
        section-level comment) or any element's own size/copy.
        `max-height:480px` comfortably excludes the shortest *portrait*
        viewport verified here (568px tall). Re-measure in Playwright if the
        stack's content changes.
      */}
      <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center gap-4 px-9 pb-8 text-center sm:gap-6 sm:px-12 sm:pb-16 lg:max-w-5xl lg:gap-7 lg:pb-24 [@media(max-height:480px)]:gap-2">
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
        {/*
          Hidden only below max-height:480px (see the gap-0 note above): even
          with the four inter-item gaps collapsed to 0, H1 + subheading + CTA
          row alone don't clear HeroFrame's bottom border on a 740x360
          landscape phone — there isn't a spacing knob left to turn. The
          teaser is supplementary (this same component already disappears at
          the opposite end, 2xl+, in favour of the floating rail variant —
          see announcements-card.tsx), so dropping it on this one extreme
          aspect ratio frees the ~90px the required elements (H1, subheading,
          CTA) actually need, verified in Playwright, rather than compressing
          copy or touching HeroFrame's own insets.
        */}
        <div className="[@media(max-height:480px)]:hidden">
          <AnnouncementsCard announcements={announcements} variant="mobile" />
        </div>
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
