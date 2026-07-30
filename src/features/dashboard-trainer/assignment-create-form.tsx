"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import type { SubmissionType } from "@/../generated/prisma/enums";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { createAssignment } from "./mutations/create-assignment";

const SUBMISSION_TYPE_OPTIONS: { value: SubmissionType; label: string }[] = [
  { value: "IMAGE", label: "Image" },
  { value: "VIDEO", label: "Video" },
  { value: "DOCUMENT", label: "Document" },
];

function todayInPh(): string {
  const now = new Date();
  const ph = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Manila" }));
  return ph.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
}

export function AssignmentCreateForm() {
  const [idempotencyKey] = useState(() => crypto.randomUUID());
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [instructions, setInstructions] = useState("");
  const [dueDate, setDueDate] = useState(() => todayInPh());
  const [dueTime, setDueTime] = useState("11:59 PM");
  const [allowedSubmissionTypes, setAllowedSubmissionTypes] = useState<SubmissionType[]>(["IMAGE", "VIDEO", "DOCUMENT"]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canPublish = title.trim() !== "" && instructions.trim() !== "" && allowedSubmissionTypes.length > 0 && !isSubmitting;
  const helperText = useMemo(
    () => (allowedSubmissionTypes.length === 0 ? "Select at least one allowed submission type." : null),
    [allowedSubmissionTypes.length],
  );

  function toggleSubmissionType(type: SubmissionType) {
    setAllowedSubmissionTypes((current) =>
      current.includes(type) ? current.filter((item) => item !== type) : [...current, type],
    );
  }

  async function handlePublish() {
    if (isSubmitting) return;
    if (!canPublish) {
      setError(helperText ?? "Add a title and instructions first.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await createAssignment({
        idempotencyKey,
        title: title.trim(),
        instructions: instructions.trim(),
        dueDate,
        dueTime,
        allowedSubmissionTypes,
      });
    } catch {
      toast.error("Assignment publishing isn't wired up yet in this build.");
      setError("Publishing is not available yet - this ships in a later wave.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      <Button type="button" onClick={() => setIsOpen((value) => !value)} disabled={isSubmitting}>
        <Plus className="size-4" aria-hidden /> {isOpen ? "Close" : "New Assignment"}
      </Button>

      {isOpen ? (
        <Card>
          <CardHeader>
            <CardTitle>Create Assignment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Title - e.g. Unit 3 Lab Report"
              disabled={isSubmitting}
            />
            <Textarea
              value={instructions}
              onChange={(event) => setInstructions(event.target.value)}
              placeholder="Instructions for trainees..."
              disabled={isSubmitting}
            />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="assignment-due-date">Due date</Label>
                <Input
                  id="assignment-due-date"
                  value={dueDate}
                  onChange={(event) => setDueDate(event.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="assignment-due-time">Due time</Label>
                <Input
                  id="assignment-due-time"
                  value={dueTime}
                  onChange={(event) => setDueTime(event.target.value)}
                  disabled={isSubmitting}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Allowed submission types</Label>
              <div className="grid grid-cols-3 gap-2">
                {SUBMISSION_TYPE_OPTIONS.map((option) => {
                  const selected = allowedSubmissionTypes.includes(option.value);
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => toggleSubmissionType(option.value)}
                      disabled={isSubmitting}
                      aria-pressed={selected}
                      className={cn(
                        "h-8 rounded-full border px-2 text-xs font-medium transition-colors disabled:opacity-50",
                        selected
                          ? "border-primary/40 bg-primary/15 text-primary"
                          : "border-border text-muted-foreground hover:bg-muted",
                      )}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>
            {helperText ? <p className="text-sm text-muted-foreground">{helperText}</p> : null}
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <Button type="button" className="w-full" disabled={!canPublish} onClick={() => void handlePublish()}>
              {isSubmitting ? "Publishing..." : "Publish Assignment"}
            </Button>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
