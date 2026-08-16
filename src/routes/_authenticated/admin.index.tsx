import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  cancelProUserSubscription,
  cancelProUsers,
  listMembers,
  listProUsers,
} from "@/lib/admin.functions";
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
  const fetchProUsers = useServerFn(listProUsers);
  const proUsersQuery = useQuery({ queryKey: ["admin-pro-users"], queryFn: () => fetchProUsers() });
  const queryClient = useQueryClient();
  const cancelSubscription = useServerFn(cancelProUserSubscription);
  const [selectedSubscriptions, setSelectedSubscriptions] = useState<string[]>([]);
  const cancelMutation = useMutation({
    mutationFn: (subscriptionId: string) => cancelSubscription({ data: { subscriptionId } }),
    onSuccess: () => {
      setSelectedSubscriptions([]);
      queryClient.invalidateQueries({ queryKey: ["admin-pro-users"] });
    },
  });
  const bulkCancelSubscription = useServerFn(cancelProUsers);
  const bulkCancelMutation = useMutation({
    mutationFn: (subscriptionIds: string[]) => bulkCancelSubscription({ data: { subscriptionIds } }),
    onSuccess: () => {
      setSelectedSubscriptions([]);
      queryClient.invalidateQueries({ queryKey: ["admin-pro-users"] });
    },
  });

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

      <section className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-card to-card p-6 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-amber-500/15 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-amber-700 dark:text-amber-300">Pro access</span>
              <span className="text-sm text-muted-foreground">{proUsersQuery.data?.total ?? "…"} active subscriptions</span>
            </div>
            <h2 className="mt-3 text-xl font-bold">Pro Users</h2>
            <p className="mt-1 text-sm text-muted-foreground">Select one or more paid users and immediately remove their Pro access by canceling their subscriptions.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => proUsersQuery.refetch()}
              disabled={proUsersQuery.isFetching}
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-semibold transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw className={`size-4 ${proUsersQuery.isFetching ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <button
              type="button"
              disabled={!selectedSubscriptions.length || bulkCancelMutation.isPending}
              onClick={() => {
                if (window.confirm(`Immediately cancel ${selectedSubscriptions.length} selected subscription(s) and remove Pro access?`)) {
                  bulkCancelMutation.mutate(selectedSubscriptions);
                }
              }}
              className="rounded-lg bg-destructive px-3 py-2 text-sm font-semibold text-destructive-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {bulkCancelMutation.isPending ? "Cancelling…" : `Cancel selected${selectedSubscriptions.length ? ` (${selectedSubscriptions.length})` : ""}`}
            </button>
          </div>
        </div>
        {proUsersQuery.isLoading ? (
          <p className="mt-5 text-sm text-muted-foreground">Loading Pro users…</p>
        ) : proUsersQuery.isError ? (
          <div className="mt-5 rounded-xl border border-destructive/20 bg-destructive/5 p-4">
            <p className="text-sm text-destructive">Failed to load Pro users.</p>
            <button type="button" onClick={() => proUsersQuery.refetch()} className="mt-3 rounded-lg bg-join px-3 py-2 text-sm font-semibold text-join-foreground">Try again</button>
          </div>
        ) : proUsersQuery.data?.users.length ? (
          <div className="mt-5 space-y-3">
            <label className="flex items-center gap-3 rounded-xl border border-border bg-card/60 p-3 text-sm font-semibold">
              <input
                type="checkbox"
                checked={selectedSubscriptions.length === proUsersQuery.data.users.length}
                onChange={(event) => setSelectedSubscriptions(event.target.checked ? proUsersQuery.data.users.map((user) => user.subscriptionId) : [])}
                className="size-4 accent-current"
              />
              Select all active Pro users for immediate cancellation
            </label>
            {proUsersQuery.data.users.map((proUser) => (
              <div key={proUser.subscriptionId} className="flex flex-col gap-4 rounded-xl border border-border bg-card/80 p-4 sm:flex-row sm:items-center">
                <input
                  type="checkbox"
                  aria-label={`Select ${proUser.email}`}
                  checked={selectedSubscriptions.includes(proUser.subscriptionId)}
                  onChange={(event) => setSelectedSubscriptions((current) => event.target.checked ? [...new Set([...current, proUser.subscriptionId])] : current.filter((id) => id !== proUser.subscriptionId))}
                  className="size-4 shrink-0 accent-current"
                />
                <div className="grid size-10 shrink-0 place-items-center rounded-full bg-amber-500/15 text-sm font-bold text-amber-700 dark:text-amber-300">
                  {proUser.name.slice(0, 1).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold">{proUser.name}</p>
                  <p className="truncate text-sm text-muted-foreground">{proUser.email}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{proUser.plan.toUpperCase()} · {proUser.status}{proUser.currentPeriodEnd ? ` · renews ${new Date(proUser.currentPeriodEnd).toLocaleDateString()}` : ""}</p>
                </div>
                {proUser.cancelAtPeriodEnd ? (
                  <span className="rounded-full bg-orange-500/10 px-3 py-2 text-xs font-semibold text-orange-700 dark:text-orange-300">Cancellation scheduled</span>
                ) : (
                  <button
                    type="button"
                    disabled={cancelMutation.isPending}
                    onClick={() => {
                      if (window.confirm(`Immediately cancel ${proUser.email}'s subscription and remove Pro access?`)) {
                        cancelMutation.mutate(proUser.subscriptionId);
                      }
                    }}
                    className="rounded-lg border border-destructive/30 px-3 py-2 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/10 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {cancelMutation.isPending ? "Cancelling…" : "Cancel immediately"}
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-5 rounded-xl bg-card/70 p-4 text-sm text-muted-foreground">No active Pro subscriptions yet.</p>
        )}
        {cancelMutation.isError ? <p className="mt-4 text-sm text-destructive">{cancelMutation.error instanceof Error ? cancelMutation.error.message : "Could not cancel subscription."}</p> : null}
        {bulkCancelMutation.isError ? <p className="mt-4 text-sm text-destructive">{bulkCancelMutation.error instanceof Error ? bulkCancelMutation.error.message : "Could not cancel selected subscriptions."}</p> : null}
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
