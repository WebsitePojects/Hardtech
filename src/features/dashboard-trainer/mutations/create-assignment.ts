import type { SubmissionType } from "@/../generated/prisma/enums";

export interface CreateAssignmentInput {
  idempotencyKey: string;
  title: string;
  instructions: string;
  dueDate: string;
  dueTime: string;
  allowedSubmissionTypes: SubmissionType[];
}

export async function createAssignment(input: CreateAssignmentInput): Promise<never> {
  void input;
  throw new Error(
    "TODO(wave-4): assignment creation is not implemented yet. " +
      "This build stops at the disabled/pending guard on purpose.",
  );
}
