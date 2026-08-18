"use server";

// Thin feature wrapper around the route-owned Server Action.
import { getOrCreateDirectConversationAction } from "@/app/(app)/messages/actions";
import type { GetOrCreateConversationInput } from "../messaging.schema";

export async function getOrCreateConversation(input: GetOrCreateConversationInput) {
  return getOrCreateDirectConversationAction(input);
}
