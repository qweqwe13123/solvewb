import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Plus, Trash2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import {
  adminGetCommunity,
  deleteCourse,
  saveCommunityProfile,
  saveCourse,
  type CommunityProfile,
  type Course,
} from "@/lib/community.functions";
import { mediaUrl, uploadMedia } from "@/lib/media";
import { CoverImage, Avatar } from "@/components/Media";

export const Route = createFileRoute("/_authenticated/admin/community")({
  head: () => ({
    meta: [
      { title: "Community — Admin — AI Video Bootcamp" },
      {
        name: "description",
        content: "Manage the community profile, owner information, and create or edit courses.",
      },
      { property: "og:title", content: "Community — Admin" },
      {
        property: "og:description",
        content: "Manage the community profile, owner information, and create or edit courses.",
      },
    ],
  }),
  component: AdminCommunityPage,
});

const emptyCourse: Course = {
  id: "",
  slug: "",
  title: "",
  summary: "",
  description: "",
  priceLabel: "$9/month",
  coverUrl: null,
  videoUrl: null,
  gallery: [],
  isPublished: true,
  sortOrder: 0,
};

function AdminCommunityPage() {
  const qc = useQueryClient();
  const fetchAll = useServerFn(adminGetCommunity);
  const saveProfileFn = useServerFn(saveCommunityProfile);
  const saveCourseFn = useServerFn(saveCourse);
  const deleteCourseFn = useServerFn(deleteCourse);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-community"],
    queryFn: () => fetchAll(),
  });

  const [profile, setProfile] = useState<CommunityProfile | null>(null);
  const [editing, setEditing] = useState<Course | null>(null);

  useEffect(() => {
    if (data?.profile) setProfile(data.profile);
  }, [data?.profile]);

  const profileMutation = useMutation({
    mutationFn: (p: CommunityProfile) => saveProfileFn({ data: p }),
    onSuccess: () => {
      toast.success("Профиль сообщества и данные владельца сохранены!");
      qc.invalidateQueries({ queryKey: ["admin-community"] });
      qc.invalidateQueries({ queryKey: ["community"] });
    },
    onError: () => toast.error("Не удалось сохранить профиль"),
  });

  const courseMutation = useMutation({
    mutationFn: (c: Course) =>
      saveCourseFn({
        data: {
          id: c.id ? c.id : null,
          slug: c.slug,
          title: c.title,
          summary: c.summary,
          description: c.description,
          priceLabel: c.priceLabel,
          coverUrl: c.coverUrl,
          videoUrl: c.videoUrl,
          gallery: c.gallery,
          isPublished: c.isPublished,
          sortOrder: c.sortOrder,
        },
      }),
    onSuccess: () => {
      toast.success("Курс сохранён");
      setEditing(null);
      qc.invalidateQueries({ queryKey: ["admin-community"] });
      qc.invalidateQueries({ queryKey: ["community"] });
    },
    onError: (e: Error) => toast.error(e.message || "Не удалось сохранить курс"),
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => deleteCourseFn({ data: { id } }),
    onSuccess: () => {
      toast.success("Курс удалён");
      qc.invalidateQueries({ queryKey: ["admin-community"] });
      qc.invalidateQueries({ queryKey: ["community"] });
    },
    onError: () => toast.error("Не удалось удалить курс"),
  });

  if (isLoading) return <p className="text-[15px] text-muted-foreground">Загрузка…</p>;

  return (
    <div className="space-y-8">
      {profile ? (
        <SidebarCardForm
          profile={profile}
          pending={profileMutation.isPending}
          onChange={setProfile}
          onSave={() => profileMutation.mutate(profile)}
        />
      ) : null}

      <section className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold">Курсы</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Список курсов, отображаемый на страницах сообщества и каталога.
            </p>
          </div>
          <button
            onClick={() => setEditing({ ...emptyCourse })}
            className="flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-bold transition-colors hover:bg-accent"
          >
            <Plus className="size-4" /> Новый курс
          </button>
        </div>

        <ul className="mt-5 divide-y divide-border">
          {(data?.courses ?? []).map((c) => (
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
                  /course/{c.slug} · {c.priceLabel} · {c.isPublished ? "опубликован" : "черновик"}
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
                  if (confirm(`Удалить курс «${c.title}»?`)) removeMutation.mutate(c.id);
                }}
                className="rounded-lg border border-border p-2 text-destructive transition-colors hover:bg-accent"
              >
                <Trash2 className="size-4" />
              </button>
            </li>
          ))}
          {(data?.courses ?? []).length === 0 ? (
            <li className="py-6 text-[15px] text-muted-foreground">Пока нет курсов.</li>
          ) : null}
        </ul>
      </section>

      {editing ? (
        <CourseForm
          course={editing}
          profile={profile}
          pending={courseMutation.isPending || profileMutation.isPending}
          onCancel={() => setEditing(null)}
          onSave={(c, p) => {
            if (p) {
              setProfile(p);
              profileMutation.mutate(p);
            }
            courseMutation.mutate(c);
          }}
        />
      ) : null}
    </div>
  );
}

