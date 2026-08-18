import { MessagesSquare } from "lucide-react";

/** Desktop-only "pick a conversation" placeholder for the right pane when no thread is open. */
export function EmptyThreadState() {
  return (
    <div className="hidden h-full flex-1 flex-col items-center justify-center gap-2 text-center text-sm text-muted-foreground lg:flex">
      <MessagesSquare className="size-10 text-muted-foreground/50" aria-hidden />
      <p>Select a conversation to start messaging.</p>
    </div>
  );
}
