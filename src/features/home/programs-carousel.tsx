"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Code2, Cpu, Smartphone } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { resolveProgramImagery } from "@/features/programs/program-visuals";

export interface ProgramsCarouselProgram {
  id: string;
  name: string;
  durationLabel: string;
  marketingEnrolledLabel: string | null;
  iconName: string | null;
  accentColor: string | null;
  imageUrl: string | null;
}

const PROGRAM_ICONS: Record<string, LucideIcon> = { cpu: Cpu, chip: Cpu, computer: Cpu, hardware: Cpu, phone: Smartphone, smartphone: Smartphone, cellphone: Smartphone, code: Code2, "code-2": Code2, software: Code2 };
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
  // Clamped during render rather than corrected afterwards in an effect. If
  // the programme list shrinks, an effect would first render one frame
  // pointing past the end of the array, then fix itself — and a setState
  // inside an effect cascades a second render for a value we can simply
  // compute. `requestedIndex` is what the user asked for; `selectedIndex` is
  // what the current list can actually honour.
  const [requestedIndex, setRequestedIndex] = useState(0);
  const lastIndex = Math.max(0, programs.length - 1);
  const selectedIndex = Math.min(requestedIndex, lastIndex);

  if (programs.length === 0) return null;
  const previous = () => setRequestedIndex((selectedIndex - 1 + programs.length) % programs.length);
  const next = () => setRequestedIndex((selectedIndex + 1) % programs.length);

            return (
    <div className="relative mx-auto w-full max-w-5xl overflow-x-clip px-1 sm:px-8 lg:px-12">
      <button type="button" aria-label="Previous program" onClick={previous} className="absolute left-0 top-1/2 z-20 hidden -translate-y-1/2 rounded-full border border-glass-border bg-background/80 p-3 text-muted-foreground transition-[border-color,box-shadow,color] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary hover:border-primary hover:text-primary hover:shadow-glow-sm motion-reduce:transition-none lg:block"><ChevronLeft className="size-4" /></button>
      <button type="button" aria-label="Next program" onClick={next} className="absolute right-0 top-1/2 z-20 hidden -translate-y-1/2 rounded-full border border-glass-border bg-background/80 p-3 text-muted-foreground transition-[border-color,box-shadow,color] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary hover:border-primary hover:text-primary hover:shadow-glow-sm motion-reduce:transition-none lg:block"><ChevronRight className="size-4" /></button>
      {/* The carousel renders whatever `programs` it is given — there is no
          name-based allow-list filtering it any more (see
          src/features/programs/program-visuals.tsx and .claude/lessons.md
          for why one existed and why it was removed). Every consumer in
          this file — the offset wraparound on the next line, the bounds in
          `previous`/`next` above, and the indicator dots below — is keyed
          to this same `programs` array, so they stay in lockstep with what
          actually renders. */}
      <div className="relative top-0 mx-auto h-[180px] w-full max-w-4xl [--carousel-step:min(74vw,260px)] [perspective:1100px] sm:h-[220px] sm:[--carousel-step:240px] lg:top-0 lg:h-[292px] lg:[--carousel-step:180px]">
        {programs.map((program, index) => {
          const rawOffset = index - selectedIndex;
          const offset = rawOffset > programs.length / 2 ? rawOffset - programs.length : rawOffset < -programs.length / 2 ? rawOffset + programs.length : rawOffset;
          const distance = Math.abs(offset);
          const Icon = resolveIcon(program.iconName);
          const active = offset === 0;
          const visible = distance <= 2;
          const accent = resolveAccent(program.accentColor);
          const imagery = resolveProgramImagery(program);
          const accentBgClass = accent.match(/bg-\S+/)?.[0] ?? "bg-primary/10";
          return (
            <article key={program.id} className={`absolute left-1/2 top-1/2 h-[164px] w-[min(78vw,320px)] overflow-hidden rounded-2xl border p-4 transition-[transform,opacity,border-color,box-shadow] duration-500 motion-reduce:transition-none sm:h-[204px] sm:w-[290px] sm:p-5 lg:h-[220px] lg:w-[290px] lg:rounded-2xl lg:p-6 ${active ? "border-brand-blue shadow-glow-md" : "border-glass-border"} ${imagery.kind === "icon" ? accentBgClass : ""}`} style={{ transform: `translate(-50%, -50%) translateX(calc(${offset} * var(--carousel-step))) translateZ(${active ? 80 : Math.max(0, 20 - distance * 10)}px) rotateY(${offset * -22}deg) scale(${active ? 1 : distance === 1 ? 0.82 : 0.66})`, opacity: visible ? active ? 1 : distance === 1 ? 0.62 : 0.28 : 0, zIndex: 10 - distance, backgroundImage: imagery.kind === "photo" ? `linear-gradient(var(--glass-bg), var(--glass-bg)), url(${imagery.src})` : undefined, backgroundSize: "cover", backgroundPosition: "center", pointerEvents: visible ? "auto" : "none" }}>
              {imagery.kind === "icon" ? (
                <Icon className={`absolute -right-3 -bottom-3 size-24 opacity-[0.08] ${accent.split(" ").find((c) => c.startsWith("text-")) ?? ""}`} aria-hidden />
              ) : null}
              <div className="absolute inset-0 bg-background/45" />
              <div className="relative flex h-full flex-col gap-3">
                <span className={`inline-flex size-10 items-center justify-center rounded-xl ${accent}`}><Icon className="size-5" /></span>
                <h3 className="line-clamp-2 text-base font-semibold leading-tight">{program.name}</h3>
                <div className="mt-auto flex flex-wrap gap-2"><Badge variant="secondary">{program.name === "Computer Hardware Servicing" ? "120 hrs" : program.durationLabel}</Badge>{program.marketingEnrolledLabel ? <Badge variant="outline" className={accent}>{program.marketingEnrolledLabel}</Badge> : null}</div>
              </div>
            </article>
          );
        })}
      </div>
      {/*
        Visible glyph stays a compact 6px/24px dot — a 44px-tall pagination
        row here would be visually heavier than the carousel it controls —
        but the tap TARGET is widened to 44px with an invisible ::after
        hit-slop, the same accessible-touch-target technique already used on
        the home Live Updates card's prev/next buttons (see
        features/home/announcements-card.tsx). Measured before: 6x6px via
        Playwright boundingBox(), well under the 44px minimum.
      */}
      <div className="mt-4 flex justify-center gap-3 lg:mt-5">
        {programs.map((program, index) => <button key={program.id} type="button" aria-label={`Go to ${program.name}`} onClick={() => setRequestedIndex(index)} className={`relative h-1.5 rounded-full transition-all after:absolute after:-inset-3.5 after:content-[''] motion-reduce:transition-none ${index === selectedIndex ? "w-6 bg-primary" : "w-1.5 bg-muted-foreground/40"}`} />)}
      </div>
    </div>
  );
}
