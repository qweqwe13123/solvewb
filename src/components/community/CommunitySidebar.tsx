import { Link as LinkIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getCommunity } from "@/lib/community.functions";
import { Avatar, CoverImage } from "@/components/Media";

const LINKS = ["Instagram", "Youtube", "Join The Skool Games"];

const LEADERS = [
  { rank: 1, name: "Nitya Nakum 🔥", points: "+1191" },
  { rank: 2, name: "Marcus Doyle", points: "+904" },
  { rank: 3, name: "Elena Ruiz", points: "+877" },
  { rank: 4, name: "Ahmed Karim", points: "+812" },
  { rank: 5, name: "Sofia Bianchi", points: "+790" },
];

export function CommunitySidebar() {
  const fetchCommunity = useServerFn(getCommunity);
  const { data } = useQuery({ queryKey: ["community"], queryFn: () => fetchCommunity() });
  const profile = data?.profile ?? null;
  const courses = data?.courses ?? [];

  const name = courses[0]?.title || profile?.name || "AI Video Bootcamp";
  const coverPath = courses[0]?.coverUrl ?? profile?.coverUrl ?? null;
  const membersLabel = (profile?.membersLabel || "26.4k members").replace(" members", "");

  return (
    <aside className="space-y-6 lg:sticky lg:top-32 lg:self-start">
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <CoverImage
          path={coverPath}
          alt={`${name} cover`}
          width={760}
          height={428}
          className="aspect-video w-full object-cover"
        />
        <div className="p-4">
          <h2 className="text-xl font-bold">{name}</h2>
          <p className="text-sm text-muted-foreground">
            {profile?.handleLabel || "skool.com/aivideobootcamp"}
          </p>
          <p className="mt-3 text-[15px] leading-7">
            {profile?.description ||
              "Master AI Video & AI Image Creation. Then use your skill to make AI Adverts, Social Media Content and Films to earn 💰"}
          </p>

          <ul className="mt-4 space-y-2.5">
            {LINKS.map((l) => (
              <li key={l} className="flex items-center gap-3 text-[15px] text-muted-foreground">
                <LinkIcon className="size-4 shrink-0" />
                {l}
              </li>
            ))}
          </ul>

          <div className="mt-4 grid grid-cols-3 divide-x divide-border border-y border-border py-3 text-center">
            {[
              [membersLabel, "Members"],
              [profile?.onlineLabel || "115", "Online"],
              [profile?.adminsLabel || "2", "Admins"],
            ].map(([n, l]) => (
              <div key={l}>
                <div className="text-lg font-bold">{n}</div>
                <div className="text-xs text-muted-foreground">{l}</div>
              </div>
            ))}
          </div>


          <button className="mt-4 w-full rounded-lg border border-border py-3 text-sm font-semibold tracking-wide text-muted-foreground uppercase transition-colors hover:bg-accent">
            Settings
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="font-bold">Leaderboard (30-day)</h2>
        <ul className="mt-3 space-y-3">
          {LEADERS.map((l) => (
            <li key={l.rank} className="flex items-center gap-3">
              <span className="grid size-6 shrink-0 place-items-center rounded-full bg-join text-xs font-bold text-join-foreground">
                {l.rank}
              </span>
              <Avatar name={l.name} className="size-8 shrink-0 rounded-full text-[10px]" />
              <span className="min-w-0 flex-1 truncate text-[15px]">{l.name}</span>
              <span className="shrink-0 text-sm font-semibold text-brand">{l.points}</span>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
