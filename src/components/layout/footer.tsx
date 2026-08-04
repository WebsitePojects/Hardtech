import Link from "next/link";
import { ExternalLink, Mail, MapPin, Phone } from "lucide-react";

import { SiteLogo } from "./site-logo";

/**
 * Global site footer (docs/screens/desktop-01.md #5, docs/screens/
 * mobile-01.md #8, docs/screens/mobile-02.md 141637): a 3-column desktop
 * grid — brand block, Quick Links, Contact — that stacks to a single column
 * on mobile, then a copyright bar. Quick Links intentionally omits Enroll
 * and Forum; every screenshot of this footer (desktop and mobile) shows
 * only Home / About / Programs / Gallery / Contact.
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
    <footer className="border-t border-glass-border bg-surface-secondary">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-10 sm:px-6 md:grid-cols-3 md:py-12">
        <div className="flex flex-col gap-4">
          <SiteLogo />
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
            className="inline-flex w-fit items-center gap-2 rounded-full border border-glass-border px-4 py-2 text-sm font-medium text-foreground transition-[background-color,border-color,box-shadow] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background hover:border-[var(--glass-border-strong)] hover:bg-glass-hover hover:shadow-glow-sm motion-reduce:transition-none"
          >
            <ExternalLink className="size-4" aria-hidden />
            Follow on Facebook
          </a>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="font-sub text-xs font-semibold tracking-widest text-neon uppercase">
            Quick Links
          </h3>
          <ul className="flex flex-col gap-2">
            {quickLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background hover:text-foreground motion-reduce:transition-none"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-3">
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
              className="flex items-center gap-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background hover:text-foreground motion-reduce:transition-none"
            >
              <Phone className="size-4 shrink-0" aria-hidden />
              (123) 456-7890
            </a>
            <a
              href="mailto:hardtechitcorp@gmail.com"
              className="flex items-center gap-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background hover:text-foreground motion-reduce:transition-none"
            >
              <Mail className="size-4 shrink-0" aria-hidden />
              hardtechitcorp@gmail.com
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-glass-border">
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
