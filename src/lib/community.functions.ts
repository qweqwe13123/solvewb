import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { checkCustomerActiveSubscription } from "@/lib/stripe-webhook.server";
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
  ownerAvatar: string | null;
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

const DEFAULT_SUPABASE_URL = "https://bwxiiqpuhgcvouuqvmbi.supabase.co";
const DEFAULT_SUPABASE_PUBLISHABLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3eGlpcXB1aGdjdm91dXF2bWJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY2MzU0NDIsImV4cCI6MjEwMjIxMTQ0Mn0.OjMHVOCpkMYx4D1xmrk4u_G1TSmVNHD2SYyMsB_0ZM4";
const DESIGNATED_ADMIN_EMAIL = "turanoglumehmet1@gmail.com";
const BASE_MEMBER_COUNT = 100;
const FIXED_PRICE_LABEL = "$49/month";
const CURRENT_COURSE_TITLE = "Master AI Automation & Web Design + More";
const CURRENT_COURSE_SUMMARY = "Master AI Automation & Web Design + More";
const CURRENT_COURSE_DESCRIPTION = `Master AI Automation & Web Design
Build AI agents, automate businesses, create premium websites, and turn your skills into a profitable online business.
🚨 Founding Member Price: $49/month ‼️ Only available for the first 500 members. Once we hit 500 members, the price increases for all new members.
What's inside?
✅ 🤖 Build AI Agents & powerful automations
✅ 🌐 Design premium websites clients pay for
✅ ⚡ Automate real business workflows
✅ 🎨 Master modern UI/UX & web animations
✅ 🧠 Learn expert-level prompting
✅ 🔥 Stay up-to-date with the latest AI tools
✅ 💰 Build AI ads & digital systems brands pay for
✅ 📈 Learn client acquisition & lead generation
✅ 📁 Create real portfolio projects
✅ 💬 Private community, feedback & weekly updates
✅ 🎁 Exclusive templates, resources & challenges

Perfect if you're tired of:
❌ Guessing with AI
❌ Weak prompts & fake-looking results
❌ Repetitive manual work
❌ Not knowing how to get high-paying clients

⚡ Start today. Lock in $49/month.
That's only $1.60/day to stay ahead in AI Automation & Web Design.
✅ Cancel anytime.`;

function normalizePriceLabel(label: string | null | undefined) {
  const value = (label || "").trim();
  if (!value) return FIXED_PRICE_LABEL;
  if (/\b9\b|\$9(?:\/|\b)/i.test(value)) return FIXED_PRICE_LABEL;
  return value;
}

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

function mapProfile(row: ProfileRow): CommunityProfile {
  return {
    id: row.id,
    name: row.name,
    tagline: row.tagline,
    description: row.description,
    priceLabel: normalizePriceLabel(row.price_label),
    membersLabel: row.members_label,
    privacyLabel: row.privacy_label,
    ownerLabel: row.owner_label,
    ownerAvatar: (row as any).owner_avatar || null,
    coverUrl: row.cover_url,
    videoUrl: row.video_url,
    gallery: Array.isArray(row.gallery) ? (row.gallery as string[]) : [],
    body: row.body,
    handleLabel:
      row.handle_label && !row.handle_label.includes("skool.com")
        ? row.handle_label
        : "solverwebsite.com/courses",
    onlineLabel: row.online_label,
    adminsLabel: row.admins_label,
  };
}

async function getDisplayedMembersLabel(supabase: ReturnType<typeof publicClient>) {
  try {
    const { count, error } = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true });
    if (!error && typeof count === "number") {
      return `${BASE_MEMBER_COUNT + count} members`;
    }
  } catch {}

  return `${BASE_MEMBER_COUNT} members`;
}

function assertDesignatedAdmin(context: {
  claims?: { email?: string | null };
  user?: { email?: string | null };
}) {
  const email = (context.claims?.email || context.user?.email || "").toLowerCase().trim();
  if (email !== DESIGNATED_ADMIN_EMAIL.toLowerCase()) {
    throw new Error("Forbidden");
  }
}

function mapCourse(row: CourseRow, fallbackCoverUrl?: string | null): Course {
  const isLegacyCourse =
    /^(ryan|asdasd|asdasdasd)$/i.test(row.title.trim()) ||
    /^(ryan|asdasd|asdasdasd)$/i.test(row.summary.trim());
  return {
    id: row.id,
    slug: row.slug,
    title: isLegacyCourse ? CURRENT_COURSE_TITLE : row.title,
    summary: isLegacyCourse ? CURRENT_COURSE_SUMMARY : row.summary,
    description: isLegacyCourse ? CURRENT_COURSE_DESCRIPTION : row.description,
    priceLabel: normalizePriceLabel(row.price_label),
    coverUrl: fallbackCoverUrl || row.cover_url,
    videoUrl: row.video_url,
    gallery: Array.isArray(row.gallery) ? (row.gallery as string[]) : [],
    isPublished: row.is_published,
    sortOrder: row.sort_order,
  };
}

