import { createFileRoute } from "@tanstack/react-router";
import { Camera, Upload } from "lucide-react";
import { useEffect, useState } from "react";

import { PageHeader } from "@/components/PageHeader";
import { MAX_SHORT_SECONDS, formatDuration, isShortDurationAllowed } from "@/lib/content";

export const Route = createFileRoute("/creeaza")({
  head: () => ({
    meta: [
      { title: "Creează — FainShow" },
      { name: "description", content: "Filmează sau încarcă un videoclip scurt pe FainShow." },
      { property: "og:title", content: "Creează — FainShow" },
      { property: "og:description", content: "Filmează sau încarcă un videoclip scurt pe FainShow." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CreatePage,
});

function CreatePage() {
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  // Read only the video's length (no full load) and reject anything over 3 minutes.
  const onFile = (file: File | undefined) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    const probe = document.createElement("video");
    probe.preload = "metadata";
    probe.onloadedmetadata = () => {
      if (isShortDurationAllowed(probe.duration)) {
        setError(null);
        setPreview(url);
      } else {
        URL.revokeObjectURL(url);
        setPreview(null);
        setError(
          `Videoclipul are ${formatDuration(probe.duration)} min. Un videoclip scurt poate avea maxim ${MAX_SHORT_SECONDS / 60} minute.`,
        );
      }
    };
    probe.onerror = () => {
      URL.revokeObjectURL(url);
      setError("Nu am putut citi videoclipul. Încearcă alt fișier.");
    };
    probe.src = url;
  };

  return (
    <div className="mx-auto min-h-screen max-w-md pb-nav">
      <PageHeader title="Creează" />
      <div className="px-4 pt-6">
        <h1 className="font-display text-4xl">Videoclip nou</h1>
        <p className="mt-1 text-sm text-muted-foreground">Filmează sau alege un videoclip vertical din telefon. Maxim 3 minute.</p>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <label className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl bg-gradient-brand p-6 text-center font-bold text-primary-foreground shadow-glow">
            <Camera className="size-8" />
            Filmează
            <input type="file" accept="video/*" capture="environment" className="sr-only" onChange={(e) => onFile(e.target.files?.[0])} />
          </label>
          <label className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border border-border bg-card p-6 text-center font-bold">
            <Upload className="size-8" />
            Încarcă
            <input type="file" accept="video/*" className="sr-only" onChange={(e) => onFile(e.target.files?.[0])} />
          </label>
        </div>

        {error && (
          <p role="alert" className="mt-4 rounded-xl border border-primary bg-accent p-3 text-sm font-semibold">
            {error}
          </p>
        )}

        {preview && (
          <div className="mt-6">
            <video src={preview} controls playsInline className="aspect-[9/16] w-full rounded-2xl bg-overlay object-cover" />
            <p className="mt-3 rounded-xl bg-card p-3 text-center text-sm text-muted-foreground">
              Previzualizare gata. Publicarea va fi disponibilă în curând.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
