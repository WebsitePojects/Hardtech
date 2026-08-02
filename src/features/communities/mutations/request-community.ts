"use server";

import { getSession } from "@/server/auth/session";
import { requestCommunity as writeRequestCommunity } from "@/server/services/community-write.service";
import { requestCommunityInputSchema } from "../communities.schema";

export interface RequestCommunityInput {
  idempotencyKey: string;
  name: string;
  region: string;
  description: string;
}

export async function requestCommunity(input: unknown) {
  const parsed = requestCommunityInputSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "Invalid community request." };
  const session = await getSession();
  if (!session) return { ok: false as const, error: "Not authorized." };
  return writeRequestCommunity({ ...parsed.data, userId: session.userId, userRole: session.role });
}
