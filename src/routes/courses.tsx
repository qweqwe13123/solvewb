import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { FooterSection } from "@/components/jack/FooterSection";
import { useGlobalVideoUnlock } from "@/hooks/use-global-video-unlock";

const EMBED_URL = "https://easy-sign-in-jacks-projects-fe350ab3.vercel.app/";

export const Route = createFileRoute("/courses")({
  head: () => ({
    meta: [
      { title: "Courses — Solver" },
      {
        name: "description",
        content:
          "Practical, project-based courses in AI automation, web development, digital systems, and brand design.",
      },
      { property: "og:title", content: "Courses — Solver" },
      {
        property: "og:description",
        content:
          "Practical, project-based courses in AI automation, web development, digital systems, and brand design.",
      },
    ],
  }),
  component: CoursesPage,
});

function CoursesPage() {
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
      <div className="mx-auto w-full max-w-[1440px] px-4 pb-10 sm:px-8">
        <div className="mt-8 overflow-hidden rounded-[28px] border border-white/10 bg-[#070B26] shadow-[0_40px_120px_-40px_rgba(0,0,0,0.8)] sm:rounded-[36px]">
          <iframe
            src={EMBED_URL}
            title="AI Video Bootcamp — Courses"
            className="block h-[calc(100vh-140px)] w-full border-0"
            loading="eager"
            allow="autoplay; fullscreen"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
      <FooterSection />
    </div>
  );
}
