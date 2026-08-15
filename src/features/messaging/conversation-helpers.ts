import type { ConversationParticipant, ConversationSummary } from "./types";

/** Every participant except the viewer — a DM has exactly one, but this stays correct if group threads land later. */
export function otherParticipants(
  conversation: Pick<ConversationSummary, "participants">,
  currentUserId: string,
): ConversationParticipant[] {
  return conversation.participants.filter((participant) => participant.id !== currentUserId);
}

export function participantInitials(participant: ConversationParticipant): string {
  const initials = `${participant.firstName[0] ?? ""}${participant.lastName[0] ?? ""}`.toUpperCase();
  return initials || "?";
}

export function participantDisplayName(participant: ConversationParticipant): string {
  return [participant.firstName, participant.lastName].filter(Boolean).join(" ") || "Unknown";
}

/** Conversation display name: the other participant(s), comma-joined. */
export function conversationDisplayName(conversation: Pick<ConversationSummary, "participants">, currentUserId: string): string {
  const others = otherParticipants(conversation, currentUserId);
  if (others.length === 0) return "You";
  return others.map(participantDisplayName).join(", ");
}
