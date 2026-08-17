import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getIsAdmin } from "@/lib/admin.functions";
import { useSession } from "@/hooks/useSession";
import { UserMenu } from "@/components/UserMenu";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminLayout,
});

const navItems = [
  { to: "/admin", label: "Members", exact: true },
  { to: "/admin/posts", label: "Posts", exact: false },
  { to: "/admin/community", label: "Community", exact: false },
  { to: "/admin/classroom", label: "Classroom", exact: false },
  { to: "/admin/calendar", label: "Calendar", exact: false },
] as const;

function AdminLayout() {
  const { user } = useSession();
  const navigate = useNavigate();
  const checkAdmin = useServerFn(getIsAdmin);

  const adminQuery = useQuery({ queryKey: ["is-admin"], queryFn: () => checkAdmin() });
  const isAdmin = adminQuery.data?.isAdmin === true;

  useEffect(() => {
    if (adminQuery.isSuccess && !isAdmin) navigate({ to: "/", replace: true });
  }, [adminQuery.isSuccess, isAdmin, navigate]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b border-border bg-card">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Link
              to="/courses"
              search={{ checkout: undefined, session_id: undefined }}
              aria-label="Back to Courses"
              className="inline-flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <ArrowLeft className="size-5" />
            </Link>
            <Link to="/" className="flex items-center gap-3">
              <img
                src="/ryan-mitchell-avatar.jpg"
                alt="Ryan Mitchell"
                width={36}
                height={36}
                className="size-9 shrink-0 rounded-full object-cover"
              />
              <span className="text-lg font-semibold">Ryan Mitchell</span>
            </Link>
          </div>
          {user ? <UserMenu user={user} /> : null}
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 lg:grid-cols-[240px_1fr]">
        <nav className="lg:sticky lg:top-24 lg:self-start">
          <ul className="flex gap-1 overflow-x-auto pb-2 lg:block lg:space-y-1 lg:overflow-visible lg:pb-0">
            {navItems.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  activeOptions={{ exact: item.exact }}
                  activeProps={{ className: "bg-join text-join-foreground" }}
                  className="block shrink-0 rounded-xl px-4 py-3 text-[15px] font-bold whitespace-nowrap transition-colors hover:bg-accent"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                to="/settings/profile"
                className="block shrink-0 rounded-xl px-4 py-3 text-[15px] font-bold whitespace-nowrap transition-colors hover:bg-accent"
              >
                Back to settings
              </Link>
            </li>
          </ul>
        </nav>

        <main className="min-w-0 space-y-6">
          {!adminQuery.isSuccess ? (
            <p className="text-[15px] text-muted-foreground">Verifying access…</p>
          ) : !isAdmin ? (
            <p className="text-[15px] text-muted-foreground">Access denied.</p>
          ) : (
            <Outlet />
          )}
        </main>
      </div>
    </div>
  );
}
