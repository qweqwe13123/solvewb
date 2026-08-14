import { supabase } from "@/integrations/supabase/client";

/** Turns a stored media path into a public URL served by the app. */
export function mediaUrl(path: string | null | undefined, fallback?: string) {
  if (!path) return fallback ?? "";
  if (/^https?:\/\//i.test(path)) return path;
  return `/api/public/media/${path.replace(/^\/+/, "")}`;
}

export async function uploadMedia(file: File, folder: string): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from("community-media")
    .upload(path, file, { cacheControl: "3600", upsert: false, contentType: file.type });
  if (error) throw new Error(error.message);
  return path;
}
