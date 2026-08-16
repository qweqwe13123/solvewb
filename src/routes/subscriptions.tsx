import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { FooterSection } from "@/components/jack/FooterSection";
import { PricingSection } from "@/components/subscriptions/PricingSection";
import { SolverBrandMark } from "@/components/subscriptions/SolverBrandMark";
import { useGlobalVideoUnlock } from "@/hooks/use-global-video-unlock";

export const Route = createFileRoute("/subscriptions")({
  head: () => ({
    meta: [
      { title: "Subscriptions — Solver" },
      {
        name: "description",
        content:
          "Solver plans — Starter, Pro, and Ultra. Choose the membership that fits your growth.",
      },
    ],
  }),
  component: SubscriptionsPage,
});

function SubscriptionsPage() {
  const display = { fontFamily: "'Instrument Serif', serif" } as const;
  useGlobalVideoUnlock();

  return (
    <div className="min-h-screen overflow-x-clip bg-white">
      <div className="border-b border-[#f0f0f0] bg-white">
        <SiteHeader
          logoStyle={display}
          variant="light"
          showDesktopCta={false}
          backLink={
            <Link to="/" className="text-sm text-[#6b7280] transition-colors hover:text-[#111]">
              ← Back home
            </Link>
          }
        />
      </div>

      <PricingSection />
      <SolverBrandMark />
      <FooterSection />
    </div>
  );
}
