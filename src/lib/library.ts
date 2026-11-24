import { queryOptions } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import { clips as sampleClips, type Clip } from "@/lib/content";

const SIGN_SECONDS = 60 * 60 * 24;

export type ProfileTab = "videos" | "favorite" | "aprecieri";

export const EMPTY_TAB_TEXT: Record<ProfileTab, string> = {
  videos: "Nu ai urcat niciun video încă.",
  favorite: "Nu ai niciun video salvat încă.",
  aprecieri: "Nu ai apreciat niciun video încă.",
};

export type FeedClip = Clip & { ownerId?: string; uploaded?: boolean };

export type PublicProfile = {
  id: string;
  username: string;
  display_name: string;
  bio: string;
  avatar_url: string | null;
};

export const libKeys = {
  feed: ["feed"] as const,
  likeCounts: (ids: string[]) => ["likeCounts", ids.join(",")] as const,
  mine: (uid: string, kind: "likes" | "saves" | "follows") => ["me", uid, kind] as const,
  profile: (username: string) => ["profile", username] as const,
  profileById: (id: string) => ["profileById", id] as const,
  stats: (id: string) => ["stats", id] as const,
  userVideos: (id: string) => ["userVideos", id] as const,
  videosByIds: (ids: string[]) => ["videosByIds", ids.join(",")] as const,
};

/** Builds the app's own link for a profile or video (always an absolute, valid URL). */
export function profileUrl(origin: string, username: string): string {
  return new URL(`/@${encodeURIComponent(username)}`, origin).toString();
}
export function videoUrl(origin: string, id: string): string {
  return new URL(`/video/${encodeURIComponent(id)}`, origin).toString();
}

/** Keeps only the ids of a tab, newest first, resolving them to clips we know about. */
export function clipsForIds(ids: string[], known: FeedClip[]): FeedClip[] {
  const byId = new Map(known.map((c) => [c.id, c]));
  return ids.map((id) => byId.get(id)).filter((c): c is FeedClip => !!c);
}

async function signMany(bucket: "videos" | "avatars", paths: string[]): Promise<Map<string, string>> {
  const out = new Map<string, string>();
  const unique = [...new Set(paths.filter(Boolean))];
  if (unique.length === 0) return out;
  const { data } = await supabase.storage.from(bucket).createSignedUrls(unique, SIGN_SECONDS);
  for (const row of data ?? []) if (row.path && row.signedUrl) out.set(row.path, row.signedUrl);
  return out;
}

export async function signAvatar(path: string | null): Promise<string | null> {
  if (!path) return null;
  return (await signMany("avatars", [path])).get(path) ?? null;
}

type VideoRow = {
  id: string;
  user_id: string;
  storage_path: string;
  poster_path: string | null;
  description: string;
  duration_sec: number;
  profiles: { username: string } | null;
};

async function toClips(rows: VideoRow[]): Promise<FeedClip[]> {
  const urls = await signMany("videos", rows.flatMap((r) => [r.storage_path, r.poster_path ?? ""]));
  return rows.map((r) => ({
    id: r.id,
    ownerId: r.user_id,
    uploaded: true,
    username: r.profiles?.username ?? "fainshow",
    description: r.description,
    song: "Sunet original",
    likes: 0,
    comments: [],
    shares: 0,
    durationSec: Number(r.duration_sec),
    src: urls.get(r.storage_path) ?? "",
    poster: (r.poster_path && urls.get(r.poster_path)) || "",
  }));
}

const VIDEO_SELECT = "id, user_id, storage_path, poster_path, description, duration_sec, profiles(username)";

/** Uploaded videos (newest first) followed by the sample clips. */
export const feedQuery = () =>
  queryOptions({
    queryKey: libKeys.feed,
    staleTime: 60_000,
    queryFn: async (): Promise<FeedClip[]> => {
      const { data, error } = await supabase
        .from("videos")
        .select(VIDEO_SELECT)
        .order("created_at", { ascending: false })
        .limit(30);
      if (error) throw error;
      return [...(await toClips((data ?? []) as VideoRow[])), ...sampleClips];
    },
  });

