import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, GraduationCap, PlayCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getCommunity, type Course } from "@/lib/community.functions";
import { listClasses, type ClassroomClass } from "@/lib/classroom.functions";
import { CoverImage } from "@/components/Media";

export const Route = createFileRoute("/c/classroom")({
  head: () => ({
    meta: [
      { title: "Classroom — AI Video Bootcamp" },
      {
        name: "description",
        content: "All AI video and AI image courses, modules and lessons in one classroom.",
      },
      { property: "og:title", content: "AI Video Bootcamp classroom" },
      {
        property: "og:description",
        content: "Step-by-step AI video courses, unlocked as you level up.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Classroom,
});

function Classroom() {
  const fetchCommunity = useServerFn(getCommunity);
  const fetchClasses = useServerFn(listClasses);
  const { data } = useQuery({ queryKey: ["community"], queryFn: () => fetchCommunity() });
  const { data: classData, isLoading } = useQuery({
    queryKey: ["classes"],
    queryFn: () => fetchClasses(),
  });

  const courses = data?.courses ?? [];
  const classes = classData?.classes ?? [];

  return (
    <div className="space-y-12">
      <header className="overflow-hidden rounded-3xl border border-border bg-card">
        <div className="grid gap-6 p-8 sm:p-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1.5 text-xs font-bold tracking-wide uppercase">
              <GraduationCap className="size-4" /> Classroom
            </span>
            <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Everything you need to master AI video
            </h1>
            <p className="mt-3 max-w-2xl text-[15px] leading-7 text-muted-foreground">
              Structured classes and courses, updated weekly. Work through them in order or jump
              straight to the skill you need today.
            </p>
          </div>
          <dl className="flex gap-8 lg:justify-end">
            <div>
              <dt className="text-sm text-muted-foreground">Classes</dt>
              <dd className="text-2xl font-bold">{classes.length}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Courses</dt>
              <dd className="text-2xl font-bold">{courses.length}</dd>
            </div>
          </dl>
        </div>
      </header>

      <section>
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="text-xl font-bold">Classes</h2>
          <span className="text-sm text-muted-foreground">Curated by the team</span>
        </div>

        {isLoading ? (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-72 animate-pulse rounded-2xl bg-muted" />
            ))}
          </div>
        ) : classes.length === 0 ? (
          <p className="mt-6 rounded-2xl border border-dashed border-border p-10 text-center text-[15px] text-muted-foreground">
            Classes coming soon.
          </p>
        ) : (
          <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {classes.map((c: ClassroomClass, i: number) => (
              <li
                key={c.id}
                className="group overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-1 hover:border-foreground/20 hover:shadow-xl"
              >
                <div className="relative">
                  <CoverImage
                    path={c.coverUrl}
                    alt={c.title}
                    loading="lazy"
                    width={640}
                    height={360}
                    className="aspect-video w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute top-3 left-3 rounded-full bg-background/85 px-3 py-1 text-xs font-bold backdrop-blur">
                    Class {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold tracking-tight">{c.title}</h3>
                  <p className="mt-2 line-clamp-3 text-[15px] leading-6 text-muted-foreground">
                    {c.description}
                  </p>
                  <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-accent">
                    <div className="h-full w-0 rounded-full bg-brand" />
                  </div>
                  <p className="mt-2 text-xs font-bold text-muted-foreground">0% complete</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {courses.length > 0 ? (
        <section>
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="text-xl font-bold">Courses</h2>
            <span className="text-sm text-muted-foreground">Full programs</span>
          </div>

          <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((c: Course) => (
              <li key={c.id}>
                <Link
                  to="/course/$slug"
                  params={{ slug: c.slug }}
                  className="group block h-full overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-1 hover:border-foreground/20 hover:shadow-xl"
                >
                  <div className="relative">
                    <CoverImage
                      path={c.coverUrl}
                      alt={c.title}
                      loading="lazy"
                      width={640}
                      height={360}
                      className="aspect-video w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <PlayCircle className="absolute right-3 bottom-3 size-9 text-background drop-shadow" />
                  </div>
                  <div className="p-6">
                    <h3 className="flex items-start gap-2 text-lg font-bold tracking-tight">
                      <span className="min-w-0 flex-1">{c.title}</span>
                      <ArrowUpRight className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </h3>
                    <p className="mt-2 line-clamp-3 text-[15px] leading-6 text-muted-foreground">
                      {c.summary}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
