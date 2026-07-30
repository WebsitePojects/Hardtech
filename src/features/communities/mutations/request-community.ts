// TODO(wave-3): replace with a real call once auth and the mutation pipeline
// exist. "Request community" (desktop-02.md #28 "+ Request community"
// button) creates an admin-reviewed request, not a live Community row —
// modelled the same way as every other mutating path in this wave: a stub
// that always throws so the compose dialog can exercise the real
// disabled/pending/idempotency-key guards without faking a filed request.
export interface RequestCommunityInput {
  idempotencyKey: string;
  name: string;
  region: string;
  description: string;
}

export async function requestCommunity(input: RequestCommunityInput): Promise<never> {
  void input;
  throw new Error(
    "TODO(wave-3): requesting a community is not implemented yet. This build stops at the disabled/pending guard on purpose.",
  );
}
