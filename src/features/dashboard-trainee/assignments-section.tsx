import { ClipboardList } from "lucide-react";

import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { AssignmentSubmissionForm } from "./assignment-submission-form";
import type { TraineeAssignmentListItem } from "./types";

export type AssignmentsSectionProps = {
  assignments: TraineeAssignmentListItem[];
};

export function AssignmentsSection({ assignments }: AssignmentsSectionProps) {
  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title="Assignments"
        description="Submit tasks posted by your trainer - images, videos, or documents."
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
            <Card key={assignment.id}>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-heading text-sm font-semibold text-foreground">{assignment.title}</p>
                    <p className="text-sm text-muted-foreground">{assignment.instructions}</p>
                  </div>
                  {assignment.submission ? (
                    <Badge variant="outline" className="border-primary/40 bg-primary/10 text-primary">
                      Submitted
                    </Badge>
                  ) : null}
                </div>
                {assignment.submission ? (
                  <div className="rounded-lg border border-glass-border p-3 text-sm">
                    <p className="font-medium text-foreground">Submitted {assignment.submission.submittedAt}</p>
                    <a
                      href={assignment.submission.submissionLink}
                      className="break-all text-primary hover:underline"
                      target="_blank"
                      rel="noreferrer"
                    >
                      {assignment.submission.submissionLink}
                    </a>
                  </div>
                ) : (
                  <AssignmentSubmissionForm assignment={assignment} />
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
