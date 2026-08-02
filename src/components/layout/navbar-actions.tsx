import { Bell, ChevronDown } from "lucide-react";
import Link from "next/link";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type NavbarUser = {
  initials: string;
  roleLabel: string;
};

/** Session-aware right side of the desktop navbar. */
export function NavbarActions({ user }: { user: NavbarUser | null }) {
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
