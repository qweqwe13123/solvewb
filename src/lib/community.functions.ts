import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";

export type CommunityProfile = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  priceLabel: string;
  membersLabel: string;
  privacyLabel: string;
  ownerLabel: string;
  coverUrl: string | null;
  videoUrl: string | null;
  gallery: string[];
  body: string;
  handleLabel: string;
  onlineLabel: string;
  adminsLabel: string;
};

export type Course = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: string;
  priceLabel: string;
  coverUrl: string | null;
  videoUrl: string | null;
  gallery: string[];
  isPublished: boolean;
  sortOrder: number;
};

type ProfileRow = Database["public"]["Tables"]["community_profile"]["Row"];
type CourseRow = Database["public"]["Tables"]["courses"]["Row"];

function publicClient() {
  return createClient<Database>(
    process.env["SUPABASE_URL"]!,
    process.env["SUPABASE_PUBLISHABLE_KEY"]!,
    { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
  );
}

function mapProfile(row: ProfileRow): CommunityProfile {
  return {
    id: row.id,
    name: row.name,
    tagline: row.tagline,
    description: row.description,
    priceLabel: row.price_label,
    membersLabel: row.members_label,
    privacyLabel: row.privacy_label,
    ownerLabel: row.owner_label,
    coverUrl: row.cover_url,
    videoUrl: row.video_url,
    gallery: Array.isArray(row.gallery) ? (row.gallery as string[]) : [],
    body: row.body,
    handleLabel: row.handle_label,
    onlineLabel: row.online_label,
    adminsLabel: row.admins_label,
  };
}

function mapCourse(row: CourseRow): Course {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    description: row.description,
    priceLabel: row.price_label,
    coverUrl: row.cover_url,
    videoUrl: row.video_url,
    gallery: Array.isArray(row.gallery) ? (row.gallery as string[]) : [],
    isPublished: row.is_published,
    sortOrder: row.sort_order,
  };
}

export const getCommunity = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ profile: CommunityProfile | null; courses: Course[] }> => {
    const supabase = publicClient();
    const [profileRes, coursesRes] = await Promise.all([
      supabase.from("community_profile").select("*").limit(1).maybeSingle(),
      supabase
        .from("courses")
        .select("*")
        .eq("is_published", true)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true }),
    ]);

    return {
      profile: profileRes.data ? mapProfile(profileRes.data) : null,
      courses: (coursesRes.data ?? []).map(mapCourse),
    };
  },
);

export const getCourseBySlug = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => z.object({ slug: z.string().min(1) }).parse(data))
  .handler(async ({ data }): Promise<{ course: Course | null }> => {
    const supabase = publicClient();
    const { data: row } = await supabase
      .from("courses")
      .select("*")
      .eq("slug", data.slug)
      .eq("is_published", true)
      .maybeSingle();
    return { course: row ? mapCourse(row) : null };
  });

/* ---------------- admin ---------------- */

export const adminGetCommunity = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ profile: CommunityProfile | null; courses: Course[] }> => {
    const [profileRes, coursesRes] = await Promise.all([
      context.supabase.from("community_profile").select("*").limit(1).maybeSingle(),
      context.supabase
        .from("courses")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true }),
    ]);
    return {
      profile: profileRes.data ? mapProfile(profileRes.data) : null,
      courses: (coursesRes.data ?? []).map(mapCourse),
    };
  });

const profileSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(120),
  tagline: z.string().max(300),
  description: z.string().max(5000),
  priceLabel: z.string().max(60),
  membersLabel: z.string().max(60),
  privacyLabel: z.string().max(60),
  ownerLabel: z.string().max(120),
  coverUrl: z.string().max(500).nullable(),
  videoUrl: z.string().max(500).nullable(),
  gallery: z.array(z.string().max(500)).max(20),
  body: z.string().max(20000),
  handleLabel: z.string().max(160),
  onlineLabel: z.string().max(40),
  adminsLabel: z.string().max(40),
});

export const saveCommunityProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => profileSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("community_profile")
      .update({
        name: data.name,
        tagline: data.tagline,
        description: data.description,
        price_label: data.priceLabel,
        members_label: data.membersLabel,
        privacy_label: data.privacyLabel,
        owner_label: data.ownerLabel,
        cover_url: data.coverUrl,
        video_url: data.videoUrl,
        gallery: data.gallery,
        body: data.body,
        handle_label: data.handleLabel,
        online_label: data.onlineLabel,
        admins_label: data.adminsLabel,
      })
      .eq("id", data.id);
    if (error) throw new Error("Не удалось сохранить профиль сообщества");
    return { ok: true };
  });

const courseSchema = z.object({
  id: z.string().uuid().nullable(),
  slug: z
    .string()
    .min(1)
    .max(80)
    .regex(/^[a-z0-9-]+$/, "Только строчные латинские буквы, цифры и дефис"),
  title: z.string().min(1).max(160),
  summary: z.string().max(500),
  description: z.string().max(20000),
  priceLabel: z.string().max(60),
  coverUrl: z.string().max(500).nullable(),
  videoUrl: z.string().max(500).nullable(),
  gallery: z.array(z.string().max(500)).max(20),
  isPublished: z.boolean(),
  sortOrder: z.number().int().min(0).max(9999),
});

export const saveCourse = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => courseSchema.parse(data))
  .handler(async ({ data, context }) => {
    const payload = {
      slug: data.slug,
      title: data.title,
      summary: data.summary,
      description: data.description,
      price_label: data.priceLabel,
      cover_url: data.coverUrl,
      video_url: data.videoUrl,
      gallery: data.gallery,
      is_published: data.isPublished,
      sort_order: data.sortOrder,
    };

    if (data.id) {
      const { error } = await context.supabase.from("courses").update(payload).eq("id", data.id);
      if (error) throw new Error("Не удалось сохранить курс");
      return { id: data.id };
    }

    const { data: row, error } = await context.supabase
      .from("courses")
      .insert(payload)
      .select("id")
      .single();
    if (error) throw new Error("Не удалось создать курс");
    return { id: row.id };
  });

export const deleteCourse = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("courses").delete().eq("id", data.id);
    if (error) throw new Error("Не удалось удалить курс");
    return { ok: true };
  });
