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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { categoryLabel } from "./category-meta";
import { createPostSchema } from "./forum.schema";
import { FORUM_CATEGORIES } from "./types";
import { createPost } from "./mutations/create-post";
import { useGuardedMutation } from "./use-guarded-mutation";
import type { ForumCategory } from "@/../generated/prisma/enums";

/**
 * "+ New Post" compose dialog (desktop-02.md #30 top-right button). Trainee
 * posts require approval (desktop-01.md guideline 5) — the copy below sets
 * that expectation up front rather than implying an instant publish.
 *
 * Guards: Publish button disabled until the schema passes and again while
 * pending; handler early-return via useGuardedMutation.
 * `idempotencyKey` is minted once per dialog mount (one compose intent),
 * not per submit attempt, so a retry after a dropped response would replay.
 */
export function NewPostDialog() {
  const [open, setOpen] = useState(false);
  const [idempotencyKey] = useState(() => crypto.randomUUID());
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState<ForumCategory | "">("");
  const [hashtagsInput, setHashtagsInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { isPending, run } = useGuardedMutation(createPost, "Posting isn't wired up yet.");

  async function handlePublish() {
    if (isPending) return;

    const hashtags = hashtagsInput
      .split(",")
      .map((tag) => tag.trim().replace(/^#/, ""))
      .filter(Boolean);

    const parsed = createPostSchema.safeParse({
      idempotencyKey,
      title,
      body,
      category: category || undefined,
      hashtags,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check the post details and try again.");
      return;
    }
    setError(null);
    await run(parsed.data);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button">
          <Plus className="size-4" aria-hidden /> New Post
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New Post</DialogTitle>
          <DialogDescription>
            Trainee posts require admin approval before they appear on the forum.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="new-post-title">Title</Label>
            <Input
              id="new-post-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Give your post a clear title"
              disabled={isPending}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="new-post-category">Category</Label>
            <Select value={category} onValueChange={(value) => setCategory(value as ForumCategory)}>
              <SelectTrigger id="new-post-category" className="w-full" disabled={isPending}>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {FORUM_CATEGORIES.map((value) => (
                  <SelectItem key={value} value={value}>
                    {categoryLabel(value)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="new-post-body">Body</Label>
            <Textarea
              id="new-post-body"
              value={body}
              onChange={(event) => setBody(event.target.value)}
              placeholder="Share the details..."
              className="min-h-32"
              disabled={isPending}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="new-post-hashtags">Hashtags (comma-separated, optional)</Label>
            <Input
              id="new-post-hashtags"
              value={hashtagsInput}
              onChange={(event) => setHashtagsInput(event.target.value)}
              placeholder="e.g. micro-soldering, tools"
              disabled={isPending}
            />
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button type="button" disabled={isPending} onClick={() => void handlePublish()}>
            {isPending ? "Publishing…" : "Publish Post"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
