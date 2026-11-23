import { createFileRoute } from "@tanstack/react-router";
import { Search, Star } from "lucide-react";
import { useState } from "react";

import { PageHeader } from "@/components/PageHeader";
import { animes, cartoons, clips, mangas, movies } from "@/lib/content";

export const Route = createFileRoute("/cautare")({
  head: () => ({
    meta: [
      { title: "Căutare — FainShow" },
      { name: "description", content: "Caută filme, videoclipuri și creatori pe FainShow." },
      { property: "og:title", content: "Căutare — FainShow" },
      { property: "og:description", content: "Caută filme, videoclipuri și creatori pe FainShow." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SearchPage,
});

function normalize(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function SearchPage() {
  const [query, setQuery] = useState("");
  const q = normalize(query.trim());
  const foundMovies = movies.filter((m) => !q || normalize(`${m.title} ${m.genre}`).includes(q));
  const others = [
    ...animes.map((a) => ({ id: `a-${a.id}`, title: a.title, kind: `Anime · ${a.episodes} episoade`, image: a.poster })),
    ...cartoons.map((c) => ({ id: `d-${c.id}`, title: c.title, kind: `Desene · ${c.episodes} episoade`, image: c.poster })),
    ...mangas.map((m) => ({ id: `m-${m.id}`, title: m.title, kind: `Manga · ${m.chapters} capitole`, image: m.cover })),
  ].filter((o) => q && normalize(`${o.title} ${o.kind}`).includes(q));
  const foundClips = clips.filter((c) => !q || normalize(`${c.username} ${c.description} ${c.song}`).includes(q));

  return (
    <div className="mx-auto min-h-screen max-w-md pb-nav">
      <PageHeader title="Căutare" />
      <div className="px-4 pt-3">
        <label className="flex h-11 items-center gap-2 rounded-full bg-secondary px-4 focus-within:ring-2 focus-within:ring-ring">
          <Search className="size-5 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Caută filme, anime, manga..."
            aria-label="Caută"
            className="h-full flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </label>
      </div>

      {foundClips.length > 0 && (
        <section className="mt-5 px-4">
          <h2 className="font-display text-2xl">Creatori</h2>
          <ul className="mt-2 space-y-2">
            {foundClips.map((c) => (
              <li key={c.id} className="flex items-center gap-3 rounded-xl bg-card p-2">
                <img src={c.poster} alt="" loading="lazy" decoding="async" className="h-14 w-10 rounded-md object-cover" />
                <div className="min-w-0">
                  <p className="text-sm font-bold">@{c.username}</p>
                  <p className="truncate text-xs text-muted-foreground">{c.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {others.length > 0 && (
        <section className="mt-5 px-4">
          <h2 className="font-display text-2xl">Animeuri, desene, manga</h2>
          <ul className="mt-2 space-y-2">
            {others.map((o) => (
              <li key={o.id} className="flex items-center gap-3 rounded-xl bg-card p-2">
                <img src={o.image} alt="" loading="lazy" decoding="async" className="h-14 w-10 rounded-md object-cover" />
                <div className="min-w-0">
                  <p className="text-sm font-bold">{o.title}</p>
                  <p className="truncate text-xs text-muted-foreground">{o.kind}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-6 px-4">
        <h2 className="font-display text-2xl">Filme populare</h2>
        {foundMovies.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">Niciun rezultat pentru „{query}”.</p>
        ) : (
          <ul className="mt-2 grid grid-cols-3 gap-2">
            {foundMovies.map((m) => (
              <li key={m.id}>
                <div className="relative overflow-hidden rounded-lg bg-card">
                  <img
                    src={m.poster}
                    alt={`Afiș ${m.title}`}
                    loading="lazy"
                    decoding="async"
                    width={360}
                    height={540}
                    className="aspect-[2/3] w-full object-cover"
                  />
                  <span className="absolute right-1 top-1 flex items-center gap-0.5 rounded-md bg-overlay/70 px-1.5 py-0.5 text-[10px] font-bold">
                    <Star className="size-3 fill-primary text-primary" />
                    {m.rating.toString().replace(".", ",")}
                  </span>
                </div>
                <p className="mt-1 truncate text-xs font-bold">{m.title}</p>
                <p className="text-[11px] text-muted-foreground">
                  {m.genre} · {m.year}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
