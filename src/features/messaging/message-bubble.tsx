import { AlertCircle, Check, CheckCheck, File as FileIcon, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { deriveDeliveryStatus, type OptimisticSendStatus } from "./message-status";
import { formatFullTimestamp, formatRelativeTime } from "./relative-time";
import { formatMegabytes } from "./file-validation";
import type { MessageView } from "./types";

function StatusTicks({ message, optimisticStatus }: { message: MessageView; optimisticStatus?: OptimisticSendStatus }) {
  if (optimisticStatus === "sending") {
    return <Loader2 className="size-3 animate-spin text-primary-foreground/70" aria-label="Sending" />;
  }
  if (optimisticStatus === "failed") {
    return <AlertCircle className="size-3 text-destructive" aria-label="Failed to send" />;
  }

  const status = deriveDeliveryStatus(message);
  if (status === "sent") {
    return <Check className="size-3 text-primary-foreground/70" aria-label="Sent" />;
  }
  if (status === "delivered") {
    return <CheckCheck className="size-3 text-primary-foreground/70" aria-label="Delivered" />;
  }
  return <CheckCheck className="size-3 text-primary-foreground" aria-label="Seen" />;
}

function AttachmentThumb({ attachment }: { attachment: MessageView["attachments"][number] }) {
  if (attachment.kind === "IMAGE") {
    return (
      // Attachment URLs are per-message and provider-issued (or blob: during
      // local upload preview); routing them through next/image would
      // require an unbounded remotePatterns allowlist for a chat surface.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={attachment.url}
        alt=""
        className="max-h-64 w-auto max-w-full rounded-md border border-glass-border object-cover"
      />
    );
  }

  if (attachment.kind === "VIDEO") {
    return (
      <video
        src={attachment.url}
        controls
        preload="metadata"
        className="max-h-72 max-w-full rounded-md border border-glass-border bg-black object-contain"
        aria-label="Attached video"
      />
    );
  }

  return (
    <a
      href={attachment.url}
      target="_blank"
      rel="noreferrer"
      download
      className="flex items-center gap-2 rounded-md border border-glass-border bg-background/40 px-2.5 py-2 text-xs hover:bg-background/70"
    >
      <FileIcon className="size-4 shrink-0" aria-hidden />
      <span className="truncate">{attachment.mimeType || "File"}</span>
      <span className="shrink-0 text-muted-foreground">{formatMegabytes(attachment.bytes)}</span>
    </a>
  );
}

/**
 * One message bubble. `isOwn` drives the visual split required by the brief:
 * the sender's own messages use the brand primitive (`bg-primary` /
 * `text-primary-foreground`, the same green used for the primary CTA
 * elsewhere in the app), the other party's use the neutral glass surface
 * ReplyCard already established (`bg-surface-secondary`) — so a thread reads
 * as the same visual language as the rest of the app rather than inventing a
 * new one.
 */
export function MessageBubble({
  message,
  isOwn,
  optimisticStatus,
}: {
  message: MessageView;
  isOwn: boolean;
  optimisticStatus?: OptimisticSendStatus;
}) {
  return (
    <div className={cn("flex", isOwn ? "justify-end" : "justify-start")}>
      <div className={cn("flex max-w-[80%] flex-col gap-1", isOwn ? "items-end" : "items-start")}>
        {message.attachments.length > 0 ? (
          <div className="flex flex-col gap-1.5">
            {message.attachments.map((attachment) => (
              <AttachmentThumb key={attachment.id} attachment={attachment} />
            ))}
          </div>
        ) : null}

        {message.body ? (
          <div
            className={cn(
              "rounded-2xl px-3.5 py-2 text-sm whitespace-pre-line",
              isOwn
                ? "rounded-br-md bg-primary text-primary-foreground"
                : "rounded-bl-md border border-glass-border bg-surface-secondary text-foreground/90",
              optimisticStatus === "failed" && "border border-destructive/50",
            )}
          >
            {message.body}
          </div>
        ) : null}

        <div className="flex items-center gap-1 px-1 text-[10px] text-muted-foreground">
          <time dateTime={message.sentAt.toISOString()} title={formatFullTimestamp(message.sentAt)}>
            {formatRelativeTime(message.sentAt)}
          </time>
          {isOwn ? <StatusTicks message={message} optimisticStatus={optimisticStatus} /> : null}
        </div>
      </div>
    </div>
  );
}
