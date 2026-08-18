"use server";

// See send-message.ts for the pattern this follows and why the import below
// is an expected "Cannot find module" until src/app/(app)/messages/actions.ts
// is authored by whoever resumes backend work. Used by the /messages/new
// redirect route (see src/app/(app)/messages/new/page.tsx).
import { getOrCreateDirectConversationAction } from "@/app/(app)/messages/actions";
import type { GetOrCreateConversationInput } from "../messaging.schema";

export async function getOrCreateConversation(input: GetOrCreateConversationInput) {
  return getOrCreateDirectConversationAction(input);
}
