import { createFileRoute, Link } from "@tanstack/react-router";
import { LegalDocumentPage } from "@/components/legal/LegalDocumentPage";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { FooterSection } from "@/components/jack/FooterSection";
import { REFUND_GUARANTEE } from "@/data/legal/refund-guarantee";
import { useGlobalVideoUnlock } from "@/hooks/use-global-video-unlock";

export const Route = createFileRoute("/refund-guarantee")({
  head: () => ({
    meta: [{ title: "30-Day Refund Guarantee - Solver" }, { name: "robots", content: "noindex" }],
  }),
  component: RefundGuaranteePage,
});

function RefundGuaranteePage() {
  const display = { fontFamily: "'Instrument Serif', serif" } as const;
  useGlobalVideoUnlock();

  return (
    <div className="min-h-screen overflow-x-clip" style={{ background: "#0C0C0C" }}>
      <SiteHeader
        logoStyle={display}
        variant="dark"
        showDesktopCta={false}
        backLink={
          <Link to="/courses" search={{ checkout: undefined, session_id: undefined }} className="text-sm text-white/70 transition-colors hover:text-white">
            Back to courses
          </Link>
        }
      />
      <LegalDocumentPage document={REFUND_GUARANTEE} />
      <FooterSection />
    </div>
  );
}
