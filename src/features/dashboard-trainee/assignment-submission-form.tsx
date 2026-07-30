"use client";

import { useId, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

export function AssignmentSubmissionForm({ assignment }: AssignmentSubmissionFormProps) {
  const [idempotencyKey] = useState(() => crypto.randomUUID());
  const [submissionLink, setSubmissionLink] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputId = useId();

  async function handleSubmit() {
    if (isSubmitting) return;

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
    } catch {
      toast.error("Assignment submission isn't wired up yet in this build.");
      setError("Submission is not available yet - this ships in a later wave.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-heading text-sm font-semibold text-foreground">{assignment.title}</p>
          <p className="text-sm text-muted-foreground">{assignment.instructions}</p>
        </div>
        <p className="shrink-0 text-xs text-muted-foreground">
          Due {assignment.dueDate} · {assignment.dueTime}
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
        {isSubmitting ? "Submitting..." : "Submit Assignment"}
      </Button>
    </div>
  );
}
