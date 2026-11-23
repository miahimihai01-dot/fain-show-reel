import { Star } from "lucide-react";
import type { ReactNode } from "react";

import { formatRating } from "@/lib/content";

/** One list row: poster on the left, details on the right. Images are lazy so long lists stay light. */
export function PosterRow({
  image,
  alt,
  title,
  rating,
  meta,
  children,
}: {
  image: string;
  alt: string;
  title: string;
  rating: number;
  meta?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <li className="flex gap-3 rounded-2xl bg-card p-2.5">
      <img
        src={image}
        alt={alt}
        loading="lazy"
        decoding="async"
        width={360}
        height={540}
        className="aspect-[2/3] w-24 shrink-0 rounded-xl object-cover"
      />
      <div className="flex min-w-0 flex-1 flex-col py-0.5">
        <h2 className="text-base font-bold leading-tight">{title}</h2>
        <p className="mt-1 flex items-center gap-1 text-sm font-bold">
          <Star className="size-4 fill-primary text-primary" />
          {formatRating(rating)}
          {meta && <span className="ml-1 truncate font-medium text-muted-foreground">· {meta}</span>}
        </p>
        {children}
      </div>
    </li>
  );
}
