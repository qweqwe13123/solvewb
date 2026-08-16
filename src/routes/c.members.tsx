import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getCommunity } from "@/lib/community.functions";
import { Avatar } from "@/components/Media";

export const Route = createFileRoute("/c/members")({
  head: () => ({
    meta: [
      { title: "Members — AI Video Bootcamp" },
      {
        name: "description",
        content: "Browse the AI Video Bootcamp member directory and connect with other creators.",
      },
      { property: "og:title", content: "AI Video Bootcamp members" },
      {
        property: "og:description",
        content: "100 AI creators building videos, ads and brands together.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Members,
});

const MEMBERS = [
  {
    name: "Daniel Riley",
    role: "Owner",
    bio: "Building AI video systems for brands. Teaching what works.",
  },
  {
    name: "Nitya Nakum",
    role: "Admin",
    bio: "Prompt engineer. Turning storyboards into finished AI films.",
  },
  { name: "Marcus Doyle", role: "Level 4", bio: "UGC ads with AI actors for DTC brands." },
  { name: "Elena Ruiz", role: "Level 3", bio: "Short-form creator, 1.2M views last month." },
  { name: "Ahmed Karim", role: "Level 3", bio: "Motion design + AI image pipelines." },
  { name: "Sofia Bianchi", role: "Level 2", bio: "Fashion AI campaigns from Milan." },
  { name: "Tom Becker", role: "Level 2", bio: "Learning Runway & Veo workflows." },
  { name: "Aiko Tanaka", role: "Level 1", bio: "New here — building my first AI influencer." },
];

function Members() {
  const fetchCommunity = useServerFn(getCommunity);
  const { data } = useQuery({ queryKey: ["community"], queryFn: () => fetchCommunity() });

  return (
    <div>
      <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-3">
        <Search className="size-4 shrink-0 text-muted-foreground" />
        <input
          placeholder="Search members"
          aria-label="Search members"
          className="w-full bg-transparent text-[15px] outline-none placeholder:text-muted-foreground"
        />
      </div>

      <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {MEMBERS.map((m) => (
          <li key={m.name} className="rounded-xl border border-border bg-card p-5">
            <div className="flex min-w-0 items-center gap-4">
              <Avatar name={m.name} className="size-14 shrink-0 rounded-full text-base" />
              <div className="min-w-0">
                <p className="truncate font-semibold">{m.name}</p>
                <p className="truncate text-sm text-muted-foreground">{m.role}</p>
              </div>
            </div>
            <p className="mt-4 line-clamp-2 text-[15px] leading-6 text-foreground/90">{m.bio}</p>
            <button className="mt-4 w-full rounded-lg border border-border py-2.5 text-sm font-semibold transition-colors hover:bg-accent">
              Chat
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
