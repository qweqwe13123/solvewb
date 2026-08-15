import { createFileRoute, Link } from "@tanstack/react-router";
import { SettingsCard } from "@/components/settings/SettingsCard";

export const Route = createFileRoute("/settings/communities")({
  head: () => ({
    meta: [
      { title: "My Communities — AI Video Bootcamp" },
      { name: "description", content: "Communities you have joined." },
      { property: "og:title", content: "My Communities" },
      { property: "og:description", content: "Communities you have joined." },
    ],
  }),
  component: CommunitiesPage,
});

function CommunitiesPage() {
  return (
    <SettingsCard title="Communities" description="Communities you're a member of.">
      <Link
        to="/"
        className="flex items-center gap-4 rounded-xl border border-border p-4 transition-colors hover:bg-accent"
      >
        <span
          aria-hidden
          className="size-14 shrink-0 rounded-lg bg-gradient-to-br from-muted to-accent"
        />
        <div>
          <div className="font-bold">AI Video Bootcamp</div>
          <div className="text-sm text-muted-foreground">100 members · $49/month</div>
        </div>
      </Link>
    </SettingsCard>
  );
}
