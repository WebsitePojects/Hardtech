import type { MessageView } from "./types";

/**
 * Server-truth delivery status, derived from `deliveredAt`/`readAt` per the
 * product brief: sent = neither set, delivered = `deliveredAt` set, seen =
 * `readAt` set. Only meaningful for messages the server has actually
 * persisted — an optimistic, not-yet-confirmed send uses
 * `OptimisticSendStatus` below instead.
 */
export type DeliveryStatus = "sent" | "delivered" | "seen";

export function deriveDeliveryStatus(message: Pick<MessageView, "deliveredAt" | "readAt">): DeliveryStatus {
  if (message.readAt) return "seen";
  if (message.deliveredAt) return "delivered";
  return "sent";
}

/**
 * Client-local status for a message the composer just fired but the (stub)
 * `sendMessage` call hasn't confirmed yet — distinct from `DeliveryStatus`,
 * which only exists once the server has assigned real timestamps.
 */
export type OptimisticSendStatus = "sending" | "failed";
