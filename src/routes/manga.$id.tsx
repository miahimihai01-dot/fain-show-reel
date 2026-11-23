import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

import { mangas } from "@/lib/content";

export const Route = createFileRoute("/manga/$id")({
  loader: ({ params }) => {
    const manga = mangas.find((m) => m.id === params.id);
    if (!manga) throw notFound();
    return manga;
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.title} — Citește pe FainShow` },
          { name: "description", content: loaderData.description },
          { property: "og:title", content: `${loaderData.title} — FainShow` },
          { property: "og:description", content: loaderData.description },
          { property: "og:type", content: "book" },
          { name: "twitter:card", content: "summary_large_image" },
        ]
      : [{ title: "Manga indisponibilă — FainShow" }, { name: "robots", content: "noindex" }],
  }),
  notFoundComponent: () => (
    <div className="p-8 text-center">
      <p>Manga nu a fost găsită.</p>
      <Link to="/manga" className="mt-4 inline-block font-bold text-primary">
        Înapoi la manga
      </Link>
    </div>
  ),
  component: MangaReader,
});

function MangaReader() {
  const manga = Route.useLoaderData();

  return (
    <div className="mx-auto min-h-screen max-w-md pb-nav">
      <header className="sticky top-0 z-40 flex items-center gap-3 border-b border-border bg-nav px-3 py-2">
        <Link to="/manga" aria-label="Înapoi la manga" className="flex size-9 items-center justify-center rounded-full bg-secondary">
          <ArrowLeft className="size-5" />
        </Link>
        <div className="min-w-0">
          <h1 className="truncate text-sm font-bold">{manga.title}</h1>
          <p className="text-xs text-muted-foreground">Capitolul 1 din {manga.chapters}</p>
        </div>
      </header>

      <div className="space-y-1 bg-overlay">
        {manga.pages.map((page, i) => (
          <img
            key={page}
            src={page}
            alt={`${manga.title}, capitolul 1, pagina ${i + 1}`}
            loading={i === 0 ? "eager" : "lazy"}
            decoding="async"
            width={720}
            height={1080}
            className="w-full"
          />
        ))}
      </div>

      <section className="px-4 pt-5">
        <h2 className="font-display text-2xl">Capitole</h2>
        <ul className="mt-2 divide-y divide-border rounded-2xl bg-card">
          {Array.from({ length: Math.min(manga.chapters, 6) }, (_, i) => i + 1).map((n) => (
            <li key={n} className="flex items-center justify-between px-4 py-3 text-sm">
              <span className={n === 1 ? "font-bold" : "text-muted-foreground"}>Capitolul {n}</span>
              <span className={`text-xs font-bold ${n === 1 ? "text-primary" : "text-muted-foreground"}`}>
                {n === 1 ? "Citești acum" : "În curând"}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
