import type { SessionType, SubmissionType } from "@/../generated/prisma/enums";

export type TraineeAssignmentListItem = {
  id: string;
  title: string;
  instructions: string;
  dueDate: string;
  dueTime: string;
  allowedSubmissionTypes: SubmissionType[];
  submission: { submissionLink: string; submittedAt: string } | null;
};

export type TraineeSessionView = {
  id: string;
  title: string;
  sessionType: SessionType;
  sessionDate: string;
  startTime: string;
  location: string | null;
};
