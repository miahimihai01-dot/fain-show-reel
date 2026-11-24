export type ShareTarget =
  | "copy" | "whatsapp" | "instagram" | "tiktok" | "facebook" | "messenger" | "telegram" | "email" | "more";

export const SHARE_TARGETS: { id: ShareTarget; label: string }[] = [
  { id: "copy", label: "Copiază link" },
  { id: "whatsapp", label: "WhatsApp" },
  { id: "instagram", label: "Instagram" },
  { id: "tiktok", label: "TikTok" },
  { id: "facebook", label: "Facebook" },
  { id: "messenger", label: "Messenger" },
  { id: "telegram", label: "Telegram" },
  { id: "email", label: "Email" },
  { id: "more", label: "Mai multe" },
];

/** Web address that opens the chosen app with the link filled in (null = copy the link instead). */
export function shareHref(target: ShareTarget, url: string, text: string): string | null {
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(text);
  switch (target) {
    case "whatsapp": return `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`;
    case "facebook": return `https://www.facebook.com/sharer/sharer.php?u=${u}`;
    case "messenger": return `fb-messenger://share/?link=${u}`;
    case "telegram": return `https://t.me/share/url?url=${u}&text=${t}`;
    case "email": return `mailto:?subject=${t}&body=${encodeURIComponent(`${text}\n${url}`)}`;
    case "instagram": return "https://www.instagram.com/";
    case "tiktok": return "https://www.tiktok.com/";
    default: return null;
  }
}

/** Copies text; falls back to a hidden textarea when the clipboard API is blocked (e.g. in a frame). */
export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const el = document.createElement("textarea");
    el.value = text;
    el.setAttribute("readonly", "");
    el.style.position = "fixed";
    el.style.opacity = "0";
    document.body.appendChild(el);
    el.select();
    const ok = document.execCommand("copy");
    el.remove();
    return ok;
  }
}
