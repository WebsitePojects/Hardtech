import type { UserRole } from "@/../generated/prisma/client";
import { userRepository } from "@/server/repositories/user.repository";

/**
 * Re-verifies a caller's identity against the database instead of trusting a
 * caller-supplied role argument. A session cookie only proves who signed in
 * and that the signature is intact — it carries no revocation and no role
 * versioning, so a demoted or suspended actor's still-validly-signed cookie
 * must not be enough to act (.claude/rules/00-non-negotiables.md rule 5,
 * "server-side authorization on every route").
 *
 * Answers exactly one question: is this actor really who they claim to be,
 * and are they active. It deliberately knows nothing about which roles a
 * particular action requires (that is `allowedRoles`, supplied by the
 * caller) or about business rules like self-conflict or moderation scope —
 * those stay in the service that owns them.
 *
 * Returns true only when the claimed role is one of `allowedRoles`, the
 * actor's real row exists with that exact role, and the actor is not
 * SUSPENDED. Fails closed on a missing actor, a role mismatch, or a
 * suspended actor.
 */
export async function verifiedActor(
  actorId: string,
  claimedRole: UserRole,
  allowedRoles: readonly UserRole[],
): Promise<boolean> {
  if (!allowedRoles.includes(claimedRole)) return false;
  const actor = await userRepository.findById(actorId);
  return actor?.role === claimedRole && actor.status === "ACTIVE";
}

/**
 * Resolves an actor immediately before a write when the operation has no
 * role claim (for example, sending a message). Pending, suspended, and
 * deleted accounts all fail closed. Callers that do accept a role claim must
 * use `verifiedActor` above so a stale or spoofed claim cannot authorize a
 * write.
 */
export async function activeActor(actorId: string) {
  const actor = await userRepository.findById(actorId);
  return actor?.status === "ACTIVE" ? actor : null;
}
