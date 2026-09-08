import type { MessageAttachment } from "./types";

type UploadTicket = {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: string;
  publicId: string;
  resourceType: "image" | "video" | "raw";
  uploadUrl: string;
  /** Posted as signed `allowed_formats`; preserve the server-selected order. */
  allowedFormats: readonly string[];
  /** Posted as signed `upload_preset`; Cloudinary enforces ticket limits with it. */
  uploadPreset: string;
  notificationUrl?: string;
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

function uploadToCloudinary(ticket: UploadTicket, file: File, onProgress: (percent: number) => void) {
  return new Promise<{ publicId: string; url: string; bytes: number }>((resolve, reject) => {
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
      const url = typeof payload.secure_url === "string" ? payload.secure_url : "";
      if (!publicId || !url) {
        reject(new Error("The upload completed without a usable file reference."));
        return;
      }
      resolve({ publicId, url, bytes: typeof payload.bytes === "number" ? payload.bytes : file.size });
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

export async function uploadMessageAttachment(file: File, onProgress: (percent: number) => void): Promise<MessageAttachment> {
  const signResponse = await fetch("/api/uploads/sign", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ kind: "MESSAGE_ATTACHMENT", fileName: file.name, byteSize: file.size, mimeType: file.type }),
  });
  const signPayload = await jsonOrNull(signResponse);
  if (!signResponse.ok || !isRecord(signPayload) || !isRecord(signPayload.ticket) || typeof signPayload.mediaAssetId !== "string") {
    const error = isRecord(signPayload) && typeof signPayload.error === "string" ? signPayload.error : "Upload service unavailable. Please try again.";
    throw new Error(error);
  }

  const uploaded = await uploadToCloudinary(signPayload.ticket as unknown as UploadTicket, file, onProgress);
  const confirmResponse = await fetch("/api/uploads/confirm", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ mediaAssetId: signPayload.mediaAssetId, publicId: uploaded.publicId }),
  });
  if (!confirmResponse.ok) throw new Error("The file uploaded but could not be verified. Please retry it.");

  const kind = file.type.startsWith("image/") ? "IMAGE" : file.type.startsWith("video/") ? "VIDEO" : "FILE";
  return { id: signPayload.mediaAssetId, url: uploaded.url, mimeType: file.type, bytes: uploaded.bytes, kind };
}
