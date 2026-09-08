import { submitAssignmentAction } from "@/app/(dashboard)/dashboard/trainee/actions";

type UploadTicket = {
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: string;
  publicId: string;
  uploadUrl: string;
  /** Posted as signed `allowed_formats`; preserve the server-selected order. */
  allowedFormats: readonly string[];
  /** Posted as signed `upload_preset`; Cloudinary enforces ticket limits with it. */
  uploadPreset: string;
  notificationUrl?: string;
};

export type SubmitAssignmentInput = {
  assignmentId: string;
  idempotencyKey: string;
  file: File;
  onProgress: (percent: number) => void;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

async function jsonOrNull(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function uploadToCloudinary(ticket: UploadTicket, file: File, onProgress: (percent: number) => void): Promise<{ publicId: string }> {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("POST", ticket.uploadUrl);
    request.responseType = "json";
    request.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100));
    });
    request.addEventListener("error", () => reject(new Error("The upload connection was interrupted.")));
    request.addEventListener("abort", () => reject(new Error("Upload cancelled.")));
    request.addEventListener("load", () => {
      const payload: unknown = request.response;
      if (request.status < 200 || request.status >= 300 || !isRecord(payload)) {
        reject(new Error("The storage service rejected this file."));
        return;
      }
      const publicId = typeof payload.public_id === "string" ? payload.public_id : "";
      if (!publicId) {
        reject(new Error("The upload completed without a usable file reference."));
        return;
      }
      resolve({ publicId });
    });

    const body = new FormData();
    body.append("file", file);
    body.append("api_key", ticket.apiKey);
    body.append("timestamp", String(ticket.timestamp));
    body.append("signature", ticket.signature);
    body.append("folder", ticket.folder);
    body.append("public_id", ticket.publicId);
    body.append("allowed_formats", ticket.allowedFormats.join(","));
    body.append("upload_preset", ticket.uploadPreset);
    if (ticket.notificationUrl) body.append("notification_url", ticket.notificationUrl);
    request.send(body);
  });
}

/** Browser bytes go only to the constrained signed upload endpoint. */
export async function submitAssignmentSubmission(input: SubmitAssignmentInput) {
  const signResponse = await fetch("/api/uploads/sign", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      kind: "ASSIGNMENT_SUBMISSION",
      fileName: input.file.name,
      byteSize: input.file.size,
      mimeType: input.file.type,
    }),
  });
  const signPayload = await jsonOrNull(signResponse);
  if (!signResponse.ok || !isRecord(signPayload) || !isRecord(signPayload.ticket) || typeof signPayload.mediaAssetId !== "string") {
    const error = isRecord(signPayload) && typeof signPayload.error === "string"
      ? signPayload.error
      : "Upload service unavailable. Please try again.";
    throw new Error(error);
  }

  const uploaded = await uploadToCloudinary(signPayload.ticket as UploadTicket, input.file, input.onProgress);
  const confirmResponse = await fetch("/api/uploads/confirm", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ mediaAssetId: signPayload.mediaAssetId, publicId: uploaded.publicId }),
  });
  if (!confirmResponse.ok) throw new Error("The file uploaded but could not be verified. Please retry it.");

  const result = await submitAssignmentAction({
    assignmentId: input.assignmentId,
    idempotencyKey: input.idempotencyKey,
    mediaAssetId: signPayload.mediaAssetId,
  });
  if (!result.ok) throw new Error(result.error);
  return result;
}
