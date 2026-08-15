"use server";

// Mirrors src/features/forum/mutations/vote-on-post.ts's shape exactly: a
// thin "use server" wrapper around a Server Action owned by
// src/app/(app)/messages/actions.ts, which does NOT exist yet (backend
// paused for this wave, and route actions.ts files are off limits to this
// builder). `npx tsc --noEmit` reports "Cannot find module
// '@/app/(app)/messages/actions'" here — expected, not a defect in this
// slice. Once actions.ts lands with a `sendMessageAction` matching this
// input shape, this file needs zero changes and every caller (composer.tsx,
// via useGuardedMutation) picks up the real behavior automatically.
import { sendMessageAction } from "@/app/(app)/messages/actions";
import type { SendMessageInput } from "../messaging.schema";

export async function sendMessage(input: SendMessageInput) {
  return sendMessageAction(input);
}
