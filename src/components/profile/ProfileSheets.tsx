import { useQueryClient } from "@tanstack/react-query";
import { Camera, Check, LogOut, Plus, Trash2 } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";

import { AuthPanel } from "@/components/chat/AuthPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { forgetAccount, loadAccounts, type SavedAccount } from "@/lib/accounts";
import type { PublicProfile } from "@/lib/library";

import { Sheet } from "./Sheet";

type Me = PublicProfile & { avatarSrc: string | null };

function useRefreshProfile(uid: string, username: string) {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: ["profileById", uid] });
    qc.invalidateQueries({ queryKey: ["profile", username] });
  };
}

async function saveProfile(uid: string, patch: Partial<Pick<PublicProfile, "username" | "display_name" | "bio" | "avatar_url">>) {
  const { error } = await supabase.from("profiles").update(patch).eq("id", uid);
  if (error) throw error;
}

function errText(e: unknown) {
  const msg = e instanceof Error ? e.message : String((e as { message?: string })?.message ?? e);
  if (/duplicate|unique/i.test(msg)) return "Numele de utilizator e deja luat.";
  return "Nu am putut salva. Încearcă din nou.";
}

const USERNAME = /^[a-z0-9._]{3,24}$/;

export function EditProfileSheet({ me, onClose, onNotice }: { me: Me; onClose: () => void; onNotice: (m: string) => void }) {
  const refresh = useRefreshProfile(me.id, me.username);
  const [name, setName] = useState(me.display_name);
  const [username, setUsername] = useState(me.username);
  const [bio, setBio] = useState(me.bio);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const u = username.trim().toLowerCase();
    if (!USERNAME.test(u)) return setError("Folosește 3–24 caractere: litere mici, cifre, punct sau _.");
    if (!name.trim()) return setError("Scrie un nume.");
    setBusy(true);
    setError(null);
    try {
      await saveProfile(me.id, { display_name: name.trim(), username: u, bio: bio.trim().slice(0, 160) });
      refresh();
      onNotice("Profil actualizat");
      onClose();
    } catch (err) {
      setError(errText(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Sheet title="Editează profilul" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <label className="block text-sm font-semibold">
          Nume
          <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1" maxLength={40} />
        </label>
        <label className="block text-sm font-semibold">
          Nume de utilizator
          <Input value={username} onChange={(e) => setUsername(e.target.value)} className="mt-1" maxLength={24} />
        </label>
        <label className="block text-sm font-semibold">
          Bio
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={160}
            rows={3}
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </label>
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <Button type="submit" disabled={busy} className="w-full">{busy ? "Se salvează..." : "Salvează"}</Button>
      </form>
    </Sheet>
  );
}

export function SettingsSheet({ me, onClose, onNotice }: { me: Me; onClose: () => void; onNotice: (m: string) => void }) {
  const refresh = useRefreshProfile(me.id, me.username);
  const [name, setName] = useState(me.display_name);
  const [pass, setPass] = useState("");
  const [pass2, setPass2] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function uploadPhoto(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) return setError("Alege o poză.");
    if (file.size > 5 * 1024 * 1024) return setError("Poza trebuie să aibă maxim 5 MB.");
    setBusy("photo");
    setError(null);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${me.id}/avatar-${Date.now()}.${ext}`;
      const { error: up } = await supabase.storage.from("avatars").upload(path, file, { contentType: file.type });
      if (up) throw up;
      await saveProfile(me.id, { avatar_url: path });
      refresh();
      onNotice("Poza a fost schimbată");
    } catch (err) {
      setError(errText(err));
    } finally {
      setBusy(null);
    }
  }

  async function saveName(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return setError("Scrie un nume.");
    setBusy("name");
    setError(null);
    try {
      await saveProfile(me.id, { display_name: name.trim() });
      refresh();
      onNotice("Numele a fost schimbat");
    } catch (err) {
      setError(errText(err));
    } finally {
      setBusy(null);
    }
  }

  async function savePass(e: FormEvent) {
    e.preventDefault();
    if (pass.length < 6) return setError("Parola trebuie să aibă cel puțin 6 caractere.");
    if (pass !== pass2) return setError("Parolele nu se potrivesc.");
    setBusy("pass");
    setError(null);
    const { error: err } = await supabase.auth.updateUser({ password: pass });
    setBusy(null);
    if (err) return setError(/same|different/i.test(err.message) ? "Alege o parolă diferită de cea veche." : "Nu am putut schimba parola.");
    setPass("");
    setPass2("");
    onNotice("Parola a fost schimbată");
  }

  return (
    <Sheet title="Setări" onClose={onClose}>
      <section className="flex items-center gap-4">
        <Avatar me={me} size="size-16" />
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-semibold">
          <Camera className="size-4" />
          {busy === "photo" ? "Se încarcă..." : "Schimbă poza"}
          <input type="file" accept="image/*" className="sr-only" onChange={(e) => uploadPhoto(e.target.files?.[0])} />
        </label>
      </section>

      <form onSubmit={saveName} className="mt-6 space-y-2">
        <label className="block text-sm font-semibold">
          Nume
          <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1" maxLength={40} />
        </label>
        <Button type="submit" variant="secondary" disabled={busy === "name"} className="w-full">Schimbă numele</Button>
      </form>

      <form onSubmit={savePass} className="mt-6 space-y-2">
        <p className="text-sm font-semibold">Parolă nouă</p>
        <Input type="password" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="Parolă nouă" autoComplete="new-password" aria-label="Parolă nouă" />
        <Input type="password" value={pass2} onChange={(e) => setPass2(e.target.value)} placeholder="Repetă parola" autoComplete="new-password" aria-label="Repetă parola" />
        <Button type="submit" variant="secondary" disabled={busy === "pass"} className="w-full">Schimbă parola</Button>
      </form>

      {error && <p role="alert" className="mt-4 text-sm text-destructive">{error}</p>}
    </Sheet>
  );
}

export function Avatar({ me, size }: { me: Me; size: string }) {
  return me.avatarSrc ? (
    <img src={me.avatarSrc} alt={me.display_name} className={`${size} rounded-full object-cover ring-2 ring-primary`} />
  ) : (
    <span className={`${size} flex items-center justify-center rounded-full bg-gradient-brand font-display text-3xl text-primary-foreground`}>
      {(me.display_name || me.username).charAt(0).toUpperCase()}
    </span>
  );
}

function useAccounts() {
  const [list, setList] = useState<SavedAccount[]>([]);
  useEffect(() => {
    const read = () => setList(loadAccounts());
    read();
    window.addEventListener("fainshow-accounts", read);
    return () => window.removeEventListener("fainshow-accounts", read);
  }, []);
  return list;
}

export function SwitchAccountSheet({ currentId, onClose, onNotice }: { currentId: string; onClose: () => void; onNotice: (m: string) => void }) {
  const qc = useQueryClient();
  const accounts = useAccounts();
  const [adding, setAdding] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  async function switchTo(a: SavedAccount) {
    if (a.id === currentId) return onClose();
    setBusy(a.id);
    const { error } = await supabase.auth.setSession({ access_token: a.access_token, refresh_token: a.refresh_token });
    setBusy(null);
    if (error) {
      forgetAccount(a.id);
      onNotice("Contul a expirat. Intră din nou în el.");
      setAdding(true);
      return;
    }
    qc.clear();
    onNotice(`Ai trecut pe ${a.label ? "@" + a.label : a.email}`);
    onClose();
  }

  async function signOut() {
    forgetAccount(currentId);
    qc.clear();
    await supabase.auth.signOut({ scope: "local" });
    const next = loadAccounts()[0];
    if (next) await switchTo(next);
    else onClose();
  }

  return (
    <Sheet title={adding ? "Adaugă cont" : "Schimbă contul"} onClose={onClose}>
      {adding ? (
        <div className="-mx-4">
          <AuthPanel next="/profil" />
          <button type="button" onClick={() => setAdding(false)} className="mx-auto mt-2 block text-sm text-muted-foreground underline">Înapoi la conturi</button>
        </div>
      ) : (
        <>
          <ul className="space-y-2">
            {accounts.map((a) => (
              <li key={a.id} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => switchTo(a)}
                  disabled={busy !== null}
                  className={`flex flex-1 items-center gap-3 rounded-lg border px-3 py-3 text-left ${a.id === currentId ? "border-primary bg-primary/10" : "border-border"}`}
                >
                  <span className="flex size-10 items-center justify-center rounded-full bg-gradient-brand font-bold text-primary-foreground">
                    {(a.label || a.email).charAt(0).toUpperCase()}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold">{a.label ? `@${a.label}` : a.email}</span>
                    <span className="block truncate text-xs text-muted-foreground">{a.email}</span>
                  </span>
                  {a.id === currentId && <Check className="size-5 text-primary" />}
                  {busy === a.id && <span className="text-xs text-muted-foreground">...</span>}
                </button>
                {a.id !== currentId && (
                  <button type="button" aria-label="Scoate contul din listă" onClick={() => forgetAccount(a.id)} className="p-2 text-muted-foreground">
                    <Trash2 className="size-4" />
                  </button>
                )}
              </li>
            ))}
          </ul>
          <Button type="button" variant="secondary" onClick={() => setAdding(true)} className="mt-4 w-full">
            <Plus className="size-4" /> Adaugă cont
          </Button>
          <Button type="button" variant="ghost" onClick={signOut} className="mt-2 w-full text-muted-foreground">
            <LogOut className="size-4" /> Ieși din contul acesta
          </Button>
        </>
      )}
    </Sheet>
  );
}
