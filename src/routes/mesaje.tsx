import { createFileRoute } from "@tanstack/react-router";
import { LogOut } from "lucide-react";

import { AuthPanel } from "@/components/chat/AuthPanel";
import { ChatPanel, EmptyChat } from "@/components/chat/ChatPanel";
import { ConversationList } from "@/components/chat/ConversationList";
import { PageHeader } from "@/components/PageHeader";
import { useAuth } from "@/hooks/useAuth";
import { useMessageDoorbell } from "@/hooks/useMessageDoorbell";
import { supabase } from "@/integrations/supabase/client";

type MessagesSearch = { c?: string };

export const Route = createFileRoute("/mesaje")({
  validateSearch: (search: Record<string, unknown>): MessagesSearch =>
    typeof search["c"] === "string" && search["c"] ? { c: search["c"] } : {},
  head: () => ({
    meta: [
      { title: "Mesaje — FainShow" },
      { name: "description", content: "Vorbește în timp real cu alți fani FainShow." },
      { property: "og:title", content: "Mesaje — FainShow" },
      { property: "og:description", content: "Vorbește în timp real cu alți fani FainShow." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MessagesPage,
});

function MessagesPage() {
  const { user, loading } = useAuth();
  const { c } = Route.useSearch();
  useMessageDoorbell(user?.id);

  return (
    <div className="mx-auto flex h-chat max-w-md flex-col md:max-w-5xl">
      <PageHeader
        title="Mesaje"
        right={
          user ? (
            <button
              type="button"
              onClick={() => supabase.auth.signOut()}
              className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground"
            >
              <LogOut className="size-4" /> Ieși
            </button>
          ) : undefined
        }
      />
      {loading ? (
        <p className="p-6 text-center text-sm text-muted-foreground">Se încarcă…</p>
      ) : !user ? (
        <div className="min-h-0 flex-1 overflow-y-auto">
          <AuthPanel />
        </div>
      ) : (
        <div className="grid min-h-0 flex-1 md:grid-cols-[340px_1fr]">
          <aside className={`min-h-0 border-border md:block md:border-r ${c ? "hidden" : "block"}`}>
            <ConversationList myId={user.id} activeId={c} />
          </aside>
          <section className={`min-h-0 md:block ${c ? "block" : "hidden"}`}>
            {c ? <ChatPanel key={c} conversationId={c} myId={user.id} /> : <EmptyChat />}
          </section>
        </div>
      )}
    </div>
  );
}
