import type { Metadata } from "next";

import { Navbar } from "@/components/layout/navbar";

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
 * Shared chrome for every route in the (app) group (forum, communities).
 * Unlike (marketing)'s layout, this one does NOT also render <Footer /> at
 * the group level: mobile-01.md #28-30 documents the post detail view
 * (/forum/[id]) as a deliberately footer-less "focused reading mode" ending
 * only in a centered "Back to Forum" button, so each page under this group
 * renders its own <Footer /> at the bottom of its JSX instead — every page
 * except /forum/[id] does. Navbar and Footer are imported, never modified,
 * per the wave-2 contract (wave 1 owns src/components/layout/**).
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
    </>
  );
}
