import { Bell, ChevronDown } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

/**
 * Right side of the desktop navbar: notification bell with a count badge,
 * then a role chip (initials + role name + chevron) — docs/screens/
 * desktop-02.md #28 (forum navbar: bell badge "2", role chip "TR" /
 * "Trainee").
 *
 * TODO(wave-3): wire to session. There is no auth in wave 1, so these are
 * static placeholders rendered as plain (non-interactive) elements rather
 * than buttons, since neither does anything yet.
 */
export function NavbarActions() {
  return (
    <div className="hidden items-center gap-3 md:flex">
      <div className="relative flex size-9 shrink-0 items-center justify-center rounded-full text-foreground/80">
        <Bell className="size-4" aria-hidden />
        <Badge className="absolute -top-1 -right-1 h-4 min-w-4 justify-center rounded-full px-1 text-[0.65rem]">
          2
        </Badge>
      </div>

      <div className="flex items-center gap-2 rounded-full border border-glass-border bg-glass py-1 pr-2.5 pl-1">
        <Avatar size="sm">
          <AvatarFallback className="bg-primary/15 text-xs font-semibold text-neon">
            TR
          </AvatarFallback>
        </Avatar>
        <span className="font-sub text-sm font-medium text-foreground">Trainee</span>
        <ChevronDown className="size-3.5 text-muted-foreground" aria-hidden />
      </div>
    </div>
  );
}
