import { createFileRoute } from "@tanstack/react-router";

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
  return (
    <div className="h-screen w-full overflow-hidden bg-black">
      <iframe
        src={EMBED_URL}
        title="AI Video Bootcamp — Courses"
        className="block h-full w-full border-0"
        loading="eager"
        allow="autoplay; fullscreen"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}
