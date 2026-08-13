import { useEffect, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useBodyScrollLock } from "./use-body-scroll-lock";

const LINKS = [
  { label: "Home", to: "/" as const },
  { label: "Services", to: "/services" as const },
  { label: "Courses", to: "/courses" as const },
  { label: "Subscriptions", to: "/subscriptions" as const },
  { label: "Refund Policy", to: "/refund-policy" as const },
  { label: "Reach Us", to: "/contact" as const },
] as const;

type MobileNavProps = {
  logoStyle?: CSSProperties;
  variant?: "light" | "dark";
};

export function MobileNav({ logoStyle, variant = "light" }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const isDark = variant === "dark";

  useBodyScrollLock(open);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const overlay =
    open && mounted ? (
      <div
        className="fixed inset-0 z-[9999] flex flex-col overscroll-none touch-none"
        style={{ background: isDark ? "#070b26" : "#0c0c0c" }}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation"
      >
        <div className="flex items-center justify-between px-5 py-5">
          <Link
            to="/"
            className="text-2xl tracking-tight text-white"
            style={logoStyle}
            onClick={() => setOpen(false)}
          >
            Solver<sup className="text-xs">®</sup>
          </Link>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-white"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex flex-1 flex-col justify-center gap-2 px-8">
          {LINKS.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className="py-3 text-2xl font-medium tracking-tight text-white transition-colors hover:text-white/70"
              style={{ fontFamily: "'Instrument Serif', serif" }}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    ) : null;

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`relative z-[10000] flex h-11 w-11 items-center justify-center rounded-full border transition-colors ${
          isDark
            ? "border-white/20 bg-black/30 text-white backdrop-blur-md"
            : "liquid-glass text-foreground"
        }`}
        aria-expanded={open}
        aria-label={open ? "Close menu" : "Open menu"}
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {overlay ? createPortal(overlay, document.body) : null}
    </div>
  );
}
