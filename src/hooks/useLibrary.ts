import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";

import { libKeys, myFollowsQuery, myMarksQuery, setFollow, setMark } from "@/lib/library";

type Mark = { video_id: string; created_at: string };

/** The signed-in user's likes, saves and follows, with instant (optimistic) toggles. */
export function useLibrary(uid: string | undefined) {
  const qc = useQueryClient();
  const likes = useQuery({ ...myMarksQuery(uid ?? "-", "likes"), enabled: !!uid });
  const saves = useQuery({ ...myMarksQuery(uid ?? "-", "saves"), enabled: !!uid });
  const follows = useQuery({ ...myFollowsQuery(uid ?? "-"), enabled: !!uid });

  const liked = useMemo(() => new Set((likes.data ?? []).map((m) => m.video_id)), [likes.data]);
  const saved = useMemo(() => new Set((saves.data ?? []).map((m) => m.video_id)), [saves.data]);
  const followed = useMemo(() => new Set(follows.data ?? []), [follows.data]);

  const toggleMark = useCallback(
    async (kind: "likes" | "saves", videoId: string) => {
      if (!uid) return;
      const key = libKeys.mine(uid, kind);
      const current = qc.getQueryData<Mark[]>(key) ?? [];
      const on = !current.some((m) => m.video_id === videoId);
      qc.setQueryData<Mark[]>(key, on
        ? [{ video_id: videoId, created_at: new Date().toISOString() }, ...current]
        : current.filter((m) => m.video_id !== videoId));
      try {
        await setMark(uid, kind, videoId, on);
      } catch {
        qc.setQueryData(key, current);
      }
      qc.invalidateQueries({ queryKey: key });
      if (kind === "likes") {
        qc.invalidateQueries({ queryKey: ["likeCounts"] });
        qc.invalidateQueries({ queryKey: ["stats"] });
      }
    },
    [qc, uid],
  );

  const toggleFollow = useCallback(
    async (username: string) => {
      if (!uid) return;
      const key = libKeys.mine(uid, "follows");
      const current = qc.getQueryData<string[]>(key) ?? [];
      const on = !current.includes(username);
      qc.setQueryData<string[]>(key, on ? [...current, username] : current.filter((u) => u !== username));
      try {
        await setFollow(uid, username, on);
      } catch {
        qc.setQueryData(key, current);
      }
      qc.invalidateQueries({ queryKey: key });
      qc.invalidateQueries({ queryKey: ["stats"] });
    },
    [qc, uid],
  );

  return {
    likes: likes.data ?? [],
    saves: saves.data ?? [],
    liked,
    saved,
    followed,
    toggleLike: (id: string) => toggleMark("likes", id),
    toggleSave: (id: string) => toggleMark("saves", id),
    toggleFollow,
  };
}
