import { createFileRoute } from "@tanstack/react-router";

import { VideoFeed } from "@/components/VideoFeed";

export const Route = createFileRoute("/video/$id")({
  head: () => ({
    meta: [
      { title: "Videoclip — FainShow" },
      { name: "description", content: "Urmărește acest videoclip scurt pe FainShow." },
      { property: "og:title", content: "Videoclip — FainShow" },
      { property: "og:description", content: "Urmărește acest videoclip scurt pe FainShow." },
      { property: "og:type", content: "video.other" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: VideoPage,
});

function VideoPage() {
  const { id } = Route.useParams();
  return <VideoFeed key={id} startId={id} />;
}