let inMemoryProfile: CommunityProfile = {
  id: "default-id",
  name: "AI Video Bootcamp",
  tagline: "How AI Content Creators Make Real Money",
  description:
    "Master AI Video & AI Image Creation. Then use your skill to make AI Adverts, Social Media Content and Films to earn 💰",
  priceLabel: FIXED_PRICE_LABEL,
  membersLabel: "100 members",
  privacyLabel: "Private",
  ownerLabel: "By Daniel Riley",
  ownerAvatar: null,
  coverUrl: "/assets/community-cover.jpg",
  videoUrl: null,
  gallery: [],
  body: "Master AI Video & AI Image Creation. Join 100 creators, monetise AI influencers and UGC ads.\n\nWelcome to the AI Video Bootcamp! In this community and course library, you will learn step-by-step how to create photorealistic AI videos, monetizable AI influencers, viral UGC ads, and short films.\n\nWhat you get inside:\n• Full Access to All Current & Future Courses\n• Private Creator Community & Feedback\n• Weekly Live Q&A and Breakdown Sessions\n• Prompt Templates, Workflow Guides & Cheat Sheets",
  handleLabel: "solverwebsite.com/courses",
  onlineLabel: "414",
  adminsLabel: "8",
};

let inMemoryCourses: Course[] = [
  {
    id: "c1",
    slug: "ai-video-mastery",
    title: CURRENT_COURSE_TITLE,
    summary: CURRENT_COURSE_SUMMARY,
    description: CURRENT_COURSE_DESCRIPTION,
    priceLabel: FIXED_PRICE_LABEL,
    coverUrl: "/assets/community-cover.jpg",
    videoUrl: null,
    gallery: [],
    isPublished: true,
    sortOrder: 1,
  },
];

export const getCommunity = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ profile: CommunityProfile; courses: Course[] }> => {
    try {
      const supabase = publicClient();
      const [profileRes, coursesRes, membersLabel] = await Promise.all([
        supabase.from("community_profile").select("*").limit(1).maybeSingle(),
        supabase
          .from("courses")
          .select("*")
          .eq("is_published", true)
          .order("sort_order", { ascending: true })
          .order("created_at", { ascending: true }),
        getDisplayedMembersLabel(supabase),
      ]);

      const fetchedProfile = profileRes.data
        ? { ...mapProfile(profileRes.data), membersLabel }
        : { ...inMemoryProfile, membersLabel };
      const fetchedCourses = (coursesRes.data ?? []).map((row) => mapCourse(row, fetchedProfile.coverUrl));

      if (fetchedProfile) {
        inMemoryProfile = { ...inMemoryProfile, ...fetchedProfile };
      }
      if (fetchedCourses.length > 0) {
        inMemoryCourses = fetchedCourses;
      }

      return {
        profile: { ...inMemoryProfile, ...fetchedProfile },
        courses: fetchedCourses.length > 0 ? fetchedCourses : inMemoryCourses,
      };
    } catch {
      return {
        profile: inMemoryProfile,
        courses: inMemoryCourses,
      };
    }
  },
);

export const getCourseBySlug = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => z.object({ slug: z.string().min(1) }).parse(data))
  .handler(async ({ data }): Promise<{ course: Course | null }> => {
    try {
      const supabase = publicClient();
      const [{ data: row }, { data: profileRow }] = await Promise.all([
        supabase
          .from("courses")
          .select("*")
          .eq("slug", data.slug)
          .eq("is_published", true)
          .maybeSingle(),
        supabase.from("community_profile").select("cover_url").limit(1).maybeSingle(),
      ]);
      if (row) return { course: mapCourse(row, profileRow?.cover_url || inMemoryProfile.coverUrl) };
    } catch {}

    const found = inMemoryCourses.find((c) => c.slug === data.slug);
    return { course: found ?? inMemoryCourses[0] ?? null };
  });

