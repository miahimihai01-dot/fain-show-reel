import { queryOptions } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";

export const MAX_MESSAGE_LENGTH = 2000;

export type ConversationSummary = {
  conversationId: string;
  otherUserId: string;
  otherUsername: string;
  otherDisplayName: string;
  lastMessage: string | null;
  lastSenderId: string | null;
  lastMessageAt: string;
  unreadCount: number;
};

export type ChatMessage = {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  created_at: string;
};

export type PersonResult = { id: string; username: string; display_name: string };

export const chatKeys = {
  conversations: ["chat", "conversations"] as const,
  messages: (conversationId: string) => ["chat", "messages", conversationId] as const,
  people: (term: string) => ["chat", "people", term] as const,
};

/** A message can be sent when it has visible text and fits the limit. */
export function canSendMessage(text: string): boolean {
  const trimmed = text.trim();
  return trimmed.length > 0 && trimmed.length <= MAX_MESSAGE_LENGTH;
}

/** First letter of the name, for the round avatar. */
export function initialOf(name: string): string {
  return (name.trim()[0] ?? "?").toUpperCase();
}

/** "14:05" today, "Ieri" yesterday, otherwise "23.11.2026". */
export function formatChatTime(iso: string, now: Date = new Date()): string {
  const d = new Date(iso);
  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  if (sameDay(d, now)) {
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  }
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (sameDay(d, yesterday)) return "Ieri";
  return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`;
}

/** Hour:minute label under each bubble. */
export function formatBubbleTime(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export const conversationsQuery = () =>
  queryOptions({
    queryKey: chatKeys.conversations,
    queryFn: async (): Promise<ConversationSummary[]> => {
      const { data, error } = await supabase.rpc("list_my_conversations");
      if (error) throw error;
      return (data ?? []).map((r) => ({
        conversationId: r.conversation_id,
        otherUserId: r.other_user_id,
        otherUsername: r.other_username,
        otherDisplayName: r.other_display_name,
        lastMessage: r.last_message,
        lastSenderId: r.last_sender_id,
        lastMessageAt: r.last_message_at,
        unreadCount: Number(r.unread_count ?? 0),
      }));
    },
  });

export const messagesQuery = (conversationId: string) =>
  queryOptions({
    queryKey: chatKeys.messages(conversationId),
    queryFn: async (): Promise<ChatMessage[]> => {
      const { data, error } = await supabase
        .from("messages")
        .select("id, conversation_id, sender_id, body, created_at")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return (data ?? []).reverse();
    },
  });

export const peopleQuery = (term: string, myId: string) =>
  queryOptions({
    queryKey: chatKeys.people(term),
    enabled: term.trim().length >= 2,
    queryFn: async (): Promise<PersonResult[]> => {
      const safe = term.trim().replace(/[%_,()]/g, "");
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, display_name")
        .or(`username.ilike.%${safe}%,display_name.ilike.%${safe}%`)
        .neq("id", myId)
        .limit(10);
      if (error) throw error;
      return data ?? [];
    },
  });

export async function sendMessage(conversationId: string, senderId: string, text: string) {
  const { error } = await supabase
    .from("messages")
    .insert({ conversation_id: conversationId, sender_id: senderId, body: text.trim() });
  if (error) throw error;
}

export async function startConversation(otherUserId: string): Promise<string> {
  const { data, error } = await supabase.rpc("start_conversation", { _other_user: otherUserId });
  if (error) throw error;
  return data;
}

export async function markConversationRead(conversationId: string, userId: string) {
  await supabase
    .from("conversation_participants")
    .update({ last_read_at: new Date().toISOString() })
    .eq("conversation_id", conversationId)
    .eq("user_id", userId);
}
