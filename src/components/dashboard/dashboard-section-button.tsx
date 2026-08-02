"use client";

import { useDashboardNavigation } from "./dashboard-shell";

export function DashboardSectionButton({ section, children, className }: { section: string; children: React.ReactNode; className?: string }) {
  const { setActiveSection } = useDashboardNavigation();
  return (
    <button type="button" className={className} onClick={() => setActiveSection(section)}>
      {children}
    </button>
  );
}
