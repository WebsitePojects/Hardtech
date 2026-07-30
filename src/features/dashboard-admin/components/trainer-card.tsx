"use client";

import { X } from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { usePendingAction } from "../use-pending-action";
import { removeAssignedTrainee } from "../mutations/trainer-mutations";

export type AssignedTrainee = {
  enrollmentId: string;
  batchId: string;
  name: string;
  programLabel: string;
};

export type TrainerManagementItem = {
  id: string;
  name: string;
  initials: string;
  programLabel: string;
  traineeCount: number;
  status: string;
  assignedTrainees: AssignedTrainee[];
};

/**
 * One trainer card in "Trainer Management" (desktop-02.md #8,
 * mobile-05.md #12-14). Each assigned-trainee row's remove ("X") action
 * goes through the disabled/pending/early-return guard before calling the
 * wave-4 stub in ../mutations/trainer-mutations.ts.
 */
export function TrainerCard({ trainer }: { trainer: TrainerManagementItem }) {
  return (
    <Card className="gap-3 p-4">
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarFallback className="bg-primary/15 text-primary">{trainer.initials}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold text-foreground">{trainer.name}</p>
          <p className="text-sm text-muted-foreground">{trainer.programLabel}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg bg-surface-secondary/60 p-3 text-center">
          <p className="font-heading text-lg font-semibold text-foreground">{trainer.traineeCount}</p>
          <p className="text-xs text-muted-foreground">Trainees</p>
        </div>
        <div className="rounded-lg bg-surface-secondary/60 p-3 text-center">
          <p className="font-heading text-lg font-semibold text-primary">{trainer.status}</p>
          <p className="text-xs text-muted-foreground">Status</p>
        </div>
      </div>

      <Separator />

      <CardContent className="px-0">
        <p className="mb-2 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
          Assigned Trainees
        </p>
        {trainer.assignedTrainees.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">No trainees assigned yet</p>
        ) : (
          <ul className="max-h-56 space-y-1 overflow-y-auto">
            {trainer.assignedTrainees.map((trainee) => (
              <AssignedTraineeRow key={trainee.enrollmentId} trainee={trainee} />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function AssignedTraineeRow({ trainee }: { trainee: AssignedTrainee }) {
  const removeAction = usePendingAction();

  async function handleRemove() {
    await removeAction.run(async () => {
      try {
        await removeAssignedTrainee({ enrollmentId: trainee.enrollmentId, batchId: trainee.batchId });
      } catch {
        toast.error("Removing an assigned trainee isn't wired up yet in this build.");
      }
    });
  }

  return (
    <li className="flex items-center justify-between gap-2 rounded-lg px-1.5 py-1.5 text-sm hover:bg-glass-hover">
      <span className="text-foreground">
        {trainee.name} <span className="text-muted-foreground">— {trainee.programLabel}</span>
      </span>
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        aria-label={`Remove ${trainee.name}`}
        disabled={removeAction.isPending}
        onClick={handleRemove}
        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
      >
        <X className="size-3.5" aria-hidden />
      </Button>
    </li>
  );
}
