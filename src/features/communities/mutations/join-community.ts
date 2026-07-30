// TODO(wave-3): replace with a real call once auth and the mutation pipeline
// exist. Join is a TOGGLE-shaped write — CommunityMembership carries a
// compound unique constraint on [communityId, userId] so a double-fire
// "Join" click cannot create two rows; wave 3 relies on that constraint,
// never a read-then-write check-then-act. Public communities are expected to
// land APPROVED immediately, private ones PENDING for the admin/moderator
// queue — that branching is a service concern, not this stub's.
// See .claude/rules/00-non-negotiables.md rules 1 and 2.
export interface JoinCommunityInput {
  idempotencyKey: string;
  communityId: string;
}

export async function joinCommunity(input: JoinCommunityInput): Promise<never> {
  void input;
  throw new Error(
    "TODO(wave-3): joining a community is not implemented yet. This build stops at the disabled/pending guard on purpose.",
  );
}
