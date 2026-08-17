import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Pin, MessageCircle, ThumbsUp, Send, Trash2 } from "lucide-react";
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
  deletePost,
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
              <PostCard
                key={p.id}
                post={p}
                liked={likedIds.has(p.id)}
                userId={user?.id ?? null}
                isAdmin={Boolean(adminQuery.data?.isAdmin)}
              />
            ))}
          </ul>
        )}
      </section>

      <CommunitySidebar />
    </div>
  );
}

function PostCard({
  post,
  liked,
  userId,
  isAdmin,
}: {
  post: Post;
  liked: boolean;
  userId: string | null;
  isAdmin: boolean;
}) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");

  const likeFn = useServerFn(toggleLike);
  const fetchComments = useServerFn(listComments);
  const addFn = useServerFn(addComment);
  const removeFn = useServerFn(deleteComment);
  const removePostFn = useServerFn(deletePost);

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
    onMutate: async () => {
      await Promise.all([
        qc.cancelQueries({ queryKey: ["posts"] }),
        qc.cancelQueries({ queryKey: ["my-likes"] }),
      ]);

      const previousPosts = qc.getQueryData<{ posts: Post[] }>(["posts"]);
      const previousLikes = qc.getQueryData<{ postIds: string[] }>(["my-likes"]);
      const nextLiked = !liked;

      qc.setQueryData<{ posts: Post[] }>(["posts"], (current) => {
        if (!current) return current;
        return {
          ...current,
          posts: current.posts.map((item) =>
            item.id === post.id
              ? { ...item, likeCount: Math.max(0, item.likeCount + (nextLiked ? 1 : -1)) }
              : item,
          ),
        };
      });
      qc.setQueryData<{ postIds: string[] }>(["my-likes"], (current) => {
        const postIds = current?.postIds ?? [];
        return {
          postIds: nextLiked
            ? Array.from(new Set([...postIds, post.id]))
            : postIds.filter((id) => id !== post.id),
        };
      });

      return { previousPosts, previousLikes };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousPosts) qc.setQueryData(["posts"], context.previousPosts);
      if (context?.previousLikes) qc.setQueryData(["my-likes"], context.previousLikes);
      toast.error("Failed to update like");
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["posts"] });
      qc.invalidateQueries({ queryKey: ["my-likes"] });
    },
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
    onSuccess: () => {
      invalidate();
      toast.success("Comment deleted");
    },
    onError: (error: Error) => toast.error(error.message || "Failed to delete comment"),
  });

  const deletePostMutation = useMutation({
    mutationFn: () => removePostFn({ data: { id: post.id } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["posts"] });
      toast.success("Post deleted");
    },
    onError: (error: Error) => toast.error(error.message || "Failed to delete post"),
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
        <div className="flex shrink-0 items-center gap-2">
          {post.isPinned ? (
            <span className="flex items-center gap-2 text-sm font-semibold">
              <Pin className="size-4" /> Pinned
            </span>
          ) : null}
          {isAdmin && post.authorId === userId ? (
            <button
              type="button"
              aria-label={`Delete post ${post.title}`}
              disabled={deletePostMutation.isPending}
              onClick={() => {
                if (confirm(`Delete the post “${post.title}”? This cannot be undone.`)) {
                  deletePostMutation.mutate();
                }
              }}
              className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
            >
              <Trash2 className="size-4" />
            </button>
          ) : null}
        </div>
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
          type="button"
          disabled={likeMutation.isPending}
          onClick={() => {
            if (!userId) {
              toast.error("Log in to like this post");
              return;
            }
            if (!likeMutation.isPending) likeMutation.mutate();
          }}
          className={`flex items-center gap-2 transition-colors hover:text-foreground disabled:cursor-wait disabled:opacity-70 ${
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
                    {isAdmin || userId === c.userId ? (
                      <button
                        type="button"
                        disabled={deleteMutation.isPending}
                        onClick={() => {
                          if (confirm("Delete this comment? This cannot be undone.")) {
                            deleteMutation.mutate(c.id);
                          }
                        }}
                        className="ml-auto rounded px-1.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
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
