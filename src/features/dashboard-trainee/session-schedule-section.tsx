"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { SessionTypeBadge } from "./session-type-badge";
import type { TraineeSessionView } from "./types";

const WEEKDAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

/**
 * "Now" in Philippine Standard Time (UTC+8, no DST) via `Intl`/`Date`
 * string round-trip — pure client-side computation, no I/O, so this is fine
 * inside a "use client" leaf per .claude/rules/10-architecture.md.
 */
function phToday(): Date {
  const now = new Date();
  return new Date(now.toLocaleString("en-US", { timeZone: "Asia/Manila" }));
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function buildCalendarDays(monthDate: Date): Date[] {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const startOffset = firstOfMonth.getDay();
  const gridStart = new Date(year, month, 1 - startOffset);
  return Array.from(
    { length: 42 },
    (_, i) => new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + i)
  );
}

export type SessionScheduleSectionProps = {
  /**
   * `TraineeOverview.upcomingSessions` — the only session read
   * `dashboard.service.ts` exposes. It is scoped to sessions on/after "now"
   * for the trainee's active batch, not a full historical/future range, so
   * navigating to a past month or a month beyond what's "upcoming" will
   * legitimately show no sessions rather than fabricated ones. Documented
   * as a known, accepted limitation (.claude/rules/20-design-fidelity.md
   * "Verification") rather than worked around with an unowned repository
   * import.
   */
  sessions: TraineeSessionView[];
};

/**
 * desktop-02.md #23, mobile-06.md 14:32:17/14:32:22: a read-only month
 * calendar (no "+" add affordance — that's the trainer's Training Calendar
 * only) plus a "Selected Day" panel. "No sessions scheduled." is the
 * verbatim empty-state copy for a day with none.
 */
export function SessionScheduleSection({ sessions }: SessionScheduleSectionProps) {
  const today = useMemo(() => phToday(), []);
  const [visibleMonth, setVisibleMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDay, setSelectedDay] = useState(today);

  const days = useMemo(() => buildCalendarDays(visibleMonth), [visibleMonth]);
  const sessionsOnDay = (day: Date) =>
    sessions.filter((session) => isSameDay(new Date(`${session.sessionDate}T00:00:00`), day));
  const selectedSessions = sessionsOnDay(selectedDay);

  function goToToday() {
    setVisibleMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDay(today);
  }

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title="Session Schedule"
        description="Philippine Standard Time · Live from your trainer"
      />

      <Card>
        <CardContent className="space-y-4 overflow-hidden">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center justify-between gap-2 sm:justify-start">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Previous month"
                onClick={() => setVisibleMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))}
                className="min-h-11 min-w-11"
              >
                <ChevronLeft className="size-4" />
              </Button>
              <p className="min-w-0 flex-1 text-center font-heading text-sm font-semibold text-foreground sm:w-36 sm:flex-none">
                {visibleMonth.toLocaleString("en-US", { month: "long", year: "numeric" })}
              </p>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Next month"
                onClick={() => setVisibleMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}
                className="min-h-11 min-w-11"
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={goToToday} className="min-h-11 w-full sm:w-auto">
              Today (PH)
            </Button>
          </div>

          <div className="overflow-x-auto pb-1">
            <div className="min-w-[20rem]">
              <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
                {WEEKDAY_LABELS.map((label) => (
                  <div key={label}>{label}</div>
                ))}
              </div>
              <div className="mt-1 grid grid-cols-7 gap-1">
                {days.map((day) => {
                  const inMonth = day.getMonth() === visibleMonth.getMonth();
                  const isToday = isSameDay(day, today);
                  const isSelected = isSameDay(day, selectedDay);
                  const hasSessions = sessionsOnDay(day).length > 0;

                  return (
                    <button
                      key={day.toISOString()}
                      type="button"
                      onClick={() => setSelectedDay(day)}
                      aria-pressed={isSelected}
                      className={cn(
                        "relative flex min-h-11 items-center justify-center rounded-lg text-sm transition-colors",
                        inMonth ? "text-foreground" : "text-muted-foreground/40",
                        isSelected
                          ? "bg-primary font-semibold text-primary-foreground"
                          : isToday
                            ? "bg-primary/15 font-semibold text-primary"
                            : "hover:bg-glass-hover"
                      )}
                    >
                      {day.getDate()}
                      {hasSessions && !isSelected ? (
                        <span className="absolute bottom-1 size-1 rounded-full bg-primary" aria-hidden />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3">
          <p className="font-sub text-xs font-semibold tracking-widest text-primary uppercase">Selected Day</p>
          <p className="font-heading text-lg font-semibold text-foreground">
            {selectedDay.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
          </p>
          <p className="text-sm text-muted-foreground">
            {selectedSessions.length} session{selectedSessions.length === 1 ? "" : "s"}
          </p>

          {selectedSessions.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">No sessions scheduled.</p>
          ) : (
            <div className="space-y-2">
              {selectedSessions.map((session) => (
                <div
                  key={session.id}
                  className="flex flex-col gap-3 rounded-lg border border-glass-border p-3 sm:flex-row sm:items-center sm:gap-4"
                >
                  <p className="shrink-0 font-heading text-sm font-semibold text-primary sm:w-20 sm:text-right">
                    {session.startTime}
                  </p>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium break-words text-foreground sm:truncate">{session.title}</p>
                    {session.location ? (
                      <p className="text-xs text-muted-foreground">{session.location}</p>
                    ) : null}
                  </div>
                  <SessionTypeBadge sessionType={session.sessionType} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
