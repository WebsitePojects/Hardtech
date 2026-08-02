"use client";

import { createContext, useContext, useMemo, useState } from "react";

import type { UserRole } from "@/../generated/prisma/enums";
import { dashboardNavItems } from "./dashboard-nav-items";

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

  return (
    <DashboardNavigationContext.Provider value={{ activeSection, setActiveSection }}>
      {children}
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