export const userVideosQuery = (userId: string) =>
  queryOptions({
    queryKey: libKeys.userVideos(userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("videos")
        .select(VIDEO_SELECT)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return toClips((data ?? []) as VideoRow[]);
    },
  });

const UUID = /^[0-9a-f-]{36}$/i;

/** Sample clips plus any uploaded videos among the given ids. */
export const videosByIdsQuery = (ids: string[]) =>
  queryOptions({
    queryKey: libKeys.videosByIds(ids),
    queryFn: async (): Promise<FeedClip[]> => {
      const uploadedIds = ids.filter((id) => UUID.test(id));
      let uploaded: FeedClip[] = [];
      if (uploadedIds.length) {
        const { data, error } = await supabase.from("videos").select(VIDEO_SELECT).in("id", uploadedIds);
        if (error) throw error;
        uploaded = await toClips((data ?? []) as VideoRow[]);
      }
      return [...uploaded, ...sampleClips];
    },
  });

export const likeCountsQuery = (ids: string[]) =>
  queryOptions({
    queryKey: libKeys.likeCounts(ids),
    enabled: ids.length > 0,
    queryFn: async (): Promise<Record<string, number>> => {
      const { data, error } = await supabase.rpc("video_like_counts", { _ids: ids });
      if (error) throw error;
      return Object.fromEntries((data ?? []).map((r) => [r.video_id, Number(r.likes)]));
    },
  });

type Mark = { video_id: string; created_at: string };

export const myMarksQuery = (uid: string, kind: "likes" | "saves") =>
  queryOptions({
    queryKey: libKeys.mine(uid, kind),
    queryFn: async (): Promise<Mark[]> => {
      const { data, error } = await supabase
        .from(kind === "likes" ? "video_likes" : "video_saves")
        .select("video_id, created_at")
        .eq("user_id", uid)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

export const myFollowsQuery = (uid: string) =>
  queryOptions({
    queryKey: libKeys.mine(uid, "follows"),
    queryFn: async (): Promise<string[]> => {
      const { data, error } = await supabase.from("follows").select("target_username").eq("follower_id", uid);
      if (error) throw error;
      return (data ?? []).map((r) => r.target_username);
    },
  });

export async function setMark(uid: string, kind: "likes" | "saves", videoId: string, on: boolean) {
  const table = kind === "likes" ? "video_likes" : "video_saves";
  const { error } = on
    ? await supabase.from(table).upsert({ user_id: uid, video_id: videoId }, { ignoreDuplicates: true })
    : await supabase.from(table).delete().eq("user_id", uid).eq("video_id", videoId);
  if (error) throw error;
}

export async function setFollow(uid: string, username: string, on: boolean) {
  const { error } = on
    ? await supabase.from("follows").upsert({ follower_id: uid, target_username: username }, { ignoreDuplicates: true })
    : await supabase.from("follows").delete().eq("follower_id", uid).eq("target_username", username);
  if (error) throw error;
}

async function withAvatar(p: PublicProfile | null) {
  if (!p) return null;
  return { ...p, avatarSrc: await signAvatar(p.avatar_url) };
}

export const profileByUsernameQuery = (username: string) =>
  queryOptions({
    queryKey: libKeys.profile(username),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, display_name, bio, avatar_url")
        .eq("username", username)
        .maybeSingle();
      if (error) throw error;
      return withAvatar(data);
    },
  });

export const profileByIdQuery = (id: string) =>
  queryOptions({
    queryKey: libKeys.profileById(id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, display_name, bio, avatar_url")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return withAvatar(data);
    },
  });

export const statsQuery = (id: string) =>
  queryOptions({
    queryKey: libKeys.stats(id),
    queryFn: async () => {
      const { data, error } = await supabase.rpc("profile_stats", { _user: id });
      if (error) throw error;
      const r = data?.[0];
      return { followers: Number(r?.followers ?? 0), following: Number(r?.following ?? 0), likes: Number(r?.likes ?? 0) };
    },
  });
