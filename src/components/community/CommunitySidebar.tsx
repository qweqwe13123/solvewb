import { Link as RouterLink } from "@tanstack/react-router";
import { Link as LinkIcon, ShieldCheck } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getCommunity } from "@/lib/community.functions";
import { CoverImage } from "@/components/Media";

const LINKS = ["Instagram", "Youtube", "Join The Skool Games"];

export function CommunitySidebar() {
  const fetchCommunity = useServerFn(getCommunity);
  const { data } = useQuery({ queryKey: ["community"], queryFn: () => fetchCommunity() });
  const profile = data?.profile ?? null;
  const courses = data?.courses ?? [];

  const name = courses[0]?.title || profile?.name || "AI Video Bootcamp";
  const coverPath = courses[0]?.coverUrl ?? profile?.coverUrl ?? null;
  const membersLabel = (profile?.membersLabel || "100 members").replace(" members", "");

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
            {profile?.handleLabel && !profile.handleLabel.includes("skool.com")
              ? profile.handleLabel
              : "solverwebsite.com/courses"}
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

          <RouterLink
            to="/refund-guarantee"
            className="mt-3 flex items-center justify-center gap-2 rounded-lg border border-border px-3 py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <ShieldCheck className="size-4" />
            100% Money-Back Guarantee
          </RouterLink>
        </div>
      </div>

    </aside>
  );
}
