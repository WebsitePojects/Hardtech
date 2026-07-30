import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { SessionType } from "@/../generated/prisma/enums";

/**
 * desktop-02.md #14/#22, mobile-06.md 14:32:12: session-type badge, four
 * fixed tones — Hands-on (green), Workshop (blue), Assessment (amber),
 * Lecture (neutral grey). Shared by the trainee dashboard's Upcoming
 * Sessions widget and the Session Schedule page's selected-day list, so the
 * tone mapping can't drift between them.
 */
const SESSION_TYPE_LABEL: Record<SessionType, string> = {
  LECTURE: "Lecture",
  HANDS_ON: "Hands-on",
  WORKSHOP: "Workshop",
  ASSESSMENT: "Assessment",
};

const SESSION_TYPE_CLASS: Record<SessionType, string> = {
  LECTURE: "border-border text-muted-foreground",
  HANDS_ON: "border-primary/40 bg-primary/10 text-primary",
  WORKSHOP: "border-brand-blue/40 bg-brand-blue/10 text-brand-blue",
  ASSESSMENT: "border-brand-orange/40 bg-brand-orange/10 text-brand-orange",
};

export function SessionTypeBadge({
  sessionType,
  className,
}: {
  sessionType: SessionType;
  className?: string;
}) {
  return (
    <Badge variant="outline" className={cn("shrink-0", SESSION_TYPE_CLASS[sessionType], className)}>
      {SESSION_TYPE_LABEL[sessionType]}
    </Badge>
  );
}
