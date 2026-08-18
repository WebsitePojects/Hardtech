"use server";

// Thin feature wrapper around the route-owned Server Action. The action
// validates input and delegates delivery/idempotency rules to the service.
import { sendMessageAction } from "@/app/(app)/messages/actions";
import type { SendMessageInput } from "../messaging.schema";

export async function sendMessage(input: SendMessageInput) {
  return sendMessageAction(input);
}
