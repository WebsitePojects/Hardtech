"use client";

import { useState } from "react";
import { Calendar, Clock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { renderProgramIcon, resolveAccent } from "@/features/programs/program-visuals";
import { formatCentavos } from "@/features/programs/format-currency";

import { SelectableCard } from "../selectable-card";
import type { EnrollProgram } from "../types";

interface StepSelectPlanProps {
  programs: EnrollProgram[];
  selectedProgramIds: string[];
  onChangeSelection: (programIds: string[]) => void;
  onContinue: () => void;
}

export function StepSelectPlan({
  programs,
  selectedProgramIds,
  onChangeSelection,
  onContinue,
}: StepSelectPlanProps) {
  const [error, setError] = useState<string | null>(null);

  function toggle(programId: string) {
    const next = selectedProgramIds.includes(programId)
      ? selectedProgramIds.filter((id) => id !== programId)
      : [...selectedProgramIds, programId];
    onChangeSelection(next);
    if (next.length > 0) setError(null);
  }

  function handleContinue() {
    if (selectedProgramIds.length === 0) {
      setError("Select at least one program to continue.");
      return;
    }
    onContinue();
  }

  const visiblePrograms = programs.filter(
    (program) =>
      program.name === "Computer Hardware Servicing" ||
      program.name === "Cellphone Hardware Servicing" ||
      program.name === "I.T. Software Development",
  );
  const count = selectedProgramIds.length;
  const continueLabel =
    count === 0 ? "Continue" : count === 1 ? "Continue with 1 program" : `Continue with ${count} programs`;

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <Badge variant="outline" className="border-primary/40 text-primary">
          Step 1 of 5
        </Badge>
        <h2 className="font-heading text-2xl font-semibold text-foreground">
          Choose Your Programs
        </h2>
        <p className="text-sm text-muted-foreground">
          Pick one or more programs — combine 2 or 3 if you want to learn multiple tracks.
        </p>
      </div>

      <div className="space-y-3">
        {visiblePrograms.map((program) => {
          const accent = resolveAccent(program.accentColor);
          const selected = selectedProgramIds.includes(program.id);

          return (
            <SelectableCard
              key={program.id}
              role="checkbox"
              selected={selected}
              onSelect={() => toggle(program.id)}
              accentBorder={accent.border}
              accentRing={cn(accent.text, "ring-current/30")}
              className="p-3 sm:p-4 sm:pr-12"
            >
              <div className="flex min-w-0 items-start gap-2.5 sm:gap-3">
                <div className={cn("flex size-8 shrink-0 items-center justify-center rounded-lg sm:size-9", accent.bg)}>
                  {renderProgramIcon(program.iconName, cn("size-3.5 sm:size-4", accent.text))}
                </div>
                <div className="min-w-0 flex-1 space-y-1.5">
                  <Badge variant="outline" className={cn("text-[11px] sm:text-xs", accent.border, accent.text)}>
                    Skills Track
                  </Badge>
                  <div className="flex min-w-0 flex-col items-start gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-2">
                    <h3 className="min-w-0 max-w-full text-pretty font-heading text-[clamp(0.9375rem,3.9vw,1rem)] leading-tight font-semibold text-foreground sm:text-base">
                      {program.name}
                    </h3>
                    <span className={cn("shrink-0 text-base leading-tight font-bold sm:text-lg", accent.text)}>
                      {formatCentavos(program.priceCentavos)}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-[clamp(0.6875rem,2.8vw,0.75rem)] text-muted-foreground sm:gap-x-4">
                    <span className="flex items-center gap-1">
                      <Clock className="size-3.5" aria-hidden />
                      {program.durationLabel}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="size-3.5" aria-hidden />
                      {program.scheduleLabel}
                    </span>
                  </div>
                  <Badge variant="outline" className="border-primary/40 text-[11px] text-primary sm:text-xs">
                    Certified
                  </Badge>

                  {selected && program.curriculumTopics.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 border-t border-glass-border pt-2">
                      {program.curriculumTopics.map((topic) => (
                        <Badge
                          key={topic}
                          variant="outline"
                          className="h-auto min-h-5 max-w-full items-start overflow-visible whitespace-normal break-words py-1 text-left font-normal leading-snug"
                        >
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            </SelectableCard>
          );
        })}
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <Button className="w-full" size="lg" disabled={count === 0} onClick={handleContinue}>
        {continueLabel}
        <span aria-hidden>&rarr;</span>
      </Button>
    </div>
  );
}
