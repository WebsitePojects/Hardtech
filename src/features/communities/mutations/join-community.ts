"use server";

import { getSession } from "@/server/auth/session";
import { joinCommunity as writeJoinCommunity } from "@/server/services/community-write.service";
import { joinCommunityInputSchema } from "../communities.schema";

export interface JoinCommunityInput {
  idempotencyKey: string;
  communityId: string;
}

export async function joinCommunity(input: unknown) {
  const parsed = joinCommunityInputSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "Invalid community." };
  const session = await getSession();
  if (!session) return { ok: false as const, error: "Not authorized." };
  return writeJoinCommunity({ ...parsed.data, userId: session.userId, userRole: session.role });
}
