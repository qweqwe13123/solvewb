import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Lock, Tag, Users } from "lucide-react";
import { getCourseBySlug } from "@/lib/community.functions";
import { mediaUrl } from "@/lib/media";
import { CoverImage } from "@/components/Media";

export const Route = createFileRoute("/course/$slug")({
  loader: async ({ params }) => {
    const { course } = await getCourseBySlug({ data: { slug: params.slug } });
    if (!course) throw notFound();
    return { course };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Course unavailable" }, { name: "robots", content: "noindex" }],
      };
    }
    const { course } = loaderData;
    const description = course.summary || `${course.title} course.`;
    return {
      meta: [
        { title: course.title },
        { name: "description", content: description },
        { property: "og:title", content: course.title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  errorComponent: () => <Fallback title="Не удалось загрузить курс" />,
  notFoundComponent: () => <Fallback title="Курс не найден" />,
  component: CoursePage,
});

function Fallback({ title }: { title: string }) {
  return (
    <div className="mx-auto grid min-h-screen max-w-2xl place-items-center px-4 text-center">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        <Link to="/" className="mt-4 inline-block text-[15px] underline">
          На главную
        </Link>
      </div>
    </div>
  );
}

function CoursePage() {
  const { course } = Route.useLoaderData();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b border-border bg-card">
        <div className="mx-auto flex h-16 max-w-4xl items-center px-4">
          <Link to="/" className="flex items-center gap-3">
            <CoverImage
              path={course?.coverUrl ?? null}
              alt={course.title}
              width={36}
              height={36}
              className="size-9 rounded-lg object-cover"
            />
            <span className="text-lg font-semibold">{course.title}</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6">
        <article className="rounded-xl border border-border bg-card p-5 sm:p-8">
          <h1 className="text-2xl font-bold sm:text-3xl">{course.title}</h1>
          {course.summary ? (
            <p className="mt-3 text-[15px] leading-6 text-muted-foreground">{course.summary}</p>
          ) : null}

          {course.videoUrl ? (
            <video
              src={mediaUrl(course.videoUrl)}
              poster={course.coverUrl ? mediaUrl(course.coverUrl) : undefined}
              controls
              className="mt-5 aspect-video w-full rounded-lg bg-black"
            />
          ) : course.coverUrl ? (
            <img
              src={mediaUrl(course.coverUrl)}
              alt={course.title}
              className="mt-5 aspect-video w-full rounded-lg object-cover"
            />
          ) : null}

          {course.gallery.length > 0 ? (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {course.gallery.map((p: string) => (
                <img
                  key={p}
                  src={mediaUrl(p)}
                  alt={`${course.title} preview`}
                  loading="lazy"
                  className="h-24 w-36 shrink-0 rounded-md object-cover"
                />
              ))}
            </div>
          ) : null}

          <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-3 border-b border-border pb-6 text-sm">
            <span className="flex items-center gap-2">
              <Lock className="size-4 text-muted-foreground" /> Private
            </span>
            <span className="flex items-center gap-2">
              <Users className="size-4 text-muted-foreground" /> {course.title}
            </span>
            <span className="flex items-center gap-2">
              <Tag className="size-4 text-muted-foreground" /> {course.priceLabel}
            </span>
          </div>

          <div className="mt-6 space-y-4 text-[15px] leading-7 whitespace-pre-line">
            {course.description}
          </div>

          <Link
            to="/c"
            className="mt-8 block w-full rounded-lg bg-join py-3.5 text-center text-sm font-semibold tracking-wide text-join-foreground uppercase transition-opacity hover:opacity-90 sm:inline-block sm:w-auto sm:px-10"
          >
            Join {course.priceLabel}
          </Link>
        </article>
      </main>
    </div>
  );
}
