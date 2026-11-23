import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import { supabase } from "@/integrations/supabase/client";
import { chatKeys } from "@/lib/chat";

/**
 * Listens on the signed-in user's private topic. Every new message in any of their
 * conversations rings it, and we refetch the list plus that conversation.
 */
export function useMessageDoorbell(userId: string | undefined) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let subscribedBefore = false;

    supabase.realtime.setAuth().then(() => {
      if (cancelled) return;
      channel = supabase
        .channel(`user:${userId}`, { config: { private: true } })
        .on("broadcast", { event: "new_message" }, ({ payload }) => {
          const id = (payload as { conversation_id?: string } | undefined)?.conversation_id;
          queryClient.invalidateQueries({ queryKey: chatKeys.conversations });
          if (id) queryClient.invalidateQueries({ queryKey: chatKeys.messages(id) });
        })
        .subscribe((status) => {
          if (status !== "SUBSCRIBED") return;
          // Rings sent before we joined (first join) or while disconnected (reconnect)
          // are not replayed, so refetch whatever chat data is already on screen.
          const hasChatData = queryClient.getQueryCache().findAll({ queryKey: ["chat"] }).some((q) => q.state.dataUpdatedAt > 0);
          if (subscribedBefore || hasChatData) queryClient.invalidateQueries({ queryKey: ["chat"] });
          subscribedBefore = true;
        });
    });

    return () => {
      cancelled = true;
      if (channel) supabase.removeChannel(channel);
    };
  }, [queryClient, userId]);
}
