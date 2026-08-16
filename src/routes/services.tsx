import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { ServicesSection } from "@/components/jack/ServicesSection";
import { FooterSection } from "@/components/jack/FooterSection";
import { useGlobalVideoUnlock } from "@/hooks/use-global-video-unlock";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services — Solver" },
      {
        name: "description",
        content:
          "All 14 services we provide — from web & app development to maintenance & support.",
      },
      { property: "og:title", content: "Services — Solver" },
      {
        property: "og:description",
        content:
          "All 14 services we provide — from web & app development to maintenance & support.",
      },
    ],
  }),
  component: ServicesPage,
});

function ServicesPage() {
  const display = { fontFamily: "'Instrument Serif', serif" } as const;
  useGlobalVideoUnlock();

  return (
    <div
      className="min-h-screen overflow-x-clip"
      style={{ background: "#0C0C0C", fontFamily: "'Kanit', sans-serif" }}
    >
      <SiteHeader
        logoStyle={display}
        variant="dark"
        showDesktopCta={false}
        backLink={
          <Link to="/" className="text-sm text-white/70 transition-colors hover:text-white">
            ← Back home
          </Link>
        }
      />
      <ServicesSection full />
      <FooterSection />
    </div>
  );
}
