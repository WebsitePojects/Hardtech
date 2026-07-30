"use client";

import { useId, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { submitAssignmentSubmission } from "./submit-assignment";
import type { TraineeAssignmentListItem } from "./types";

const SUBMISSION_TYPE_LABEL: Record<string, string> = {
  IMAGE: "Image",
  VIDEO: "Video",
  DOCUMENT: "Document",
};

export type AssignmentSubmissionFormProps = {
  assignment: TraineeAssignmentListItem;
};

/**
 * Never rendered against real data yet — `assignments-section.tsx`'s list
 * is always empty until `dashboard.service` gains a trainee assignment read
 * (see that file's TODO(orchestrator)). Built now, guards and all, so
 * wave 4 only has to supply the read and the real mutation, not design this
 * form from scratch.
 *
 * Guards (.claude/rules/00-non-negotiables.md rule 1), all three: the
 * submit `Button` is `disabled` while `isSubmitting`, its label switches to
 * a visible pending state ("Submitting…"), and `handleSubmit` early-returns
 * if `isSubmitting` is already true — defense in depth alongside `disabled`
 * for a fast double-click/double-tap. `idempotencyKey` is minted once via
 * `useState`'s lazy initializer on mount (one submission intent per form
 * instance), never regenerated per click, so a retry after a dropped
 * response replays instead of duplicating.
 *
 * Duplicate-safety on the server side (rule 2) is
 * `AssignmentSubmission.@@unique([assignmentId, traineeId])` — the real
 * wave-4 action upserts on that constraint, never read-then-write. See
 * submit-assignment.ts.
 */
export function AssignmentSubmissionForm({ assignment }: AssignmentSubmissionFormProps) {
  const [idempotencyKey] = useState(() => crypto.randomUUID());
  const [submissionLink, setSubmissionLink] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputId = useId();

  async function handleSubmit() {
    if (isSubmitting) return; // early-return guard, defense in depth alongside `disabled`

    if (!submissionLink.trim()) {
      setError("Add a link to your submission first.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await submitAssignmentSubmission({
        idempotencyKey,
        assignmentId: assignment.id,
        submissionLink: submissionLink.trim(),
      });
      // Unreachable while submitAssignmentSubmission always throws (see
      // TODO(wave-4) in submit-assignment.ts). A successful result lands
      // here once wave 4 wires a real server action.
    } catch {
      toast.error("Assignment submission isn't wired up yet in this build.");
      setError("Submission is not available yet — this ships in a later wave.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <CardContent className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-heading text-sm font-semibold text-foreground">{assignment.title}</p>
            <p className="text-sm text-muted-foreground">{assignment.instructions}</p>
          </div>
          <p className="shrink-0 text-xs text-muted-foreground">
            Due {assignment.dueDate.toLocaleDateString()} · {assignment.dueTime}
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {assignment.allowedSubmissionTypes.map((type) => (
            <Badge key={type} variant="outline">
              {SUBMISSION_TYPE_LABEL[type] ?? type}
            </Badge>
          ))}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={inputId}>Submission link</Label>
          <Input
            id={inputId}
            value={submissionLink}
            onChange={(event) => setSubmissionLink(event.target.value)}
            placeholder="https://..."
            disabled={isSubmitting}
          />
        </div>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <Button type="button" disabled={isSubmitting} onClick={() => void handleSubmit()}>
          {isSubmitting ? "Submitting…" : "Submit Assignment"}
        </Button>
      </CardContent>
    </Card>
  );
}
