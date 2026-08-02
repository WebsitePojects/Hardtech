"use server";

import { getSession } from "@/server/auth/session";
import { requestCommunityInputSchema } from "@/features/communities/communities.schema";
import { requestCommunity } from "@/server/services/community-write.service";

export async function createCommunityRequestAction(input: unknown) {
  const parsed = requestCommunityInputSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "Invalid community request." };
  const session = await getSession();
  if (!session) return { ok: false as const, error: "Not authorized." };
  return requestCommunity({ ...parsed.data, userId: session.userId, userRole: session.role });
}
