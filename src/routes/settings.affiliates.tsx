import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Coins } from "lucide-react";
import { SettingsCard } from "@/components/settings/SettingsCard";

export const Route = createFileRoute("/settings/affiliates")({
  head: () => ({
    meta: [
      { title: "Affiliates — AI Video Bootcamp" },
      {
        name: "description",
        content: "Earn lifetime commission for every member you invite.",
      },
      { property: "og:title", content: "Affiliates" },
      {
        property: "og:description",
        content: "Earn lifetime commission for every member you invite.",
      },
    ],
  }),
  component: AffiliatesPage,
});

const link = "https://www.skool.com/signup?ref=0935b09c859a461d9b9121e7704a7356";

function AffiliatesPage() {
  const [copied, setCopied] = useState(false);

  return (
    <SettingsCard
      title="Affiliates"
      description="Earn commission for life when you invite somebody to create or join a community."
    >
      <div className="space-y-8">
        <div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              ["$0", "Last 30 days"],
              ["$0", "Lifetime"],
            ].map(([v, l]) => (
              <div key={l} className="rounded-xl border border-border bg-muted/40 p-6 text-center">
                <div className="text-3xl font-bold">{v}</div>
                <div className="mt-1 text-sm text-muted-foreground">{l}</div>
              </div>
            ))}
            <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-muted/40 p-4">
              <div className="flex-1 text-center">
                <div className="text-3xl font-bold text-brand">$0</div>
                <div className="mt-1 text-sm text-muted-foreground">Account balance</div>
              </div>
              <button className="rounded-lg bg-muted px-5 py-3 text-sm font-semibold tracking-wide text-muted-foreground uppercase">
                Payout
              </button>
            </div>
          </div>
          <p className="mt-2 text-right text-sm text-muted-foreground">$0 available soon</p>
        </div>

        <div>
          <h2 className="text-lg font-bold">Your affiliate links</h2>
          <span className="mt-3 inline-block rounded-full bg-muted-foreground/80 px-5 py-2.5 text-sm text-background">
            Platform
          </span>
          <p className="mt-4 text-[15px]">
            Earn <strong>40% commission</strong> when you invite somebody to create a community.
          </p>

          <div className="mt-4 flex items-stretch overflow-hidden rounded-lg border border-border">
            <span className="flex-1 truncate px-4 py-4 text-[15px] font-semibold text-brand">
              {link}
            </span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(link);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
              className="bg-join px-7 text-sm font-semibold tracking-wide text-join-foreground uppercase transition-opacity hover:opacity-90"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <p className="mt-3 text-right text-sm text-muted-foreground">Active</p>
        </div>

        <div className="grid min-h-64 place-items-center rounded-xl border border-border p-10 text-center">
          <div>
            <Coins className="mx-auto size-12 text-join" />
            <p className="mt-4 text-[15px] text-muted-foreground">Your referrals will show here</p>
          </div>
        </div>
      </div>
    </SettingsCard>
  );
}
