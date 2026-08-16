import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listMembers } from "@/lib/admin.functions";
import { useSession } from "@/hooks/useSession";

export const Route = createFileRoute("/_authenticated/admin/")({
  head: () => ({
    meta: [
      { title: "Members — Admin — AI Video Bootcamp" },
      {
        name: "description",
        content: "Private admin panel for managing AI Video Bootcamp members.",
      },
      { property: "og:title", content: "Members — Admin" },
      {
        property: "og:description",
        content: "Private admin panel for managing AI Video Bootcamp members.",
      },
    ],
  }),
  component: AdminMembersPage,
});

function AdminMembersPage() {
  const { user } = useSession();
  const fetchMembers = useServerFn(listMembers);
  const membersQuery = useQuery({ queryKey: ["admin-members"], queryFn: () => fetchMembers() });

  return (
    <>
      <section className="rounded-2xl border border-border bg-card p-6 sm:p-8">
        <h1 className="text-2xl font-bold">Admin panel</h1>
        <p className="mt-3 text-[15px] leading-6 text-muted-foreground">
          Only accessible by {user?.email}.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <Stat
            label="Registered users"
            value={membersQuery.data ? String(membersQuery.data.total) : "…"}
          />
          <Stat label="Admins" value="1" />
          <Stat label="Price" value="$49/mo" />
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-6 sm:p-8">
        <h2 className="text-xl font-bold">Members</h2>
        {membersQuery.isLoading ? (
          <p className="mt-4 text-[15px] text-muted-foreground">Loading…</p>
        ) : membersQuery.isError ? (
          <p className="mt-4 text-[15px] text-destructive">Failed to load members list.</p>
        ) : (
          <ul className="mt-4 divide-y divide-border">
            {membersQuery.data?.members.map((m) => (
              <li key={m.id} className="flex items-center gap-4 py-3">
                {m.avatarUrl ? (
                  <img
                    src={m.avatarUrl}
                    alt={m.name}
                    width={40}
                    height={40}
                    className="size-10 rounded-full object-cover"
                  />
                ) : (
                  <span className="grid size-10 place-items-center rounded-full bg-muted text-sm font-semibold">
                    {m.name.slice(0, 1).toUpperCase()}
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-bold">{m.name}</p>
                  <p className="truncate text-sm text-muted-foreground">{m.email}</p>
                </div>
                <span className="hidden text-sm text-muted-foreground sm:block">
                  {new Date(m.createdAt).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}
