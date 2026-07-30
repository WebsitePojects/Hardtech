import { Navbar } from "@/components/layout/navbar";

/**
 * Shared chrome for /login and /forgot-password. Both screenshots
 * (docs/screens/desktop-02.md #1, docs/screens/mobile-04.md #11-12) show the
 * same floating glass navbar used across the marketing routes, but no
 * global Footer — the login page's own "© 2026 HardTech IT Corp. All rights
 * reserved." line is page content (inside the left marketing column), not
 * shared chrome, so it is not duplicated here.
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
    </>
  );
}
