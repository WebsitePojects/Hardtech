"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { Film, ImageIcon, Megaphone, Pin, UploadCloud } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { AnnouncementType, MediaType } from "@/../generated/prisma/enums";
import { usePendingAction } from "../use-pending-action";
import { postAnnouncement } from "../mutations/announcement-mutations";

const TYPE_OPTIONS: { value: AnnouncementType; label: string }[] = [
  { value: "UPDATE", label: "Update" },
  { value: "NOTICE", label: "Notice" },
  { value: "INFO", label: "Info" },
];

function mediaTypeFor(file: File): MediaType | null {
  if (file.type.startsWith("image/")) return "IMAGE";
  if (file.type.startsWith("video/")) return "VIDEO";
  return null;
}

/**
 * "New Announcement" create form (desktop-02.md #10, mobile-05.md #16).
 * A real, fully-wired mutating control: idempotency key minted once per
 * user intent when the form mounts (non-negotiables rule 1, same pattern
 * as src/features/enroll/enroll-wizard.tsx's `idempotencyKey`), disabled
 * while empty (matching the screenshot's own greyed-out "Post Announcement"
 * on a blank form) and disabled/pending/early-return while a submit is in
 * flight, then calls the wave-4 stub in
 * ../mutations/announcement-mutations.ts, which always throws.
 */
export function AnnouncementForm() {
  const [idempotencyKey] = useState(() => crypto.randomUUID());
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [type, setType] = useState<AnnouncementType>("INFO");
  const [isPinned, setIsPinned] = useState(false);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const submit = usePendingAction();

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    setMediaFile(event.target.files?.[0] ?? null);
  }

  const canSubmit = title.trim().length > 0 && body.trim().length > 0 && !submit.isPending;

  async function handleSubmit() {
    if (!canSubmit || submit.isPending) return;

    await submit.run(async () => {
      const mediaType = mediaFile ? mediaTypeFor(mediaFile) : null;
      try {
        await postAnnouncement({
          idempotencyKey,
          title: title.trim(),
          body: body.trim(),
          type,
          isPinned,
          media: mediaFile && mediaType ? { file: mediaFile, type: mediaType } : null,
        });
      } catch {
        toast.error("Posting an announcement isn't wired up yet in this build.");
      }
    });
  }

  return (
    <Card className="border-primary/30">
      <CardHeader>
        <CardTitle>New Announcement</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            Title
          </Label>
          <Input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="e.g. New batch opening June 2026"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            Body
          </Label>
          <Textarea
            value={body}
            onChange={(event) => setBody(event.target.value)}
            placeholder="Announcement details visible to site visitors..."
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            Media — optional image or video
          </Label>
          <label className="flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border border-dashed border-glass-border p-6 text-center hover:border-primary/40">
            <div className="flex items-center gap-2 text-muted-foreground">
              <ImageIcon className="size-5" aria-hidden />
              <UploadCloud className="size-5" aria-hidden />
              <Film className="size-5" aria-hidden />
            </div>
            <span className="text-sm font-semibold text-foreground">
              {mediaFile ? mediaFile.name : "Click to attach image or video"}
            </span>
            <span className="text-xs text-muted-foreground">PNG, JPG, MP4, MOV · max 20 MB</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,video/mp4,video/quicktime"
              className="sr-only"
              onChange={handleFileChange}
            />
          </label>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
              Type
            </Label>
            <div className="flex gap-2">
              {TYPE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={type === option.value}
                  onClick={() => setType(option.value)}
                  className={cn(
                    "rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
                    type === option.value
                      ? "border-brand-blue/50 bg-brand-blue/10 text-brand-blue"
                      : "border-glass-border text-muted-foreground hover:text-foreground",
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-foreground">
            <Checkbox checked={isPinned} onCheckedChange={(checked) => setIsPinned(checked === true)} />
            <Pin className="size-3.5" aria-hidden />
            Pin to top
          </label>
        </div>

        <Button type="button" className="w-full" disabled={!canSubmit} onClick={handleSubmit}>
          <Megaphone className="size-4" aria-hidden />
          {submit.isPending ? "Posting…" : "Post Announcement"}
        </Button>
      </CardContent>
    </Card>
  );
}
