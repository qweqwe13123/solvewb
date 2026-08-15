import { createFileRoute } from "@tanstack/react-router";
import { Lock, Tag, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { CommunitySidebar } from "@/components/community/CommunitySidebar";
import { getCommunity } from "@/lib/community.functions";
import { mediaUrl } from "@/lib/media";
import { CoverImage } from "@/components/Media";

export const Route = createFileRoute("/c/about")({
  head: () => ({
    meta: [
      { title: "About — AI Video Bootcamp" },
      { name: "description", content: "What AI Video Bootcamp is, who it is for and what is inside the membership." },
      { property: "og:title", content: "About AI Video Bootcamp" },
      { property: "og:description", content: "Master AI video and AI image creation, then monetise the skill." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AboutTab,
});

function AboutTab() {
  const fetchCommunity = useServerFn(getCommunity);
  const { data } = useQuery({ queryKey: ["community"], queryFn: () => fetchCommunity() });
  const profile = data?.profile ?? null;
  const courses = data?.courses ?? [];
  const name = courses[0]?.title || profile?.name || "AI Video Bootcamp";
  const imagePath = courses[0]?.coverUrl ?? profile?.coverUrl ?? null;
  const video = profile?.videoUrl ? mediaUrl(profile.videoUrl) : null;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
      <article className="min-w-0 rounded-xl border border-border bg-card p-5 sm:p-8">
        <h1 className="text-2xl font-bold sm:text-3xl">{name}</h1>
        {video ? (
          <video src={video} poster={imagePath ? mediaUrl(imagePath) : undefined} controls className="mt-5 aspect-video w-full rounded-lg bg-black" />
        ) : (
          <CoverImage
            path={imagePath}
            alt={`${name} cover`}
            width={1280}
            height={720}
            className="mt-5 aspect-video w-full rounded-lg object-cover"
          />
        )}

        <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-3 border-b border-border pb-6 text-sm">
          <span className="flex items-center gap-2">
            <Lock className="size-4 text-muted-foreground" /> {profile?.privacyLabel || "Private"}
          </span>
          <span className="flex items-center gap-2">
            <Users className="size-4 text-muted-foreground" /> {profile?.membersLabel || "100 members"}
          </span>
          <span className="flex items-center gap-2">
            <Tag className="size-4 text-muted-foreground" /> {profile?.priceLabel || "$49/month"}
          </span>
        </div>

        <div className="mt-6 text-[15px] leading-7 whitespace-pre-line">
          {profile?.body || profile?.description}
        </div>
      </article>

      <CommunitySidebar />
    </div>
  );
}
