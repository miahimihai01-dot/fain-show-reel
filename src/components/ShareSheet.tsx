import { Copy, Facebook, Instagram, Mail, MessageCircle, MoreHorizontal, Music2, Send, X } from "lucide-react";
import type { ComponentType } from "react";

import { SHARE_TARGETS, copyText, shareHref, type ShareTarget } from "@/lib/share";

const ICONS: Record<ShareTarget, ComponentType<{ className?: string }>> = {
  copy: Copy,
  whatsapp: MessageCircle,
  instagram: Instagram,
  tiktok: Music2,
  facebook: Facebook,
  messenger: MessageCircle,
  telegram: Send,
  email: Mail,
  more: MoreHorizontal,
};

export function ShareSheet({
  title,
  url,
  text,
  withMore = false,
  onClose,
  onNotice,
}: {
  title: string;
  url: string;
  text: string;
  withMore?: boolean;
  onClose: () => void;
  onNotice: (msg: string) => void;
}) {
  const targets = SHARE_TARGETS.filter((t) => withMore || t.id !== "more");

  async function pick(id: ShareTarget) {
    if (id === "copy") {
      onNotice((await copyText(url)) ? "Link copiat!" : "Nu am putut copia link-ul.");
      onClose();
      return;
    }
    if (id === "more") {
      try {
        if (navigator.share) {
          await navigator.share({ title: "FainShow", text, url });
        } else {
          onNotice((await copyText(url)) ? "Link copiat!" : "Nu am putut copia link-ul.");
        }
      } catch {
        /* closed the system sheet — nothing to report */
      }
      onClose();
      return;
    }
    if (id === "instagram" || id === "tiktok") {
      // These apps have no web share link: copy ours so it can be pasted there.
      await copyText(url);
      onNotice(`Link copiat! Lipește-l în ${id === "instagram" ? "Instagram" : "TikTok"}.`);
    }
    const href = shareHref(id, url, text);
    if (href) window.open(href, "_blank", "noopener,noreferrer");
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[60] flex flex-col justify-end">
      <button type="button" aria-label="Închide" onClick={onClose} className="flex-1 bg-overlay/60" />
      <div role="dialog" aria-label={title} className="mx-auto w-full max-w-md rounded-t-2xl bg-card pb-6 animate-in slide-in-from-bottom duration-200">
        <div className="flex items-center justify-between px-4 py-3">
          <span className="w-6" />
          <h2 className="text-sm font-bold">{title}</h2>
          <button type="button" aria-label="Închide" onClick={onClose} className="text-muted-foreground">
            <X className="size-6" />
          </button>
        </div>
        <p className="mx-4 mb-3 truncate rounded-lg bg-secondary px-3 py-2 text-xs text-muted-foreground">{url}</p>
        <ul className="grid grid-cols-4 gap-y-4 px-2">
          {targets.map(({ id, label }) => {
            const Icon = ICONS[id];
            return (
              <li key={id}>
                <button type="button" onClick={() => pick(id)} className="flex w-full flex-col items-center gap-1.5 text-[11px] font-semibold">
                  <span className={`flex size-12 items-center justify-center rounded-full ${id === "copy" ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"}`}>
                    <Icon className="size-5" />
                  </span>
                  {label}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
