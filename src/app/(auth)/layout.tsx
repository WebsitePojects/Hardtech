import type { Metadata } from "next";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    noimageindex: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

/**
 * Shared chrome for /login and /forgot-password. Both screenshots
 * (docs/screens/desktop-02.md #1, docs/screens/mobile-04.md #11-12) show the
 * same floating glass navbar used across the marketing routes.
 *
 * The global Footer IS rendered here — an earlier version of this comment
 * claimed it was not, while the code below rendered it anyway. Measuring the
 * reference settled it: its /login has a <footer> too, starting at y=996 on a
 * 900px viewport, i.e. below the fold because the login panel is exactly one
 * viewport tall. The page keeps its own "© 2026 HardTech IT Corp." line inside
 * the left marketing column; that is page content and is not the same element.
 *
 * So the footer stays, and login/page.tsx carries min-h-screen to push it off
 * the first screen. Removing the footer here would break /forgot-password,
 * which shares this layout and does not fill the viewport.
 *
 * Navbar itself is orchestrator-owned (src/components/layout/**) and is
 * read-only to AUTH this wave.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
