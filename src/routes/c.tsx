import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bell, Loader2, MessageSquare, Search, Send, Sparkles, Shield } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { CourseSwitcher } from "@/components/CourseSwitcher";
import { UserMenu } from "@/components/UserMenu";
import { useSession } from "@/hooks/useSession";
import { getCommunity, checkCommunityAccessFn } from "@/lib/community.functions";

const DESIGNATED_ADMIN_EMAIL = "turanoglumehmet1@gmail.com";
const COMMUNITY_REDIRECT = "/c";

export const Route = createFileRoute("/c")({
  component: CommunityShell,
});

const TABS = [
  { to: "/c", label: "Community", exact: true },
  { to: "/c/classroom", label: "Classroom" },
  { to: "/c/calendar", label: "Calendar" },
  { to: "/c/members", label: "Members" },

  { to: "/c/leaderboards", label: "Leaderboards" },
  { to: "/c/about", label: "About" },
] as const;

function CommunityShell() {
  const { user, loading: sessionLoading } = useSession();
  const navigate = useNavigate();
  const [chatOpen, setChatOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<string[]>([]);
  const fetchCommunity = useServerFn(getCommunity);
  const checkAccess = useServerFn(checkCommunityAccessFn);
  const { data } = useQuery({ queryKey: ["community"], queryFn: () => fetchCommunity() });
  const accessQuery = useQuery({
    queryKey: ["community-access-status", user?.id, user?.email],
    queryFn: () => checkAccess({ data: { userId: user?.id, email: user?.email } }),
    enabled: !!user,
    staleTime: 0,
    refetchOnMount: "always",
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 3000),
  });
  const profile = data?.profile ?? null;
  const courses = data?.courses ?? [];
  const name = courses[0]?.title || profile?.name || "AI Video Bootcamp";
  const logo = courses[0]?.coverUrl ?? profile?.coverUrl ?? null;
  const isAdmin = (user?.email || "").toLowerCase().trim() === DESIGNATED_ADMIN_EMAIL;
  const hasAccess = isAdmin || Boolean(accessQuery.data?.hasAccess);

  useEffect(() => {
    if (sessionLoading) return;
    if (!user) {
      navigate({
        to: "/auth",
        search: { redirect: COMMUNITY_REDIRECT },
        replace: true,
      });
      return;
    }
    if (!isAdmin && accessQuery.isSuccess && accessQuery.data && !hasAccess) {
      navigate({
        to: "/courses",
        replace: true,
      });
    }
  }, [accessQuery.isSuccess, hasAccess, isAdmin, navigate, sessionLoading, user]);

  if (
    sessionLoading ||
    (!user && typeof window !== "undefined") ||
    (user && !isAdmin && accessQuery.isLoading)
  ) {
    return (
      <div className="grid min-h-screen place-items-center bg-background text-sm font-medium text-muted-foreground">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-6 animate-spin text-foreground" />
          <span>Verifying Pro access...</span>
        </div>
      </div>
    );
  }

  if (user && !isAdmin && accessQuery.isError) {
    return (
      <div className="grid min-h-screen place-items-center bg-background px-4 text-center text-sm text-muted-foreground">
        <div>
          <p>We are still verifying your Pro access.</p>
          <button type="button" className="mt-4 rounded-lg bg-join px-4 py-2 font-semibold text-join-foreground" onClick={() => accessQuery.refetch()}>
            Check access again
          </button>
        </div>
      </div>
    );
  }

  if (user && !isAdmin && accessQuery.isSuccess && !hasAccess) {
    return (
      <div className="grid min-h-screen place-items-center bg-background text-sm text-muted-foreground">
        Redirecting to courses…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b border-border bg-card">
        <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-3 md:grid-cols-[auto_minmax(0,1fr)_auto]">
          <div className="min-w-0">
            <CourseSwitcher title={name} logo={logo} courses={courses} />
          </div>

          <div className="order-3 col-span-2 flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 md:order-none md:col-span-1 md:max-w-2xl">
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <input
              placeholder="Search"
              aria-label="Search community"
              className="w-full bg-transparent text-[15px] outline-none placeholder:text-muted-foreground"
            />
          </div>

          <div className="relative flex shrink-0 items-center gap-4">
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
              <Link to="/auth" className="text-sm font-medium">
                Log in
              </Link>
            )}

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
          </div>
        </div>

        <nav className="mx-auto max-w-7xl overflow-x-auto px-4">
          <ul className="flex min-w-max items-center gap-7">
            {TABS.map((t) => (
              <li key={t.to}>
                <Link
                  to={t.to}
                  activeOptions={{ exact: "exact" in t ? t.exact : false }}
                  className="block border-b-2 border-transparent py-3 text-[15px] text-muted-foreground transition-colors hover:text-foreground [&.active]:border-foreground [&.active]:font-semibold [&.active]:text-foreground"
                >
                  {t.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
