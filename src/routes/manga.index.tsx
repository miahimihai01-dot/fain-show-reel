import { Link, createFileRoute } from "@tanstack/react-router";

import { PosterRow } from "@/components/PosterRow";
import { SectionLayout } from "@/components/SectionLayout";
import { mangas } from "@/lib/content";

export const Route = createFileRoute("/manga/")({
  head: () => ({
    meta: [
      { title: "Manga — FainShow" },
      { name: "description", content: "Citește manga pe FainShow: coperte, capitole și rating." },
      { property: "og:title", content: "Manga — FainShow" },
      { property: "og:description", content: "Citește manga pe FainShow: coperte, capitole și rating." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MangaPage,
});

function MangaPage() {
  return (
    <SectionLayout title="Manga">
      <ul className="space-y-3 px-4 pt-3">
        {mangas.map((m) => (
          <PosterRow key={m.id} image={m.cover} alt={`Copertă ${m.title}`} title={m.title} rating={m.rating} meta={m.genre}>
            <p className="mt-1.5 text-xs font-bold">{m.chapters} capitole</p>
            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{m.description}</p>
            <Link
              to="/manga/$id"
              params={{ id: m.id }}
              className="mt-auto inline-flex h-9 w-fit items-center rounded-lg bg-primary px-5 text-sm font-bold text-primary-foreground"
            >
              Citește
            </Link>
          </PosterRow>
        ))}
      </ul>
    </SectionLayout>
  );
}
