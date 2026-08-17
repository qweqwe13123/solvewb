import { createFileRoute } from "@tanstack/react-router";
import {
  Bell,
  Globe,
  Lock,
  MessageSquare,
  Play,
  Search,
  Send,
  Shield,
  ShieldCheck,
  Sparkles,
  Tag,
  Users,
} from "lucide-react";
import { CourseSwitcher } from "@/components/CourseSwitcher";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { useSession } from "@/hooks/useSession";
import { UserMenu } from "@/components/UserMenu";
import { getCommunity, checkCommunityAccessFn, type Course } from "@/lib/community.functions";
import { syncCheckoutSessionFn } from "@/lib/stripe-checkout.functions";
import { mediaUrl } from "@/lib/media";
import { Avatar, CoverImage } from "@/components/Media";
import { readProAccess, writeProAccess } from "@/lib/pro-access-cache";

const DESIGNATED_ADMIN_EMAIL = "turanoglumehmet1@gmail.com";

export const Route = createFileRoute("/courses")({
  validateSearch: (search: Record<string, unknown>) => ({
    checkout: search.checkout === "success" || search.checkout === "canceled" ? search.checkout : undefined,
    session_id: typeof search.session_id === "string" ? search.session_id : undefined,
  }),
  head: () => ({
    meta: [
      { title: "AI Video Bootcamp — Courses & Community" },
      {
        name: "description",
        content:
          "Master AI Video & AI Image Creation. Join 100 creators, monetise AI influencers and UGC ads.",
      },
      { property: "og:title", content: "AI Video Bootcamp — Courses" },
      {
        property: "og:description",
        content:
          "Master AI Video & AI Image Creation. Then use your skill to make AI Adverts, Social Media Content and Films to earn.",
      },
    ],
  }),
  component: CoursesPage,
});

