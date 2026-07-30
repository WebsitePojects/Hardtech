export interface EvaluateTraineeInput {
  idempotencyKey: string;
  traineeId: string;
  skill: string;
  rating: "CERTIFIED" | "COMPETENT" | "NEEDS_IMPROVEMENT";
  notes: string;
}

export async function evaluateTrainee(input: EvaluateTraineeInput): Promise<never> {
  void input;
  throw new Error(
    "TODO(wave-4): trainer evaluation is not implemented yet. " +
      "This build stops at the disabled/pending guard on purpose.",
  );
}
