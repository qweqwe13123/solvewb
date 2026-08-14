import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Link2, Paperclip, Pin, Plus, Smile, Trash2, Upload, X, Youtube } from "lucide-react";
import { toast } from "sonner";
import { adminListPosts, deletePost, savePost, type Post } from "@/lib/posts.functions";
import { CoverImage, Avatar } from "@/components/Media";
import { uploadMedia } from "@/lib/media";
import { useSession } from "@/hooks/useSession";
import { getCommunity } from "@/lib/community.functions";

export const Route = createFileRoute("/_authenticated/admin/posts")({
  head: () => ({
    meta: [
      { title: "Posts — Admin — AI Video Bootcamp" },
      {
        name: "description",
        content: "Write, pin and publish community posts as an admin.",
      },
      { property: "og:title", content: "Posts — Admin" },
      { property: "og:description", content: "Write and publish community posts." },
    ],
  }),
  component: AdminPostsPage,
});

const CATEGORIES = [
  "General Discussion",
  "Announcements",
  "Wins",
  "Questions",
  "Resources",
] as const;

const EMOJIS = ["🔥", "🚀", "🎯", "💡", "🙌", "❤️", "😂", "✅", "⚡", "🏆"];

const emptyPost: Post = {
  id: "",
  title: "",
  body: "",
  category: CATEGORIES[0],
  coverUrl: null,
  isPinned: false,
  isPublished: true,
  authorName: "",
  authorAvatar: null,
  createdAt: "",
  likeCount: 0,
  commentCount: 0,
};

function AdminPostsPage() {
  const qc = useQueryClient();
  const fetchAll = useServerFn(adminListPosts);
  const saveFn = useServerFn(savePost);
  const removeFn = useServerFn(deletePost);

  const { data, isLoading } = useQuery({ queryKey: ["admin-posts"], queryFn: () => fetchAll() });
  const [editing, setEditing] = useState<Post | null>({ ...emptyPost });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["admin-posts"] });
    qc.invalidateQueries({ queryKey: ["posts"] });
  };

  const saveMutation = useMutation({
    mutationFn: (p: Post) =>
      saveFn({
        data: {
          id: p.id ? p.id : null,
          title: p.title,
          body: p.body,
          category: p.category,
          coverUrl: p.coverUrl,
          isPinned: p.isPinned,
          isPublished: p.isPublished,
        },
      }),
    onSuccess: () => {
      toast.success("Пост опубликован");
      setEditing(null);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message || "Не удалось сохранить пост"),
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => removeFn({ data: { id } }),
    onSuccess: () => {
      toast.success("Пост удалён");
      invalidate();
    },
    onError: () => toast.error("Не удалось удалить пост"),
  });

  return (
    <>
      {editing ? (
        <PostComposer
          value={editing}
          pending={saveMutation.isPending}
          onCancel={() => setEditing(null)}
          onSave={(p) => saveMutation.mutate(p)}
        />
      ) : (
        <button
          onClick={() => setEditing({ ...emptyPost })}
          className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-[15px] font-bold transition-colors hover:bg-accent"
        >
          <Plus className="size-4" /> Новый пост
        </button>
      )}

      <section className="rounded-2xl border border-border bg-card p-6 sm:p-8">
        <h2 className="text-xl font-bold">Посты</h2>
        {isLoading ? (
          <p className="mt-4 text-[15px] text-muted-foreground">Загрузка…</p>
        ) : (
          <ul className="mt-4 divide-y divide-border">
            {(data?.posts ?? []).map((p) => (
              <li key={p.id} className="flex items-center gap-4 py-3">
                <CoverImage
                  path={p.coverUrl}
                  alt={p.title}
                  width={72}
                  height={48}
                  className="h-12 w-[72px] shrink-0 rounded-md bg-muted object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-bold">
                    {p.isPinned ? "📌 " : ""}
                    {p.title}
                  </p>
                  <p className="truncate text-sm text-muted-foreground">
                    {p.category} · {p.isPublished ? "опубликован" : "черновик"} · {p.likeCount}{" "}
                    лайков · {p.commentCount} комм.
                  </p>
                </div>
                <button
                  onClick={() => setEditing(p)}
                  className="rounded-lg border border-border px-3 py-2 text-sm font-bold transition-colors hover:bg-accent"
                >
                  Изменить
                </button>
                <button
                  aria-label={`Удалить ${p.title}`}
                  onClick={() => {
                    if (confirm(`Удалить пост «${p.title}»?`)) removeMutation.mutate(p.id);
                  }}
                  className="rounded-lg border border-border p-2 text-destructive transition-colors hover:bg-accent"
                >
                  <Trash2 className="size-4" />
                </button>
              </li>
            ))}
            {(data?.posts ?? []).length === 0 ? (
              <li className="py-6 text-[15px] text-muted-foreground">Пока нет постов.</li>
            ) : null}
          </ul>
        )}
      </section>
    </>
  );
}

