import { Bell, ChevronDown, MessageCircle } from "lucide-react";
import Link from "next/link";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import { UnreadBadge } from "@/features/messaging/unread-badge";
import { cn } from "@/lib/utils";

export type NavbarUser = {
  initials: string;
  roleLabel: string;
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
  unreadMessageCount = 0,
}: {
  user: NavbarUser | null;
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

      <div className="flex items-center gap-2 rounded-full border border-glass-border bg-glass py-1 pr-2.5 pl-1">
        <Avatar size="sm">
          <AvatarFallback className="bg-primary/15 text-xs font-semibold text-neon">
            {user.initials}
          </AvatarFallback>
        </Avatar>
        <span className="font-sub text-sm font-medium text-foreground">{user.roleLabel}</span>
        <ChevronDown className="size-3.5 text-muted-foreground" aria-hidden />
      </div>
    </div>
  );
}
