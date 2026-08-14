import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";

export type ClassroomClass = {
  id: string;
  title: string;
  description: string;
  coverUrl: string | null;
  sortOrder: number;
  isPublished: boolean;
};

type Row = Database["public"]["Tables"]["classroom_classes"]["Row"];

function publicClient() {
  return createClient<Database>(
    process.env["SUPABASE_URL"]!,
    process.env["SUPABASE_PUBLISHABLE_KEY"]!,
    { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
  );
}

function map(row: Row): ClassroomClass {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    coverUrl: row.cover_url,
    sortOrder: row.sort_order,
    isPublished: row.is_published,
  };
}

export const listClasses = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ classes: ClassroomClass[] }> => {
    const { data } = await publicClient()
      .from("classroom_classes")
      .select("*")
      .eq("is_published", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    return { classes: (data ?? []).map(map) };
  },
);

export const adminListClasses = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ classes: ClassroomClass[] }> => {
    const { data } = await context.supabase
      .from("classroom_classes")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    return { classes: (data ?? []).map(map) };
  });

const classSchema = z.object({
  id: z.string().uuid().nullable(),
  title: z.string().min(1).max(160),
  description: z.string().max(5000),
  coverUrl: z.string().max(500).nullable(),
  sortOrder: z.number().int().min(0).max(9999),
  isPublished: z.boolean(),
});

export const saveClass = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => classSchema.parse(data))
  .handler(async ({ data, context }) => {
    const payload = {
      title: data.title,
      description: data.description,
      cover_url: data.coverUrl,
      sort_order: data.sortOrder,
      is_published: data.isPublished,
    };
    if (data.id) {
      const { error } = await context.supabase
        .from("classroom_classes")
        .update(payload)
        .eq("id", data.id);
      if (error) throw new Error("Не удалось сохранить класс");
      return { id: data.id };
    }
    const { data: row, error } = await context.supabase
      .from("classroom_classes")
      .insert(payload)
      .select("id")
      .single();
    if (error) throw new Error("Не удалось создать класс");
    return { id: row.id };
  });

export const deleteClass = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("classroom_classes")
      .delete()
      .eq("id", data.id);
    if (error) throw new Error("Не удалось удалить класс");
    return { ok: true };
  });
