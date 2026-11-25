import { LovableMark } from "@lovable.dev/cloud-auth-js/react";
import { MessageCircle } from "lucide-react";
import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { lovable } from "@/integrations/lovable/index";
import { supabase } from "@/integrations/supabase/client";

type Mode = "signin" | "signup";

function GoogleLogo() {
  return (
    <svg aria-hidden="true" width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z" />
      <path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z" />
      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z" />
    </svg>
  );
}

export function AuthPanel({ next = "/mesaje" }: { next?: string } = {}) {
  const [mode, setMode] = useState<Mode>("signin");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const redirect = () => `${window.location.origin}${next}`;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);
    if (mode === "signin") {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err) setError("Email sau parolă greșită.");
    } else {
      const { data, error: err } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: redirect(), data: { username: username.trim(), display_name: username.trim() } },
      });
      if (err) setError(err.message.includes("Password") ? "Parola trebuie să aibă minim 6 caractere." : "Nu am putut crea contul. Încearcă din nou.");
      else if (!data.session) setNotice("Ți-am trimis un email. Apasă pe link ca să-ți confirmi contul.");
    }
    setBusy(false);
  }

  async function social(provider: "google" | "lovable") {
    setError(null);
    const result = await lovable.auth.signInWithOAuth(provider, { redirect_uri: redirect() });
    if (result.error) setError("Autentificarea nu a mers. Încearcă din nou.");
  }

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col items-center px-6 py-10 text-center">
      <span className="flex size-16 items-center justify-center rounded-2xl bg-gradient-brand text-primary-foreground shadow-glow">
        <MessageCircle className="size-8" strokeWidth={2.4} />
      </span>
      <h1 className="mt-4 font-display text-4xl">Mesaje</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Intră în cont ca să vorbești cu alți fani FainShow.
      </p>

      <div className="mt-6 grid w-full grid-cols-2 rounded-lg bg-card p-1" role="tablist">
        {(["signin", "signup"] as const).map((m) => (
          <button
            key={m}
            type="button"
            role="tab"
            aria-selected={mode === m}
            onClick={() => setMode(m)}
            className={`h-9 rounded-md text-sm font-bold ${mode === m ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
          >
            {m === "signin" ? "Intră în cont" : "Cont nou"}
          </button>
        ))}
      </div>

      <form onSubmit={onSubmit} className="mt-4 flex w-full flex-col gap-3 text-left">
        {mode === "signup" && (
          <label className="text-xs font-semibold text-muted-foreground">
            Nume de utilizator
            <Input required minLength={3} maxLength={20} value={username} onChange={(e) => setUsername(e.target.value)} className="mt-1 h-11 bg-card text-foreground" placeholder="ex. ana.filme" />
          </label>
        )}
        <label className="text-xs font-semibold text-muted-foreground">
          Email
          <Input required type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 h-11 bg-card text-foreground" />
        </label>
        <label className="text-xs font-semibold text-muted-foreground">
          Parolă
          <Input required type="password" minLength={6} autoComplete={mode === "signin" ? "current-password" : "new-password"} value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 h-11 bg-card text-foreground" />
        </label>
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        {notice && <p className="text-sm text-foreground">{notice}</p>}
        <Button type="submit" disabled={busy} className="h-11 font-bold">
          {mode === "signin" ? "Intră" : "Creează cont"}
        </Button>
      </form>

      <div className="my-5 flex w-full items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" /> sau <span className="h-px flex-1 bg-border" />
      </div>

      <div className="flex w-full flex-col gap-3">
        <Button type="button" variant="outline" onClick={() => social("google")} className="h-11 gap-2.5 border-google-border bg-google-bg px-3 font-semibold text-google-fg hover:bg-google-bg/90 hover:text-google-fg">
          <GoogleLogo />
          Continuă cu Google
        </Button>
        <Button type="button" variant="outline" onClick={() => social("lovable")} className="h-11 gap-2.5 font-semibold">
          <LovableMark className="size-[18px]" />
          Continuă cu Lovable
        </Button>
      </div>
    </div>
  );
}
