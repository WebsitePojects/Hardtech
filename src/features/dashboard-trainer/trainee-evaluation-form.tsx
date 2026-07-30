"use client";

import { useId, useState } from "react";
import { Star } from "lucide-react";
import { toast } from "sonner";

import type { TrainerTraineeRosterItem } from "@/server/services/dashboard.service";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { evaluateTrainee, type EvaluateTraineeInput } from "./mutations/evaluate-trainee";

const RATINGS: { value: EvaluateTraineeInput["rating"]; label: string }[] = [
  { value: "CERTIFIED", label: "Certified" },
  { value: "COMPETENT", label: "Competent" },
  { value: "NEEDS_IMPROVEMENT", label: "Needs Improvement" },
];

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function EvaluationFormCard({ trainee }: { trainee: TrainerTraineeRosterItem }) {
  const [idempotencyKey] = useState(() => crypto.randomUUID());
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState<EvaluateTraineeInput["rating"]>("CERTIFIED");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const notesId = useId();

  async function handleSubmit() {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError(null);
    try {
      await evaluateTrainee({
        idempotencyKey,
        traineeId: trainee.id,
        skill: "Diagnostics",
        rating,
        notes,
      });
    } catch {
      toast.error("Evaluation submission isn't wired up yet in this build.");
      setError("Submission is not available yet - this ships in a later wave.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-3">
          <span
            className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-sm font-semibold text-primary"
            aria-hidden
          >
            {initials(trainee.name)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate font-heading text-base font-semibold text-foreground">{trainee.name}</p>
            <p className="truncate text-sm text-muted-foreground">{trainee.email}</p>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-semibold text-primary">{trainee.progressPercent}%</span>
          </div>
          <Progress value={trainee.progressPercent} />
        </div>

        <div className="flex flex-wrap gap-2">
          {trainee.isPaid ? (
            <Badge variant="outline" className="border-primary/40 bg-primary/10 text-primary">
              Paid
            </Badge>
          ) : null}
          {trainee.isTrained ? (
            <Badge variant="outline" className="border-brand-blue/40 bg-brand-blue/10 text-brand-blue">
              Trained
            </Badge>
          ) : null}
        </div>

        {trainee.isTrained && !isOpen ? (
          <Button type="button" variant="destructive" className="w-full" disabled>
            <Star className="size-4" aria-hidden /> Undo Evaluation
          </Button>
        ) : (
          <Button
            type="button"
            variant={isOpen ? "outline" : "outline"}
            className={cn("w-full", !isOpen && "border-primary/40 text-primary hover:text-primary")}
            onClick={() => setIsOpen((value) => !value)}
            disabled={isSubmitting}
          >
            <Star className="size-4" aria-hidden /> {isOpen ? "Cancel" : "Evaluate"}
          </Button>
        )}

        {isOpen ? (
          <div className="space-y-3">
            <div className="h-8 rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm text-foreground">
              Diagnostics
            </div>
            <Select
              value={rating}
              onValueChange={(value) => {
                switch (value) {
                  case "CERTIFIED":
                  case "COMPETENT":
                  case "NEEDS_IMPROVEMENT":
                    setRating(value);
                    return;
                  default:
                    return;
                }
              }}
              disabled={isSubmitting}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RATINGS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Textarea
              id={notesId}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Notes..."
              disabled={isSubmitting}
            />
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <Button type="button" className="w-full" disabled={isSubmitting} onClick={() => void handleSubmit()}>
              {isSubmitting ? "Submitting..." : "Submit Evaluation"}
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
