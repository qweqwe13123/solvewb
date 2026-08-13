import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { CoursesSection } from "@/components/jack/CoursesSection";
import { FooterSection } from "@/components/jack/FooterSection";
import { useGlobalVideoUnlock } from "@/hooks/use-global-video-unlock";

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
      <CoursesSection />
      <FooterSection />
    </div>
  );
}
