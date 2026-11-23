import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, MessageCircle, SendHorizontal } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState, type FormEvent } from "react";

import { Avatar } from "@/components/chat/ConversationList";
import {
  MAX_MESSAGE_LENGTH,
  canSendMessage,
  chatKeys,
  conversationsQuery,
  formatBubbleTime,
  markConversationRead,
  messagesQuery,
  sendMessage,
  type ChatMessage,
} from "@/lib/chat";

export function EmptyChat() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center text-muted-foreground">
      <MessageCircle className="size-12 text-primary" />
      <p className="font-display text-3xl text-foreground">Mesajele tale</p>
      <p className="max-w-xs text-sm">Alege o conversație din stânga sau caută pe cineva ca să începi una nouă.</p>
    </div>
  );
}

export function ChatPanel({ conversationId, myId }: { conversationId: string; myId: string }) {
  const queryClient = useQueryClient();
  const conversations = useQuery(conversationsQuery());
  const messages = useQuery(messagesQuery(conversationId));
  const [text, setText] = useState("");
  const [sendError, setSendError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const other = conversations.data?.find((c) => c.conversationId === conversationId);
  const lastId = messages.data?.at(-1)?.id;

  useLayoutEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [lastId, conversationId]);

  // Mark as read on open and whenever a new message arrives while the chat is open.
  useEffect(() => {
    if (!messages.data) return;
    markConversationRead(conversationId, myId).then(() =>
      queryClient.invalidateQueries({ queryKey: chatKeys.conversations }),
    );
  }, [conversationId, myId, lastId, messages.data, queryClient]);

  async function onSubmit(e?: FormEvent) {
    e?.preventDefault();
    if (!canSendMessage(text)) return;
    const body = text.trim();
    setText("");
    setSendError(null);
    const key = chatKeys.messages(conversationId);
    const temp: ChatMessage = {
      id: `temp-${Date.now()}`,
      conversation_id: conversationId,
      sender_id: myId,
      body,
      created_at: new Date().toISOString(),
    };
    queryClient.setQueryData<ChatMessage[]>(key, (old) => [...(old ?? []), temp]);
    try {
      await sendMessage(conversationId, myId, body);
    } catch {
      setSendError("Mesajul nu s-a trimis. Încearcă din nou.");
      setText(body);
    }
    queryClient.invalidateQueries({ queryKey: key });
    queryClient.invalidateQueries({ queryKey: chatKeys.conversations });
    inputRef.current?.focus();
  }

  const name = other?.otherDisplayName ?? "…";

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center gap-3 border-b border-border bg-card/60 px-3 py-2">
        <Link to="/mesaje" search={{}} className="rounded-full p-1.5 md:hidden" aria-label="Înapoi la conversații">
          <ArrowLeft className="size-5" />
        </Link>
        <Avatar name={name} size="sm" />
        <div className="min-w-0">
          <p className="truncate font-bold leading-tight">{name}</p>
          {other && <p className="truncate text-xs text-muted-foreground">@{other.otherUsername}</p>}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4" aria-live="polite" aria-label="Mesaje">
        {messages.isLoading && <p className="text-center text-sm text-muted-foreground">Se încarcă…</p>}
        {messages.data?.length === 0 && (
          <p className="mt-10 text-center text-sm text-muted-foreground">Niciun mesaj încă. Scrie primul! 👋</p>
        )}
        <ul className="flex flex-col gap-1.5">
          {messages.data?.map((m) => {
            const mine = m.sender_id === myId;
            const pending = m.id.startsWith("temp-");
            return (
              <li key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm shadow-sm ${
                    mine ? "rounded-br-md bg-bubble-mine text-primary-foreground" : "rounded-bl-md bg-card text-card-foreground"
                  } ${pending ? "opacity-70" : ""}`}
                >
                  <p className="whitespace-pre-wrap break-words">{m.body}</p>
                  <p className={`mt-0.5 text-right text-[10px] ${mine ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                    {pending ? "se trimite…" : formatBubbleTime(m.created_at)}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
        <div ref={bottomRef} />
      </div>

      {sendError && <p role="alert" className="px-4 pb-1 text-xs text-destructive">{sendError}</p>}
      <form onSubmit={onSubmit} className="flex items-end gap-2 border-t border-border bg-nav p-2">
        <label className="sr-only" htmlFor="chat-input">Scrie un mesaj</label>
        <textarea
          id="chat-input"
          ref={inputRef}
          rows={1}
          value={text}
          maxLength={MAX_MESSAGE_LENGTH}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSubmit();
            }
          }}
          placeholder="Scrie un mesaj…"
          className="max-h-32 min-h-10 flex-1 resize-none rounded-2xl bg-card px-4 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring"
        />
        <button
          type="submit"
          disabled={!canSendMessage(text)}
          aria-label="Trimite"
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-brand text-primary-foreground shadow-glow disabled:opacity-40"
        >
          <SendHorizontal className="size-5" />
        </button>
      </form>
    </div>
  );
}
