import { useState } from "react";
import { Upload, X } from "lucide-react";
import { toast } from "sonner";
import { mediaUrl, uploadMedia } from "@/lib/media";

export function Text({
  label,
  value,
  type = "text",
  onChange,
}: {
  label: string;
  value: string;
  type?: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-muted-foreground">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 w-full rounded-md border border-border bg-transparent px-3 py-2.5 text-[15px] outline-none focus:border-foreground"
      />
    </label>
  );
}

export function Area({
  label,
  value,
  rows,
  onChange,
}: {
  label: string;
  value: string;
  rows: number;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-muted-foreground">{label}</span>
      <textarea
        value={value}
        rows={rows}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 w-full resize-y rounded-md border border-border bg-transparent px-3 py-2.5 text-[15px] leading-6 outline-none focus:border-foreground"
      />
    </label>
  );
}

export function ImageField({
  label,
  folder,
  value,
  onChange,
}: {
  label: string;
  folder: string;
  value: string | null;
  onChange: (v: string | null) => void;
}) {
  const [busy, setBusy] = useState(false);

  async function handle(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    try {
      onChange(await uploadMedia(file, folder));
    } catch {
      toast.error("Failed to upload file");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <span className="text-sm font-bold text-muted-foreground">{label}</span>
      <div className="mt-1.5 rounded-md border border-border p-3">
        {value ? (
          <img
            src={mediaUrl(value)}
            alt={label}
            className="aspect-video w-full rounded object-cover"
          />
        ) : (
          <div className="grid aspect-video w-full place-items-center rounded bg-muted text-sm text-muted-foreground">
            No cover uploaded
          </div>
        )}
        <div className="mt-3 flex items-center gap-2">
          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-bold transition-colors hover:bg-accent">
            <Upload className="size-4" />
            {busy ? "Uploading…" : "Upload"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handle(e.target.files?.[0])}
            />
          </label>
          {value ? (
            <button
              type="button"
              aria-label="Remove cover"
              onClick={() => onChange(null)}
              className="rounded-lg border border-border p-2 transition-colors hover:bg-accent"
            >
              <X className="size-4" />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
