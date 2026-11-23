import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { PosterRow } from "@/components/PosterRow";
import { SectionLayout } from "@/components/SectionLayout";
import { audienceLabel, cartoons, type Audience } from "@/lib/content";

export const Route = createFileRoute("/desene")({
  head: () => ({
    meta: [
      { title: "Desene animate — FainShow" },
      { name: "description", content: "Desene animate pentru copii și pentru adulți pe FainShow." },
      { property: "og:title", content: "Desene animate — FainShow" },
      { property: "og:description", content: "Desene animate pentru copii și pentru adulți pe FainShow." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CartoonsPage,
});

const filters: { value: Audience | "toate"; label: string }[] = [
  { value: "toate", label: "Toate" },
  { value: "copii", label: "Copii" },
  { value: "adulti", label: "Adulți" },
];

function CartoonsPage() {
  const [filter, setFilter] = useState<Audience | "toate">("toate");
  const list = cartoons.filter((c) => filter === "toate" || c.audience === filter);

  return (
    <SectionLayout title="Desene animate">
      <div className="flex gap-2 px-4 pt-3" role="group" aria-label="Filtru public">
        {filters.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFilter(f.value)}
            aria-pressed={filter === f.value}
            className={`h-9 rounded-full px-4 text-sm font-bold ${
              filter === f.value ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
      <ul className="space-y-3 px-4 pt-3">
        {list.map((c) => (
          <PosterRow
            key={c.id}
            image={c.poster}
            alt={`Afiș ${c.title}`}
            title={c.title}
            rating={c.rating}
            meta={`${c.episodes} episoade`}
          >
            <p className="mt-1.5 line-clamp-3 text-xs leading-relaxed text-muted-foreground">{c.description}</p>
            <span
              className={`mt-auto w-fit rounded-md px-2.5 py-1 text-xs font-bold ${
                c.audience === "adulti" ? "bg-primary text-primary-foreground" : "bg-accent"
              }`}
            >
              {audienceLabel[c.audience]}
            </span>
          </PosterRow>
        ))}
      </ul>
    </SectionLayout>
  );
}
