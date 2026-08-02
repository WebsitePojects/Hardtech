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
              className="pr-12"
            >
              <div className="flex items-start gap-3">
                <div className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg", accent.bg)}>
                  {renderProgramIcon(program.iconName, cn("size-4", accent.text))}
                </div>
                <div className="flex-1 space-y-1.5">
                  <Badge variant="outline" className={cn(accent.border, accent.text)}>
                    Skills Track
                  </Badge>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-heading text-base font-semibold text-foreground">
                      {program.name}
                    </h3>
                    <span className={cn("shrink-0 text-lg font-bold", accent.text)}>
                      {formatCentavos(program.priceCentavos)}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="size-3.5" aria-hidden />
                      {program.durationLabel}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="size-3.5" aria-hidden />
                      {program.scheduleLabel}
                    </span>
                  </div>
                  <Badge variant="outline" className="border-primary/40 text-primary">
                    Certified
                  </Badge>

                  {selected && program.curriculumTopics.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 border-t border-glass-border pt-2">
                      {program.curriculumTopics.map((topic) => (
                        <Badge key={topic} variant="outline" className="font-normal">
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
