"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { usePendingAction } from "../use-pending-action";
import { approveForumPost, rejectForumPost } from "../mutations/forum-mutations";

export type ForumModerationItem = {
  id: string;
  title: string;
  body: string;
  authorName: string;
  category: string;
  createdDateLabel: string;
};

export function ForumModerationCard({ item }: { item: ForumModerationItem }) {
  const approve = usePendingAction();
  const reject = usePendingAction();
  const [status, setStatus] = useState<"pending" | "approved" | "rejected">("pending");
  const pending = approve.isPending || reject.isPending;

  async function handleApprove() {
    await approve.run(async () => {
      try {
        await approveForumPost({ postId: item.id });
        setStatus("approved");
        toast.success("Forum post approved.");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "We could not approve that post.");
      }
    });
  }

  async function handleReject() {
    await reject.run(async () => {
      try {
        await rejectForumPost({ postId: item.id });
        setStatus("rejected");
        toast.success("Forum post rejected.");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "We could not reject that post.");
      }
    });
  }

  return (
    <Card className="gap-3 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <p className="font-semibold text-foreground">{item.title}</p>
            <Badge variant="outline">{status}</Badge>
          </div>
          <p className="line-clamp-2 text-sm text-muted-foreground">{item.body}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            {item.authorName} · {item.category} · {item.createdDateLabel}
          </p>
        </div>
        {status === "pending" ? (
          <div className="flex shrink-0 gap-2">
            <Button type="button" size="sm" disabled={pending} onClick={() => void handleApprove()}>
              <Check className="size-3.5" aria-hidden /> {approve.isPending ? "Approving…" : "Approve"}
            </Button>
            <Button type="button" variant="destructive" size="sm" disabled={pending} onClick={() => void handleReject()}>
              <X className="size-3.5" aria-hidden /> {reject.isPending ? "Rejecting…" : "Reject"}
            </Button>
          </div>
        ) : null}
      </div>
    </Card>
  );
}