export const checkCommunityAccessFn = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => {
    const parsed = z
      .object({ userId: z.string().optional(), email: z.string().optional() })
      .safeParse(data || {});
    return parsed.success ? parsed.data : {};
  })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const userId = context.userId;
    const email = (context.claims?.email || context.user?.email || "").toString().toLowerCase().trim();
    if (email && email === DESIGNATED_ADMIN_EMAIL.toLowerCase()) {
      return { hasAccess: true, isAdmin: true, status: "admin" };
    }

    if (!userId && !email) {
      return { hasAccess: false, isAdmin: false, status: "unauthenticated" };
    }

    try {
      if (userId) {
        const { data: sub } = await supabaseAdmin
          .from("subscriptions")
          .select("status")
          .eq("user_id", userId)
          .in("status", ["active", "trialing"])
          .limit(1)
          .maybeSingle();

        if (sub && ["active", "trialing"].includes(sub.status)) {
          return { hasAccess: true, isAdmin: false, status: sub.status };
        }
      }

      if (email) {
        const { data: profile } = await supabaseAdmin
          .from("profiles")
          .select("id")
          .eq("email", email)
          .limit(1)
          .maybeSingle();

        if (profile?.id) {
          const { data: subByProfile } = await supabaseAdmin
            .from("subscriptions")
            .select("status")
            .eq("user_id", profile.id)
            .in("status", ["active", "trialing"])
            .limit(1)
            .maybeSingle();

          if (subByProfile && ["active", "trialing"].includes(subByProfile.status)) {
            return { hasAccess: true, isAdmin: false, status: subByProfile.status };
          }
        }

        // Live check against Stripe API to detect and sync active subscriptions immediately
        const hasLiveStripeSub = await Promise.race([
          checkCustomerActiveSubscription(email),
          new Promise<boolean>((resolve) => setTimeout(() => resolve(false), 3500)),
        ]);
        if (hasLiveStripeSub) {
          return { hasAccess: true, isAdmin: false, status: "active" };
        }
      }
    } catch (err) {
      console.warn("Could not check subscription access:", err);
    }

    return { hasAccess: false, isAdmin: false, status: "no_subscription" };
  });

/* ---------------- admin ---------------- */

export const adminGetCommunity = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(
    async ({ context }): Promise<{ profile: CommunityProfile | null; courses: Course[] }> => {
      assertDesignatedAdmin(context);
      await context.supabase.rpc("claim_admin_role");
      try {
        const [profileRes, coursesRes] = await Promise.all([
          context.supabase.from("community_profile").select("*").limit(1).maybeSingle(),
          context.supabase
            .from("courses")
            .select("*")
            .order("sort_order", { ascending: true })
            .order("created_at", { ascending: true }),
        ]);
        const fetchedProfile = profileRes.data ? mapProfile(profileRes.data) : null;
        const fetchedCourses = (coursesRes.data ?? []).map((row) => mapCourse(row, fetchedProfile?.coverUrl));

        if (fetchedProfile) inMemoryProfile = { ...inMemoryProfile, ...fetchedProfile };
        if (fetchedCourses.length > 0) inMemoryCourses = fetchedCourses;

        return {
          profile: fetchedProfile ? { ...inMemoryProfile, ...fetchedProfile } : inMemoryProfile,
          courses: fetchedCourses.length > 0 ? fetchedCourses : inMemoryCourses,

        };
      } catch {
        return {
          profile: inMemoryProfile,
          courses: inMemoryCourses,
        };
      }
    },
  );

const profileSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(120),
  tagline: z.string().max(5000),
  description: z.string().max(5000),
  priceLabel: z.string().max(60),
  membersLabel: z.string().max(60),
  privacyLabel: z.string().max(60),
  ownerLabel: z.string().max(120),
  ownerAvatar: z.string().nullable().optional(),
  coverUrl: z.string().nullable(),
  videoUrl: z.string().nullable(),
  gallery: z.array(z.string()).max(20),
  body: z.string().max(20000),
  handleLabel: z.string().max(160),
  onlineLabel: z.string().max(40),
  adminsLabel: z.string().max(40),
});

