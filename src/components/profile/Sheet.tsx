import { X } from "lucide-react";
import type { ReactNode } from "react";

export function Sheet({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-[60] flex flex-col justify-end">
      <button type="button" aria-label="Închide" onClick={onClose} className="flex-1 bg-overlay/60" />
      <div role="dialog" aria-label={title} className="mx-auto max-h-[85vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-card pb-6 animate-in slide-in-from-bottom duration-200">
        <div className="sticky top-0 flex items-center justify-between border-b border-border bg-card px-4 py-3">
          <span className="w-6" />
          <h2 className="text-sm font-bold">{title}</h2>
          <button type="button" aria-label="Închide" onClick={onClose} className="text-muted-foreground">
            <X className="size-6" />
          </button>
        </div>
        <div className="px-4 pt-4">{children}</div>
      </div>
    </div>
  );
}
