"use client";

import { useEffect, useState } from "react";
import { Camera, Cpu, Network, Smartphone, Code2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import type { ProgramWithCurriculum } from "@/server/services/marketing.service";

/**
 * "Core Programs" peeking-card carousel (docs/screens/desktop-01.md #1-2,
 * mobile-05.md/mobile-06.md hero shots). Interactive (embla + selected-index
 * tracking), so this is the client leaf — the eyebrow/H2 wrapper stays a
 * server component in programs-section.tsx.
 *
 * Program.iconName and Program.accentColor are free-form strings seeded by
 * DATA; this maps the known design values (chip/phone/code icons, blue/
 * amber/purple accents per program category) with a neutral fallback so an
 * unrecognized value never crashes the render.
 */
const PROGRAM_ICONS: Record<string, LucideIcon> = {
  cpu: Cpu,
  chip: Cpu,
  computer: Cpu,
  hardware: Cpu,
  phone: Smartphone,
  smartphone: Smartphone,
  cellphone: Smartphone,
  code: Code2,
  "code-2": Code2,
  software: Code2,
  network: Network,
  networking: Network,
  wifi: Network,
  camera: Camera,
  cctv: Camera,
};

const ACCENT_CLASSES: Record<string, string> = {
  blue: "border-brand-blue text-brand-blue bg-brand-blue/10",
  amber: "border-brand-orange text-brand-orange bg-brand-orange/10",
  orange: "border-brand-orange text-brand-orange bg-brand-orange/10",
  purple: "border-brand-purple text-brand-purple bg-brand-purple/10",
  green: "border-primary text-primary bg-primary/10",
};

function resolveIcon(iconName: string | null): LucideIcon {
  if (!iconName) return Cpu;
  return PROGRAM_ICONS[iconName.toLowerCase()] ?? Cpu;
}

function resolveAccent(accentColor: string | null): string {
  if (!accentColor) return ACCENT_CLASSES.green;
  return ACCENT_CLASSES[accentColor.toLowerCase()] ?? ACCENT_CLASSES.green;
}

export function ProgramsCarousel({
  programs,
}: {
  programs: ProgramWithCurriculum[];
}) {
  const [api, setApi] = useState<CarouselApi>();
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (!api) return;

    // Seeds selectedIndex from Embla's imperative API the moment it becomes
    // available. Same justification as src/components/ui/carousel.tsx's
    // identical onSelect seeding: `api` is a stable external object, not
    // derived from this state, so the effect cannot retrigger itself.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedIndex(api.selectedScrollSnap());
    const onSelect = () => setSelectedIndex(api.selectedScrollSnap());
    api.on("select", onSelect);

    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  if (programs.length === 0) return null;

  return (
    <div className="relative">
      <Carousel
        opts={{ loop: true, align: "center" }}
        setApi={setApi}
        className="mx-auto max-w-4xl"
      >
        <CarouselContent>
          {programs.map((program, index) => {
            const Icon = resolveIcon(program.iconName);
            const accent = resolveAccent(program.accentColor);
            const isActive = index === selectedIndex;

            return (
              <CarouselItem
                key={program.id}
                className="basis-4/5 sm:basis-1/2 lg:basis-1/3"
              >
                <div
                  className={`glass flex h-full flex-col gap-4 rounded-2xl border p-6 transition-all duration-300 ${
                    isActive
                      ? `scale-100 opacity-100 ${accent}`
                      : "scale-90 border-glass-border opacity-50"
                  }`}
                >
                  <span
                    className={`inline-flex size-12 items-center justify-center rounded-xl ${accent}`}
                  >
                    <Icon className="size-6" />
                  </span>
                  <h3 className="text-lg font-semibold">{program.name}</h3>
                  <div className="mt-auto flex flex-wrap gap-2">
                    <Badge variant="secondary">{program.durationLabel}</Badge>
                    {program.marketingEnrolledLabel ? (
                      <Badge variant="outline" className={accent}>
                        {program.marketingEnrolledLabel}
                      </Badge>
                    ) : null}
                  </div>
                </div>
              </CarouselItem>
            );
          })}
        </CarouselContent>
        <CarouselPrevious className="left-2" />
        <CarouselNext className="right-2" />
      </Carousel>

      <div className="mt-6 flex justify-center gap-2">
        {programs.map((program, index) => (
          <button
            key={program.id}
            type="button"
            aria-label={`Go to ${program.name}`}
            onClick={() => api?.scrollTo(index)}
            className={`h-2 rounded-full transition-all ${
              index === selectedIndex
                ? "w-6 bg-primary"
                : "w-2 bg-muted-foreground/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
