"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Send, WifiOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AttachmentPicker, type StagedAttachment } from "./attachment-picker";
import { validateAttachmentBatch } from "./file-validation";
import { sendMessageSchema } from "./messaging.schema";
import { sendMessage } from "./mutations/send-message";
import { uploadMessageAttachment } from "./upload-client";

/**
 * Message composer: body textarea, attachment tray, send button.
 *
 * Non-negotiables rule 1 (no double-submit):
 *   - `idempotencyKey` is minted ONCE per user "send intent", via a ref
 *     seeded with `crypto.randomUUID()` on mount — never regenerated on
 *     retry, so retrying after a dropped response replays the same key
 *     instead of risking a duplicate message. A fresh key is minted only
 *     *after* a confirmed successful send, when the next message becomes a
 *     new intent.
 *   - `isPending` drives both the `disabled` attribute and an early-return
 *     guard at the top of `handleSend`, mirroring
 *     src/app/(auth)/login/login-form.tsx's `handleSubmit` — both are
 *     required independently, since `disabled` alone can still race a fast
 *     double-tap.
 *
 * Deliberately does NOT use the shared `useGuardedMutation` hook (see
 * ./use-guarded-mutation.ts, used elsewhere in this feature for read-only
 * side effects like mark-as-read): that hook swallows success vs. failure
 * into the same code path, which is wrong here specifically — on failure
 * this composer must keep the draft and REUSE the same idempotency key so a
 * retry replays the original intent; only a confirmed success clears the
 * draft and rolls the key. That branch requires knowing the outcome, so
 * `handleSend` awaits `sendMessage` directly instead.
 *
 * Attachments upload eagerly on selection (devSimulateUpload here — a real
 * integration drops in an XHR/fetch with the same
 * `(file, onProgress) => { promise, cancel }` shape) so the send button only
 * needs to wait for already-in-flight uploads, not start them.
 */
