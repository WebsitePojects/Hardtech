"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";

import type { AdminUnassignedEnrollmentItem } from "@/server/services/dashboard.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { assignEnrollmentToBatch } from "../mutations/assign-enrollment-to-batch";

export function UnassignedEnrollmentList({ enrollments }: { enrollments: AdminUnassignedEnrollmentItem[] }) {
  if (enrollments.length === 0) return null;

  return (
    <Card>
      <CardContent className="space-y-3">
        <div>
          <p className="font-heading text-base font-semibold text-foreground">Assign active enrollments</p>
          <p className="text-sm text-muted-foreground">Choose a matching trainer batch before trainees can receive work.</p>
        </div>
        <div className="space-y-2">
          {enrollments.map((enrollment) => <EnrollmentAssignmentRow key={enrollment.enrollmentId} enrollment={enrollment} />)}
        </div>
      </CardContent>
    </Card>
  );
}

function EnrollmentAssignmentRow({ enrollment }: { enrollment: AdminUnassignedEnrollmentItem }) {
  const [batchId, setBatchId] = useState(enrollment.eligibleBatches[0]?.id ?? "");
  const [isPending, setIsPending] = useState(false);
  const pendingRef = useRef(false);
  const intentKeyRef = useRef(crypto.randomUUID());

  async function handleAssign() {
    if (pendingRef.current || !batchId) return;
    pendingRef.current = true;
    setIsPending(true);
    try {
      await assignEnrollmentToBatch({
        enrollmentId: enrollment.enrollmentId,
        batchId,
        idempotencyKey: intentKeyRef.current,
      });
      toast.success(`${enrollment.traineeName} assigned to the selected batch.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to assign this enrollment.");
    } finally {
      pendingRef.current = false;
      setIsPending(false);
    }
  }

  return (
    <div className="flex flex-wrap items-end justify-between gap-3 rounded-lg border border-border p-3">
      <div>
        <p className="text-sm font-medium text-foreground">{enrollment.traineeName}</p>
        <p className="text-xs text-muted-foreground">{enrollment.programName}</p>
      </div>
      {enrollment.eligibleBatches.length === 0 ? (
        <p className="text-sm text-muted-foreground">No matching trainer batch is available.</p>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          <select
            aria-label={`Batch for ${enrollment.traineeName}`}
            value={batchId}
            onChange={(event) => setBatchId(event.target.value)}
            disabled={isPending}
            className="h-9 rounded-md border border-input bg-transparent px-2 text-sm text-foreground disabled:opacity-50"
          >
            {enrollment.eligibleBatches.map((batch) => (
              <option key={batch.id} value={batch.id}>{batch.label} · {batch.trainerName}</option>
            ))}
          </select>
          <Button type="button" size="sm" disabled={isPending || !batchId} onClick={() => void handleAssign()}>
            {isPending ? "Assigning…" : "Assign batch"}
          </Button>
        </div>
      )}
    </div>
  );
}
