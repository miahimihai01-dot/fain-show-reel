import type { Session } from "@supabase/supabase-js";

/** Whole days since the account was created (0 on the first day). */
export function daysInApp(createdAt: string, now: Date = new Date()): number {
  const start = new Date(createdAt).getTime();
  if (Number.isNaN(start)) return 0;
  return Math.max(0, Math.floor((now.getTime() - start) / 86_400_000));
}

export function formatJoinDate(createdAt: string): string {
  return new Date(createdAt).toLocaleDateString("ro-RO", { day: "numeric", month: "long", year: "numeric" });
}

export type SavedAccount = {
  id: string;
  email: string;
  label: string;
  access_token: string;
  refresh_token: string;
};

const KEY = "fainshow.accounts";

export function loadAccounts(): SavedAccount[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

/** Adds or refreshes an account in the list, keeping the order stable. */
export function upsertAccount(list: SavedAccount[], acc: SavedAccount): SavedAccount[] {
  const i = list.findIndex((a) => a.id === acc.id);
  if (i === -1) return [...list, acc];
  const next = [...list];
  next[i] = { ...acc, label: acc.label || list[i]!.label };
  return next;
}

export function removeAccount(list: SavedAccount[], id: string): SavedAccount[] {
  return list.filter((a) => a.id !== id);
}

function store(list: SavedAccount[]) {
  localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new Event("fainshow-accounts"));
}

/** Remembers the current session so the user can switch back to it later. */
export function rememberSession(s: Session | null) {
  if (typeof window === "undefined" || !s) return;
  const meta = s.user.user_metadata as Record<string, unknown>;
  const label = String(meta["username"] ?? meta["display_name"] ?? meta["full_name"] ?? "");
  store(
    upsertAccount(loadAccounts(), {
      id: s.user.id,
      email: s.user.email ?? "",
      label,
      access_token: s.access_token,
      refresh_token: s.refresh_token,
    }),
  );
}

export function forgetAccount(id: string) {
  store(removeAccount(loadAccounts(), id));
}
