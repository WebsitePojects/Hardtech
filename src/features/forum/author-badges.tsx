import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/../generated/prisma/enums";

/**
 * Role badge next to a forum author's name (desktop-01.md #11-13,
 * desktop-02.md #28-31): ADMIN is amber, TRAINER is blue, TRAINEE is green.
 */
export function RoleBadge({ role }: { role: UserRole }) {
  const style: Record<UserRole, string> = {
    ADMIN: "border-brand-orange/40 bg-brand-orange/10 text-brand-orange",
    TRAINER: "border-brand-blue/40 bg-brand-blue/10 text-brand-blue",
    TRAINEE: "border-primary/40 bg-primary/10 text-primary",
  };

  return (
    <Badge variant="outline" className={cn("uppercase", style[role])}>
      {role}
    </Badge>
  );
}

/**
 * Reputation pill next to the role badge — ACTIVE (green) / NEWCOMER (gray).
 * See ForumReputationBadge in ./types for provenance.
 */