function PostComposer({
  value,
  pending,
  onCancel,
  onSave,
}: {
  value: Post;
  pending: boolean;
  onCancel: () => void;
  onSave: (p: Post) => void;
}) {
  const [form, setForm] = useState<Post>(value);
  const [uploading, setUploading] = useState(false);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const { user } = useSession();
  const fetchCommunity = useServerFn(getCommunity);
  const { data: community } = useQuery({
    queryKey: ["community"],
    queryFn: () => fetchCommunity(),
  });

  useEffect(() => setForm(value), [value]);

  const meta = user?.user_metadata ?? {};
  const authorName =
    (meta["full_name"] as string | undefined) ??
    (meta["name"] as string | undefined) ??
    user?.email ??
    "Admin";

  function append(text: string) {
    setForm((f) => ({ ...f, body: f.body ? `${f.body}\n${text}` : text }));
    bodyRef.current?.focus();
  }

  async function handleUpload(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    try {
      setForm((f) => ({ ...f, coverUrl: null }));
      const path = await uploadMedia(file, "posts");
      setForm((f) => ({ ...f, coverUrl: path }));
    } catch {
      toast.error("Не удалось загрузить файл");
    } finally {
      setUploading(false);
    }
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-5 sm:p-7">
      <div className="flex items-center gap-3">
        <Avatar
          name={authorName}
          path={(meta["avatar_url"] as string | undefined) ?? null}
          className="size-9 shrink-0 rounded-full text-xs"
        />
        <p className="min-w-0 truncate text-[15px]">
          <span className="font-bold">{authorName}</span>{" "}
          <span className="text-muted-foreground">posting in</span>{" "}
          <span className="font-bold">{community?.profile?.name ?? "Community"}</span>
        </p>
      </div>

      <form
        className="mt-5"
        onSubmit={(e) => {
          e.preventDefault();
          if (!form.title.trim()) {
            toast.error("Добавьте заголовок");
            return;
          }
          onSave(form);
        }}
      >
        <input
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="Title"
          aria-label="Заголовок поста"
          className="w-full bg-transparent text-3xl font-extrabold tracking-tight outline-none placeholder:text-muted-foreground/60"
        />
        <textarea
          ref={bodyRef}
          value={form.body}
          onChange={(e) => setForm({ ...form, body: e.target.value })}
          placeholder="Write something..."
          rows={6}
          aria-label="Текст поста"
          className="mt-3 w-full resize-y bg-transparent text-[17px] leading-7 outline-none placeholder:text-muted-foreground/60"
        />

        {form.coverUrl ? (
          <div className="relative mt-3 w-full max-w-md">
            <CoverImage
              path={form.coverUrl}
              alt="Обложка поста"
              className="aspect-video w-full rounded-xl object-cover"
            />
            <button
              type="button"
              aria-label="Убрать вложение"
              onClick={() => setForm({ ...form, coverUrl: null })}
              className="absolute top-2 right-2 rounded-full bg-background/90 p-1.5"
            >
              <X className="size-4" />
            </button>
          </div>
        ) : null}
        {uploading ? (
          <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
            <Upload className="size-4" /> Загрузка…
          </p>
        ) : null}

        <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-border pt-4">
          <label
            title="Прикрепить изображение"
            className="cursor-pointer text-muted-foreground transition-colors hover:text-foreground"
          >
            <Paperclip className="size-5" />
            <span className="sr-only">Прикрепить изображение</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleUpload(e.target.files?.[0])}
            />
          </label>

          <button
            type="button"
            title="Вставить ссылку"
            onClick={() => {
              const url = prompt("Ссылка (https://…)");
              if (url) append(url);
            }}
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            <Link2 className="size-5" />
            <span className="sr-only">Вставить ссылку</span>
          </button>

          <button
            type="button"
            title="Вставить видео YouTube"
            onClick={() => {
              const url = prompt("Ссылка на YouTube");
              if (url) append(url);
            }}
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            <Youtube className="size-5" />
            <span className="sr-only">Вставить видео</span>
          </button>

          <div className="relative">
            <button
              type="button"
              title="Эмодзи"
              onClick={() => setEmojiOpen((v) => !v)}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              <Smile className="size-5" />
              <span className="sr-only">Эмодзи</span>
            </button>
            {emojiOpen ? (
              <div className="absolute bottom-9 left-0 z-10 flex w-56 flex-wrap gap-1 rounded-xl border border-border bg-card p-2 shadow-lg">
                {EMOJIS.map((e) => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => {
                      setForm((f) => ({ ...f, body: f.body + e }));
                      setEmojiOpen(false);
                    }}
                    className="rounded-md p-1.5 text-lg hover:bg-accent"
                  >
                    {e}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            aria-label="Категория"
            className="rounded-lg border border-border bg-transparent px-3 py-2 text-sm font-bold outline-none"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setForm({ ...form, isPinned: !form.isPinned })}
            className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-bold transition-colors ${
              form.isPinned
                ? "border-join bg-join text-join-foreground"
                : "border-border text-muted-foreground hover:bg-accent"
            }`}
          >
            <Pin className="size-4" /> Pinned
          </button>

          <button
            type="button"
            onClick={() => setForm({ ...form, isPublished: !form.isPublished })}
            className="rounded-lg border border-border px-3 py-2 text-sm font-bold text-muted-foreground transition-colors hover:bg-accent"
          >
            {form.isPublished ? "Опубликован" : "Черновик"}
          </button>

          <div className="ml-auto flex items-center gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-3 py-2 text-sm font-bold text-muted-foreground uppercase transition-colors hover:text-foreground"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={pending || !form.title.trim()}
              className="rounded-lg bg-join px-6 py-2.5 text-sm font-bold text-join-foreground uppercase transition-opacity disabled:opacity-50"
            >
              {pending ? "…" : "Post"}
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}
