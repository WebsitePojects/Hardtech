"use server";

// See send-message.ts for the pattern this follows and why the import below
// is an expected "Cannot find module" until src/app/(app)/messages/actions.ts
// is authored by whoever resumes backend work.
import { markConversationReadAction } from "@/app/(app)/messages/actions";
import type { MarkConversationReadInput } from "../messaging.schema";

export async function markConversationRead(input: MarkConversationReadInput) {
  return markConversationReadAction(input);
}
