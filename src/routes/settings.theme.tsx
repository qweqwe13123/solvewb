import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, ChevronUp } from "lucide-react";
import { SettingsCard } from "@/components/settings/SettingsCard";

export const Route = createFileRoute("/settings/theme")({
  head: () => ({
    meta: [
      { title: "Theme — AI Video Bootcamp" },
      { name: "description", content: "Choose light, dark or system appearance." },
      { property: "og:title", content: "Theme settings" },
      { property: "og:description", content: "Choose light, dark or system appearance." },
    ],
  }),
  component: ThemePage,
});

const options = [
  { id: "light", label: "Light (default)" },
  { id: "dark", label: "Dark" },
  { id: "system", label: "System" },
] as const;

type ThemeId = (typeof options)[number]["id"];

function applyTheme(theme: ThemeId) {
  const dark =
    theme === "dark" ||
    (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
  localStorage.setItem("theme", theme);
}

function ThemePage() {
  const [theme, setTheme] = useState<ThemeId>("light");
  const [open, setOpen] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("theme") as ThemeId | null;
    if (stored) setTheme(stored);
  }, []);

  const current = options.find((o) => o.id === theme)!;

  return (
    <SettingsCard title="Theme">
      <div className="relative max-w-xl">
        <button
          onClick={() => setOpen((v) => !v)}
          className="relative flex w-full items-center justify-between rounded-md border-2 border-foreground px-4 py-4 text-left"
        >
          <span className="absolute -top-2.5 left-3 bg-card px-1 text-xs text-muted-foreground">
            Theme
          </span>
          <span className="text-[17px]">{current.label}</span>
          <ChevronUp className={`size-5 transition-transform ${open ? "" : "rotate-180"}`} />
        </button>

        {open ? (
          <ul className="mt-2 overflow-hidden rounded-lg border border-border bg-card shadow-lg">
            {options.map((o) => (
              <li key={o.id}>
                <button
                  onClick={() => {
                    setTheme(o.id);
                    applyTheme(o.id);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between px-4 py-4 text-left text-[16px] font-bold transition-colors ${
                    theme === o.id ? "bg-join text-join-foreground" : "hover:bg-accent"
                  }`}
                >
                  {o.label}
                  {theme === o.id ? <Check className="size-4" /> : null}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </SettingsCard>
  );
}
