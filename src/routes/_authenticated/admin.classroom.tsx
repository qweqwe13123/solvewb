import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import {
  adminListClasses,
  deleteClass,
  saveClass,
  type ClassroomClass,
} from "@/lib/classroom.functions";
import { Area, ImageField, Text } from "@/components/admin/fields";
import { mediaUrl } from "@/lib/media";
import { CoverImage } from "@/components/Media";

export const Route = createFileRoute("/_authenticated/admin/classroom")({
  head: () => ({
    meta: [
      { title: "Classroom — Admin — AI Video Bootcamp" },
      { name: "description", content: "Create and manage classroom classes, covers and descriptions." },
      { property: "og:title", content: "Classroom — Admin" },
      { property: "og:description", content: "Create and manage classroom classes." },
    ],
  }),
  component: AdminClassroomPage,
});

const emptyClass: ClassroomClass = {
  id: "",
  title: "",
  description: "",
  coverUrl: null,
  sortOrder: 0,
  isPublished: true,
};

function AdminClassroomPage() {
  const qc = useQueryClient();
  const fetchAll = useServerFn(adminListClasses);
  const saveFn = useServerFn(saveClass);
  const removeFn = useServerFn(deleteClass);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-classes"],
    queryFn: () => fetchAll(),
  });
  const [editing, setEditing] = useState<ClassroomClass | null>(null);

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["admin-classes"] });
    qc.invalidateQueries({ queryKey: ["classes"] });
  };

  const saveMutation = useMutation({
    mutationFn: (c: ClassroomClass) =>
      saveFn({
        data: {
          id: c.id ? c.id : null,
          title: c.title,
          description: c.description,
          coverUrl: c.coverUrl,
          sortOrder: c.sortOrder,
          isPublished: c.isPublished,
        },
      }),
    onSuccess: () => {
      toast.success("Класс сохранён");
      setEditing(null);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message || "Не удалось сохранить класс"),
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => removeFn({ data: { id } }),
    onSuccess: () => {
      toast.success("Класс удалён");
      invalidate();
    },
    onError: () => toast.error("Не удалось удалить класс"),
  });

  if (isLoading) return <p className="text-[15px] text-muted-foreground">Загрузка…</p>;

  return (
    <>
      <section className="rounded-2xl border border-border bg-card p-6 sm:p-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Классы</h1>
            <p className="mt-1 text-[15px] text-muted-foreground">
              Обложка, название и описание для каждой карточки в Classroom.
            </p>
          </div>
          <button
            onClick={() => setEditing({ ...emptyClass })}
            className="flex shrink-0 items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-bold transition-colors hover:bg-accent"
          >
            <Plus className="size-4" /> Новый класс
          </button>
        </div>

        <ul className="mt-5 divide-y divide-border">
          {(data?.classes ?? []).map((c) => (
            <li key={c.id} className="flex items-center gap-4 py-3">
              <CoverImage
                path={c.coverUrl}
                alt={c.title}
                width={72}
                height={48}
                className="h-12 w-[72px] shrink-0 rounded-md bg-muted object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-bold">{c.title}</p>
                <p className="truncate text-sm text-muted-foreground">
                  #{c.sortOrder} · {c.isPublished ? "опубликован" : "черновик"}
                </p>
              </div>
              <button
                onClick={() => setEditing(c)}
                className="rounded-lg border border-border px-3 py-2 text-sm font-bold transition-colors hover:bg-accent"
              >
                Изменить
              </button>
              <button
                aria-label={`Удалить ${c.title}`}
                onClick={() => {
                  if (confirm(`Удалить класс «${c.title}»?`)) removeMutation.mutate(c.id);
                }}
                className="rounded-lg border border-border p-2 text-destructive transition-colors hover:bg-accent"
              >
                <Trash2 className="size-4" />
              </button>
            </li>
          ))}
          {(data?.classes ?? []).length === 0 ? (
            <li className="py-6 text-[15px] text-muted-foreground">Пока нет классов.</li>
          ) : null}
        </ul>
      </section>

      {editing ? (
        <ClassForm
          value={editing}
          pending={saveMutation.isPending}
          onCancel={() => setEditing(null)}
          onSave={(c) => saveMutation.mutate(c)}
        />
      ) : null}
    </>
  );
}

function ClassForm({
  value,
  pending,
  onCancel,
  onSave,
}: {
  value: ClassroomClass;
  pending: boolean;
  onCancel: () => void;
  onSave: (c: ClassroomClass) => void;
}) {
  const [form, setForm] = useState<ClassroomClass>(value);
  useEffect(() => setForm(value), [value]);

  return (
    <section className="mt-6 rounded-2xl border border-border bg-card p-6 sm:p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">{value.id ? "Редактировать класс" : "Новый класс"}</h2>
        <button aria-label="Закрыть" onClick={onCancel} className="rounded-lg p-2 hover:bg-accent">
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
            label="Название класса"
            value={form.title}
            onChange={(v) => setForm({ ...form, title: v })}
          />
          <Text
            label="Порядок"
            value={String(form.sortOrder)}
            onChange={(v) => setForm({ ...form, sortOrder: Number(v) || 0 })}
          />
        </div>
        <Area
          label="Описание"
          rows={4}
          value={form.description}
          onChange={(v) => setForm({ ...form, description: v })}
        />
        <ImageField
          label="Обложка класса"
          folder="classroom"
          value={form.coverUrl}
          onChange={(v) => setForm({ ...form, coverUrl: v })}
        />
        <label className="flex items-center gap-3 text-[15px]">
          <input
            type="checkbox"
            checked={form.isPublished}
            onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
            className="size-4"
          />
          Опубликован
        </label>
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-join px-6 py-3 text-sm font-bold tracking-wide text-join-foreground uppercase transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {pending ? "Сохраняем…" : "Сохранить класс"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-border px-6 py-3 text-sm font-bold transition-colors hover:bg-accent"
          >
            Отмена
          </button>
        </div>
      </form>
    </section>
  );
}
