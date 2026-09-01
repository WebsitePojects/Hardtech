"use client";

import { Hash, Tag } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { NewPostDialog } from "./new-post-dialog";

/**
 * The feed's composer row — avatar, a prompt field, and a Publish button,
 * plus a second row hinting at category/hashtags — each row opening its own
 * `NewPostDialog` instance from either of its two triggers (see the
 * docstring on `trigger` in new-post-dialog.tsx). Both instances render the
 * identical compose form/validation/guarded submit; nothing about the form
 * itself is duplicated here, only how it's opened. `id="composer"` is the
 * anchor the welcome banner's CTA scrolls to.
 *
 * The reference image's composer also shows an image/video/poll attachment
 * row. That's deliberately not reproduced: `createPostSchema`
 * (forum.schema.ts) has no attachment fields and there is no upload
 * pipeline wired to forum posts, so rendering camera/video/poll icons here
 * would be exactly the "decorative icon that carries no meaning" pattern
 * the brief calls out — they'd look clickable and do nothing real. What the
 * compose dialog actually accepts beyond title/body is a category and
 * hashtags, so those are what the row hints at instead, each one a real
 * trigger for the same dialog rather than a prop for a capability that
 * doesn't exist.
 *
 * `firstName`/`initials` are plain strings computed server-side in
 * page.tsx from `getDashboardUser` — no function crosses the
 * Server→Client boundary here, only the two strings this needs.
 */
export function PostComposer({ firstName, initials }: { firstName: string; initials: string }) {
  const promptTrigger = (
    <button
      type="button"
      className="h-11 flex-1 rounded-full border border-glass-border bg-glass px-4 text-left text-sm text-muted-foreground transition-colors hover:bg-glass-hover sm:h-10"
    >
      What&apos;s on your mind, {firstName}?
    </button>
  );
  const publishTrigger = (
    <Button type="button" size="sm" className="shrink-0">
      Publish
    </Button>
  );
  const categoryTrigger = (
    <button
      type="button"
      className="flex h-11 items-center gap-1.5 rounded-lg px-2 text-xs text-muted-foreground transition-colors hover:bg-glass-hover hover:text-foreground sm:h-8"
    >
      <Tag className="size-4" aria-hidden /> Category
    </button>
  );
  const hashtagTrigger = (
    <button
      type="button"
      className="flex h-11 items-center gap-1.5 rounded-lg px-2 text-xs text-muted-foreground transition-colors hover:bg-glass-hover hover:text-foreground sm:h-8"
    >
      <Hash className="size-4" aria-hidden /> Hashtags
    </button>
  );

  return (
    <div id="composer" className="scroll-mt-24 rounded-2xl border border-glass-border bg-surface-card p-3.5">
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarFallback className="bg-primary/15 font-semibold text-primary">{initials}</AvatarFallback>
        </Avatar>
        <NewPostDialog trigger={[promptTrigger, publishTrigger]} />
      </div>

      <div className="mt-3 flex items-center gap-2 border-t border-glass-border pt-3">
        <NewPostDialog trigger={[categoryTrigger, hashtagTrigger]} />
      </div>
    </div>
  );
}
