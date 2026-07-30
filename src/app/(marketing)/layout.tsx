import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";

/**
 * Shared chrome for every route in the (marketing) group. Route builders
 * render page content only — no navbar, no footer, no page-level
 * `<html>`/`<body>` (those live in the root layout).
 */
export default function MarketingLayout({
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
