import { supabase } from "@/integrations/supabase/client";

const STORAGE_BUCKET = "community-media";
const SUPABASE_STORAGE_BASE = "https://bwxiiqpuhgcvouuqvmbi.supabase.co/storage/v1/object/public";

/** Turns a stored media path into a public URL served by the app or Supabase. */
export function mediaUrl(path: string | null | undefined, fallback?: string) {
  if (!path) return fallback ?? "";
  if (/^(https?:\/\/|data:|\/assets\/)/i.test(path)) return path;
  if (path.startsWith("/")) return path;
  return `${SUPABASE_STORAGE_BASE}/${STORAGE_BUCKET}/${path.replace(/^\/+/, "")}`;
}

export async function uploadMedia(file: File, folder: string): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;

  try {
    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(path, file, { cacheControl: "3600", upsert: true, contentType: file.type || "application/octet-stream" });
    if (!error) {
      return path;
    }
  } catch {}

  // Fallback to Data URL for any image/file format (png, jpg, webp, heic, gif, svg, avif, etc.)
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Unable to read file"));
    reader.readAsDataURL(file);
  });
}