export const saveCommunityProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => profileSchema.parse(data))
  .handler(async ({ data, context }) => {
    assertDesignatedAdmin(context);
    await context.supabase.rpc("claim_admin_role");

    const payload: Record<string, any> = {
      name: data.name,
      tagline: data.tagline,
      description: data.description,
      price_label: normalizePriceLabel(data.priceLabel),
      members_label: data.membersLabel,
      privacy_label: data.privacyLabel,
      owner_label: data.ownerLabel,
      owner_avatar: data.ownerAvatar,
      cover_url: data.coverUrl,
      video_url: data.videoUrl,
      gallery: data.gallery,
      body: data.body,
      handle_label: data.handleLabel,
      online_label: data.onlineLabel,
      admins_label: data.adminsLabel,
    };

    try {
      let savedRow: ProfileRow;

      if (data.id && data.id !== "default-id") {
        const { data: row, error } = await context.supabase
          .from("community_profile")
          .update(payload as any)
          .eq("id", data.id)
          .select("*")
          .single();
        if (error || !row) throw error ?? new Error("Community profile was not found");
        savedRow = row;
      } else {
        const { data: existing, error: existingError } = await context.supabase
          .from("community_profile")
          .select("id")
          .limit(1)
          .maybeSingle();
        if (existingError) throw existingError;

        if (existing?.id) {
          const { data: row, error } = await context.supabase
            .from("community_profile")
            .update(payload as any)
            .eq("id", existing.id)
            .select("*")
            .single();
          if (error || !row) throw error ?? new Error("Community profile was not found");
          savedRow = row;
        } else {
          const { data: row, error } = await context.supabase
            .from("community_profile")
            .insert(payload as any)
            .select("*")
            .single();
          if (error || !row) throw error ?? new Error("Community profile was not created");
          savedRow = row;
        }
      }

      const savedProfile = mapProfile(savedRow);
      inMemoryProfile = { ...inMemoryProfile, ...savedProfile };
      return { ok: true, profile: savedProfile };
    } catch (err) {
      console.warn("Could not persist community_profile to DB:", err);
      throw new Error("Community settings were not saved in Supabase");
    }
  });

const courseSchema = z.object({
  id: z.string().uuid().nullable().optional(),
  slug: z
    .string()
    .min(1)
    .max(80)
    .regex(/^[a-z0-9-]+$/, "Только строчные латинские буквы, цифры и дефис"),
  title: z.string().min(1).max(160),
  summary: z.string().max(500),
  description: z.string().max(20000),
  priceLabel: z.string().max(60),
  coverUrl: z.string().nullable(),
  videoUrl: z.string().nullable(),
  gallery: z.array(z.string()).max(20),
  isPublished: z.boolean(),
  sortOrder: z.number().int().min(0).max(9999),
});

export const saveCourse = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => courseSchema.parse(data))
  .handler(async ({ data, context }) => {
    assertDesignatedAdmin(context);
    await context.supabase.rpc("claim_admin_role");

    const payload = {
      slug: data.slug,
      title: data.title,
      summary: data.summary,
      description: data.description,
      price_label: normalizePriceLabel(data.priceLabel),
      cover_url: data.coverUrl || inMemoryProfile.coverUrl,
      video_url: data.videoUrl,
      gallery: data.gallery,
      is_published: data.isPublished,
      sort_order: data.sortOrder,
    };

    const updatedCourse: Course = {
      id: data.id || `c-${Date.now()}`,
      slug: data.slug,
      title: data.title,
      summary: data.summary,
      description: data.description,
      priceLabel: normalizePriceLabel(data.priceLabel),
      coverUrl: data.coverUrl || inMemoryProfile.coverUrl,
      videoUrl: data.videoUrl,
      gallery: data.gallery,
      isPublished: data.isPublished,
      sortOrder: data.sortOrder,
    };

    try {
      if (data.id) {
        const { error } = await context.supabase.from("courses").update(payload as any).eq("id", data.id);
        if (error) throw error;
        const existingIndex = inMemoryCourses.findIndex(
          (c) => (data.id && c.id === data.id) || c.slug === data.slug,
        );
        if (existingIndex >= 0) {
          inMemoryCourses[existingIndex] = updatedCourse;
        } else {
          inMemoryCourses.push(updatedCourse);
        }
        return { id: data.id };
      }

      const { data: row, error } = await context.supabase
        .from("courses")
        .insert(payload as any)
        .select("id")
        .single();
      if (error) throw error;
      const existingIndex = inMemoryCourses.findIndex(
        (c) => (data.id && c.id === data.id) || c.slug === data.slug,
      );
      if (existingIndex >= 0) {
        inMemoryCourses[existingIndex] = updatedCourse;
      } else {
        inMemoryCourses.push(updatedCourse);
      }
      if (row) return { id: row.id };
    } catch (err) {
      console.warn("Could not persist course to DB:", err);
      throw new Error("Course was not saved in Supabase");
    }

    return { id: updatedCourse.id };
  });

export const deleteCourse = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ id: z.string() }).parse(data))
  .handler(async ({ data, context }) => {
    assertDesignatedAdmin(context);
    await context.supabase.rpc("claim_admin_role");
    try {
      const { error } = await context.supabase.from("courses").delete().eq("id", data.id);
      if (error) throw error;
      inMemoryCourses = inMemoryCourses.filter((c) => c.id !== data.id);
    } catch (err) {
      console.warn("Could not delete course from DB:", err);
      throw new Error("Course was not deleted in Supabase");
    }
    return { ok: true };
  });