function SidebarCardForm({
  profile,
  pending,
  onChange,
  onSave,
}: {
  profile: CommunityProfile;
  pending: boolean;
  onChange: (p: CommunityProfile) => void;
  onSave: () => void;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm">
      <h1 className="text-2xl font-bold">Настройки сообщества и владельца</h1>
      <p className="mt-2 text-[15px] text-muted-foreground">
        Здесь настраиваются имя автора/владельца, его фотография (Avatar), название сообщества, обложка и описание.
      </p>
      <form
        className="mt-6 space-y-6"
        onSubmit={(e) => {
          e.preventDefault();
          onSave();
        }}
      >
        <div className="rounded-xl border border-border p-5 bg-accent/20">
          <h2 className="text-base font-bold text-foreground">Владелец / Автор курса</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Синхронизируется со строкой под видео на странице курсов (например: By Daniel Riley).
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Text
              label="Имя автора / подпись (например: By Daniel Riley)"
              value={profile.ownerLabel}
              onChange={(v) => onChange({ ...profile, ownerLabel: v })}
            />
            <MediaField
              label="Фото / аватар владельца"
              folder="avatars"
              accept="image/*"
              value={profile.ownerAvatar}
              onChange={(v) => onChange({ ...profile, ownerAvatar: v })}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Text
            label="Название сообщества"
            value={profile.name}
            onChange={(v) => onChange({ ...profile, name: v })}
          />
          <Text
            label="Ссылка / адрес канала"
            value={profile.handleLabel}
            onChange={(v) => onChange({ ...profile, handleLabel: v })}
          />
        </div>

        <Area
          label="Краткое описание"
          rows={3}
          value={profile.description}
          onChange={(v) => onChange({ ...profile, description: v })}
        />

        <div className="grid gap-4 sm:grid-cols-3">
          <Text
            label="Участники"
            value={profile.membersLabel}
            onChange={(v) => onChange({ ...profile, membersLabel: v })}
          />
          <Text
            label="Онлайн"
            value={profile.onlineLabel}
            onChange={(v) => onChange({ ...profile, onlineLabel: v })}
          />
          <Text
            label="Админов"
            value={profile.adminsLabel}
            onChange={(v) => onChange({ ...profile, adminsLabel: v })}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Text
            label="Цена на кнопке Join"
            value={profile.priceLabel}
            onChange={(v) => onChange({ ...profile, priceLabel: v })}
          />
          <Text
            label="Приватность (Private / Public)"
            value={profile.privacyLabel}
            onChange={(v) => onChange({ ...profile, privacyLabel: v })}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <MediaField
            label="Обложка карточки сообщества"
            folder="community"
            accept="image/*"
            value={profile.coverUrl}
            onChange={(v) => onChange({ ...profile, coverUrl: v })}
          />
          <MediaField
            label="Видео сообщества"
            folder="community"
            accept="video/*"
            isVideo
            value={profile.videoUrl}
            onChange={(v) => onChange({ ...profile, videoUrl: v })}
          />
        </div>

        <Area
          label="Полное описание страницы (текст под видео)"
          rows={6}
          value={profile.body}
          onChange={(v) => onChange({ ...profile, body: v })}
        />

        <div>
          <GalleryField
            label="Фотогалерея сообщества"
            folder="community"
            value={profile.gallery}
            onChange={(gallery) => onChange({ ...profile, gallery })}
          />
        </div>

        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-join px-6 py-3 text-sm font-bold tracking-wide text-join-foreground uppercase transition-opacity hover:opacity-90 disabled:opacity-60 shadow-sm"
        >
          {pending ? "Сохраняем…" : "Сохранить изменения"}
        </button>
      </form>
    </section>
  );
}

function CourseForm({
  course,
  profile,
  pending,
  onCancel,
  onSave,
}: {
  course: Course;
  profile: CommunityProfile | null;
  pending: boolean;
  onCancel: () => void;
  onSave: (c: Course, p: CommunityProfile | null) => void;
}) {
  const [form, setForm] = useState<Course>(course);
  const [main, setMain] = useState<CommunityProfile | null>(profile);
  useEffect(() => setForm(course), [course]);
  useEffect(() => setMain(profile), [profile]);

  return (
    <section className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">{course.id ? "Редактировать курс" : "Новый курс"}</h2>
        <button aria-label="Закрыть" onClick={onCancel} className="rounded-lg p-2 hover:bg-accent">
          <X className="size-4" />
        </button>
      </div>

      <form
        className="mt-6 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          onSave(
            {
              ...form,
              slug:
                form.slug.trim() ||
                form.title
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, "-")
                  .replace(/^-|-$/g, ""),
            },
            main,
          );
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Text
            label="Название"
            value={form.title}
            onChange={(v) => setForm({ ...form, title: v })}
          />
          <Text
            label="Адрес (slug)"
            value={form.slug}
            onChange={(v) => setForm({ ...form, slug: v })}
          />
          <Text
            label="Цена"
            value={form.priceLabel}
            onChange={(v) => setForm({ ...form, priceLabel: v })}
          />
          <Text
            label="Порядок"
            value={String(form.sortOrder)}
            onChange={(v) => setForm({ ...form, sortOrder: Number(v) || 0 })}
          />
        </div>
        <Area
          label="Краткое описание"
          rows={2}
          value={form.summary}
          onChange={(v) => setForm({ ...form, summary: v })}
        />
        <Area
          label="Полное описание"
          rows={6}
          value={form.description}
          onChange={(v) => setForm({ ...form, description: v })}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <MediaField
            label="Обложка курса"
            folder="courses"
            accept="image/*"
            value={form.coverUrl}
            onChange={(v) => setForm({ ...form, coverUrl: v })}
          />
          <MediaField
            label="Видео курса"
            folder="courses"
            accept="video/*"
            isVideo
            value={form.videoUrl}
            onChange={(v) => setForm({ ...form, videoUrl: v })}
          />
        </div>

        <GalleryField
          label="Фотографии курса"
          value={form.gallery}
          onChange={(gallery) => setForm({ ...form, gallery })}
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
            {pending ? "Сохраняем…" : "Сохранить курс"}
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

