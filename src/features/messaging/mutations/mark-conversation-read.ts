"use server";

// Thin feature wrapper around the route-owned Server Action.
import { markConversationReadAction } from "@/app/(app)/messages/actions";
import type { MarkConversationReadInput } from "../messaging.schema";

export async function markConversationRead(input: MarkConversationReadInput) {
  return markConversationReadAction(input);
}
