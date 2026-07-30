import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const PERSONAS = [
  { matchName: "Carlos Reyes", label: "Carlos Reyes · In Progress" },
  { matchName: "Liza Cruz", label: "Liza Cruz · Graduate" },
] as const;

export type DemoPersonaBannerProps = {
  /** The real signed-in trainee's display name (getDashboardUser). Decides
   * which pill renders as "selected" — see the security note below. */
  displayName: string;
};

/**
 * desktop-02.md #22 / mobile-06.md 14:32:09: an amber-bordered "DEMO / View
 * as:" strip toggling between the Carlos Reyes (in-progress) and Liza Cruz
 * (graduate) seeded personas.
 *
 * Reproduced as a *display-only* affordance, not a working switch. In the
 * reference product the other pill re-renders a different trainee's whole
 * dashboard — which means a signed-in trainee could pull another real
 * trainee's progress/session data with a client-side click. That is a
 * cross-tenant data exposure, not a cosmetic demo trick
 * (.claude/rules/00-non-negotiables.md rule 5: server-side authorization on
 * every route — a client control must never be what decides whose data
 * loads). `getTraineeOverview` takes whatever id its caller passes with no
 * ownership check of its own, so nothing stops that misuse except this
 * component's own restraint.
 *
 * So: the pill matching the *real* signed-in trainee (matched by name,
 * since AUTH's `Session` intentionally carries no PII beyond
 * `userId`/`role` — see `role-meta.ts`) renders selected; the other seeded
 * persona's pill renders present but `disabled`, with no click handler and
 * no second data fetch anywhere near it. If the signed-in trainee is
 * neither seeded demo persona, both pills render disabled/inert — this
 * banner never guesses at an identity to highlight.
 *
 * TODO(wave-4): a genuine "view as" feature needs a server-side,
 * admin-authorized, audited endpoint (its own authz check, its own audit
 * log row per rules 6/7) — not a client toggle over another user's real
 * service read.
 */
export function DemoPersonaBanner({ displayName }: DemoPersonaBannerProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-dashed border-brand-orange/40 bg-brand-orange/5 p-3">
      <Badge variant="outline" className="border-brand-orange/50 text-brand-orange">
        DEMO
      </Badge>
      <span className="text-sm text-muted-foreground">View as:</span>
      <div className="flex flex-wrap gap-2">
        {PERSONAS.map((persona) => {
          const isSelf = persona.matchName === displayName;
          return (
            <button
              key={persona.matchName}
              type="button"
              disabled={!isSelf}
              aria-pressed={isSelf}
              title={isSelf ? undefined : "Switching identity isn't available in this build"}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                isSelf
                  ? "border-primary bg-primary text-primary-foreground"
                  : "cursor-not-allowed border-border text-muted-foreground opacity-60"
              )}
            >
              {persona.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
