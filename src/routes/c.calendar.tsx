import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Clock, List, Video } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listEvents, type CalendarEvent } from "@/lib/calendar.functions";

export const Route = createFileRoute("/c/calendar")({
  head: () => ({
    meta: [
      { title: "Calendar — AI Video Bootcamp" },
      {
        name: "description",
        content: "Live calls, Q&A sessions and community events for AI Video Bootcamp members.",
      },
      { property: "og:title", content: "AI Video Bootcamp calendar" },
      {
        property: "og:description",
        content: "See every upcoming live Q&A and workshop at a glance.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CalendarPage,
});

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function buildGrid(year: number, month: number) {
  const first = new Date(year, month, 1);
  const offset = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();
  const cells: { day: number; current: boolean }[] = [];
  for (let i = offset - 1; i >= 0; i--) cells.push({ day: prevMonthDays - i, current: false });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, current: true });
  while (cells.length % 7 !== 0) cells.push({ day: cells.length % 7, current: false });
  return cells;
}

function timeLabel(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function CalendarPage() {
  const today = new Date();
  const [cursor, setCursor] = useState({ y: today.getFullYear(), m: today.getMonth() });
  const [view, setView] = useState<"list" | "month">("month");

  const fetchEvents = useServerFn(listEvents);
  const { data } = useQuery({ queryKey: ["events"], queryFn: () => fetchEvents() });
  const events = data?.events ?? [];

  const cells = buildGrid(cursor.y, cursor.m);
  const label = new Date(cursor.y, cursor.m, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  const isThisMonth = cursor.y === today.getFullYear() && cursor.m === today.getMonth();

  const eventsForDay = (day: number) =>
    events.filter((e: CalendarEvent) => {
      const d = new Date(e.startsAt);
      return d.getFullYear() === cursor.y && d.getMonth() === cursor.m && d.getDate() === day;
    });

  const upcoming = events
    .filter((e: CalendarEvent) => new Date(e.startsAt).getTime() >= today.getTime() - 3600_000)
    .slice(0, 20);

  const shift = (delta: number) =>
    setCursor((c) => {
      const d = new Date(c.y, c.m + delta, 1);
      return { y: d.getFullYear(), m: d.getMonth() };
    });

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 p-5">
        <button
          onClick={() => setCursor({ y: today.getFullYear(), m: today.getMonth() })}
          className="rounded-full border border-border px-6 py-2.5 text-[15px] transition-colors hover:bg-accent"
        >
          Today
        </button>

        <div className="flex min-w-0 items-center justify-center gap-6">
          <button
            aria-label="Previous month"
            onClick={() => shift(-1)}
            className="text-muted-foreground"
          >
            <ChevronLeft className="size-6" />
          </button>
          <div className="min-w-0 text-center">
            <h1 className="truncate text-2xl font-bold">{label}</h1>
            <p className="text-sm text-brand">
              {events.length} {events.length === 1 ? "event" : "events"} scheduled
            </p>
          </div>
          <button
            aria-label="Next month"
            onClick={() => shift(1)}
            className="text-muted-foreground"
          >
            <ChevronRight className="size-6" />
          </button>
        </div>

        <div className="flex overflow-hidden rounded-lg border border-border">
          {(["list", "month"] as const).map((v) => (
            <button
              key={v}
              aria-label={v === "list" ? "List view" : "Month view"}
              onClick={() => setView(v)}
              className={`grid size-11 place-items-center transition-colors ${
                view === v ? "bg-accent" : "hover:bg-accent/60"
              }`}
            >
              {v === "list" ? <List className="size-5" /> : <CalendarDays className="size-5" />}
            </button>
          ))}
        </div>
      </div>

      {view === "month" ? (
        <div>
          <div className="grid grid-cols-7 border-y border-border">
            {DAYS.map((d) => (
              <div
                key={d}
                className="border-r border-border py-4 text-center text-sm font-bold last:border-r-0"
              >
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {cells.map((c, i) => {
              const isToday = c.current && isThisMonth && c.day === today.getDate();
              const dayEvents = c.current ? eventsForDay(c.day) : [];
              return (
                <div
                  key={i}
                  className="min-h-32 border-r border-b border-border p-3 last:border-r-0"
                >
                  <div
                    className={`grid size-7 place-items-center rounded-full text-sm ${
                      isToday
                        ? "bg-destructive font-semibold text-destructive-foreground"
                        : c.current
                          ? ""
                          : "text-muted-foreground"
                    }`}
                  >
                    {c.day}
                  </div>
                  <div className="mt-2 space-y-1.5">
                    {dayEvents.map((e) => (
                      <p key={e.id} className="truncate text-sm font-semibold text-brand">
                        {timeLabel(e.startsAt)} · {e.title}
                      </p>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : upcoming.length === 0 ? (
        <p className="border-t border-border p-10 text-center text-[15px] text-muted-foreground">
          No scheduled events yet.
        </p>
      ) : (
        <ul className="divide-y divide-border border-t border-border">
          {upcoming.map((e: CalendarEvent) => (
            <li key={e.id} className="flex items-start gap-4 p-5">
              <div className="grid size-14 shrink-0 place-items-center rounded-xl bg-accent text-center leading-none">
                <span className="text-lg font-bold">{new Date(e.startsAt).getDate()}</span>
                <span className="text-[11px] font-semibold text-muted-foreground uppercase">
                  {new Date(e.startsAt).toLocaleDateString("en-US", { month: "short" })}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{e.title}</p>
                <p className="mt-0.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Clock className="size-4" /> {timeLabel(e.startsAt)} · {e.durationMinutes} min
                  </span>
                  {e.linkUrl ? (
                    <a
                      href={e.linkUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 text-brand"
                    >
                      <Video className="size-4" /> Join
                    </a>
                  ) : null}
                </p>
                {e.description ? (
                  <p className="mt-2 text-[15px] leading-6 text-foreground/90">{e.description}</p>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
