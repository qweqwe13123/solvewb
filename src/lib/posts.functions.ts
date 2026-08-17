import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";

export type Post = {
  id: string;
  title: string;
  body: string;
  category: string;
  coverUrl: string | null;
  isPinned: boolean;
  isPublished: boolean;
  authorId: string | null;
  authorName: string;
  authorAvatar: string | null;
  createdAt: string;
  likeCount: number;
  commentCount: number;
};

export type PostComment = {
  id: string;
  postId: string;
  userId: string;
  authorName: string;
  authorAvatar: string | null;
  body: string;
  createdAt: string;
};

type Row = Database["public"]["Tables"]["posts"]["Row"];

const DEFAULT_SUPABASE_URL = "https://bwxiiqpuhgcvouuqvmbi.supabase.co";
const DEFAULT_SUPABASE_PUBLISHABLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3eGlpcXB1aGdjdm91dXF2bWJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY2MzU0NDIsImV4cCI6MjEwMjIxMTQ0Mn0.OjMHVOCpkMYx4D1xmrk4u_G1TSmVNHD2SYyMsB_0ZM4";

function publicClient() {
  const url =
    process.env["SUPABASE_URL"] || process.env["VITE_SUPABASE_URL"] || DEFAULT_SUPABASE_URL;
  const key =
    process.env["SUPABASE_PUBLISHABLE_KEY"] ||
    process.env["VITE_SUPABASE_PUBLISHABLE_KEY"] ||
    DEFAULT_SUPABASE_PUBLISHABLE_KEY;
  return createClient<Database>(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
}

function map(row: Row, likes = 0, comments = 0): Post {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    category: row.category,
    coverUrl: row.cover_url,
    isPinned: row.is_pinned,
    isPublished: row.is_published,
    authorId: row.author_id,
    authorName: row.author_name,
    authorAvatar: row.author_avatar,
    createdAt: row.created_at,
    likeCount: likes,
    commentCount: comments,
  };
}

function tally(rows: { post_id: string }[]) {
  const counts = new Map<string, number>();
  for (const r of rows) counts.set(r.post_id, (counts.get(r.post_id) ?? 0) + 1);
  return counts;
}

export const listPosts = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ posts: Post[] }> => {
    const supabase = publicClient();
    const [postsRes, likesRes, commentsRes] = await Promise.all([
      supabase
        .from("posts")
        .select("*")
        .eq("is_published", true)
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false }),
      supabase.from("post_likes").select("post_id"),
      supabase.from("post_comments").select("post_id"),
    ]);
    const likes = tally(likesRes.data ?? []);
    const comments = tally(commentsRes.data ?? []);
    return {
      posts: (postsRes.data ?? []).map((r) =>
        map(r, likes.get(r.id) ?? 0, comments.get(r.id) ?? 0),
      ),
    };
  },
);

export const listComments = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => z.object({ postId: z.string().uuid() }).parse(data))
  .handler(async ({ data }): Promise<{ comments: PostComment[] }> => {
    const { data: rows } = await publicClient()
      .from("post_comments")
      .select("*")
      .eq("post_id", data.postId)
      .order("created_at", { ascending: true });
    return {
      comments: (rows ?? []).map((r) => ({
        id: r.id,
        postId: r.post_id,
        userId: r.user_id,
        authorName: r.author_name,
        authorAvatar: r.author_avatar,
        body: r.body,
        createdAt: r.created_at,
      })),
    };
  });

export const listMyLikes = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ postIds: string[] }> => {
    const { data } = await context.supabase
      .from("post_likes")
      .select("post_id")
      .eq("user_id", context.userId);
    return { postIds: (data ?? []).map((r) => r.post_id) };
  });

export const toggleLike = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ postId: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }): Promise<{ liked: boolean }> => {
    const { data: existing } = await context.supabase
      .from("post_likes")
      .select("id")
      .eq("post_id", data.postId)
      .eq("user_id", context.userId)
      .maybeSingle();

    if (existing) {
      await context.supabase.from("post_likes").delete().eq("id", existing.id);
      return { liked: false };
    }
    const { error } = await context.supabase
      .from("post_likes")
      .insert({ post_id: data.postId, user_id: context.userId });
    if (error) throw new Error("Не удалось поставить лайк");
    return { liked: true };
  });

