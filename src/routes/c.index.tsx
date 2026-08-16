import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Pin, MessageCircle, ThumbsUp, Send } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { CommunitySidebar } from "@/components/community/CommunitySidebar";
import { Avatar, CoverImage } from "@/components/Media";
import { useSession } from "@/hooks/useSession";
import { getIsAdmin } from "@/lib/admin.functions";
import {
  addComment,
  deleteComment,
  listComments,
  listMyLikes,
  listPosts,
  toggleLike,
  type Post,
} from "@/lib/posts.functions";

export const Route = createFileRoute("/c/")({
  head: () => ({
    meta: [
      { title: "Community feed — AI Video Bootcamp" },
      {
        name: "description",
        content:
          "Posts, announcements and daily accountability inside the AI Video Bootcamp community.",
      },
      { property: "og:title", content: "AI Video Bootcamp community feed" },
      {
        property: "og:description",
        content: "Join the discussion, share your AI video wins and learn with 100 creators.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CommunityFeed,
});

function formatDate(iso: string) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function CommunityFeed() {
  const { user } = useSession();
  const fetchPosts = useServerFn(listPosts);
  const fetchLikes = useServerFn(listMyLikes);
  const checkAdmin = useServerFn(getIsAdmin);

  const postsQuery = useQuery({ queryKey: ["posts"], queryFn: () => fetchPosts() });
  const likesQuery = useQuery({
    queryKey: ["my-likes"],
    queryFn: () => fetchLikes(),
    enabled: !!user,
  });
  const adminQuery = useQuery({
    queryKey: ["is-admin"],
    queryFn: () => checkAdmin(),
    enabled: !!user,
  });

  const posts = postsQuery.data?.posts ?? [];
  const likedIds = new Set(likesQuery.data?.postIds ?? []);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
      <section className="min-w-0">
        {adminQuery.data?.isAdmin ? (
          <Link
            to="/admin/posts"
            className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:bg-accent"
          >
            <span className="text-[15px] font-bold">Create a new post</span>
            <span className="text-sm text-muted-foreground">Admin · Posts</span>
          </Link>
        ) : null}

        {postsQuery.isLoading ? (
          <p className="text-[15px] text-muted-foreground">Loading…</p>
        ) : posts.length === 0 ? (
          <p className="rounded-xl border border-border bg-card p-6 text-[15px] text-muted-foreground">
            No posts yet.
          </p>
        ) : (
          <ul className="mt-5 space-y-5">
            {posts.map((p) => (
              <PostCard key={p.id} post={p} liked={likedIds.has(p.id)} userId={user?.id ?? null} />
            ))}
          </ul>
        )}
      </section>

      <CommunitySidebar />
    </div>
  );
}

function PostCard({ post, liked, userId }: { post: Post; liked: boolean; userId: string | null }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");

  const likeFn = useServerFn(toggleLike);
  const fetchComments = useServerFn(listComments);
  const addFn = useServerFn(addComment);
  const removeFn = useServerFn(deleteComment);

  const commentsQuery = useQuery({
    queryKey: ["comments", post.id],
    queryFn: () => fetchComments({ data: { postId: post.id } }),
    enabled: open,
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["posts"] });
    qc.invalidateQueries({ queryKey: ["my-likes"] });
    qc.invalidateQueries({ queryKey: ["comments", post.id] });
  };

  const likeMutation = useMutation({
    mutationFn: () => likeFn({ data: { postId: post.id } }),
    onSuccess: invalidate,
    onError: () => toast.error("Failed to update like"),
  });

  const commentMutation = useMutation({
    mutationFn: (body: string) => addFn({ data: { postId: post.id, body } }),
    onSuccess: () => {
      setText("");
      invalidate();
    },
    onError: () => toast.error("Failed to submit comment"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => removeFn({ data: { id } }),
    onSuccess: invalidate,
    onError: () => toast.error("Failed to delete comment"),
  });

  return (
    <li
      className={`rounded-xl border bg-card p-5 ${post.isPinned ? "border-join" : "border-border"}`}
    >
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar
            name={post.authorName || "Admin"}
            path={post.authorAvatar}
            className="size-11 shrink-0 rounded-full text-sm"
          />
          <div className="min-w-0">
            <div className="truncate font-semibold">{post.authorName || "Admin"}</div>
            <div className="truncate text-sm text-muted-foreground">
              {formatDate(post.createdAt)} • {post.category}
            </div>
          </div>
        </div>
        {post.isPinned ? (
          <span className="flex shrink-0 items-center gap-2 text-sm font-semibold">
            <Pin className="size-4" /> Pinned
          </span>
        ) : null}
      </div>

      <h3 className="mt-4 flex items-center gap-2 text-xl font-bold">
        <span className="size-2.5 shrink-0 rounded-full bg-brand" />
        {post.title}
      </h3>
      {post.body ? (
        <p className="mt-2 text-[15px] leading-7 whitespace-pre-line text-foreground/90">
          {post.body}
        </p>
      ) : null}
      {post.coverUrl ? (
        <CoverImage
          path={post.coverUrl}
          alt={post.title}
          loading="lazy"
          className="mt-4 aspect-video w-full rounded-xl object-cover"
        />
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
        <button
          onClick={() => {
            if (!userId) {
              toast.error("Log in to like this post");
              return;
            }
            likeMutation.mutate();
          }}
          className={`flex items-center gap-2 transition-colors hover:text-foreground ${
            liked ? "font-bold text-brand" : ""
          }`}
        >
          <ThumbsUp className="size-4" /> {post.likeCount}
        </button>
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 transition-colors hover:text-foreground"
        >
          <MessageCircle className="size-4" /> {post.commentCount}
        </button>
      </div>

      {open ? (
        <div className="mt-4 border-t border-border pt-4">
          <ul className="space-y-4">
            {(commentsQuery.data?.comments ?? []).map((c) => (
              <li key={c.id} className="flex gap-3">
                <Avatar
                  name={c.authorName}
                  path={c.authorAvatar}
                  className="size-9 shrink-0 rounded-full text-xs"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-bold">{c.authorName}</span>
                    <span className="text-xs text-muted-foreground">{formatDate(c.createdAt)}</span>
                    {userId === c.userId ? (
                      <button
                        onClick={() => deleteMutation.mutate(c.id)}
                        className="ml-auto text-xs text-muted-foreground hover:text-destructive"
                      >
                        Delete
                      </button>
                    ) : null}
                  </div>
                  <p className="text-[15px] leading-6 whitespace-pre-line">{c.body}</p>
                </div>
              </li>
            ))}
            {commentsQuery.isLoading ? (
              <li className="text-sm text-muted-foreground">Loading…</li>
            ) : (commentsQuery.data?.comments ?? []).length === 0 ? (
              <li className="text-sm text-muted-foreground">No comments yet.</li>
            ) : null}
          </ul>

          {userId ? (
            <form
              className="mt-4 flex items-center gap-3"
              onSubmit={(e) => {
                e.preventDefault();
                if (!text.trim()) return;
                commentMutation.mutate(text.trim());
              }}
            >
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Write a comment…"
                aria-label="Comment"
                className="min-w-0 flex-1 rounded-lg border border-border bg-transparent px-3 py-2.5 text-[15px] outline-none focus:border-foreground"
              />
              <button
                type="submit"
                disabled={commentMutation.isPending || !text.trim()}
                aria-label="Send comment"
                className="rounded-lg bg-join p-2.5 text-join-foreground disabled:opacity-50"
              >
                <Send className="size-4" />
              </button>
            </form>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">
              <Link to="/auth" className="font-bold text-brand">
                Log in
              </Link>
              to comment and like posts.
            </p>
          )}
        </div>
      ) : null}
    </li>
  );
}
