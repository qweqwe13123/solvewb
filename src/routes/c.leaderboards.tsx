import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getCommunity } from "@/lib/community.functions";
import { Avatar } from "@/components/Media";

export const Route = createFileRoute("/c/leaderboards")({
  head: () => ({
    meta: [
      { title: "Leaderboards — AI Video Bootcamp" },
      { name: "description", content: "Weekly, monthly and all-time points leaderboards for AI Video Bootcamp members." },
      { property: "og:title", content: "AI Video Bootcamp leaderboards" },
      { property: "og:description", content: "Earn points by posting, commenting and shipping AI videos." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Leaderboards,
});

const RANGES = ["7-day", "30-day", "All-time"] as const;

const DATA: Record<(typeof RANGES)[number], { name: string; points: number }[]> = {
  "7-day": [
    { name: "Nitya Nakum", points: 312 },
    { name: "Marcus Doyle", points: 288 },
    { name: "Elena Ruiz", points: 254 },
    { name: "Ahmed Karim", points: 231 },
    { name: "Sofia Bianchi", points: 190 },
    { name: "Tom Becker", points: 173 },
    { name: "Aiko Tanaka", points: 150 },
  ],
  "30-day": [
    { name: "Nitya Nakum", points: 1191 },
    { name: "Marcus Doyle", points: 904 },
    { name: "Elena Ruiz", points: 877 },
    { name: "Ahmed Karim", points: 812 },
    { name: "Sofia Bianchi", points: 790 },
    { name: "Tom Becker", points: 655 },
    { name: "Aiko Tanaka", points: 540 },
  ],
  "All-time": [
    { name: "Marcus Doyle", points: 12840 },
    { name: "Nitya Nakum", points: 11902 },
    { name: "Elena Ruiz", points: 9877 },
    { name: "Sofia Bianchi", points: 8120 },
    { name: "Ahmed Karim", points: 7790 },
    { name: "Aiko Tanaka", points: 6655 },
    { name: "Tom Becker", points: 5540 },
  ],
};

function Leaderboards() {
  const [range, setRange] = useState<(typeof RANGES)[number]>("30-day");
  const fetchCommunity = useServerFn(getCommunity);
  const { data } = useQuery({ queryKey: ["community"], queryFn: () => fetchCommunity() });
  const rows = DATA[range];

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <section className="rounded-xl border border-border bg-card p-5">
        <div className="flex flex-wrap items-center gap-3">
          {RANGES.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`rounded-full border px-5 py-2.5 text-[15px] transition-colors ${
                r === range
                  ? "border-transparent bg-muted-foreground/80 font-medium text-background"
                  : "border-border hover:bg-accent"
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        <ol className="mt-5 divide-y divide-border">
          {rows.map((m, i) => (
            <li key={m.name} className="flex items-center gap-4 py-4">
              <span
                className={`grid size-8 shrink-0 place-items-center rounded-full text-sm font-bold ${
                  i < 3 ? "bg-join text-join-foreground" : "bg-accent text-muted-foreground"
                }`}
              >
                {i + 1}
              </span>
              <Avatar name={m.name} className="size-10 shrink-0 rounded-full text-xs" />
              <span className="min-w-0 flex-1 truncate text-[15px] font-medium">{m.name}</span>
              <span className="shrink-0 font-semibold text-brand">+{m.points}</span>
            </li>
          ))}
        </ol>
      </section>

      <aside className="rounded-xl border border-border bg-card p-5">
        <h2 className="font-bold">Levels</h2>
        <ul className="mt-4 space-y-3 text-[15px]">
          {[
            "Level 1 — Newcomer (0%)",
            "Level 2 — Contributor (18%)",
            "Level 3 — Creator (7%)",
            "Level 4 — Pro (3%)",
            "Level 5 — Legend (1%)",
          ].map((l) => (
            <li key={l} className="flex items-center gap-3">
              <span className="size-2.5 shrink-0 rounded-full bg-brand" />
              <span className="min-w-0 truncate">{l}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-muted-foreground">
          Points are earned when other members like your posts and comments.
        </p>
      </aside>
    </div>
  );
}
