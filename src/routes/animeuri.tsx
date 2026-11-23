import { createFileRoute } from "@tanstack/react-router";

import { PosterRow } from "@/components/PosterRow";
import { SectionLayout } from "@/components/SectionLayout";
import { animes } from "@/lib/content";

export const Route = createFileRoute("/animeuri")({
  head: () => ({
    meta: [
      { title: "Animeuri — FainShow" },
      { name: "description", content: "Animeuri cu episoade și rating pe FainShow." },
      { property: "og:title", content: "Animeuri — FainShow" },
      { property: "og:description", content: "Animeuri cu episoade și rating pe FainShow." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AnimePage,
});

function AnimePage() {
  return (
    <SectionLayout title="Animeuri">
      <ul className="space-y-3 px-4 pt-3">
        {animes.map((a) => (
          <PosterRow key={a.id} image={a.poster} alt={`Afiș ${a.title}`} title={a.title} rating={a.rating}>
            <p className="mt-1.5 text-xs text-muted-foreground">{a.genre}</p>
            <span className="mt-auto w-fit rounded-md bg-accent px-2.5 py-1 text-xs font-bold">
              {a.episodes} episoade
            </span>
          </PosterRow>
        ))}
      </ul>
    </SectionLayout>
  );
}
