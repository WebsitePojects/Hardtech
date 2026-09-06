import { ClipboardList } from "lucide-react";

import type { TrainerAssignmentItem, TrainerBatchOption } from "@/server/services/dashboard.service";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { Card, CardContent } from "@/components/ui/card";
import { AssignmentCreateForm } from "../assignment-create-form";
import { formatDateOnly } from "../format";

export function AssignmentsSection({ assignments, batches }: { assignments: TrainerAssignmentItem[]; batches: TrainerBatchOption[] }) {
  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title="Assignments"
        description="Post tasks for your trainees. They'll get a real-time notification and can submit image, video, or document files."
      />

      <AssignmentCreateForm batches={batches} />

      {assignments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-10 text-center">
            <span className="flex size-10 items-center justify-center rounded-full bg-primary/15 text-primary" aria-hidden>
              <ClipboardList className="size-5" />
            </span>
            <p className="font-heading text-sm font-semibold text-foreground">No assignments yet</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Click <strong>New Assignment</strong> to post one. Trainees will be notified instantly.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {assignments.map((assignment) => (
            <Card key={assignment.id}>
              <CardContent className="space-y-2">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-heading text-sm font-semibold text-foreground">{assignment.title}</p>
                    <p className="text-sm text-muted-foreground">{assignment.instructions}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Due {formatDateOnly(assignment.dueDate)} · {assignment.dueTime}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
