import { communityMembershipRepository } from "@/server/repositories/community-membership.repository";
import { communityRepository } from "@/server/repositories/community.repository";

type Result = { ok: true; id?: string } | { ok: false; error: string };

function isUniqueViolation(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === "P2002";
}

export async function joinCommunity(input: { userId: string; userRole: string; communityId: string; idempotencyKey: string }): Promise<Result> {
  void input.idempotencyKey;
  if (input.userRole !== "TRAINEE" && input.userRole !== "TRAINER" && input.userRole !== "ADMIN") return { ok: false, error: "Not authorized." };
  const community = await communityRepository.findById(input.communityId);
  if (!community) return { ok: false, error: "Community not found." };
  const status = community.visibility === "PUBLIC" ? "APPROVED" : "PENDING";
  try {
    const membership = await communityMembershipRepository.create({ userId: input.userId, communityId: input.communityId, status });
    return { ok: true, id: membership.id };
  } catch (error) {
    if (!isUniqueViolation(error)) return { ok: false, error: "Unable to join community." };
    const existing = await communityMembershipRepository.findByUserAndCommunityId(input.userId, input.communityId);
    return existing ? { ok: true, id: existing.id } : { ok: false, error: "Unable to join community." };
  }
}

export async function leaveCommunity(input: { userId: string; userRole: string; communityId: string }): Promise<Result> {
  if (input.userRole !== "TRAINEE" && input.userRole !== "TRAINER" && input.userRole !== "ADMIN") return { ok: false, error: "Not authorized." };
  await communityMembershipRepository.deleteByUserAndCommunity(input.userId, input.communityId);
  return { ok: true };
}

export async function requestCommunity(input: { userId: string; userRole: string; idempotencyKey: string; name: string; region: string; description: string }): Promise<Result> {
  if (input.userRole !== "TRAINEE" && input.userRole !== "TRAINER" && input.userRole !== "ADMIN") return { ok: false, error: "Not authorized." };
  try {
    const request = await communityRepository.createRequest({ requesterId: input.userId, name: input.name, region: input.region, description: input.description, idempotencyKey: input.idempotencyKey });
    return { ok: true, id: request.id };
  } catch (error) {
    if (!isUniqueViolation(error)) return { ok: false, error: "Unable to submit community request." };
    const existing = await communityRepository.findRequestByIdempotencyKey(input.idempotencyKey) ??
      await communityRepository.findRequestByRequesterAndName(input.userId, input.name, input.region);
    return existing ? { ok: true, id: existing.id } : { ok: false, error: "Unable to submit community request." };
  }
}

export async function approveCommunityRequest(input: { requestId: string; reviewerId: string; reviewerRole: string }): Promise<Result> {
  if (input.reviewerRole !== "ADMIN") return { ok: false, error: "Not authorized." };
  const changed = await communityRepository.transitionRequest(input.requestId, "PENDING", "APPROVED", input.reviewerId, null);
  return changed.count === 1 ? { ok: true } : { ok: false, error: "Request is no longer pending." };
}

export async function rejectCommunityRequest(input: { requestId: string; reviewerId: string; reviewerRole: string; reason?: string }): Promise<Result> {
  if (input.reviewerRole !== "ADMIN") return { ok: false, error: "Not authorized." };
  const changed = await communityRepository.transitionRequest(input.requestId, "PENDING", "REJECTED", input.reviewerId, input.reason ?? null);
  return changed.count === 1 ? { ok: true } : { ok: false, error: "Request is no longer pending." };
}
