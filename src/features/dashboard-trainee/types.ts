import type { SessionType, SubmissionType } from "@/../generated/prisma/enums";

export type TraineeAssignmentListItem = {
  id: string;
  title: string;
  instructions: string;
  dueDate: string;
  dueTime: string;
  allowedSubmissionTypes: SubmissionType[];
  submission: {
    submittedAt: string;
    delivery:
      | { state: "READY"; url: string; type: SubmissionType }
      | { state: "PROCESSING"; type: SubmissionType }
      | { state: "LEGACY"; url: string };
  } | null;
};

export type TraineeSessionView = {
  id: string;
  title: string;
  sessionType: SessionType;
  sessionDate: string;
  startTime: string;
  location: string | null;
};
