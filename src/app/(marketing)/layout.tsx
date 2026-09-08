import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { OrganizationJsonLd } from "./organization-json-ld";

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
      <OrganizationJsonLd />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
