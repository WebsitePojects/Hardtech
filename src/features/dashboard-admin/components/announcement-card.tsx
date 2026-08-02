"use client";

import { Pin, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { AnnouncementType } from "@/../generated/prisma/enums";
import { usePendingAction } from "../use-pending-action";
import { deleteAnnouncement } from "../mutations/announcement-mutations";

export type AnnouncementItem = {
  id: string;
  title: string;
  body: string;
  type: AnnouncementType;
  isPinned: boolean;
  postedDateLabel: string;
};

const TYPE_BADGE_LABEL: Record<AnnouncementType, string> = {
  UPDATE: "Update",
  NOTICE: "Notice",
  INFO: "Info",
};

const TYPE_BORDER_CLASS: Record<AnnouncementType, string> = {
  UPDATE: "border-l-primary",
  NOTICE: "border-l-brand-orange",
  INFO: "border-l-brand-blue",
};

/** One posted announcement (desktop-02.md #10, mobile-05.md #17). */
export function AnnouncementCard({ item }: { item: AnnouncementItem }) {
  const removeAction = usePendingAction();

  async function handleDelete() {
    if (removeAction.isPending) return;
    await removeAction.run(async () => {
      try {
        await deleteAnnouncement({ announcementId: item.id });
      } catch {
        toast.error("Deleting an announcement isn't wired up yet in this build.");
      }
    });
  }

  return (
    <Card className={cn("gap-2 border-l-4 p-4", TYPE_BORDER_CLASS[item.type])}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          {item.isPinned ? <Pin className="size-4 text-primary" aria-hidden /> : null}
          <p className="font-semibold text-foreground">{item.title}</p>
          <Badge variant="outline">{TYPE_BADGE_LABEL[item.type]}</Badge>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={`Delete ${item.title}`}
          disabled={removeAction.isPending}
          onClick={handleDelete}
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          {removeAction.isPending ? "Deleting…" : <Trash2 className="size-4" aria-hidden />}
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">{item.body}</p>
      <p className="text-xs text-muted-foreground">Posted {item.postedDateLabel}</p>
    </Card>
  );
}
