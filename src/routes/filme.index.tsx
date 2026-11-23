import { Link, createFileRoute } from "@tanstack/react-router";

import { PosterRow } from "@/components/PosterRow";
import { SectionLayout } from "@/components/SectionLayout";
import { movies } from "@/lib/content";

export const Route = createFileRoute("/filme/")({
  head: () => ({
    meta: [
      { title: "Filme — FainShow" },
      { name: "description", content: "Filme cu rating și descriere pe FainShow. Alege și apasă Vezi." },
      { property: "og:title", content: "Filme — FainShow" },
      { property: "og:description", content: "Filme cu rating și descriere pe FainShow." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MoviesPage,
});

function MoviesPage() {
  return (
    <SectionLayout title="Filme">
      <ul className="space-y-3 px-4 pt-3">
        {movies.map((m) => (
          <PosterRow key={m.id} image={m.poster} alt={`Afiș ${m.title}`} title={m.title} rating={m.rating}>
            <p className="mt-1.5 line-clamp-3 text-xs leading-relaxed text-muted-foreground">{m.description}</p>
            <Link
              to="/filme/$id"
              params={{ id: m.id }}
              className="mt-auto inline-flex h-9 w-fit items-center rounded-lg bg-primary px-5 text-sm font-bold text-primary-foreground"
            >
              Vezi
            </Link>
          </PosterRow>
        ))}
      </ul>
    </SectionLayout>
  );
}
