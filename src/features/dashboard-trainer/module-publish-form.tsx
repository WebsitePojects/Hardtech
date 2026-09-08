"use client";

import { useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import type { ModuleFileType } from "@/../generated/prisma/enums";
import type { TrainerBatchOption } from "@/server/services/dashboard.service";
import { publishModuleAction } from "@/app/(dashboard)/dashboard/trainer/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { uploadModuleFile } from "./upload-module";

const ACCEPT_BY_FILE_TYPE: Record<ModuleFileType, string> = {
  PDF: "application/pdf",
  MP4: "video/mp4",
  DOCX: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

export function ModulePublishForm({ batches }: { batches: TrainerBatchOption[] }) {
  const router = useRouter();
  const inputId = useId();
  const pendingRef = useRef(false);
  const intentKeyRef = useRef(crypto.randomUUID());
  const mediaAssetIdRef = useRef<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [fileType, setFileType] = useState<ModuleFileType>("PDF");
  const [unitNumber, setUnitNumber] = useState("1");
  const [batchId, setBatchId] = useState(batches[0]?.id ?? "");
  const [isPending, setIsPending] = useState(false);
  const [hasUploadedFile, setHasUploadedFile] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (pendingRef.current) return;
    setFile(event.target.files?.[0] ?? null);
    mediaAssetIdRef.current = null;
    setHasUploadedFile(false);
    intentKeyRef.current = crypto.randomUUID();
    setProgress(null);
    setStatus(null);
    setError(null);
  }

  async function publish() {
    if (pendingRef.current || !file) return;
    if (!batchId) {
      setError("Choose one of your batches before publishing.");
      return;
    }
    const parsedUnit = Number(unitNumber);
    if (!Number.isInteger(parsedUnit) || parsedUnit < 1) {
      setError("Enter a valid unit number.");
      return;
    }

    pendingRef.current = true;
    setIsPending(true);
    setError(null);
    try {
      if (!mediaAssetIdRef.current) {
        setStatus("Uploading file...");
        setProgress(0);
        const uploaded = await uploadModuleFile({ file, onProgress: setProgress });
        mediaAssetIdRef.current = uploaded.mediaAssetId;
        setHasUploadedFile(true);
        setStatus("Upload complete. Waiting for provider verification before publishing.");
      }
      const result = await publishModuleAction({
        idempotencyKey: intentKeyRef.current,
        batchId,
        mediaAssetId: mediaAssetIdRef.current,
        title,
        fileType,
        unitNumber: parsedUnit,
      });
      if (!result.ok) throw new Error(result.error);
      toast.success("Module published.");
      setStatus("Module published.");
      router.refresh();
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Unable to publish module.";
      setError(message);
      if (mediaAssetIdRef.current && /still being verified/i.test(message)) {
        setStatus("Upload complete. Provider verification is still in progress; retry publishing shortly.");
      }
      toast.error(message);
    } finally {
      pendingRef.current = false;
      setIsPending(false);
    }
  }

  return (
    <div className="space-y-3">
      <Input placeholder="Title..." value={title} onChange={(event) => setTitle(event.target.value)} disabled={isPending} />
      <div className="grid grid-cols-2 gap-3">
        <select className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm text-foreground" value={fileType} onChange={(event) => setFileType(event.target.value as ModuleFileType)} disabled={isPending}>
          <option value="PDF">PDF</option>
          <option value="MP4">MP4</option>
          <option value="DOCX">DOCX</option>
        </select>
        <Input type="number" min="1" value={unitNumber} onChange={(event) => setUnitNumber(event.target.value)} disabled={isPending} aria-label="Unit number" />
      </div>
      <select className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm text-foreground" value={batchId} onChange={(event) => setBatchId(event.target.value)} disabled={isPending}>
        <option value="">Choose batch</option>
        {batches.map((batch) => <option key={batch.id} value={batch.id}>{batch.programName} · Batch {batch.label}</option>)}
      </select>
      <div className="space-y-1.5">
        <Label htmlFor={inputId}>Module file</Label>
        <Input id={inputId} type="file" accept={ACCEPT_BY_FILE_TYPE[fileType]} onChange={handleFileChange} disabled={isPending} />
        {file ? <p className="text-xs text-muted-foreground">{file.name}</p> : null}
        {progress !== null && isPending ? <p className="text-xs text-muted-foreground">Uploading {progress}%</p> : null}
      </div>
      {status ? <p className="text-xs text-muted-foreground">{status}</p> : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button type="button" variant="outline" disabled={isPending || !file || !title.trim() || !batchId} onClick={() => void publish()}>
        {isPending ? "Publishing..." : hasUploadedFile ? "Retry Publish" : "Upload and Publish"}
      </Button>
    </div>
  );
}
