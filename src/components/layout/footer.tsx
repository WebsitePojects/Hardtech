import Link from "next/link";
import { ExternalLink, Mail, MapPin, Phone } from "lucide-react";

import { SiteLogo } from "./site-logo";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { GradientWordmark } from "@/components/ui/gradient-wordmark";

/**
 * Global site footer (docs/screens/desktop-01.md #5, docs/screens/
 * mobile-01.md #8, docs/screens/mobile-02.md 141637): a 3-column desktop
 * grid — brand block, Quick Links, Contact — that stacks to a single column
 * on mobile, then a copyright bar. Quick Links intentionally omits Enroll
 * and Forum; every screenshot of this footer (desktop and mobile) shows
 * only Home / About / Programs / Gallery / Contact.
 *
 * The KaiboPH-style "signature footer" pass on top of that structure: each
 * column reveals on scroll with an 80ms stagger (vgldesign technique #1,
 * `EASE_REVEAL`), the section sits on the same tinted `.hero-glow` radial
 * used behind the homepage hero (not pure black), and it closes on an
 * oversized ghost "HARDTECH" wordmark (the shared `GradientWordmark`
 * primitive) instead of a flat link list — the large-scale
 * layered-typography closing moment the reference genre is known for. No
 * copy was added: every string below already existed in this file.
 */
const quickLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Programs", href: "/programs" },
  { label: "Gallery", href: "/gallery" },
  { label: "Contact", href: "/contact" },
];

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-glass-border bg-surface-secondary">
      {/* Same tinted radial glow language as the homepage hero — brand
          green, never pure black. Negative z-index keeps it behind the
          (non-positioned) content below regardless of DOM order. */}
      <div
        aria-hidden
        className="hero-glow pointer-events-none absolute inset-x-0 top-0 -z-10 h-[28rem] opacity-70"
      />

      <div className="relative mx-auto grid w-full max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-3 md:py-20">
        <ScrollReveal className="flex flex-col gap-4">
          <SiteLogo className="py-1" />
          <p className="max-w-xs text-sm text-muted-foreground">
            Professional IT training for tomorrow&apos;s tech leaders.
          </p>
          {/*
            The design source has no confirmed HardTech company Facebook
            page URL (only individual staff profiles), so this links nowhere
            real yet. lucide-react also ships no Facebook brand glyph
            (brand icons were dropped from the package) — ExternalLink
            stands in for it.
          */}
          <a
            href="#"
            className="inline-flex min-h-11 w-fit items-center gap-2 rounded-full border border-glass-border px-4 py-2 text-sm font-medium text-foreground transition-[background-color,border-color,box-shadow] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background hover:border-[var(--glass-border-strong)] hover:bg-glass-hover hover:shadow-glow-sm motion-reduce:transition-none"
          >
            <ExternalLink className="size-4" aria-hidden />
            Follow on Facebook
          </a>
        </ScrollReveal>

        <ScrollReveal delayMs={80} className="flex flex-col gap-3">
          <h3 className="font-sub text-xs font-semibold tracking-widest text-neon uppercase">
            Quick Links
          </h3>
          <ul className="flex flex-col gap-2">
            {quickLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="inline-flex min-h-11 items-center text-sm text-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background hover:text-foreground motion-reduce:transition-none"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </ScrollReveal>

        <ScrollReveal delayMs={160} className="flex flex-col gap-3">
          <h3 className="font-sub text-xs font-semibold tracking-widest text-neon uppercase">
            Contact
          </h3>
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <span className="flex items-start gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden />
              673 Quirino Highway, Novaliches, QC
            </span>
            <a
              href="tel:1234567890"
              className="flex min-h-11 items-center gap-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background hover:text-foreground motion-reduce:transition-none"
            >
              <Phone className="size-4 shrink-0" aria-hidden />
              (123) 456-7890
            </a>
            <a
              href="mailto:hardtechitcorp@gmail.com"
              className="flex min-h-11 items-center gap-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background hover:text-foreground motion-reduce:transition-none"
            >
              <Mail className="size-4 shrink-0" aria-hidden />
              hardtechitcorp@gmail.com
            </a>
          </div>
        </ScrollReveal>
      </div>

      {/* Closing visual moment: an oversized ghost wordmark in the brand's
          Teachers title face, tinted with the same green the rest of the
          site glows with. Purely decorative — SiteLogo above already carries
          the accessible brand name — so it's hidden from the a11y tree and
          clipped by the footer's own overflow-hidden rather than widening
          the page.

          This sits directly above the copyright bar — the last element on
          the page — so the default ScrollReveal (rootMargin -80px, 15%
          threshold) could never fire here: on a short document the page
          runs out of scroll room before this element satisfies "15%
          visible inside a viewport 80px shorter than the real one," and it
          stayed at opacity: 0 forever (verified via computed-style probe,
          simulated scroll to the document's end at 390x900). Fixed at the
          source instead of worked around here: `ScrollReveal` now takes a
          `nearBottom` prop for exactly this case (see
          src/components/motion/scroll-reveal.tsx) — `rootMargin: "0px"` and
          `threshold: 0`, satisfiable by an element with no more page below
          it to scroll through. Re-verified firing after the fix (Playwright,
          scrolled to document end, 390x900): opacity 0 -> 1. Now rendered
          via the shared GradientWordmark primitive (see
          src/components/ui/gradient-wordmark.tsx) instead of a bespoke
          span. */}
      <ScrollReveal nearBottom durationMs={900} className="relative -mb-3 select-none text-center sm:-mb-4 md:-mb-6">
        <GradientWordmark text="HARDTECH" />
      </ScrollReveal>

      <div className="relative border-t border-glass-border">
        <p className="mx-auto max-w-6xl px-4 py-6 text-center text-xs text-muted-foreground sm:px-6">
          © 2026 HardTech IT Corp. All rights reserved. · Powered by{" "}
          <a href="#" className="font-medium text-neon focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background hover:underline">
            Prince IT Solutions
          </a>
        </p>
      </div>
    </footer>
  );
}
