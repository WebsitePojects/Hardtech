"use client";

import { useState } from "react";
import { Flag } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { REPORT_REASONS } from "./types";
import { reportPost } from "./mutations/report-post";
import { useGuardedMutation } from "./use-guarded-mutation";
import type { ReportReason } from "@/../generated/prisma/enums";

/** Verbatim from mobile-04.md's confirmed 5 report reasons. */
const REASON_LABELS: Record<ReportReason, string> = {
  SPAM: "Spam",
  HARASSMENT: "Harassment",
  MISINFORMATION: "Misinformation",
  OFF_TOPIC: "Off-topic",
  OTHER: "Other",
};

/**
 * Report-post dialog (mobile-04.md: "Reporting Inappropriate Content").
 * Guards: submit button disabled until a reason is chosen and again while
 * pending; handler early-returns via useGuardedMutation; PostReport's
 * compound unique constraint on [postId, reporterId] is what makes a
 * repeat-click safe in wave 3, not client logic.
 */
export function ReportDialog({ postId }: { postId: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<ReportReason | "">("");
  const [note, setNote] = useState("");
  const [idempotencyKey] = useState(() => crypto.randomUUID());
  const { isPending, run } = useGuardedMutation(reportPost, "We could not submit your report.");

  async function handleSubmit() {
    if (isPending || !reason) return;
    await run({
      idempotencyKey,
      postId,
      reason,
      note: note.trim() || undefined,
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          aria-label="Report this post"
          className="inline-flex items-center rounded-md p-1 text-muted-foreground transition-colors hover:bg-glass-hover hover:text-destructive"
        >
          <Flag className="size-3.5" aria-hidden />
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report this post</DialogTitle>
          <DialogDescription>
            Tell us what&apos;s wrong. A moderator will review your report.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="report-reason">Reason</Label>
            <Select value={reason} onValueChange={(value) => setReason(value as ReportReason)}>
              <SelectTrigger id="report-reason" className="w-full">
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                {REPORT_REASONS.map((value) => (
                  <SelectItem key={value} value={value}>
                    {REASON_LABELS[value]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="report-note">Additional details (optional)</Label>
            <Textarea
              id="report-note"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Anything that helps a moderator review this..."
              disabled={isPending}
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button type="button" disabled={!reason || isPending} onClick={() => void handleSubmit()}>
            {isPending ? "Submitting…" : "Submit Report"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
