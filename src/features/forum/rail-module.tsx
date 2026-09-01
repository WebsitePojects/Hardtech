import type { LucideIcon } from "lucide-react";

/**
 * Shared header treatment for the three right-rail modules (Top
 * Contributors, Top Questions, Popular Hashtags). Extracted because all
 * three repeat the identical icon + eyebrow-label header — the third
 * occurrence is the DRY threshold per .claude/rules root CLAUDE.md
 * ("Extract on the third occurrence"). Keeping this as the only shared
 * piece (not a full card wrapper) is deliberate: the rail should read as
 * one system via this header, while each module's body differs enough
 * (ranked list vs. numbered list vs. tag/count pairs) that forcing a
 * shared body template would just be an abstraction with three special
 * cases inside it.
 */
export function RailModule({
  icon: Icon,
  title,
  children,
}: {
  icon: LucideIcon;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-b border-glass-border pb-5 last:border-b-0 last:pb-0 lg:rounded-2xl lg:border lg:border-glass-border lg:bg-surface-card lg:p-4 lg:pb-4">
      <h2 className="mb-3 flex items-center gap-2 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
        <Icon className="size-4 text-primary" aria-hidden />
        {title}
      </h2>
      {children}
    </section>
  );
}
