import Link from "next/link";
import {
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  User,
  Zap,
  type LucideIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ProgramWithCurriculum } from "@/server/services/marketing.service";

import { decimalToCentavos, formatCentavos } from "./format-currency";
import { renderProgramIcon, resolveAccent } from "./program-visuals";
import { ProgramPhoto } from "./program-photo";

interface ProgramCardProps {
  program: ProgramWithCurriculum;
  trainerName: string | null;
  /** Cards alternate photo side; screenshot 14/15 = left, 16 = right, 17 = left. */
  imageSide: "left" | "right";
}

function InfoTile({
  icon: Icon,
  label,
  value,
  valueClassName,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="rounded-xl border border-glass-border bg-surface-secondary/60 p-3">
      <div className="flex items-center gap-1.5 text-xs font-medium tracking-wide text-muted-foreground uppercase">
        <Icon className="size-3.5" aria-hidden />
        {label}
      </div>
      <p className={cn("mt-1 text-sm font-semibold text-foreground", valueClassName)}>
        {value}
      </p>
    </div>
  );
}

export function ProgramCard({ program, trainerName, imageSide }: ProgramCardProps) {
  const marketingImage =
    program.name === "Computer Hardware Servicing"
      ? "/images/gallery/gallery-01.jpg"
      : program.name === "Cellphone Hardware Servicing"
        ? "/images/gallery/gallery-08.jpg"
        : program.name === "I.T. Software Development"
          ? "/images/gallery/gallery-15.jpg"
          : null;

  if (!marketingImage) return null;

  const accent = resolveAccent(program.accentColor);
  const priceCentavos = decimalToCentavos(program.priceAmount);

  // mobile-01 screenshot 33 shows the Computer Hardware Servicing price
  // struck through with no accompanying "sale" price anywhere in the corpus;
  // desktop-01 screenshots 14-15 show the same program's price plain. The
  // Program model has one price field, not an original/sale pair, so there
  // is no data-driven way to know which programs are "on promo." Reproduced
  // as a responsive-only detail (struck on mobile widths, plain from `md`
  // up) so both source screenshots stay true rather than guessing a rule.
  // Flagged per the ROUTES-B brief; see docs/screens/mobile-01.md open
  // question 5.
  const showMobileStrikethrough = program.name === "Computer Hardware Servicing";

  const photo = (
    <div className="relative aspect-4/3 w-full overflow-hidden rounded-2xl lg:aspect-auto lg:h-full">
      {/*
        Plain <img>, not next/image: next.config.ts (images.remotePatterns) is
        orchestrator-owned and Program.imageUrl is DATA-seeded, so the host is
        not guaranteed to be allow-listed. next/image would throw at runtime
        for an unconfigured domain.
      */}
      <ProgramPhoto src={marketingImage} alt={program.name} />
      {program.badgeLabel ? (
        <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">
          {program.badgeLabel}
        </Badge>
      ) : null}
    </div>
  );

  const content = (
    <div className="flex flex-col gap-5 p-1">
      <div className={cn("flex size-11 items-center justify-center rounded-xl", accent.bg)}>
        {renderProgramIcon(program.iconName, cn("size-5", accent.text))}
      </div>

      <div className="space-y-1.5">
        <h3 className="font-heading text-2xl font-semibold text-foreground">
          {program.name}
        </h3>
        {program.subtitle ? (
          <p className={cn("text-sm font-medium", accent.text)}>{program.subtitle}</p>
        ) : null}
      </div>

      <p className="text-sm leading-relaxed text-muted-foreground">
        {program.description}
      </p>

      <div className="grid grid-cols-2 gap-3">
        <InfoTile icon={Clock} label="Duration" value={program.durationLabel} />
        <InfoTile icon={Calendar} label="Schedule" value={program.scheduleLabel} />
        <InfoTile icon={Zap} label="Level" value={program.levelLabel} />
        <InfoTile
          icon={DollarSign}
          label="Investment"
          value={formatCentavos(priceCentavos)}
          valueClassName={cn(
            accent.text,
            showMobileStrikethrough && "line-through decoration-2 md:no-underline",
          )}
        />
      </div>

      {program.curriculumTopics.length > 0 ? (
        <div className="space-y-2">
          <h4 className={cn("text-xs font-semibold tracking-wide uppercase", accent.text)}>
            Course Modules
          </h4>
          <ul className="space-y-1.5">
            {program.curriculumTopics.map((topic) => (
              <li key={topic.id} className="flex items-start gap-2 text-sm text-foreground">
                <CheckCircle2 className={cn("mt-0.5 size-4 shrink-0", accent.text)} aria-hidden />
                {topic.title}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {trainerName || program.instructorCredentialLine ? (
        <div className="flex items-center gap-3 border-t border-glass-border pt-4">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-surface-secondary">
            <User className="size-4 text-muted-foreground" aria-hidden />
          </div>
          <div className="text-sm">
            {trainerName ? <p className="font-medium text-foreground">{trainerName}</p> : null}
            {program.instructorCredentialLine ? (
              <p className="text-muted-foreground">{program.instructorCredentialLine}</p>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="flex flex-col gap-2 pt-1 sm:flex-row">
        <Button asChild className="sm:flex-1">
          <Link href="/enroll">
            Enroll Now
            <span aria-hidden>&rarr;</span>
          </Link>
        </Button>
        <Button asChild variant="outline" className="sm:flex-1">
          <Link href="/contact">Inquire</Link>
        </Button>
      </div>
    </div>
  );

  return (
    <Card className="glass grid gap-5 overflow-hidden rounded-xl bg-surface-secondary p-5 lg:grid-cols-2 lg:p-6">
      <div className={cn(imageSide === "right" && "lg:order-2")}>{photo}</div>
      <div className={cn(imageSide === "right" && "lg:order-1")}>{content}</div>
    </Card>
  );
}
