import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell, Lock, Search, Shield, ShieldCheck, Sparkles, Tag, Users } from "lucide-react";
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
const ONLINE_MIN = 10;
const ONLINE_MAX = 45;

function getUtcHourKey(date: Date) {
  return date.toISOString().slice(0, 13);
}

function getDeterministicOnlineNumber(hourKey: string) {
  let hash = 2166136261;
  for (let index = 0; index < hourKey.length; index += 1) {
    hash ^= hourKey.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return ONLINE_MIN + ((hash >>> 0) % (ONLINE_MAX - ONLINE_MIN + 1));
}

export const Route = createFileRoute("/courses")({
  loader: async () => getCommunity(),
  validateSearch: (search: Record<string, unknown>) => ({
    checkout:
      search.checkout === "success" || search.checkout === "canceled" ? search.checkout : undefined,
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
  const initialCommunity = Route.useLoaderData();
  const { data = initialCommunity } = useQuery({
    queryKey: ["community"],
    queryFn: () => fetchCommunity(),
    initialData: initialCommunity,
    staleTime: 0,
    refetchOnMount: true,
  });
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

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [onlineHourKey, setOnlineHourKey] = useState(() => getUtcHourKey(new Date()));

  useEffect(() => {
    const now = new Date();
    const nextHour = new Date(now);
    nextHour.setUTCMinutes(60, 0, 50);
    const timer = window.setTimeout(
      () => setOnlineHourKey(getUtcHourKey(new Date())),
      Math.max(1000, nextHour.getTime() - now.getTime()),
    );
    return () => window.clearTimeout(timer);
  }, [onlineHourKey]);

  const onlineNumber = getDeterministicOnlineNumber(onlineHourKey);
  const profile = data?.profile ?? null;
  const courses = data?.courses ?? [];
  const name = profile?.name || "AI Video Bootcamp";
  const priceLabel = profile?.priceLabel || "$49/month";
  const membersLabel = profile?.membersLabel || "100 members";
  const privacyLabel = profile?.privacyLabel || "Private";
  const coverPath = "/2.png";
  const logoPath = coverPath;
  const introVideo = profile?.videoUrl ? mediaUrl(profile.videoUrl) : null;
  const gallery = profile?.gallery ?? [];
  const requestedDescription = `Master AI Automation & Web Design
Build AI agents, automate businesses, create premium websites, and turn your skills into a profitable online business.
🚨 Founding Member Price: $49/month ‼️ Only available for the first 500 members. Once we hit 500 members, the price increases for all new members.
What's inside?
✅ 🤖 Build AI Agents & powerful automations
✅ 🌐 Design premium websites clients pay for
✅ ⚡ Automate real business workflows
✅ 🎨 Master modern UI/UX & web animations
✅ 🧠 Learn expert-level prompting
✅ 🔥 Stay up-to-date with the latest AI tools
✅ 💰 Build AI ads & digital systems brands pay for
✅ 📈 Learn client acquisition & lead generation
✅ 📁 Create real portfolio projects
✅ 💬 Private community, feedback & weekly updates
✅ 🎁 Exclusive templates, resources & challenges

Perfect if you're tired of:
❌ Guessing with AI
❌ Weak prompts & fake-looking results
❌ Repetitive manual work
❌ Not knowing how to get high-paying clients

⚡ Start today. Lock in $49/month.
That's only $1.60/day to stay ahead in AI Automation & Web Design.
✅ Cancel anytime.`;
  const body = profile?.body?.includes("⭐ Top 1% Community on Skool")
    ? requestedDescription
    : profile?.body || requestedDescription;
  const shortDescription = profile?.description?.includes("⭐ Top 1% Community on Skool")
    ? requestedDescription
    : profile?.description || requestedDescription;
  const checkoutPath = "/checkout?plan=starter&period=monthly";

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <header className="sticky top-0 z-20 border-b border-border bg-card">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <CourseSwitcher title={courses[0]?.title || name} logo={logoPath} courses={courses} />

          <div className="relative flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              aria-label="Open notifications"
              onClick={() => {
                setNotificationsOpen((value) => !value);
              }}
              className="relative rounded-full p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <Bell className="size-5" />
              <span className="absolute -top-1.5 -right-1.5 grid size-4 place-items-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                1
              </span>
            </button>
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
            <CoverImage
              path={coverPath}
              alt={`${name} cover`}
              width={1280}
              height={720}
              className="mt-5 aspect-video w-full rounded-lg object-cover"
            />
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
                name="Ryan Mitchell"
                path="/ryan-mitchell-avatar.jpg"
                className="size-6 rounded-full text-[10px]"
              />
              By Ryan Mitchell 💎 🔥
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
              <p className="mt-3 text-[15px] leading-6">{shortDescription}</p>
              <div className="mt-4 grid grid-cols-3 divide-x divide-border border-y border-border py-3 text-center">
                {[
                  [membersLabel.replace(" members", ""), "Members"],
                  [String(onlineNumber), "Online"],
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
        </aside>
      </main>
    </div>
  );
}
