"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useGuardedMutation } from "@/features/forum/use-guarded-mutation";
import { requestCommunityInputSchema } from "./communities.schema";
import { requestCommunity } from "./mutations/request-community";

/**
 * "+ Request community" dialog (desktop-02.md #28). Guards: Submit disabled
 * until the schema passes and again while pending; handler early-return via
 * useGuardedMutation. `idempotencyKey` is minted once per dialog mount (one
 * compose intent), not per submit attempt.
 */
export function RequestCommunityDialog() {
  const [open, setOpen] = useState(false);
  const [idempotencyKey] = useState(() => crypto.randomUUID());
  const [name, setName] = useState("");
  const [region, setRegion] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { isPending, run } = useGuardedMutation(
    requestCommunity,
    "Requesting a community isn't wired up yet.",
  );

  async function handleSubmit() {
    if (isPending) return;
    const parsed = requestCommunityInputSchema.safeParse({
      idempotencyKey,
      name,
      region,
      description,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check the details and try again.");
      return;
    }
    setError(null);
    await run(parsed.data);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline">
          <Plus className="size-4" aria-hidden /> Request community
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request a community</DialogTitle>
          <DialogDescription>
            An admin reviews new community requests before they go live.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="request-community-name">Community name</Label>
            <Input
              id="request-community-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Bulacan Repair Network"
              disabled={isPending}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="request-community-region">Region or city</Label>
            <Input
              id="request-community-region"
              value={region}
              onChange={(event) => setRegion(event.target.value)}
              placeholder="e.g. Bulacan"
              disabled={isPending}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="request-community-description">Description</Label>
            <Textarea
              id="request-community-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="What is this community for?"
              disabled={isPending}
            />
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button type="button" disabled={isPending} onClick={() => void handleSubmit()}>
            {isPending ? "Submitting…" : "Submit Request"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
