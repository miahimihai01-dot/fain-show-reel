import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { ArrowLeft, Star } from "lucide-react";

import { formatRating, movies } from "@/lib/content";

export const Route = createFileRoute("/filme/$id")({
  loader: ({ params }) => {
    const movie = movies.find((m) => m.id === params.id);
    if (!movie) throw notFound();
    return movie;
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.title} — FainShow` },
          { name: "description", content: loaderData.description },
          { property: "og:title", content: `${loaderData.title} — FainShow` },
          { property: "og:description", content: loaderData.description },
          { property: "og:type", content: "video.movie" },
          { name: "twitter:card", content: "summary_large_image" },
        ]
      : [{ title: "Film indisponibil — FainShow" }, { name: "robots", content: "noindex" }],
  }),
  notFoundComponent: () => (
    <div className="p-8 text-center">
      <p>Filmul nu a fost găsit.</p>
      <Link to="/filme" className="mt-4 inline-block font-bold text-primary">
        Înapoi la filme
      </Link>
    </div>
  ),
  component: MoviePage,
});

function MoviePage() {
  const movie = Route.useLoaderData();

  return (
    <div className="mx-auto min-h-screen max-w-md pb-nav">
      <div className="relative">
        <img src={movie.poster} alt={`Afiș ${movie.title}`} className="aspect-[2/3] max-h-[60vh] w-full object-cover" />
        <div className="absolute inset-0 bg-fade-bottom" />
        <Link
          to="/filme"
          aria-label="Înapoi la filme"
          className="absolute left-3 top-3 flex size-10 items-center justify-center rounded-full bg-overlay/60"
        >
          <ArrowLeft className="size-5" />
        </Link>
        <div className="absolute inset-x-0 bottom-0 px-4 pb-4">
          <h1 className="font-display text-5xl leading-none">{movie.title}</h1>
          <p className="mt-2 flex items-center gap-1 text-sm font-bold">
            <Star className="size-4 fill-primary text-primary" />
            {formatRating(movie.rating)}
            <span className="ml-1 font-medium text-muted-foreground">
              · {movie.genre} · {movie.year}
            </span>
          </p>
        </div>
      </div>
      <div className="px-4 pt-4">
        <p className="text-sm leading-relaxed text-muted-foreground">{movie.description}</p>
        <h2 className="mt-6 font-display text-2xl">Trailer</h2>
        {/* Loads only when the user presses play. */}
        <video
          src="/videos/short-3.mp4"
          poster={movie.poster}
          preload="none"
          controls
          playsInline
          className="mt-2 aspect-video w-full rounded-2xl bg-overlay object-cover"
        />
        <p className="mt-2 text-xs text-muted-foreground">Trailer de exemplu.</p>
      </div>
    </div>
  );
}
