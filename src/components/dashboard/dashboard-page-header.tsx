import { cn } from "@/lib/utils";

export type DashboardPageHeaderProps = {
  /** Transcribe verbatim from docs/screens/ — e.g. admin's nav says
   * "Analytics" but its own H1 is "Reports & Analytics"; pass whichever
   * string the target page's screenshot actually shows as its heading. */
  title: string;
  description?: string;
  className?: string;
};

/**
 * H1 + subtext pattern repeated at the top of every dashboard section in
 * docs/screens/desktop-02.md (e.g. "System Overview" / "HardTech IT Corp —
 * operations at a glance"). Presentational only — no data fetching, no
 * copy invented here.
 */
export function DashboardPageHeader({
  title,
  description,
  className,
}: DashboardPageHeaderProps) {
  return (
    <div className={cn("space-y-1", className)}>
      <h1 className="font-heading text-2xl font-semibold text-foreground sm:text-3xl">
        {title}
      </h1>
      {description ? (
        <p className="text-sm text-muted-foreground sm:text-base">{description}</p>
      ) : null}
    </div>
  );
}
