import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronsUpDown, Search } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CoverImage } from "@/components/Media";
import type { Course } from "@/lib/community.functions";

export function CourseSwitcher({
  title,
  logo,
  courses,
}: {
  title: string;
  logo?: string | null;
  courses: Course[];
}) {
  const [query, setQuery] = useState("");
  const filtered = courses.filter((c) =>
    c.title.toLowerCase().includes(query.trim().toLowerCase()),
  );

  const defaultLogo = logo || "/assets/community-cover.jpg";

  return (
    <div className="flex items-center gap-3">
      <CoverImage
        path={defaultLogo}
        alt={`${title} logo`}
        width={40}
        height={40}
        className="size-10 shrink-0 rounded-lg object-cover"
      />
      <span className="text-lg font-semibold">{title}</span>
      <Popover>
        <PopoverTrigger
          aria-label="Switch course"
          className="grid size-8 place-items-center rounded-full bg-accent text-muted-foreground transition-colors hover:bg-muted"
        >
          <ChevronsUpDown className="size-4" />
        </PopoverTrigger>
        <PopoverContent align="start" sideOffset={12} className="w-80 rounded-xl p-3 shadow-lg">
          <div className="flex items-center gap-2 rounded-full bg-accent px-4 py-2.5">
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search"
              className="w-full bg-transparent text-[15px] outline-none placeholder:text-muted-foreground"
            />
          </div>

          <div className="mt-2 space-y-1">
            {filtered.map((c) => (
              <Link
                key={c.id}
                to="/course/$slug"
                params={{ slug: c.slug }}
                className="flex w-full items-center gap-3 rounded-lg p-2 transition-colors hover:bg-accent"
              >
                <CoverImage
                  path={c.coverUrl || defaultLogo}
                  alt={c.title}
                  loading="lazy"
                  width={40}
                  height={40}
                  className="size-10 shrink-0 rounded-lg object-cover"
                />
                <span className="min-w-0 truncate text-[15px] font-semibold">{c.title}</span>
              </Link>
            ))}

            {filtered.length === 0 ? (
              <p className="px-2 py-3 text-sm text-muted-foreground">No results found</p>
            ) : null}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
