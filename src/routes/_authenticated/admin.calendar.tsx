import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import {
  adminListEvents,
  deleteEvent,
  saveEvent,
  type CalendarEvent,
} from "@/lib/calendar.functions";
import { Area, Text } from "@/components/admin/fields";

export const Route = createFileRoute("/_authenticated/admin/calendar")({
  head: () => ({
    meta: [
      { title: "Calendar — Admin — AI Video Bootcamp" },
      { name: "description", content: "Schedule live calls and announce new lessons for members." },
      { property: "og:title", content: "Calendar — Admin" },
      { property: "og:description", content: "Schedule live calls and new lessons." },
    ],
  }),
  component: AdminCalendarPage,
});

function toLocalInput(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function emptyEvent(): CalendarEvent {
  const d = new Date();
  d.setHours(20, 0, 0, 0);
  return {
    id: "",
    title: "",
    description: "",
    startsAt: d.toISOString(),
    durationMinutes: 60,
    linkUrl: null,
    isPublished: true,
  };
}

function AdminCalendarPage() {
  const qc = useQueryClient();
  const fetchAll = useServerFn(adminListEvents);
  const saveFn = useServerFn(saveEvent);
  const removeFn = useServerFn(deleteEvent);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-events"],
    queryFn: () => fetchAll(),
  });
  const [editing, setEditing] = useState<CalendarEvent | null>(null);

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["admin-events"] });
    qc.invalidateQueries({ queryKey: ["events"] });
  };

  const saveMutation = useMutation({
    mutationFn: (e: CalendarEvent) =>
      saveFn({
        data: {
          id: e.id ? e.id : null,
          title: e.title,
          description: e.description,
          startsAt: e.startsAt,
          durationMinutes: e.durationMinutes,
          linkUrl: e.linkUrl?.trim() ? e.linkUrl.trim() : null,
          isPublished: e.isPublished,
        },
      }),
    onSuccess: () => {
      toast.success("Event saved");
      setEditing(null);
      invalidate();
    },
    onError: (err: Error) => toast.error(err.message || "Failed to save event"),
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => removeFn({ data: { id } }),
    onSuccess: () => {
      toast.success("Event deleted");
      invalidate();
    },
    onError: () => toast.error("Failed to delete event"),
  });

  if (isLoading) return <p className="text-[15px] text-muted-foreground">Loading…</p>;

  return (
    <>
      <section className="rounded-2xl border border-border bg-card p-6 sm:p-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Calendar</h1>
            <p className="mt-1 text-[15px] text-muted-foreground">
              Add live calls and upcoming lesson dates for community members.
            </p>
          </div>
          <button
            onClick={() => setEditing(emptyEvent())}
            className="flex shrink-0 items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-bold transition-colors hover:bg-accent"
          >
            <Plus className="size-4" /> New event
          </button>
        </div>

        <ul className="mt-5 divide-y divide-border">
          {(data?.events ?? []).map((e) => (
            <li key={e.id} className="flex items-center gap-4 py-3">
              <div className="grid size-12 shrink-0 place-items-center rounded-lg bg-accent text-center leading-none">
                <span className="text-lg font-bold">{new Date(e.startsAt).getDate()}</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-bold">{e.title}</p>
                <p className="truncate text-sm text-muted-foreground">
                  {new Date(e.startsAt).toLocaleString("ru-RU", {
                    day: "numeric",
                    month: "long",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}{" "}
                  · {e.durationMinutes} min · {e.isPublished ? "published" : "draft"}
                </p>
              </div>
              <button
                onClick={() => setEditing(e)}
                className="rounded-lg border border-border px-3 py-2 text-sm font-bold transition-colors hover:bg-accent"
              >
                Edit
              </button>
              <button
                aria-label={`Удалить ${e.title}`}
                onClick={() => {
                  if (confirm(`Удалить событие «${e.title}»?`)) removeMutation.mutate(e.id);
                }}
                className="rounded-lg border border-border p-2 text-destructive transition-colors hover:bg-accent"
              >
                <Trash2 className="size-4" />
              </button>
            </li>
          ))}
          {(data?.events ?? []).length === 0 ? (
            <li className="py-6 text-[15px] text-muted-foreground">No events yet.</li>
          ) : null}
        </ul>
      </section>

      {editing ? (
        <EventForm
          value={editing}
          pending={saveMutation.isPending}
          onCancel={() => setEditing(null)}
          onSave={(e) => saveMutation.mutate(e)}
        />
      ) : null}
    </>
  );
}

function EventForm({
  value,
  pending,
  onCancel,
  onSave,
}: {
  value: CalendarEvent;
  pending: boolean;
  onCancel: () => void;
  onSave: (e: CalendarEvent) => void;
}) {
  const [form, setForm] = useState<CalendarEvent>(value);
  useEffect(() => setForm(value), [value]);

  return (
    <section className="mt-6 rounded-2xl border border-border bg-card p-6 sm:p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">
          {value.id ? "Edit event" : "New event"}
        </h2>
        <button aria-label="Close" onClick={onCancel} className="rounded-lg p-2 hover:bg-accent">
          <X className="size-4" />
        </button>
      </div>

      <form
        className="mt-6 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          onSave(form);
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Text
            label="Event title (e.g. Live Q&A & Breakdown)"
            value={form.title}
            onChange={(v) => setForm({ ...form, title: v })}
          />
          <Text
            label="Start date and time"
            type="datetime-local"
            value={toLocalInput(form.startsAt)}
            onChange={(v) => {
              const d = new Date(v);
              if (!Number.isNaN(d.getTime())) setForm({ ...form, startsAt: d.toISOString() });
            }}
          />
          <Text
            label="Длительность (minуты)"
            value={String(form.durationMinutes)}
            onChange={(v) => setForm({ ...form, durationMinutes: Number(v) || 60 })}
          />
          <Text
            label="Meeting link (optional)"
            value={form.linkUrl ?? ""}
            onChange={(v) => setForm({ ...form, linkUrl: v })}
          />
        </div>
        <Area
          label="Description"
          rows={4}
          value={form.description}
          onChange={(v) => setForm({ ...form, description: v })}
        />
        <label className="flex items-center gap-3 text-[15px]">
          <input
            type="checkbox"
            checked={form.isPublished}
            onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
            className="size-4"
          />
          Published
        </label>
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-join px-6 py-3 text-sm font-bold tracking-wide text-join-foreground uppercase transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {pending ? "Saving…" : "Save event"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-border px-6 py-3 text-sm font-bold transition-colors hover:bg-accent"
          >
            Cancel
          </button>
        </div>
      </form>
    </section>
  );
}