export const addComment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({ postId: z.string().uuid(), body: z.string().trim().min(1).max(4000) }).parse(data),
  )
  .handler(async ({ data, context }) => {
    const meta = (context.claims as { user_metadata?: Record<string, unknown> } | null)
      ?.user_metadata;
    const name =
      (meta?.["full_name"] as string | undefined) ??
      (meta?.["name"] as string | undefined) ??
      (context.claims as { email?: string } | null)?.email ??
      "Member";
    const avatar = (meta?.["avatar_url"] as string | undefined) ?? null;

    const { error } = await context.supabase.from("post_comments").insert({
      post_id: data.postId,
      user_id: context.userId,
      body: data.body,
      author_name: name,
      author_avatar: avatar,
    });
    if (error) throw new Error("Failed to submit comment");
    return { ok: true };
  });

export const deleteComment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const email = (context.claims?.email || context.user?.email || "").toLowerCase().trim();
    const isAdmin = email === "turanoglumehmet1@gmail.com";
    if (isAdmin) {
      const { error } = await context.supabase.rpc("claim_admin_role");
      if (error) throw new Error("Unable to verify administrator permissions");
    }

    const { data: comment, error: commentError } = await context.supabase
      .from("post_comments")
      .select("user_id")
      .eq("id", data.id)
      .maybeSingle();
    if (commentError || !comment) throw new Error("Comment was not found");
    if (!isAdmin && comment.user_id !== context.userId) throw new Error("Forbidden");

    const { error } = await context.supabase.from("post_comments").delete().eq("id", data.id);
    if (error) throw new Error("Failed to delete comment");
    return { ok: true };
  });

/* ---------------- admin ---------------- */

export const adminListPosts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ posts: Post[] }> => {
    const [postsRes, likesRes, commentsRes] = await Promise.all([
      context.supabase
        .from("posts")
        .select("*")
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false }),
      context.supabase.from("post_likes").select("post_id"),
      context.supabase.from("post_comments").select("post_id"),
    ]);
    const likes = tally(likesRes.data ?? []);
    const comments = tally(commentsRes.data ?? []);
    return {
      posts: (postsRes.data ?? []).map((r) =>
        map(r, likes.get(r.id) ?? 0, comments.get(r.id) ?? 0),
      ),
    };
  });

const postSchema = z.object({
  id: z.string().uuid().nullable(),
  title: z.string().trim().min(1).max(200),
  body: z.string().max(20000),
  category: z.string().min(1).max(80),
  coverUrl: z.string().max(500).nullable(),
  isPinned: z.boolean(),
  isPublished: z.boolean(),
});

export const savePost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => postSchema.parse(data))
  .handler(async ({ data, context }) => {
    const payload = {
      title: data.title,
      body: data.body,
      category: data.category,
      cover_url: data.coverUrl,
      is_pinned: data.isPinned,
      is_published: data.isPublished,
    };

    if (data.id) {
      const { error } = await context.supabase.from("posts").update(payload).eq("id", data.id);
      if (error) throw new Error("Не удалось сохранить пост");
      return { id: data.id };
    }

    const meta = (context.claims as { user_metadata?: Record<string, unknown> } | null)
      ?.user_metadata;
    const name =
      (meta?.["full_name"] as string | undefined) ??
      (meta?.["name"] as string | undefined) ??
      (context.claims as { email?: string } | null)?.email ??
      "Admin";

    const { data: row, error } = await context.supabase
      .from("posts")
      .insert({
        ...payload,
        author_id: context.userId,
        author_name: name,
        author_avatar: (meta?.["avatar_url"] as string | undefined) ?? null,
      })
      .select("id")
      .single();
    if (error) throw new Error("Не удалось создать пост");
    return { id: row.id };
  });

export const deletePost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const email = (context.claims?.email || context.user?.email || "").toLowerCase().trim();
    if (email !== "turanoglumehmet1@gmail.com") throw new Error("Forbidden");

    const { error: roleError } = await context.supabase.rpc("claim_admin_role");
    if (roleError) throw new Error("Unable to verify administrator permissions");

    const { data: post, error: postError } = await context.supabase
      .from("posts")
      .select("author_id")
      .eq("id", data.id)
      .maybeSingle();
    if (postError || !post) throw new Error("Post was not found");
    if (post.author_id !== context.userId) throw new Error("You can delete only your own posts");

    const { error } = await context.supabase
      .from("posts")
      .delete()
      .eq("id", data.id)
      .eq("author_id", context.userId);
    if (error) throw new Error("Failed to delete post");
    return { ok: true };
  });
