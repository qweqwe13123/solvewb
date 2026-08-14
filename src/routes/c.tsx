import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { Bell, MessageSquare, Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { CourseSwitcher } from "@/components/CourseSwitcher";
import { UserMenu } from "@/components/UserMenu";
import { useSession } from "@/hooks/useSession";
import { getCommunity } from "@/lib/community.functions";

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
  const { user } = useSession();
  const fetchCommunity = useServerFn(getCommunity);
  const { data } = useQuery({ queryKey: ["community"], queryFn: () => fetchCommunity() });
  const profile = data?.profile ?? null;
  const courses = data?.courses ?? [];
  const name = courses[0]?.title || profile?.name || "AI Video Bootcamp";
  const logo = courses[0]?.coverUrl ?? profile?.coverUrl ?? null;

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

          <div className="flex shrink-0 items-center gap-4">
            <MessageSquare className="size-5 text-muted-foreground" />
            <span className="relative">
              <Bell className="size-5 text-muted-foreground" />
              <span className="absolute -top-1.5 -right-1.5 grid size-4 place-items-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                1
              </span>
            </span>
            {user ? (
              <UserMenu user={user} />
            ) : (
              <Link to="/auth" className="text-sm font-medium">
                Log in
              </Link>
            )}
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