function Text({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-muted-foreground">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 w-full rounded-md border border-border bg-transparent px-3 py-2.5 text-[15px] outline-none focus:border-foreground"
      />
    </label>
  );
}

function Area({
  label,
  value,
  rows,
  onChange,
}: {
  label: string;
  value: string;
  rows: number;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-muted-foreground">{label}</span>
      <textarea
        value={value}
        rows={rows}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 w-full resize-y rounded-md border border-border bg-transparent px-3 py-2.5 text-[15px] leading-6 outline-none focus:border-foreground"
      />
    </label>
  );
}

function MediaField({
  label,
  folder,
  accept,
  value,
  isVideo,
  onChange,
}: {
  label: string;
  folder: string;
  accept: string;
  value: string | null;
  isVideo?: boolean;
  onChange: (v: string | null) => void;
}) {
  const [busy, setBusy] = useState(false);

  async function handle(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    try {
      const url = await uploadMedia(file, folder);
      onChange(url);
      toast.success("Файл успешно загружен");
    } catch {
      toast.error("Не удалось загрузить файл");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <span className="text-sm font-bold text-muted-foreground">{label}</span>
      <div className="mt-1.5 rounded-md border border-border p-3">
        {value ? (
          isVideo ? (
            <video src={mediaUrl(value)} controls className="aspect-video w-full rounded bg-black" />
          ) : (
            <div className="relative aspect-video w-full overflow-hidden rounded bg-muted flex items-center justify-center">
              <img
                src={mediaUrl(value)}
                alt={label}
                className="h-full w-full object-cover"
              />
            </div>
          )
        ) : (
          <div className="grid aspect-video w-full place-items-center rounded bg-muted text-sm text-muted-foreground">
            Нет файла
          </div>
        )}
        <div className="mt-3 flex items-center gap-3">
          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-bold transition-colors hover:bg-accent">
            <Upload className="size-4" />
            {busy ? "Загрузка…" : "Загрузить"}
            <input
              type="file"
              accept={accept}
              className="hidden"
              onChange={(e) => handle(e.target.files?.[0])}
            />
          </label>
          {value ? (
            <button
              type="button"
              onClick={() => onChange(null)}
              className="text-sm font-bold text-muted-foreground hover:text-destructive"
            >
              Убрать
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function GalleryField({
  value,
  onChange,
  folder = "courses",
  label = "Фотографии",
}: {
  value: string[];
  onChange: (v: string[]) => void;
  folder?: string;
  label?: string;
}) {
  const [busy, setBusy] = useState(false);

  async function handle(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    try {
      const paths = await Promise.all(Array.from(files).map((f) => uploadMedia(f, folder)));
      onChange([...value, ...paths]);
      toast.success("Фотографии добавлены");
    } catch {
      toast.error("Не удалось загрузить фото");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <span className="text-sm font-bold text-muted-foreground">{label}</span>
      <div className="mt-1.5 rounded-md border border-border p-3">
        <div className="flex flex-wrap gap-3">
          {value.map((p) => (
            <div key={p} className="relative">
              <img
                src={mediaUrl(p)}
                alt="Фото курса"
                className="h-20 w-32 rounded object-cover"
              />
              <button
                type="button"
                aria-label="Удалить фото"
                onClick={() => onChange(value.filter((x) => x !== p))}
                className="absolute -top-2 -right-2 grid size-6 place-items-center rounded-full border border-border bg-card shadow"
              >
                <X className="size-3" />
              </button>
            </div>
          ))}
          {value.length === 0 ? (
            <p className="text-sm text-muted-foreground">Пока нет фотографий.</p>
          ) : null}
        </div>
        <label className="mt-3 flex w-fit cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-bold transition-colors hover:bg-accent">
          <Upload className="size-4" />
          {busy ? "Загрузка…" : "Добавить фото"}
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handle(e.target.files)}
          />
        </label>
      </div>
    </div>
  );
}
