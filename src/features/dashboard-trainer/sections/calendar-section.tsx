"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Plus, X } from "lucide-react";

import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { SessionTypeBadge } from "../session-type-badge";
import type { SessionType } from "@/../generated/prisma/enums";
import type { TrainerBatchOption } from "@/server/services/dashboard.service";
import { createTrainingSessionAction } from "@/app/(dashboard)/dashboard/trainer/actions";

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export type TrainerCalendarSessionView = {
  id: string;
  title: string;
  sessionType: SessionType;
  sessionDate: string;
  startTime: string;
  location: string | null;
};

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
  const gridStart = new Date(year, month, 1 - firstOfMonth.getDay());
  return Array.from(
    { length: 42 },
    (_, i) => new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + i),
  );
}

function dateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function CalendarSection({ sessions, batches }: { sessions: TrainerCalendarSessionView[]; batches: TrainerBatchOption[] }) {
  const router = useRouter();
  const today = useMemo(() => phToday(), []);
  const [visibleMonth, setVisibleMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDay, setSelectedDay] = useState(today);
  const [draftDate, setDraftDate] = useState<string | null>(null);
  const intentKeyRef = useRef<string | null>(null);
  const pendingRef = useRef(false);
  const [title, setTitle] = useState("");
  const [startTime, setStartTime] = useState("08:00");
  const [sessionType, setSessionType] = useState<SessionType>("LECTURE");
  const [location, setLocation] = useState("");
  const [batchId, setBatchId] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);

  const days = useMemo(() => buildCalendarDays(visibleMonth), [visibleMonth]);
  const selectedKey = dateKey(selectedDay);
  const sessionsThisMonth = sessions.filter((session) => {
    const date = new Date(`${session.sessionDate}T00:00:00`);
    return date.getFullYear() === visibleMonth.getFullYear() && date.getMonth() === visibleMonth.getMonth();
  });
  const selectedSessions = sessions.filter((session) => session.sessionDate === selectedKey);

  function goToToday() {
    setVisibleMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDay(today);
  }

  function openDraft(date: string) {
    if (pendingRef.current) return;
    setDraftDate(date);
    setTitle("");
    setStartTime("08:00");
    setSessionType("LECTURE");
    setLocation("");
    setBatchId((current) => current || batches[0]?.id || "");
    setPublishError(null);
    intentKeyRef.current = crypto.randomUUID();
  }

  async function publishSession() {
    if (pendingRef.current || !draftDate || !intentKeyRef.current) return;
    if (!batchId) {
      setPublishError("Choose one of your batches before publishing.");
      return;
    }
    pendingRef.current = true;
    setIsPublishing(true);
    setPublishError(null);
    try {
      const result = await createTrainingSessionAction({
        idempotencyKey: intentKeyRef.current,
        batchId,
        title,
        sessionType,
        sessionDate: draftDate,
        startTime,
        location,
      });
      if (!result.ok) throw new Error(result.error);
      toast.success("Session published.");
      setDraftDate(null);
      router.refresh();
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Unable to publish session.";
      setPublishError(message);
      toast.error(message);
    } finally {
      pendingRef.current = false;
      setIsPublishing(false);
    }
  }

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title="Training Calendar"
        description="Philippine Standard Time · Hover a date and click + to schedule a session. Trainees see it instantly."
      />

      <Card>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Previous month"
                onClick={() => setVisibleMonth((month) => new Date(month.getFullYear(), month.getMonth() - 1, 1))}
              >
                <ChevronLeft className="size-4" />
              </Button>
              <p className="w-36 text-center font-heading text-sm font-semibold text-foreground">
                {visibleMonth.toLocaleString("en-US", { month: "long", year: "numeric" })}
              </p>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Next month"
                onClick={() => setVisibleMonth((month) => new Date(month.getFullYear(), month.getMonth() + 1, 1))}
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={goToToday}>
              Today (PH)
            </Button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
            {WEEKDAY_LABELS.map((label) => (
              <div key={label}>{label}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {days.map((day) => {
              const key = dateKey(day);
              const inMonth = day.getMonth() === visibleMonth.getMonth();
              const isToday = isSameDay(day, today);
              const isSelected = isSameDay(day, selectedDay);
              const hasSessions = sessions.some((session) => session.sessionDate === key);

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setSelectedDay(day);
                    openDraft(key);
                  }}
                  aria-pressed={isSelected}
                  className={cn(
                    "group relative flex aspect-square items-center justify-center rounded-lg text-sm transition-colors",
                    inMonth ? "text-foreground" : "text-muted-foreground/40",
                    isSelected
                      ? "bg-primary font-semibold text-primary-foreground"
                      : isToday
                        ? "bg-primary/15 font-semibold text-primary"
                        : "hover:bg-glass-hover",
                  )}
                >
                  {day.getDate()}
                  {hasSessions && !isSelected ? (
                    <span className="absolute bottom-1 size-1 rounded-full bg-primary" aria-hidden />
                  ) : null}
                  <Plus className="absolute right-1 bottom-1 size-3 opacity-0 group-hover:opacity-100" aria-hidden />
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {draftDate ? (
        <Card>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="font-heading text-base font-semibold text-foreground">New Session</h3>
                <p className="text-sm font-medium text-primary">{draftDate}</p>
              </div>
              <Button type="button" variant="ghost" size="icon" aria-label="Close" onClick={() => setDraftDate(null)}>
                <X className="size-4" />
              </Button>
            </div>
            <input
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm text-foreground placeholder:text-muted-foreground"
              placeholder="Session title..."
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              disabled={isPublishing}
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="time"
                className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm text-foreground"
                value={startTime}
                onChange={(event) => setStartTime(event.target.value)}
                disabled={isPublishing}
              />
              <select className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm text-foreground" value={sessionType} onChange={(event) => setSessionType(event.target.value as SessionType)} disabled={isPublishing}>
                <option value="LECTURE">Lecture</option>
                <option value="HANDS_ON">Hands-on</option>
                <option value="WORKSHOP">Workshop</option>
                <option value="ASSESSMENT">Assessment</option>
              </select>
            </div>
            <select className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm text-foreground" value={batchId} onChange={(event) => setBatchId(event.target.value)} disabled={isPublishing}>
              <option value="">Choose batch</option>
              {batches.map((batch) => <option key={batch.id} value={batch.id}>{batch.programName} · Batch {batch.label}</option>)}
            </select>
            <input
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm text-foreground"
              placeholder="Location (optional)"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              disabled={isPublishing}
            />
            <p className="text-sm text-muted-foreground">Times and dates are Philippine Standard Time. Published sessions are visible to active trainees in the selected batch.</p>
            {publishError ? <p className="text-sm text-destructive">{publishError}</p> : null}
            <Button type="button" className="w-full" disabled={isPublishing || !title.trim() || !batchId} onClick={() => void publishSession()}>
              {isPublishing ? "Publishing..." : "Publish Session"}
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardContent className="space-y-3">
          <h3 className="font-heading text-base font-semibold text-foreground">Sessions This Month</h3>
          {sessionsThisMonth.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">No sessions scheduled this month.</p>
          ) : (
            sessionsThisMonth.map((session) => (
              <div key={session.id} className="flex items-center gap-4 rounded-lg border border-glass-border p-3">
                <div className="w-20 shrink-0 text-right">
                  <p className="font-heading text-sm font-semibold text-primary">{session.startTime}</p>
                  <p className="text-xs text-muted-foreground">{session.sessionDate}</p>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{session.title}</p>
                  {session.location ? <p className="text-xs text-muted-foreground">{session.location}</p> : null}
                </div>
                <SessionTypeBadge sessionType={session.sessionType} />
              </div>
            ))
          )}
          {selectedSessions.length > 0 ? (
            <p className="text-xs text-muted-foreground">{selectedSessions.length} selected-day session sourced.</p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
