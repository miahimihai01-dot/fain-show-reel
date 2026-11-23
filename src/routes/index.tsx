import { createFileRoute } from "@tanstack/react-router";

import { VideoFeed } from "@/components/VideoFeed";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FainShow — Videoclipuri scurte" },
      { name: "description", content: "Dă swipe prin videoclipuri scurte verticale pe FainShow. Rapid și ușor pe telefon." },
      { property: "og:title", content: "FainShow — Videoclipuri scurte" },
      { property: "og:description", content: "Dă swipe prin videoclipuri scurte verticale pe FainShow." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return <VideoFeed />;
}
