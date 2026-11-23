import type { ReactNode } from "react";

export function PageHeader({ title, right }: { title: string; right?: ReactNode }) {
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-nav px-4 py-3">
      <div className="flex items-baseline gap-2">
        <span className="font-display text-3xl leading-none text-gradient-brand">FainShow</span>
        <span className="text-sm font-semibold text-muted-foreground">· {title}</span>
      </div>
      {right}
    </header>
  );
}
