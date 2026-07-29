import type { Metadata } from "next";
import { Geist_Mono, Inter, Manrope, Teachers } from "next/font/google";
import "./globals.css";

/**
 * The design system declares three families (docs/research/01-design-source.md):
 *   --font-title : Teachers   headings
 *   --font-sub   : Manrope    subheads, stat labels, nav
 *   --font-body  : Inter      body copy
 *
 * The published Figma site substitutes Source Sans 3 for all three only because
 * Figma Sites did not ship those faces. We use the declared intent.
 */
const teachers = Teachers({
  variable: "--font-teachers",
  subsets: ["latin"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HardTech IT Corp",
  description:
    "Comprehensive training in computer and cellphone hardware servicing and IT software development, featuring online enrollment, interactive dashboards, and a sleek, futuristic design.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      /**
       * `dark` is hard-set: every screenshot in docs/screens/ is dark, and dark
       * is the primary theme. A light palette exists in globals.css because the
       * source ships one, but it is not the shipped experience.
       *
       * `data-scroll-behavior="smooth"` is required in Next 16 — the framework
       * no longer overrides scroll-behavior during navigation on its own, so
       * without it route changes animate instead of jumping.
       * See .claude/rules/30-nextjs-16.md §7.
       */
      className={`dark ${teachers.variable} ${manrope.variable} ${inter.variable} ${geistMono.variable} h-full antialiased`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
