import { Info } from "lucide-react";

/**
 * Honest placeholder for sections whose live read does not exist yet.
 * `src/server/services/dashboard.service.ts`'s own module docstring lists
 * exactly which admin surfaces it deliberately does not cover (User
 * Management table, Trainer Management roster, Certificate Approvals list,
 * Announcements, Payment Methods, Audit Log, the Analytics month-by-month
 * charts) and says so "in the return report, not silently skipped."
 *
 * This is NOT a design-sourced empty state (e.g. "No trainees assigned
 * yet" is real product copy from a screenshot; this is not) — it exists so
 * the page never fabricates numbers, names, or rows for data no service
 * call can currently supply. `detail` names the specific missing read for
 * whoever wires it up next.
 */
export function DataNotConnectedNote({ detail }: { detail: string }) {
  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-dashed border-glass-border bg-surface-secondary/40 p-4 text-sm text-muted-foreground">
      <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
      <p>Live data for this section isn&apos;t wired up yet. {detail}</p>
    </div>
  );
}
