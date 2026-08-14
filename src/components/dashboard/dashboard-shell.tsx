"use client";

import { createContext, useContext, useEffect, useLayoutEffect, useMemo, useState } from "react";

import type { UserRole } from "@/../generated/prisma/enums";
import { dashboardNavItems } from "./dashboard-nav-items";

// React warns on useLayoutEffect during SSR; it never actually runs there
// (no DOM), so alias to useEffect on the server and the real thing in the
// browser — the standard guard for a browser-only layout effect.
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

type DashboardNavigationContextValue = {
  activeSection: string;
  setActiveSection: (section: string) => void;
};

const DashboardNavigationContext = createContext<DashboardNavigationContextValue | null>(null);

export function useDashboardNavigation() {
  const context = useContext(DashboardNavigationContext);
  if (!context) throw new Error("Dashboard navigation must be used inside DashboardShell.");
  return context;
}

export function DashboardShell({ role, children }: { role: UserRole; children: React.ReactNode }) {
  const items = dashboardNavItems[role];
  const validSections = useMemo(() => new Set(items.map((item) => item.id)), [items]);
  const [activeSection, setActiveSectionState] = useState(items[0]?.id ?? "");

  function setActiveSection(section: string) {
    if (validSections.has(section)) setActiveSectionState(section);
    else setActiveSectionState(items[0]?.id ?? "");
  }

  // Radix portals (Sheet, Select, DropdownMenu — all used inside the
  // dashboard, some in src/features/dashboard-admin/** which this wave does
  // not own) mount their content as a direct child of <body>, outside the
  // `dashboard-scope` wrapper div below. CSS custom properties inherit down
  // the DOM tree, so a portaled node is NOT a descendant of that div and
  // would silently keep the old shared tokens. Mirroring the class onto
  // <body> while this shell is mounted puts every portal back inside the
  // scope too, since document.body is portaled content's real DOM parent.
  // useLayoutEffect (not useEffect) so it lands before first paint — no
  // flash of the old, flatter tokens on a client-side route transition.
  useIsomorphicLayoutEffect(() => {
    document.body.classList.add("dashboard-scope");
    return () => {
      document.body.classList.remove("dashboard-scope");
    };
  }, []);

  return (
    <DashboardNavigationContext.Provider value={{ activeSection, setActiveSection }}>
      {/* `dashboard-scope` re-declares the shadcn surface tokens
       * (--secondary/--muted/--accent/--input/--border/--ring/--destructive)
       * for every descendant — see the block in globals.css right after
       * `.dark { ... }` for why this is scoped here instead of mutating
       * those tokens globally. `contents` keeps the wrapper out of the box
       * tree (layout.tsx's own flex/min-h-screen div renders unchanged as
       * this element's only child); CSS custom property inheritance follows
       * the DOM, not the box tree, so the scoping still applies. */}
      <div className="dashboard-scope contents">{children}</div>
    </DashboardNavigationContext.Provider>
  );
}

export function DashboardSection({ section, children }: { section: string; children: React.ReactNode }) {
  const { activeSection } = useDashboardNavigation();
  const isActive = activeSection === section;

  return (
    <div hidden={!isActive} aria-hidden={!isActive}>
      {children}
    </div>
  );
}
