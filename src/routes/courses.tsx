import { createFileRoute, Link } from "@tanstack/react-router";
import { Globe, Lock, Users, Tag, Play } from "lucide-react";
import { CourseSwitcher } from "@/components/CourseSwitcher";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useSession } from "@/hooks/useSession";
import { UserMenu } from "@/components/UserMenu";
import { getCommunity, type Course } from "@/lib/community.functions";
import { mediaUrl } from "@/lib/media";
import { Avatar, CoverImage } from "@/components/Media";

export const Route = createFileRoute("/courses")({
  head: () => ({
    meta: [
      { title: "AI Video Bootcamp — Courses & Community" },
      {
        name: "description",
        content: "Master AI Video & AI Image Creation. Join 26.4k creators, monetise AI influencers and UGC ads.",
      },
      { property: "og:title", content: "AI Video Bootcamp — Courses" },
      {
        property: "og:description",
        content: "Master AI Video & AI Image Creation. Then use your skill to make AI Adverts, Social Media Content and Films to earn.",
      },
    ],
  }),
  component: CoursesPage,
});

function CoursesPage() {
  const { user } = useSession();
  const fetchCommunity = useServerFn(getCommunity);
  const { data } = useQuery({ queryKey: ["community"], queryFn: () => fetchCommunity() });

  const profile = data?.profile ?? null;
  const courses = data?.courses ?? [];
  const name = profile?.name || "AI Video Bootcamp";
  const priceLabel = profile?.priceLabel || "$9/month";
  const membersLabel = profile?.membersLabel || "26.4k members";
  const privacyLabel = profile?.privacyLabel || "Private";
  const coverPath = profile?.coverUrl || "/assets/community-cover.jpg";
  const logoPath = courses[0]?.coverUrl || coverPath;
  const introVideo = profile?.videoUrl ? mediaUrl(profile.videoUrl) : null;
  const gallery = profile?.gallery ?? [];
  const body = profile?.body || "Master AI Video & AI Image Creation. Then use your skill to make AI Adverts, Social Media Content and Films to earn 💰\n\nWelcome to the AI Video Bootcamp! In this community and course library, you will learn step-by-step how to create photorealistic AI videos, monetizable AI influencers, viral UGC ads, and short films.\n\nWhat you get inside:\n• Full Access to All Current & Future Courses\n• Private Creator Community & Feedback\n• Weekly Live Q&A and Breakdown Sessions\n• Prompt Templates, Workflow Guides & Cheat Sheets";

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <header className="sticky top-0 z-20 border-b border-border bg-card">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <CourseSwitcher
            title={courses[0]?.title || name}
            logo={logoPath}
            courses={courses}
          />

          <div className="flex items-center gap-3">
            <Globe className="size-5 text-muted-foreground" />
            {user ? (
              <UserMenu user={user} />
            ) : (
              <Link
                to="/auth"
                search={{ redirect: "/c" }}
                className="rounded-md border border-border px-5 py-2.5 text-sm font-medium tracking-wide uppercase transition-colors hover:bg-accent"
              >
                Log in
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-6 px-4 py-6 lg:grid-cols-[1fr_320px]">
        <article className="rounded-xl border border-border bg-card p-5 sm:p-8">
          <h1 className="text-2xl font-bold sm:text-3xl">{name}</h1>

          {introVideo ? (
            <video
              src={introVideo}
              poster={coverPath ? mediaUrl(coverPath) : "/assets/video-poster.jpg"}
              controls
              className="mt-5 aspect-video w-full rounded-lg bg-black object-cover"
            />
          ) : (
            <div className="relative mt-5 overflow-hidden rounded-lg bg-black">
              <CoverImage
                path={coverPath}
                alt="Community intro video preview"
                width={1280}
                height={720}
                className="aspect-video w-full object-cover opacity-90"
              />
              <button
                aria-label="Play intro video"
                className="absolute inset-0 grid place-items-center"
              >
                <span className="grid size-20 place-items-center rounded-full bg-card shadow-lg transition-transform hover:scale-105">
                  <Play className="size-8 translate-x-0.5 fill-current" />
                </span>
              </button>
              <span className="absolute bottom-3 right-3 rounded bg-black/70 px-2 py-1 text-xs text-white">
                3 min
              </span>
            </div>
          )}

          {gallery.length > 0 ? (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {gallery.map((p: string) => (
                <img
                  key={p}
                  src={mediaUrl(p)}
                  alt={`${name} preview`}
                  loading="lazy"
                  width={160}
                  height={96}
                  className="h-24 w-36 shrink-0 rounded-md object-cover"
                />
              ))}
            </div>
          ) : null}

          <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-3 border-b border-border pb-6 text-sm">
            <span className="flex items-center gap-2">
              <Lock className="size-4 text-muted-foreground" /> {privacyLabel}
            </span>
            <span className="flex items-center gap-2">
              <Users className="size-4 text-muted-foreground" /> {membersLabel}
            </span>
            <span className="flex items-center gap-2">
              <Tag className="size-4 text-muted-foreground" /> {priceLabel}
            </span>
            <span className="flex items-center gap-2">
              <Avatar
                name={profile?.ownerLabel || "Daniel Riley"}
                path={profile?.ownerAvatar}
                className="size-6 rounded-full text-[10px]"
              />
              {profile?.ownerLabel || "By Daniel Riley"}
            </span>
          </div>

          <div className="mt-6 space-y-4 text-[15px] leading-7 whitespace-pre-line text-foreground/90">
            {body}
            <div>
              <Link to="/terms-of-use" className="text-sm text-muted-foreground underline">
                Privacy and terms
              </Link>
            </div>
          </div>
        </article>

        <aside className="lg:sticky lg:top-22 lg:self-start">
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <CoverImage
              path={coverPath}
              alt={`${name} community cover`}
              width={1088}
              height={608}
              className="aspect-video w-full object-cover"
            />
            <div className="p-4">
              <h2 className="font-semibold">{name}</h2>
              <p className="text-sm text-muted-foreground">
                {profile?.handleLabel || "skool.com/aivideobootcamp"}
              </p>
              <p className="mt-3 text-[15px] leading-6">
                {profile?.description ||
                  "Master AI Video & AI Image Creation. Then use your skill to make AI Adverts, Social Media Content and Films to earn 💰"}
              </p>
              <div className="mt-4 grid grid-cols-3 divide-x divide-border border-y border-border py-3 text-center">
                {[
                  [membersLabel.replace(" members", ""), "Members"],
                  [profile?.onlineLabel || "414", "Online"],
                  [profile?.adminsLabel || "8", "Admins"],
                ].map(([n, l]) => (
                  <div key={l}>
                    <div className="text-lg font-semibold">{n}</div>
                    <div className="text-xs text-muted-foreground">{l}</div>
                  </div>
                ))}
              </div>
              <Link
                to={user ? "/c" : "/auth"}
                search={user ? undefined : { redirect: "/c" }}
                className="mt-4 block w-full rounded-lg bg-join py-3.5 text-center text-sm font-semibold tracking-wide text-join-foreground uppercase transition-opacity hover:opacity-90 shadow-sm"
              >
                Join {priceLabel}
              </Link>
            </div>
          </div>

          {courses.length > 0 ? (
            <div className="mt-6 rounded-xl border border-border bg-card p-4">
              <h2 className="font-semibold">Courses</h2>
              <ul className="mt-3 space-y-3">
                {courses.map((c: Course) => (
                  <li key={c.id}>
                    <Link
                      to="/course/$slug"
                      params={{ slug: c.slug }}
                      className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-accent"
                    >
                      <CoverImage
                        path={c.coverUrl}
                        alt={c.title}
                        loading="lazy"
                        width={64}
                        height={44}
                        className="h-11 w-16 shrink-0 rounded-md object-cover"
                      />
                      <span className="min-w-0">
                        <span className="block truncate text-[15px] font-semibold">
                          {c.title}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {c.summary || c.priceLabel}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <p className="mt-4 text-center text-sm text-muted-foreground">
            Powered by <span className="font-bold text-foreground">skool</span>
          </p>
        </aside>
      </main>
    </div>
  );
}
