import { communityMembershipRepository } from "@/server/repositories/community-membership.repository";
import { communityRepository } from "@/server/repositories/community.repository";
import { checkRateLimit } from "@/server/auth/rate-limit";
import { verifiedActor } from "@/server/services/actor-verification.service";
import type { UserRole } from "@/../generated/prisma/client";

type Result = { ok: true; id?: string } | { ok: false; error: string };

function isUniqueViolation(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === "P2002";
}

const communityRoles: readonly UserRole[] = ["TRAINEE", "TRAINER", "ADMIN"];

async function verifiedCommunityActor(userId: string, userRole: string): Promise<boolean> {
  if (!communityRoles.includes(userRole as UserRole)) return false;
  return verifiedActor(userId, userRole as UserRole, communityRoles);
}

async function consumeWriteBudget(actorId: string, operation: string): Promise<boolean> {
  try {
    return (await checkRateLimit(`enroll:communities-${operation}:${actorId}`)).allowed;
  } catch {
    return false;
  }
}

export async function joinCommunity(input: { userId: string; userRole: string; communityId: string; idempotencyKey: string }): Promise<Result> {
  if (!(await verifiedCommunityActor(input.userId, input.userRole))) return { ok: false, error: "Not authorized." };
  const existing = await communityMembershipRepository.findByUserAndCommunityId(input.userId, input.communityId);
  if (existing) return { ok: true, id: existing.id };
  if (!(await consumeWriteBudget(input.userId, "join"))) return { ok: false, error: "Please wait before joining another community." };
  const community = await communityRepository.findById(input.communityId);
  if (!community) return { ok: false, error: "Community not found." };
  const status = community.visibility === "PUBLIC" ? "APPROVED" : "PENDING";
  try {
    const membership = await communityMembershipRepository.create({ userId: input.userId, communityId: input.communityId, status });
    return { ok: true, id: membership.id };
  } catch (error) {
    if (!isUniqueViolation(error)) return { ok: false, error: "Unable to join community." };
    const replay = await communityMembershipRepository.findByUserAndCommunityId(input.userId, input.communityId);
    return replay ? { ok: true, id: replay.id } : { ok: false, error: "Unable to join community." };
  }
}

export async function leaveCommunity(input: { userId: string; userRole: string; communityId: string }): Promise<Result> {
  if (!(await verifiedCommunityActor(input.userId, input.userRole))) return { ok: false, error: "Not authorized." };
  if (!(await consumeWriteBudget(input.userId, "leave"))) return { ok: false, error: "Please wait before leaving another community." };
  await communityMembershipRepository.deleteByUserAndCommunity(input.userId, input.communityId);
  return { ok: true };
}

export async function requestCommunity(input: { userId: string; userRole: string; idempotencyKey: string; name: string; region: string; description: string }): Promise<Result> {
  if (!(await verifiedCommunityActor(input.userId, input.userRole))) return { ok: false, error: "Not authorized." };
  const replay = await communityRepository.findRequestByIdempotencyKey(input.idempotencyKey);
  if (replay?.requesterId === input.userId) return { ok: true, id: replay.id };
  if (!(await consumeWriteBudget(input.userId, "request"))) return { ok: false, error: "Please wait before requesting another community." };
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
  if (input.reviewerRole !== "ADMIN" || !(await verifiedActor(input.reviewerId, "ADMIN", ["ADMIN"]))) return { ok: false, error: "Not authorized." };
  if (!(await consumeWriteBudget(input.reviewerId, "moderate"))) return { ok: false, error: "Please wait before reviewing another community request." };
  const changed = await communityRepository.transitionRequest(input.requestId, "PENDING", "APPROVED", input.reviewerId, null);
  return changed.count === 1 ? { ok: true } : { ok: false, error: "Request is no longer pending." };
}

export async function rejectCommunityRequest(input: { requestId: string; reviewerId: string; reviewerRole: string; reason?: string }): Promise<Result> {
  if (input.reviewerRole !== "ADMIN" || !(await verifiedActor(input.reviewerId, "ADMIN", ["ADMIN"]))) return { ok: false, error: "Not authorized." };
  if (!(await consumeWriteBudget(input.reviewerId, "moderate"))) return { ok: false, error: "Please wait before reviewing another community request." };
  const changed = await communityRepository.transitionRequest(input.requestId, "PENDING", "REJECTED", input.reviewerId, input.reason ?? null);
  return changed.count === 1 ? { ok: true } : { ok: false, error: "Request is no longer pending." };
}
