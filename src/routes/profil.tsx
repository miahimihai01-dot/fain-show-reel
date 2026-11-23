import { createFileRoute } from "@tanstack/react-router";
import { Heart } from "lucide-react";

import { PageHeader } from "@/components/PageHeader";
import { clips, formatCount } from "@/lib/content";

export const Route = createFileRoute("/profil")({
  head: () => ({
    meta: [
      { title: "Profil — FainShow" },
      { name: "description", content: "Profilul tău FainShow: videoclipuri, urmăritori și aprecieri." },
      { property: "og:title", content: "Profil — FainShow" },
      { property: "og:description", content: "Profilul tău FainShow: videoclipuri, urmăritori și aprecieri." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProfilePage,
});

const stats = [
  { label: "Urmăriri", value: 128 },
  { label: "Urmăritori", value: 2450 },
  { label: "Aprecieri", value: 18700 },
];

function ProfilePage() {
  return (
    <div className="mx-auto min-h-screen max-w-md pb-nav">
      <PageHeader title="Profil" />
      <div className="flex flex-col items-center px-4 pt-6 text-center">
        <span className="flex size-24 items-center justify-center rounded-full bg-gradient-brand font-display text-5xl text-primary-foreground shadow-glow">
          F
        </span>
        <h1 className="mt-3 text-lg font-bold">@utilizator.fain</h1>
        <p className="mt-1 text-sm text-muted-foreground">Iubesc filmele și videoclipurile scurte 🎬</p>

        <dl className="mt-5 grid w-full grid-cols-3 gap-2">
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col-reverse">
              <dt className="text-xs text-muted-foreground">{s.label}</dt>
              <dd className="font-display text-2xl">{formatCount(s.value)}</dd>
            </div>
          ))}
        </dl>

        <button type="button" className="mt-5 h-10 w-full rounded-lg border border-border bg-card text-sm font-bold">
          Editează profilul
        </button>
      </div>

      <h2 className="mt-6 border-b-2 border-primary px-4 pb-2 text-center text-sm font-bold">Videoclipuri</h2>
      <ul className="grid grid-cols-3 gap-0.5 pt-0.5">
        {clips.map((c) => (
          <li key={c.id} className="relative">
            <img src={c.poster} alt={c.description} loading="lazy" decoding="async" className="aspect-[9/16] w-full object-cover" />
            <span className="absolute bottom-1 left-1 flex items-center gap-1 text-xs font-bold text-shadow-soft">
              <Heart className="size-3 fill-current" />
              {formatCount(c.likes)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
