import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SessionTypeBadge } from "./session-type-badge";
import type { UpcomingSessionItem } from "@/server/services/dashboard.service";

function formatSessionDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * desktop-02.md #22 "Upcoming Sessions" card: time (bold green) + date on
 * the left, title + location in the middle, session-type Badge on the
 * right. Same row shape reused by the trainer overview (out of scope here)
 * and by Session Schedule's selected-day list — kept in one component so
 * they can't drift.
 *
 * The empty-state copy reuses Session Schedule's verbatim "No sessions
 * scheduled." (desktop-02.md #23) rather than inventing new copy for a
 * state this specific widget's own screenshots never show empty.
 */
export function UpcomingSessionsCard({
  sessions,
  className,
}: {
  sessions: UpcomingSessionItem[];
  className?: string;
}) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Upcoming Sessions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {sessions.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">No sessions scheduled.</p>
        ) : (
          sessions.map((session) => (
            <div
              key={session.id}
              className="flex items-center gap-4 rounded-lg border border-glass-border p-3"
            >
              <div className="w-20 shrink-0 text-right">
                <p className="font-heading text-sm font-semibold text-primary">{session.startTime}</p>
                <p className="text-xs text-muted-foreground">{formatSessionDate(session.sessionDate)}</p>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{session.title}</p>
                {session.location ? (
                  <p className="text-xs text-muted-foreground">{session.location}</p>
                ) : null}
              </div>
              <SessionTypeBadge sessionType={session.sessionType} />
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
