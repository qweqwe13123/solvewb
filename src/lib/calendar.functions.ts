import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";

export type CalendarEvent = {
  id: string;
  title: string;
  description: string;
  startsAt: string;
  durationMinutes: number;
  linkUrl: string | null;
  isPublished: boolean;
};

type Row = Database["public"]["Tables"]["calendar_events"]["Row"];

const DEFAULT_SUPABASE_URL = "https://bwxiiqpuhgcvouuqvmbi.supabase.co";
const DEFAULT_SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3eGlpcXB1aGdjdm91dXF2bWJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY2MzU0NDIsImV4cCI6MjEwMjIxMTQ0Mn0.OjMHVOCpkMYx4D1xmrk4u_G1TSmVNHD2SYyMsB_0ZM4";

function publicClient() {
  const url = process.env["SUPABASE_URL"] || process.env["VITE_SUPABASE_URL"] || DEFAULT_SUPABASE_URL;
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"] || process.env["VITE_SUPABASE_PUBLISHABLE_KEY"] || DEFAULT_SUPABASE_PUBLISHABLE_KEY;
  return createClient<Database>(url, key, { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } });
}

function map(row: Row): CalendarEvent {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    startsAt: row.starts_at,
    durationMinutes: row.duration_minutes,
    linkUrl: row.link_url,
    isPublished: row.is_published,
  };
}

export const listEvents = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ events: CalendarEvent[] }> => {
    const { data } = await publicClient()
      .from("calendar_events")
      .select("*")
      .eq("is_published", true)
      .order("starts_at", { ascending: true });
    return { events: (data ?? []).map(map) };
  },
);

export const adminListEvents = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ events: CalendarEvent[] }> => {
    const { data } = await context.supabase
      .from("calendar_events")
      .select("*")
      .order("starts_at", { ascending: true });
    return { events: (data ?? []).map(map) };
  });

const eventSchema = z.object({
  id: z.string().uuid().nullable(),
  title: z.string().min(1).max(160),
  description: z.string().max(5000),
  startsAt: z.string().min(1),
  durationMinutes: z.number().int().min(5).max(1440),
  linkUrl: z.string().max(500).nullable(),
  isPublished: z.boolean(),
});

export const saveEvent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => eventSchema.parse(data))
  .handler(async ({ data, context }) => {
    const payload = {
      title: data.title,
      description: data.description,
      starts_at: new Date(data.startsAt).toISOString(),
      duration_minutes: data.durationMinutes,
      link_url: data.linkUrl,
      is_published: data.isPublished,
    };
    if (data.id) {
      const { error } = await context.supabase
        .from("calendar_events")
        .update(payload)
        .eq("id", data.id);
      if (error) throw new Error("Не удалось сохранить событие");
      return { id: data.id };
    }
    const { data: row, error } = await context.supabase
      .from("calendar_events")
      .insert(payload)
      .select("id")
      .single();
    if (error) throw new Error("Не удалось создать событие");
    return { id: row.id };
  });

export const deleteEvent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("calendar_events").delete().eq("id", data.id);
    if (error) throw new Error("Не удалось удалить событие");
    return { ok: true };
  });
