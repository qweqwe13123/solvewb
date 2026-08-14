import { mediaUrl } from "@/lib/media";

/**
 * Cover image that renders a neutral placeholder block instead of a stock
 * fallback picture when no media has been uploaded.
 */
export function CoverImage({
  path,
  alt = "",
  className = "",
  width,
  height,
  loading,
}: {
  path?: string | null | undefined;
  alt?: string | undefined;
  className?: string | undefined;
  width?: number | undefined;
  height?: number | undefined;
  loading?: "lazy" | "eager" | undefined;
}) {
  const src = mediaUrl(path);
  if (!src) {
    return (
      <div
        aria-hidden
        className={`bg-gradient-to-br from-muted to-accent ${className}`}
      />
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading={loading}
      className={className}
    />
  );
}

function initials(name: string) {
  return name
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

/** Avatar that falls back to initials instead of a placeholder photo. */
export function Avatar({
  name,
  path,
  className = "",
}: {
  name: string;
  path?: string | null | undefined;
  className?: string | undefined;
}) {
  const src = mediaUrl(path);
  if (src) {
    return (
      <img src={src} alt={name} loading="lazy" className={`object-cover ${className}`} />
    );
  }
  return (
    <span
      aria-hidden
      className={`grid place-items-center bg-accent text-xs font-semibold text-muted-foreground ${className}`}
    >
      {initials(name) || "?"}
    </span>
  );
}
