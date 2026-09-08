import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { ProgramPhoto } from "@/features/programs/program-photo";
import {
  renderProgramIcon,
  resolveAccent,
  resolveProgramImagery,
} from "@/features/programs/program-visuals";
import { cn } from "@/lib/utils";
import type { ProgramWithCurriculum } from "@/server/services/marketing.service";

export function ProgramsSection({
  programs,
}: {
  programs: ProgramWithCurriculum[];
}) {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
          WHAT WE OFFER
        </p>
        <h2 className="mt-3 text-3xl font-bold text-primary sm:text-4xl">
          Core Programs
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
          Choose a hands-on training path, then review its curriculum before you enroll.
        </p>
      </div>

      {programs.length === 0 ? (
        <p className="mx-auto mt-8 max-w-xl rounded-2xl border border-glass-border bg-surface-secondary px-5 py-6 text-center text-sm text-muted-foreground">
          Programs are being prepared. Please check back soon or contact us for enrollment guidance.
        </p>
      ) : (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 sm:gap-5 lg:mt-10 lg:gap-6">
          {programs.map((program) => {
            const accent = resolveAccent(program.accentColor);
            const imagery = resolveProgramImagery(program);
            const detailHref = `/programs/${encodeURIComponent(program.shortName)}`;

            return (
              <li key={program.id}>
                <Link
                  href={detailHref}
                  aria-label={`View details for ${program.name}`}
                  className="group block h-full rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-background"
                >
                  <article className="relative flex h-full min-h-64 overflow-hidden rounded-2xl border border-glass-border bg-surface-secondary p-5 transition-[border-color,box-shadow,transform] duration-200 motion-reduce:transform-none motion-reduce:transition-none sm:p-6 lg:group-hover:-translate-y-0.5 lg:group-hover:border-[var(--glass-border-strong)] lg:group-hover:shadow-glow-md">
                    {imagery.kind === "photo" ? (
                      <div className="absolute inset-0 opacity-25">
                        <ProgramPhoto src={imagery.src!} alt="" />
                      </div>
                    ) : (
                      <div
                        aria-hidden="true"
                        className={cn("pointer-events-none absolute inset-0", accent.bg)}
                      >
                        {renderProgramIcon(
                          program.iconName,
                          cn("absolute -right-5 -bottom-5 size-40 opacity-10", accent.text),
                        )}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-background/70" aria-hidden="true" />

                    <div className="relative flex w-full flex-col items-start">
                      <span className={cn("flex size-11 items-center justify-center rounded-xl", accent.bg)}>
                        {renderProgramIcon(program.iconName, cn("size-5", accent.text))}
                      </span>
                      <h3 className="mt-8 text-xl font-semibold text-foreground sm:text-2xl">
                        {program.name}
                      </h3>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <Badge variant="secondary">{program.durationLabel}</Badge>
                        {program.marketingEnrolledLabel ? (
                          <Badge variant="outline" className={cn(accent.border, accent.text)}>
                            {program.marketingEnrolledLabel}
                          </Badge>
                        ) : null}
                      </div>
                      <span className={cn("mt-auto pt-8 text-sm font-semibold", accent.text)}>
                        View program details <span aria-hidden="true">&rarr;</span>
                      </span>
                    </div>
                  </article>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
