import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { ArrowLeft, ArrowRight, CalendarDays, CheckCircle2, CircleDollarSign, Clock3, Gauge, UserRound } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProgramPhoto } from "@/features/programs/program-photo";
import { decimalToCentavos, formatCentavos } from "@/features/programs/format-currency";
import { renderProgramIcon, resolveAccent, resolveProgramImagery } from "@/features/programs/program-visuals";
import { createSiteMetadata } from "@/lib/site-origin";
import { getPublishedProgramBySlug, getTrainers } from "@/server/services/marketing.service";

type ProgramPageProps = {
  params: Promise<{ slug: string }>;
};

// The page and its metadata need the same published-only lookup. React cache
// keeps that contract while avoiding a second request for the same route.
const getProgramForPage = cache(async (slug: string) => getPublishedProgramBySlug(slug));

export async function generateMetadata({ params }: ProgramPageProps): Promise<Metadata> {
  const { slug } = await params;
  const program = await getProgramForPage(slug);

  if (!program) {
    return createSiteMetadata({
      title: "Program Not Found | HardTech IT Corp",
      description: "The requested HardTech training program is unavailable.",
      path: "/programs",
      noIndex: true,
    });
  }

  return createSiteMetadata({
    title: `${program.name} | HardTech IT Corp`,
    description: program.description,
    path: `/programs/${program.slug}`,
  });
}

export default async function ProgramDetailPage({ params }: ProgramPageProps) {
  const { slug } = await params;
  const program = await getProgramForPage(slug);
  if (!program) notFound();

  const trainers = await getTrainers();
  const trainer = trainers.find((candidate) => candidate.userId === program.primaryTrainerId) ?? null;
  const imagery = resolveProgramImagery(program);
  const accent = resolveAccent(program.accentColor);
  const priceLabel = formatCentavos(decimalToCentavos(program.priceAmount));

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
      <nav aria-label="Breadcrumb" className="mb-8">
        <Link
          href="/programs"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <ArrowLeft className="size-4" aria-hidden />
          All programs
        </Link>
      </nav>

      <article className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(20rem,0.95fr)] lg:items-start lg:gap-12">
        <div className="relative overflow-hidden rounded-2xl border border-glass-border bg-surface-secondary">
          {imagery.kind === "photo" ? (
            <div className="relative aspect-4/3 min-h-72">
              <ProgramPhoto src={imagery.src!} alt={`HardTech learners in ${program.name}`} />
            </div>
          ) : (
            <div className={`flex aspect-4/3 min-h-72 items-center justify-center ${accent.bg}`}>
              {renderProgramIcon(program.iconName, `size-20 ${accent.text}`)}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            {program.badgeLabel ? <Badge className="bg-primary text-primary-foreground">{program.badgeLabel}</Badge> : null}
            <Badge
              variant="outline"
              className={program.enrollmentOpen ? "border-primary/40 text-primary" : "border-glass-border text-muted-foreground"}
            >
              {program.enrollmentOpen ? "Enrollment open" : "Enrollment currently closed"}
            </Badge>
          </div>

          <div className="space-y-3">
            <h1 className="font-heading text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">{program.name}</h1>
            {program.subtitle ? <p className={`text-base font-medium ${accent.text}`}>{program.subtitle}</p> : null}
            <p className="max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">{program.description}</p>
          </div>

          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <DetailStat icon={Clock3} label="Duration" value={program.durationLabel} />
            <DetailStat icon={CalendarDays} label="Schedule" value={program.scheduleLabel} />
            <DetailStat icon={Gauge} label="Level" value={program.levelLabel} />
            <DetailStat icon={CircleDollarSign} label="Investment" value={priceLabel} valueClassName={accent.text} />
          </dl>

          {trainer || program.instructorCredentialLine ? (
            <div className="flex items-start gap-3 rounded-xl border border-glass-border bg-surface-secondary/60 p-4">
              <UserRound className={`mt-0.5 size-5 shrink-0 ${accent.text}`} aria-hidden />
              <div className="text-sm">
                {trainer ? <p className="font-semibold text-foreground">{trainer.user.firstName} {trainer.user.lastName}</p> : null}
                {program.instructorCredentialLine ? <p className="mt-0.5 text-muted-foreground">{program.instructorCredentialLine}</p> : null}
              </div>
            </div>
          ) : null}

          {program.enrollmentOpen ? (
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href={`/enroll?program=${encodeURIComponent(program.slug)}`} aria-label={`Enroll in ${program.name}`}>
                Enroll in this program
                <ArrowRight aria-hidden />
              </Link>
            </Button>
          ) : (
            <p className="rounded-xl border border-glass-border bg-surface-secondary/60 p-4 text-sm text-muted-foreground" role="status">
              Enrollment is closed for this program. Browse the current catalog for available training.
            </p>
          )}
        </div>
      </article>

      <section className="mt-14 max-w-3xl border-t border-glass-border pt-10 sm:mt-20 sm:pt-12" aria-labelledby="curriculum-heading">
        <h2 id="curriculum-heading" className="font-heading text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          What you will learn
        </h2>
        {program.curriculumTopics.length > 0 ? (
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {program.curriculumTopics.map((topic) => (
              <li key={topic.id} className="flex items-start gap-3 rounded-xl border border-glass-border bg-surface-secondary/50 p-4 text-sm text-foreground">
                <CheckCircle2 className={`mt-0.5 size-4 shrink-0 ${accent.text}`} aria-hidden />
                <span>{topic.title}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">The course modules will be published before this intake opens.</p>
        )}
      </section>
    </main>
  );
}

function DetailStat({
  icon: Icon,
  label,
  value,
  valueClassName,
}: {
  icon: typeof Clock3;
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="rounded-xl border border-glass-border bg-surface-secondary/60 p-3">
      <dt className="flex items-center gap-1.5 text-xs font-medium tracking-wide text-muted-foreground uppercase">
        <Icon className="size-3.5" aria-hidden />
        {label}
      </dt>
      <dd className={`mt-1 text-sm font-semibold text-foreground ${valueClassName ?? ""}`}>{value}</dd>
    </div>
  );
}
