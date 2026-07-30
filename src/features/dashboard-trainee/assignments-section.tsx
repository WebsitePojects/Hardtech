import { ClipboardList } from "lucide-react";

import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { Card, CardContent } from "@/components/ui/card";
import { AssignmentSubmissionForm } from "./assignment-submission-form";
import type { TraineeAssignmentListItem } from "./types";

/**
 * desktop-02.md #24, mobile-06.md 14:32:26: "Assignments" — verbatim
 * empty-state copy every captured screenshot of this trainee page shows.
 *
 * `dashboard.service.ts` exposes no read for Assignment/AssignmentSubmission
 * (only `getTraineeOverview`, `getDashboardUser`, `getNotifications` — see
 * that module's own scope note). Per .claude/rules/10-architecture.md this
 * builder may not import a repository or `db` to fill the gap, so
 * `assignments` stays a real, correctly-typed, always-empty array instead
 * of fabricated rows.
 *
 * TODO(orchestrator): dashboard.service lacks a trainee assignment-listing
 * read (Assignment rows scoped to the trainee's batch, each joined with the
 * trainee's own AssignmentSubmission if one exists). Once it lands, map its
 * result into `assignments` below — `AssignmentSubmissionForm` is already
 * built against `TraineeAssignmentListItem` with full disabled/pending/
 * idempotency-key guards and is ready to receive real rows.
 */
const assignments: TraineeAssignmentListItem[] = [];

export function AssignmentsSection() {
  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title="Assignments"
        description="Submit tasks posted by your trainer — images, videos, or documents."
      />

      {assignments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-10 text-center">
            <span
              className="flex size-10 items-center justify-center rounded-full bg-primary/15 text-primary"
              aria-hidden
            >
              <ClipboardList className="size-5" />
            </span>
            <p className="font-heading text-sm font-semibold text-foreground">No assignments yet</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Your trainer hasn&apos;t posted anything. You&apos;ll get a notification when they do.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {assignments.map((assignment) => (
            <AssignmentSubmissionForm key={assignment.id} assignment={assignment} />
          ))}
        </div>
      )}
    </div>
  );
}
