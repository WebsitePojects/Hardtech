"use client";

import { useState } from "react";
import { Camera, ChevronLeft, ChevronRight, Code2, Cpu, Network, Smartphone } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface ProgramsCarouselProgram {
  id: string;
  name: string;
  durationLabel: string;
  marketingEnrolledLabel: string | null;
  iconName: string | null;
  accentColor: string | null;
  imageUrl: string | null;
}

const PROGRAM_ICONS: Record<string, LucideIcon> = { cpu: Cpu, chip: Cpu, computer: Cpu, hardware: Cpu, phone: Smartphone, smartphone: Smartphone, cellphone: Smartphone, code: Code2, "code-2": Code2, software: Code2, network: Network, networking: Network, wifi: Network, camera: Camera, cctv: Camera };
const ACCENT_CLASSES: Record<string, string> = {
  blue: "border-brand-blue text-brand-blue bg-brand-blue/10",
  amber: "border-brand-orange text-brand-orange bg-brand-orange/10",
  orange: "border-brand-orange text-brand-orange bg-brand-orange/10",
  purple: "border-brand-purple text-brand-purple bg-brand-purple/10",
  green: "border-primary text-primary bg-primary/10",
};

function resolveIcon(iconName: string | null): LucideIcon { return iconName ? PROGRAM_ICONS[iconName.toLowerCase()] ?? Cpu : Cpu; }
function resolveAccent(accentColor: string | null): string { return accentColor ? ACCENT_CLASSES[accentColor.toLowerCase()] ?? ACCENT_CLASSES.green : ACCENT_CLASSES.green; }

export function ProgramsCarousel({ programs }: { programs: ProgramsCarouselProgram[] }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  if (programs.length === 0) return null;
  const previous = () => setSelectedIndex((selectedIndex - 1 + programs.length) % programs.length);
  const next = () => setSelectedIndex((selectedIndex + 1) % programs.length);

            return (
    <div className="relative mx-auto h-[292px] w-full max-w-5xl">
      <button type="button" aria-label="Previous program" onClick={previous} className="absolute left-0 top-1/2 z-20 hidden -translate-y-1/2 rounded-full border border-glass-border bg-background/80 p-3 text-muted-foreground transition hover:border-primary hover:text-primary lg:block"><ChevronLeft className="size-4" /></button>
      <button type="button" aria-label="Next program" onClick={next} className="absolute right-0 top-1/2 z-20 hidden -translate-y-1/2 rounded-full border border-glass-border bg-background/80 p-3 text-muted-foreground transition hover:border-primary hover:text-primary lg:block"><ChevronRight className="size-4" /></button>
      <div className="relative top-28 mx-auto h-[250px] w-full max-w-4xl [perspective:1100px]">
        {programs.map((program, index) => {
          const rawOffset = index - selectedIndex;
          const offset = rawOffset > programs.length / 2 ? rawOffset - programs.length : rawOffset < -programs.length / 2 ? rawOffset + programs.length : rawOffset;
          const distance = Math.abs(offset);
          const Icon = resolveIcon(program.iconName);
          const active = offset === 0;
          const visible = distance <= 2;
          const accent = resolveAccent(program.accentColor);
          return (
            <article key={program.id} className={`absolute left-1/2 top-1/2 h-[220px] w-[290px] overflow-hidden rounded-2xl border p-6 transition-all duration-500 ${active ? "border-brand-blue shadow-[0_0_25px_var(--glow-brand-blue)]" : "border-glass-border"}`} style={{ transform: `translate(-50%, -50%) translateX(${offset * 180}px) translateZ(${active ? 80 : Math.max(0, 20 - distance * 10)}px) rotateY(${offset * -22}deg) scale(${active ? 1 : distance === 1 ? 0.82 : 0.66})`, opacity: visible ? active ? 1 : distance === 1 ? 0.62 : 0.28 : 0, zIndex: 10 - distance, backgroundImage: program.imageUrl ? `linear-gradient(var(--glass), var(--glass)), url(${program.imageUrl})` : undefined, backgroundSize: "cover", backgroundPosition: "center", pointerEvents: visible ? "auto" : "none" }}>
              <div className="absolute inset-0 bg-background/65" />
              <div className="relative flex h-full flex-col gap-3">
                <span className={`inline-flex size-10 items-center justify-center rounded-xl ${accent}`}><Icon className="size-5" /></span>
                <h3 className="text-base font-semibold leading-tight">{program.name}</h3>
                <div className="mt-auto flex flex-wrap gap-2"><Badge variant="secondary">{program.name === "Computer Hardware Servicing" ? "120 hrs" : program.durationLabel}</Badge>{program.marketingEnrolledLabel ? <Badge variant="outline" className={accent}>{program.marketingEnrolledLabel}</Badge> : null}</div>
              </div>
            </article>
          );
        })}
      </div>
      <div className="absolute inset-x-0 bottom-0 flex justify-center gap-2">
        {programs.map((program, index) => <button key={program.id} type="button" aria-label={`Go to ${program.name}`} onClick={() => setSelectedIndex(index)} className={`h-1.5 rounded-full transition-all ${index === selectedIndex ? "w-6 bg-primary" : "w-1.5 bg-muted-foreground/40"}`} />)}
      </div>
    </div>
  );
}
