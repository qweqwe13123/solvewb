import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/c/leaderboards")({
  component: LeaderboardsComingSoon,
});

function LeaderboardsComingSoon() {
  return (
    <section className="grid min-h-[420px] place-items-center rounded-xl border border-border bg-card p-8 text-center">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Community</p>
        <h1 className="mt-3 text-3xl font-bold">Leaderboards</h1>
        <p className="mt-3 text-muted-foreground">Community rankings and points are coming soon.</p>
        <span className="mt-6 inline-flex rounded-full bg-accent px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Coming soon
        </span>
      </div>
    </section>
  );
}
