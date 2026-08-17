import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useSession } from "@/hooks/useSession";
import { getIsAdmin } from "@/lib/admin.functions";
import { UserMenu } from "@/components/UserMenu";

export const Route = createFileRoute("/settings")({
  component: SettingsLayout,
});

const nav = [
  { label: "Communities", to: "/settings/communities" },
  { label: "Profile", to: "/settings/profile" },
  { label: "Affiliates", to: "/settings/affiliates" },
  { label: "Payouts", to: "/settings/payouts" },
  { label: "Account", to: "/settings/account" },
  { label: "Notifications", to: "/settings/notifications" },
  { label: "Chat", to: "/settings/chat" },
  { label: "Payment methods", to: "/settings/payment-methods" },
  { label: "Payment history", to: "/settings/payment-history" },
  { label: "Theme", to: "/settings/theme" },
  { label: "Help center", to: "/reach-us" },
] as const;

function SettingsLayout() {
  const { user } = useSession();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const checkAdmin = useServerFn(getIsAdmin);
  const { data: adminData } = useQuery({
    queryKey: ["is-admin", user?.id],
    queryFn: () => checkAdmin(),
    enabled: Boolean(user),
  });
  const isAdmin = adminData?.isAdmin === true;
  const visibleNav = isAdmin
    ? nav
    : nav.filter((item) =>
        ["/settings/profile", "/reach-us"].includes(item.to),
      );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b border-border bg-card">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link
            to="/courses"
            search={{ checkout: undefined, session_id: undefined }}
            aria-label="Back to Courses"
            className="inline-flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <ArrowLeft className="size-5" />
          </Link>
          {user ? (
            <UserMenu user={user} />
          ) : (
            <Link
              to="/auth"
              className="rounded-md border border-border px-5 py-2.5 text-sm font-medium tracking-wide uppercase"
            >
              Log in
            </Link>
          )}
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 lg:grid-cols-[240px_1fr]">
        <nav className="lg:sticky lg:top-24 lg:self-start">
          <ul className="flex gap-1 overflow-x-auto pb-2 lg:block lg:space-y-1 lg:overflow-visible lg:pb-0">
            {visibleNav.map((item) => {
              const active = pathname === item.to;
              return (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className={`block shrink-0 rounded-xl px-4 py-3 text-[15px] font-bold whitespace-nowrap transition-colors ${
                      active ? "bg-join text-join-foreground" : "text-foreground hover:bg-accent"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <main className="min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
