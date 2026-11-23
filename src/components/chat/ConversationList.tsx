import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { Search, X } from "lucide-react";
import { useState } from "react";

import {
  conversationsQuery,
  formatChatTime,
  initialOf,
  peopleQuery,
  startConversation,
} from "@/lib/chat";

export function Avatar({ name, size = "md" }: { name: string; size?: "md" | "sm" }) {
  return (
    <span
      aria-hidden="true"
      className={`flex shrink-0 items-center justify-center rounded-full bg-gradient-brand font-display text-primary-foreground ${
        size === "md" ? "size-12 text-2xl" : "size-9 text-lg"
      }`}
    >
      {initialOf(name)}
    </span>
  );
}

export function ConversationList({ myId, activeId }: { myId: string; activeId: string | undefined }) {
  const [term, setTerm] = useState("");
  const [opening, setOpening] = useState<string | null>(null);
  const navigate = useNavigate();
  const conversations = useQuery(conversationsQuery());
  const people = useQuery(peopleQuery(term, myId));
  const searching = term.trim().length >= 2;

  async function openWith(userId: string) {
    setOpening(userId);
    try {
      const id = await startConversation(userId);
      setTerm("");
      await conversations.refetch();
      navigate({ to: "/mesaje", search: { c: id } });
    } finally {
      setOpening(null);
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="p-3">
        <label className="flex h-10 items-center gap-2 rounded-full bg-card px-4">
          <Search className="size-4 text-muted-foreground" />
          <span className="sr-only">Caută oameni</span>
          <input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Caută oameni după nume…"
            className="h-full flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          {term && (
            <button type="button" onClick={() => setTerm("")} aria-label="Șterge căutarea">
              <X className="size-4 text-muted-foreground" />
            </button>
          )}
        </label>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {searching ? (
          <ul aria-label="Rezultate căutare">
            {people.isLoading && <li className="px-4 py-3 text-sm text-muted-foreground">Caut…</li>}
            {people.data?.length === 0 && (
              <li className="px-4 py-3 text-sm text-muted-foreground">Nu am găsit pe nimeni.</li>
            )}
            {people.data?.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  disabled={opening === p.id}
                  onClick={() => openWith(p.id)}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-card disabled:opacity-60"
                >
                  <Avatar name={p.display_name} />
                  <span className="min-w-0">
                    <span className="block truncate font-bold">{p.display_name}</span>
                    <span className="block truncate text-sm text-muted-foreground">@{p.username}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <ul aria-label="Conversații">
            {conversations.isLoading && <li className="px-4 py-3 text-sm text-muted-foreground">Se încarcă…</li>}
            {conversations.data?.length === 0 && (
              <li className="px-6 py-10 text-center text-sm text-muted-foreground">
                Nicio conversație încă. Caută pe cineva mai sus și scrie-i primul mesaj.
              </li>
            )}
            {conversations.data?.map((c) => {
              const active = c.conversationId === activeId;
              const preview = c.lastMessage
                ? `${c.lastSenderId === myId ? "Tu: " : ""}${c.lastMessage}`
                : "Spune salut 👋";
              return (
                <li key={c.conversationId}>
                  <Link
                    to="/mesaje"
                    search={{ c: c.conversationId }}
                    className={`flex items-center gap-3 border-l-2 px-4 py-2.5 ${
                      active ? "border-primary bg-card" : "border-transparent hover:bg-card/60"
                    }`}
                  >
                    <Avatar name={c.otherDisplayName} />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline justify-between gap-2">
                        <span className="truncate font-bold">{c.otherDisplayName}</span>
                        <span className={`shrink-0 text-xs ${c.unreadCount > 0 ? "font-bold text-primary" : "text-muted-foreground"}`}>
                          {formatChatTime(c.lastMessageAt)}
                        </span>
                      </span>
                      <span className="flex items-center justify-between gap-2">
                        <span className="truncate text-sm text-muted-foreground">{preview}</span>
                        {c.unreadCount > 0 && (
                          <span
                            aria-label={`${c.unreadCount} necitite`}
                            className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-bold text-primary-foreground"
                          >
                            {c.unreadCount}
                          </span>
                        )}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
