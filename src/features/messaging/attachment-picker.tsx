"use client";

import { useRef } from "react";
import { AlertCircle, File as FileIcon, Paperclip, RotateCcw, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { ACCEPTED_FILE_EXTENSIONS, MAX_ATTACHMENTS_PER_MESSAGE, formatMegabytes } from "./file-validation";
import type { MessageAttachment } from "./types";

export type StagedAttachment = {
  /** Client-local id, stable across the upload lifecycle (not the eventual server-issued attachment id). */
  localId: string;
  file: File;
  status: "pending" | "uploading" | "done" | "error";
  progress: number;
  error?: string;
  /** Set once `status === "done"` — the id the composer sends with the message. */
  remote?: MessageAttachment;
};

/**
 * Staged-attachment tray + the "add attachment" trigger. Purely a
 * presentation + local-state-driven list — the actual upload state machine
 * (pending → uploading → done/error) lives in the parent Composer, which
 * owns the async upload call so it can be swapped from the dev simulation to
 * a real XHR/fetch without touching this component.
 */
export function AttachmentPicker({
  staged,
  disabled,
  onFilesSelected,
  onRemove,
  onRetry,
}: {
  staged: StagedAttachment[];
  disabled: boolean;
  onFilesSelected: (files: File[]) => void;
  onRemove: (localId: string) => void;
  onRetry: (localId: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
    <div className="flex flex-col gap-2">
      {staged.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {staged.map((item) => (
            <div
              key={item.localId}
              className={cn(
                "flex w-44 flex-col gap-1 rounded-lg border border-glass-border bg-glass p-2 text-xs",
                item.status === "error" && "border-destructive/50",
              )}
            >
              <div className="flex items-center gap-1.5">
                <FileIcon className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
                <span className="min-w-0 flex-1 truncate">{item.file.name}</span>
                <button
                  type="button"
                  onClick={() => onRemove(item.localId)}
                  aria-label={`Remove ${item.file.name}`}
                  className="shrink-0 text-muted-foreground hover:text-foreground"
                >
                  <X className="size-3.5" aria-hidden />
                </button>
              </div>
              <span className="text-[10px] text-muted-foreground">{formatMegabytes(item.file.size)}</span>
              {item.status === "uploading" || item.status === "pending" ? (
                <Progress value={item.progress} className="h-1" />
              ) : null}
              {item.status === "error" ? (
                <div className="flex items-start gap-1 text-[10px] text-destructive">
                  <AlertCircle className="size-3 shrink-0" aria-hidden />
                  <span className="min-w-0 flex-1">Upload failed</span>
                  <button type="button" onClick={() => onRetry(item.localId)} aria-label={`Retry ${item.file.name}`} title={item.error} className="shrink-0 text-primary hover:text-primary/80">
                    <RotateCcw className="size-3" aria-hidden />
                  </button>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}

      <div>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPTED_FILE_EXTENSIONS}
          className="hidden"
          disabled={disabled}
          onChange={(event) => {
            const files = Array.from(event.target.files ?? []);
            event.target.value = "";
            if (files.length > 0) onFilesSelected(files);
          }}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          disabled={disabled || staged.length >= MAX_ATTACHMENTS_PER_MESSAGE}
          onClick={() => inputRef.current?.click()}
          aria-label="Attach a file"
        >
          <Paperclip className="size-4" aria-hidden />
        </Button>
        <p className="mt-1 text-[10px] text-muted-foreground">Images, video, PDF, or DOCX · 10 MB max each</p>
      </div>
    </div>
  );
}
