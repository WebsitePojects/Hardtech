import { Bell, ChevronDown, MessageCircle } from "lucide-react";
import Link from "next/link";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import { UnreadBadge } from "@/features/messaging/unread-badge";
import { cn } from "@/lib/utils";

export type NavbarUser = {
  initials: string;
  roleLabel: string;
  dashboardHref: string;
};

/**
 * Session-aware right side of the desktop navbar.
 *
 * `unreadMessageCount` is optional and undefined/0 by default deliberately —
 * there is no real unread-count read wired up yet
 * (src/server/services/messaging.service.ts doesn't exist for this wave), so
 * this component never fabricates a live number. The type is ready for
 * whoever wires `getUnreadTotal` at the page/layout level: pass the real
 * count in and the badge appears; leave it out and the icon renders with no
 * badge, exactly like today.
 */
export function NavbarActions({
  user,
  logoutAction,
  unreadMessageCount = 0,
}: {
  user: NavbarUser | null;
  logoutAction: () => Promise<void>;
  unreadMessageCount?: number;
}) {
  if (!user) {
    return (
      <div className="hidden items-center gap-2 md:flex">
        <Link
          href="/login"
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "border-glass-border bg-transparent hover:bg-glass-hover",
          )}
        >
          Login
        </Link>
        <Link href="/enroll" className={buttonVariants({ size: "sm" })}>
          Enroll Now
        </Link>
      </div>
    );
  }

  return (
    <div className="hidden items-center gap-3 md:flex">
      <div
        className="relative flex size-9 shrink-0 items-center justify-center rounded-full text-foreground/80"
        aria-label="Notifications"
      >
        <Bell className="size-4" aria-hidden />
        {/* TODO(orchestrator): connect the unread notification service read before showing a badge. */}
      </div>

      <Link
        href="/messages"
        className="relative flex size-9 shrink-0 items-center justify-center rounded-full text-foreground/80 hover:text-foreground"
        aria-label={unreadMessageCount > 0 ? `Messages, ${unreadMessageCount} unread` : "Messages"}
      >
        <MessageCircle className="size-4" aria-hidden />
        <UnreadBadge count={unreadMessageCount} className="absolute -top-0.5 -right-0.5" />
      </Link>

      <details className="group relative">
        <summary className="flex cursor-pointer list-none items-center gap-2 rounded-full border border-glass-border bg-glass py-1 pr-2.5 pl-1 transition-colors hover:border-primary/45 [&::-webkit-details-marker]:hidden">
          <Avatar size="sm">
            <AvatarFallback className="bg-primary/15 text-xs font-semibold text-neon">
              {user.initials}
            </AvatarFallback>
          </Avatar>
          <span className="font-sub text-sm font-medium text-foreground">{user.roleLabel}</span>
          <ChevronDown className="size-3.5 text-muted-foreground transition-transform group-open:rotate-180" aria-hidden />
        </summary>
        <div className="absolute top-[calc(100%+0.55rem)] right-0 z-[999999] min-w-44 rounded-xl border border-glass-border bg-surface-secondary p-1.5 shadow-xl">
          <Link href={user.dashboardHref} className="block rounded-lg px-3 py-2 text-sm text-foreground hover:bg-glass-hover">
            Back to dashboard
          </Link>
          <form action={logoutAction}>
            <button type="submit" className="w-full rounded-lg px-3 py-2 text-left text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
              Log out
            </button>
          </form>
        </div>
      </details>
    </div>
  );
}
