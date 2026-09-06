"use client";

import { useId, useRef, useState } from "react";
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

const ACCEPT_BY_SUBMISSION_TYPE: Record<string, string[]> = {
  IMAGE: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  VIDEO: ["video/mp4", "video/webm", "video/quicktime"],
  DOCUMENT: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
};

export type AssignmentSubmissionFormProps = {
  assignment: TraineeAssignmentListItem;
};

export function AssignmentSubmissionForm({ assignment }: AssignmentSubmissionFormProps) {
  const intentKeyRef = useRef(crypto.randomUUID());
  const pendingRef = useRef(false);
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputId = useId();
  const acceptedTypes = assignment.allowedSubmissionTypes.flatMap((type) => ACCEPT_BY_SUBMISSION_TYPE[type] ?? []);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (pendingRef.current) return;
    setFile(event.target.files?.[0] ?? null);
    setError(null);
    setProgress(null);
    // Selecting a file is an explicit fresh intent. A retry of the selected
    // file keeps this key so the server can replay instead of duplicate.
    intentKeyRef.current = crypto.randomUUID();
  }

  async function handleSubmit() {
    if (pendingRef.current) return;
    if (!file) {
      setError("Choose a file to submit first.");
      return;
    }

    pendingRef.current = true;
    setIsSubmitting(true);
    setError(null);
    setProgress(0);
    try {
      await submitAssignmentSubmission({
        assignmentId: assignment.id,
        idempotencyKey: intentKeyRef.current,
        file,
        onProgress: setProgress,
      });
      toast.success("Assignment submitted.");
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Assignment submission failed. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      pendingRef.current = false;
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
        <Label htmlFor={inputId}>Submission file</Label>
        <Input
          id={inputId}
          type="file"
          accept={acceptedTypes.join(",")}
          onChange={handleFileChange}
          disabled={isSubmitting}
        />
        {file ? <p className="text-xs text-muted-foreground">{file.name}</p> : null}
        {progress !== null && isSubmitting ? <p className="text-xs text-muted-foreground">Uploading {progress}%</p> : null}
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <Button type="button" disabled={isSubmitting || !file} onClick={() => void handleSubmit()}>
        {isSubmitting ? "Submitting..." : "Submit Assignment"}
      </Button>
    </div>
  );
}