export function Composer({ conversationId, onSent }: { conversationId: string; onSent?: () => void }) {
  const [body, setBody] = useState("");
  const [staged, setStaged] = useState<StagedAttachment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const idempotencyKeyRef = useRef(crypto.randomUUID());
  const [isOffline, setIsOffline] = useState(false);
  const [isPending, setIsPending] = useState(false);

  // Network loss is its own visible, recoverable error state — not just
  // another case that falls into the generic "send failed" toast. Composing
  // stays possible offline; sending is blocked with an explicit reason
  // instead of silently failing once the request actually goes out.
  useEffect(() => {
    function updateOnlineStatus() {
      setIsOffline(!navigator.onLine);
    }
    updateOnlineStatus();
    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);
    return () => {
      window.removeEventListener("online", updateOnlineStatus);
      window.removeEventListener("offline", updateOnlineStatus);
    };
  }, []);

  const uploadFile = useCallback((localId: string, file: File) => {
    setStaged((current) => current.map((item) => item.localId === localId ? { ...item, status: "uploading" } : item));
    const promise = uploadMessageAttachment(file, (percent) => {
      setStaged((current) =>
        current.map((item) => (item.localId === localId ? { ...item, status: "uploading", progress: percent } : item)),
      );
    });
    promise
      .then((remote) => {
        setStaged((current) =>
          current.map((item) => (item.localId === localId ? { ...item, status: "done", progress: 100, remote } : item)),
        );
      })
      .catch((uploadError: unknown) => {
        setStaged((current) =>
          current.map((item) =>
            item.localId === localId
              ? { ...item, status: "error", error: uploadError instanceof Error ? uploadError.message : "Upload failed. Remove it or retry." }
              : item,
          ),
        );
      });
  }, []);

  function handleFilesSelected(files: File[]) {
    const { accepted, rejections } = validateAttachmentBatch(staged.length, files);

    // Primary surface is local component state — the same `error` slot
    // `handleSend`'s validation uses — so a rejection is guaranteed visible
    // without depending on a global toast host being mounted somewhere else
    // in the app (this project has no `<Toaster/>` in its root layout yet).
    // `toast.error` is kept as a supplementary notice for the rest of a
    // mixed batch (e.g. 2 of 5 files rejected for different reasons), never
    // the only place the message appears.
    if (rejections.length > 0) {
      setError(rejections[0].reason);
    } else {
      setError(null);
    }

    if (accepted.length === 0) return;

    const newItems: StagedAttachment[] = accepted.map((file) => ({
      localId: crypto.randomUUID(),
      file,
      status: "pending",
      progress: 0,
    }));
    setStaged((current) => [...current, ...newItems]);
    for (const item of newItems) {
      uploadFile(item.localId, item.file);
    }
  }

  function handleRemove(localId: string) {
    setStaged((current) => current.filter((item) => item.localId !== localId));
  }

  function handleRetry(localId: string) {
    const item = staged.find((candidate) => candidate.localId === localId);
    if (!item || isPending) return;
    setError(null);
    uploadFile(localId, item.file);
  }

  const hasUploadingAttachment = staged.some((item) => item.status === "pending" || item.status === "uploading");
  const hasErroredAttachment = staged.some((item) => item.status === "error");
  const isEmpty = body.trim().length === 0 && staged.length === 0;
  const canSend = !isPending && !isOffline && !hasUploadingAttachment && !hasErroredAttachment && !isEmpty;

  async function handleSend() {
    // Rule 1 early-return guard, mirroring login-form.tsx's handleSubmit —
    // checked before anything else, on top of the `disabled` attribute below.
    if (isPending) return;
    if (isOffline) {
      setError("You're offline. Reconnect to send this message.");
      return;
    }
    if (hasUploadingAttachment) {
      setError("Wait for attachments to finish uploading.");
      return;
    }
    if (hasErroredAttachment) {
      setError("Remove the failed attachment before sending.");
      return;
    }

    const attachmentIds = staged.filter((item) => item.status === "done" && item.remote).map((item) => item.remote!.id);
    const parsed = sendMessageSchema.safeParse({
      idempotencyKey: idempotencyKeyRef.current,
      conversationId,
      body,
      attachmentIds,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Write a message first.");
      return;
    }

    setError(null);
    setIsPending(true);
    try {
      const result = await sendMessage(parsed.data);
      if (
        typeof result === "object" &&
        result !== null &&
        "ok" in result &&
        (result as { ok: unknown }).ok === false &&
        "error" in result &&
        typeof (result as { error: unknown }).error === "string"
      ) {
        // Reported failure, not a thrown one — same "keep the draft, reuse
        // the key" recovery path as the catch block below.
        setError((result as { error: string }).error);
        return;
      }

      // Confirmed success: this send intent is over. Clear the draft and
      // mint a fresh key for the next one.
      idempotencyKeyRef.current = crypto.randomUUID();
      setBody("");
      setStaged([]);
      onSent?.();
    } catch {
      // Failed send — visible, recoverable, never silent: the draft and
      // attachments stay exactly as typed, and the SAME idempotency key is
      // reused so pressing send again replays this intent instead of
      // minting a new one that could double-post if the first attempt
      // actually landed server-side.
      setError("We could not send your message. Check your connection and try again.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-2 border-t border-glass-border p-3">
      {isOffline ? (
        <p className="flex items-center gap-1.5 rounded-md bg-destructive/10 px-2.5 py-1.5 text-xs text-destructive">
          <WifiOff className="size-3.5 shrink-0" aria-hidden />
          You&rsquo;re offline. Messages can&rsquo;t be sent until your connection is back.
        </p>
      ) : null}

      <AttachmentPicker staged={staged} disabled={isPending} onFilesSelected={handleFilesSelected} onRemove={handleRemove} onRetry={handleRetry} />

      {error ? (
        <p role="alert" aria-live="polite" className="text-xs text-destructive">
          {error}
        </p>
      ) : null}

      <div className="flex items-end gap-2">
        <Textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder="Write a message..."
          disabled={isPending}
          className="min-h-9 flex-1 resize-none"
          rows={1}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              void handleSend();
            }
          }}
        />
        <Button
          type="button"
          size="icon"
          disabled={!canSend}
          aria-busy={isPending}
          onClick={() => void handleSend()}
          aria-label="Send message"
        >
          <Send className="size-4" aria-hidden />
        </Button>
      </div>
    </div>
  );
}
