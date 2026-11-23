import type { ReactNode } from "react";

import { TopTabs } from "@/components/TopTabs";

/** Shell for the Filme / Animeuri / Desene / Manga sections: logo, top menu, content. */
export function SectionLayout({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mx-auto min-h-screen max-w-md pb-nav">
      <header className="sticky top-0 z-40 border-b border-border bg-nav">
        <TopTabs />
      </header>
      <h1 className="px-4 pt-4 font-display text-4xl">{title}</h1>
      {children}
    </div>
  );
}