function CoursesPage() {
  const { checkout, session_id } = Route.useSearch();
  const { user } = useSession();
  const isAdmin = (user?.email || "").toLowerCase().trim() === DESIGNATED_ADMIN_EMAIL;
  const fetchCommunity = useServerFn(getCommunity);
  const checkAccess = useServerFn(checkCommunityAccessFn);
  const syncSession = useServerFn(syncCheckoutSessionFn);
  const { data } = useQuery({ queryKey: ["community"], queryFn: () => fetchCommunity() });
  const accessQuery = useQuery({
    queryKey: ["community-access-status", user?.id, user?.email],
    queryFn: async () => {
      if (checkout === "success" && session_id) {
        const synced = await syncSession({ data: { sessionId: session_id } }).catch(() => null);
        if (synced?.ok && synced.hasAccess) {
          return { hasAccess: true, isAdmin: false, status: synced.status ?? "active" };
        }
      }
      return checkAccess({ data: { userId: user?.id, email: user?.email } });
    },
    enabled: !!user,
    placeholderData: () =>
      user?.id && readProAccess(user.id)
        ? { hasAccess: true, isAdmin: false, status: "active" }
        : undefined,
    staleTime: 15_000,
    refetchOnMount: false,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 3000),
  });
  const hasAccess = isAdmin || Boolean(accessQuery.data?.hasAccess);

  useEffect(() => {
    if (!user || isAdmin || !accessQuery.isSuccess) return;
    writeProAccess(user.id, Boolean(accessQuery.data?.hasAccess));
  }, [accessQuery.data?.hasAccess, accessQuery.isSuccess, isAdmin, user]);

  const [chatOpen, setChatOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<string[]>([]);

  const profile = data?.profile ?? null;
  const courses = data?.courses ?? [];
  const name = profile?.name || "AI Video Bootcamp";
  const priceLabel = profile?.priceLabel || "$49/month";
  const membersLabel = profile?.membersLabel || "100 members";
  const privacyLabel = profile?.privacyLabel || "Private";
  const coverPath = profile?.coverUrl || "/assets/community-cover.jpg";
  const logoPath = courses[0]?.coverUrl || coverPath;
  const introVideo = profile?.videoUrl ? mediaUrl(profile.videoUrl) : null;
  const gallery = profile?.gallery ?? [];
  const body =
    profile?.body ||
    "Master AI Video & AI Image Creation. Then use your skill to make AI Adverts, Social Media Content and Films to earn 💰\n\nWelcome to the AI Video Bootcamp! In this community and course library, you will learn step-by-step how to create photorealistic AI videos, monetizable AI influencers, viral UGC ads, and short films.\n\nWhat you get inside:\n• Full Access to All Current & Future Courses\n• Private Creator Community & Feedback\n• Weekly Live Q&A and Breakdown Sessions\n• Prompt Templates, Workflow Guides & Cheat Sheets";
  const checkoutPath = "/checkout?plan=starter&period=monthly";

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <header className="sticky top-0 z-20 border-b border-border bg-card">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <CourseSwitcher title={courses[0]?.title || name} logo={logoPath} courses={courses} />

          <div className="relative flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              aria-label="Open chat"
              onClick={() => {
                setChatOpen((value) => !value);
                setNotificationsOpen(false);
              }}
              className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <MessageSquare className="size-5" />
            </button>
            <button
              type="button"
              aria-label="Open notifications"
              onClick={() => {
                setNotificationsOpen((value) => !value);
                setChatOpen(false);
              }}
              className="relative rounded-full p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <Bell className="size-5" />
              <span className="absolute -top-1.5 -right-1.5 grid size-4 place-items-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                1
              </span>
            </button>
            {chatOpen ? (
              <div className="absolute right-0 top-11 z-30 w-[min(92vw,360px)] rounded-xl border border-border bg-card p-4 shadow-lg">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div>
                    <p className="text-sm font-bold">Community chat</p>
                    <p className="text-xs text-muted-foreground">Send a message to support</p>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">
                    Online
                  </span>
                </div>
                <div className="mt-3 max-h-52 space-y-2 overflow-y-auto">
                  <div className="w-fit max-w-[85%] rounded-xl rounded-bl-sm bg-accent px-3 py-2 text-sm">
                    Hi, how can we help?
                  </div>
                  {messages.map((item, index) => (
                    <div
                      key={`${item}-${index}`}
                      className="ml-auto w-fit max-w-[85%] rounded-xl rounded-br-sm bg-join px-3 py-2 text-sm font-medium text-join-foreground"
                    >
                      {item}
                    </div>
                  ))}
                </div>
                <form
                  className="mt-3 flex items-center gap-2 rounded-lg border border-border px-3 py-2"
                  onSubmit={(event) => {
                    event.preventDefault();
                    const trimmed = message.trim();
                    if (!trimmed) return;
                    setMessages((items) => [...items, trimmed]);
                    setMessage("");
                  }}
                >
                  <input
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    placeholder="Write a message..."
                    className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  />
                  <button
                    type="submit"
                    aria-label="Send message"
                    className="rounded-md bg-join p-2 text-join-foreground"
                  >
                    <Send className="size-4" />
                  </button>
                </form>
              </div>
            ) : null}
            {notificationsOpen ? (
              <div className="absolute right-0 top-11 z-30 w-[min(92vw,340px)] rounded-xl border border-border bg-card p-4 shadow-lg">
                <p className="text-sm font-bold">Notifications</p>
                <div className="mt-3 rounded-lg bg-accent p-3">
                  <p className="text-sm font-semibold">Welcome to AI Video Bootcamp</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    New course updates and community replies will appear here.
                  </p>
                </div>
              </div>
            ) : null}
            <Globe className="size-5 text-muted-foreground" />
            {isAdmin ? (
              <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 px-3 py-1 text-xs font-bold text-purple-600 dark:text-purple-400 shadow-sm">
                <Shield className="size-3.5 fill-current" />
                <span>ADMIN</span>
              </div>
            ) : hasAccess ? (
              <div className="flex items-center gap-1.5 rounded-full bg-amber-500/15 border border-amber-500/40 px-3 py-1 text-xs font-bold text-amber-600 dark:text-amber-400 shadow-sm">
                <Sparkles className="size-3.5 fill-amber-500" />
                <span>PRO USER</span>
              </div>
            ) : null}
            {user ? (
              <UserMenu user={user} />
            ) : (
              <Link
                to="/auth"
                search={{ redirect: "/courses" }}
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
                {profile?.handleLabel && !profile.handleLabel.includes("skool.com")
                  ? profile.handleLabel
                  : "solverwebsite.com/courses"}
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
              {isAdmin || hasAccess ? (
                <Link
                  to="/c"
                  className="mt-4 block w-full rounded-lg bg-join py-3.5 text-center text-sm font-semibold tracking-wide text-join-foreground uppercase transition-opacity hover:opacity-90 shadow-sm"
                >
                  Open community
                </Link>
              ) : user ? (
                <Link
                  to="/checkout"
                  search={{ plan: "starter", period: "monthly" }}
                  className="mt-4 block w-full rounded-lg bg-join py-3.5 text-center text-sm font-semibold tracking-wide text-join-foreground uppercase transition-opacity hover:opacity-90 shadow-sm"
                >
                  Join {priceLabel}
                </Link>
              ) : (
                <Link
                  to="/auth"
                  search={{ redirect: checkoutPath }}
                  className="mt-4 block w-full rounded-lg bg-join py-3.5 text-center text-sm font-semibold tracking-wide text-join-foreground uppercase transition-opacity hover:opacity-90 shadow-sm"
                >
                  Join {priceLabel}
                </Link>
              )}
              <Link
                to="/refund-guarantee"
                className="mt-3 flex items-center justify-center gap-2 rounded-lg border border-border px-3 py-2.5 text-center text-sm font-semibold text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <ShieldCheck className="size-4" />
                100% Money-Back Guarantee
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
                        path={c.coverUrl || coverPath}
                        alt={c.title}
                        loading="lazy"
                        width={64}
                        height={44}
                        className="h-11 w-16 shrink-0 rounded-md object-cover"
                      />
                      <span className="min-w-0">
                        <span className="block truncate text-[15px] font-semibold">{c.title}</span>
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
            Powered by <span className="font-bold text-foreground">solverwebsite</span>
          </p>
        </aside>
      </main>
    </div>
  );
}
