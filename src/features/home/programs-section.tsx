import Link from "next/link";
import { ArrowRight, ArrowUpRight, CalendarDays, CircleDollarSign, Clock3, Gauge } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ProgramWithCurriculum } from "@/server/services/marketing.service";
import {
  renderProgramIcon,
  resolveAccent,
  resolveProgramImagery,
} from "@/features/programs/program-visuals";
import { ProgramPhoto } from "@/features/programs/program-photo";
import { decimalToCentavos, formatCentavos } from "@/features/programs/format-currency";

function ProgramFeature({ program, index }: { program: ProgramWithCurriculum; index: number }) {
  const imagery = resolveProgramImagery(program);
  const accent = resolveAccent(program.accentColor);
  const priceLabel = formatCentavos(decimalToCentavos(program.priceAmount));

  return (
    <article
      className={cn(
        "group relative isolate min-h-[28rem] overflow-hidden rounded-2xl border border-glass-border bg-surface-secondary",
        "transition-[border-color,box-shadow,transform] duration-300 motion-reduce:transition-none",
        "lg:hover:-translate-y-1 lg:hover:border-[var(--glass-border-strong)] lg:hover:shadow-glow-md",
      )}
    >
      {imagery.kind === "photo" ? (
        <>
          <div className="absolute inset-0 -z-20">
            <ProgramPhoto src={imagery.src!} alt={`Students training in ${program.name}`} />
          </div>
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-gradient-to-t from-background via-background/85 to-background/10"
          />
        </>
      ) : (
        <div
          aria-hidden="true"
          className={cn("absolute inset-0 -z-10 bg-gradient-to-br from-background via-background to-surface-secondary", accent.bg)}
        />
      )}

      <div className="flex min-h-[28rem] flex-col items-start justify-end p-5 sm:p-7">
        <div className={cn("mb-auto flex size-11 items-center justify-center rounded-xl border", accent.bg, accent.border)}>
          {renderProgramIcon(program.iconName, cn("size-5", accent.text))}
        </div>

        <div className="max-w-xl space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="border-foreground/25 bg-background/85 text-foreground">
              Program {String(index + 1).padStart(2, "0")}
            </Badge>
            {program.marketingEnrolledLabel ? (
              <Badge className={cn("border", accent.bg, accent.border, accent.text)}>
                {program.marketingEnrolledLabel}
              </Badge>
            ) : null}
          </div>
          <div>
            <h3 className="font-heading text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {program.name}
            </h3>
            {program.subtitle ? (
              <p className={cn("mt-1 text-sm font-medium", accent.text)}>{program.subtitle}</p>
            ) : null}
          </div>
          {program.description ? (
            <p className="max-w-lg text-sm leading-relaxed text-foreground/80 sm:text-base">
              {program.description}
            </p>
          ) : null}
          <dl className="grid grid-cols-1 gap-2 border-y border-foreground/15 py-3 text-sm sm:grid-cols-3 sm:gap-3">
            <div>
              <dt className="flex items-center gap-1.5 text-xs text-muted-foreground"><Clock3 className={cn("size-3.5", accent.text)} aria-hidden /> Duration</dt>
              <dd className="mt-1 font-medium text-foreground">{program.durationLabel}</dd>
            </div>
            <div>
              <dt className="flex items-center gap-1.5 text-xs text-muted-foreground"><CalendarDays className={cn("size-3.5", accent.text)} aria-hidden /> Schedule</dt>
              <dd className="mt-1 font-medium text-foreground">{program.scheduleLabel}</dd>
            </div>
            <div>
              <dt className="flex items-center gap-1.5 text-xs text-muted-foreground"><Gauge className={cn("size-3.5", accent.text)} aria-hidden /> Level</dt>
              <dd className="mt-1 font-medium text-foreground">{program.levelLabel}</dd>
            </div>
          </dl>
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-foreground">
              <CircleDollarSign className={cn("size-4", accent.text)} aria-hidden />
              {priceLabel}
            </span>
            <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/80">
              <Link href="/enroll" aria-label={`Start enrollment for ${program.name}`}>
                Start enrollment
                <ArrowRight aria-hidden />
              </Link>
            </Button>
            <Button asChild variant="outline" className="border-foreground/30 bg-background/90 text-foreground hover:border-primary hover:bg-background">
              <Link href="/programs" aria-label={`View ${program.name} details`}>
                Details
                <ArrowUpRight aria-hidden />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}

/**
 * A direct catalogue preview, rendered entirely on the server. The active
 * two-program state gets two equally legible choices instead of a carousel;
 * future catalogue changes still render every record in a responsive grid.
 */
export function ProgramsSection({ programs }: { programs: ProgramWithCurriculum[] }) {
  if (programs.length === 0) {
    return (
      <section className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 lg:py-20" aria-labelledby="programs-heading">
        <div className="max-w-xl space-y-4">
          <h2 id="programs-heading" className="font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Training programs are being prepared.
          </h2>
          <p className="text-muted-foreground">Contact HardTech to learn which hands-on training opens next.</p>
          <Button asChild variant="outline"><Link href="/programs">Explore program information<ArrowUpRight aria-hidden /></Link></Button>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 lg:py-20" aria-labelledby="programs-heading">
      <div className="max-w-2xl">
        <h2 id="programs-heading" className="font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Choose the technology trade you want to master.
        </h2>
        <p className="mt-3 text-base leading-relaxed text-muted-foreground sm:text-lg">
          Start with hands-on, job-focused training. Compare each program, then see its full curriculum before you enroll.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
        {programs.map((program, index) => <ProgramFeature key={program.id} program={program} index={index} />)}
      </div>

      <div className="mt-6 flex justify-start">
        <Button asChild variant="outline"><Link href="/programs">Compare all program details<ArrowUpRight aria-hidden /></Link></Button>
      </div>
    </section>
  );
}
