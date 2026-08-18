// Client-side attachment validation. Every rule here MUST be checked before
// any upload starts (product brief) — this module has no I/O, it only
// classifies and rejects, so the composer can call it synchronously on file
// selection/drop.
import type { MessageAttachmentKind } from "./types";

export const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024; // 10 MB
export const MAX_ATTACHMENTS_PER_MESSAGE = 5;

const ACCEPTED_MIME_TYPES = new Set<string>([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

/** `<input accept="...">` and the drop-zone hint text share this one list. */
export const ACCEPTED_FILE_EXTENSIONS =
  "image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm,video/quicktime,application/pdf,.docx";

export function classifyAttachmentKind(mimeType: string): MessageAttachmentKind {
  if (mimeType.startsWith("image/")) return "IMAGE";
  if (mimeType.startsWith("video/")) return "VIDEO";
  return "FILE";
}

/**
 * Whole-MB rounding above 10 MB (matches how people actually say file
 * sizes), one-decimal precision below it so a 9.6 MB file doesn't misreport
 * as "10 MB" right at the boundary.
 */
export function formatMegabytes(bytes: number): string {
  const mb = bytes / (1024 * 1024);
  const rounded = mb >= 10 ? Math.round(mb) : Math.round(mb * 10) / 10;
  return `${rounded} MB`;
}

export type AttachmentValidation = { ok: true } | { ok: false; reason: string };

/**
 * Exact sentence pattern from the brief: "That file is 14 MB. The maximum
 * is 10 MB." — state the actual size and the actual limit, never a generic
 * "file too large".
 */
export function validateAttachmentFile(file: File): AttachmentValidation {
  if (!ACCEPTED_MIME_TYPES.has(file.type)) {
    return {
      ok: false,
      reason: `"${file.name}" is not a supported file type. Attach images, video, PDF, or DOCX files only.`,
    };
  }
  if (file.size > MAX_ATTACHMENT_BYTES) {
    return {
      ok: false,
      reason: `That file is ${formatMegabytes(file.size)}. The maximum is ${formatMegabytes(MAX_ATTACHMENT_BYTES)}.`,
    };
  }
  return { ok: true };
}

export type AttachmentRejection = { file: File; reason: string };

/**
 * Validates a batch of newly-picked files against both the per-file rules
 * and the 5-per-message cap, given how many attachments are already staged.
 * Every rejected file carries its own reason — never a single generic error
 * covering a mixed batch.
 */
export function validateAttachmentBatch(
  existingCount: number,
  incoming: File[],
): { accepted: File[]; rejections: AttachmentRejection[] } {
  const rejections: AttachmentRejection[] = [];
  const accepted: File[] = [];
  let count = existingCount;

  for (const file of incoming) {
    if (count >= MAX_ATTACHMENTS_PER_MESSAGE) {
      rejections.push({
        file,
        reason: `You can attach up to ${MAX_ATTACHMENTS_PER_MESSAGE} files per message.`,
      });
      continue;
    }
    const result = validateAttachmentFile(file);
    if (!result.ok) {
      rejections.push({ file, reason: result.reason });
      continue;
    }
    accepted.push(file);
    count += 1;
  }

  return { accepted, rejections };
}
