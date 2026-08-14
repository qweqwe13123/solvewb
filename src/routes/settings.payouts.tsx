import { createFileRoute } from "@tanstack/react-router";
import { SettingsCard, EmptyState } from "@/components/settings/SettingsCard";

export const Route = createFileRoute("/settings/payouts")({
  head: () => ({
    meta: [
      { title: "Payouts — AI Video Bootcamp" },
      { name: "description", content: "Set up how you get paid your affiliate earnings." },
      { property: "og:title", content: "Payouts" },
      { property: "og:description", content: "Set up how you get paid your affiliate earnings." },
    ],
  }),
  component: PayoutsPage,
});

function PayoutsPage() {
  return (
    <SettingsCard
      title="Payouts"
      description="Connect a payout account to receive your affiliate earnings."
    >
      <div className="space-y-6">
        <button className="rounded-lg bg-join px-6 py-3 text-sm font-semibold tracking-wide text-join-foreground uppercase transition-opacity hover:opacity-90">
          Connect payout account
        </button>
        <EmptyState title="Your payouts will show here" />
      </div>
    </SettingsCard>
  );
}
