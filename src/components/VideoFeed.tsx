import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Heart, MessageCircle, Music2, Play, Plus, Send, Share2, Volume2, VolumeX, X } from "lucide-react";

import { TopTabs } from "@/components/TopTabs";
import { clips as initialClips, formatCount, type Clip } from "@/lib/content";

/**
 * Vertical swipe feed. Only the slide that is on screen plays (autoplay); every other
 * video stays paused and unloaded, so at most one video runs at a time.
 */
export function VideoFeed() {
  const [clips, setClips] = useState<Clip[]>(initialClips);
  const [activeId, setActiveId] = useState<string>(initialClips[0]?.id ?? "");
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(false);
  const [commentsFor, setCommentsFor] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);

  // The slide that is mostly on screen becomes the active (playing) one.
  useEffect(() => {
    const root = scrollerRef.current;
    if (!root) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            const id = (entry.target as HTMLElement).dataset["clipId"];
            if (id) {
              setActiveId(id);
              setPaused(false);
            }
          }
        }
      },
      { root, threshold: [0.6] },
    );
    root.querySelectorAll("[data-clip-id]").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 1800);
    return () => clearTimeout(t);
  }, [notice]);

  const togglePlay = useCallback(() => setPaused((p) => !p), []);
  // Browsers block autoplay with sound until the user taps; fall back to muted.
  const onAutoplayBlocked = useCallback(() => setMuted(true), []);

  const share = useCallback(async (clip: Clip) => {
    const url = `${window.location.origin}/?v=${clip.id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "FainShow", text: clip.description, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setNotice("Link copiat!");
    } catch {
      /* user closed the share sheet */
    }
  }, []);

  const addComment = useCallback((id: string, text: string) => {
    setClips((list) =>
      list.map((c) => (c.id === id ? { ...c, comments: [...c.comments, { user: "tu", text }] } : c)),
    );
  }, []);

  const openClip = clips.find((c) => c.id === commentsFor) ?? null;

  return (
    <div className="relative mx-auto h-feed max-w-md bg-overlay">
      <div className="absolute inset-x-0 top-0 z-20 bg-fade-top pb-4 pt-1">
        <TopTabs overlay />
      </div>

      <div ref={scrollerRef} className="h-full snap-feed overflow-y-scroll">
        {clips.map((clip) => (
          <VideoSlide
            key={clip.id}
            clip={clip}
            active={activeId === clip.id}
            playing={activeId === clip.id && !paused}
            muted={muted}
            onToggleMute={() => setMuted((m) => !m)}
            onAutoplayBlocked={onAutoplayBlocked}
            onTogglePlay={togglePlay}
            onOpenComments={setCommentsFor}
            onShare={share}
          />
        ))}
      </div>

      {notice && (
        <div
          role="status"
          className="absolute left-1/2 top-16 z-30 -translate-x-1/2 rounded-full bg-card px-4 py-2 text-sm font-semibold"
        >
          {notice}
        </div>
      )}

      {openClip && (
        <CommentsSheet
          clip={openClip}
          onClose={() => setCommentsFor(null)}
          onAdd={(text) => addComment(openClip.id, text)}
        />
      )}
    </div>
  );
}

type SlideProps = {
  clip: Clip;
  active: boolean;
  playing: boolean;
  muted: boolean;
  onToggleMute: () => void;
  onAutoplayBlocked: () => void;
  onTogglePlay: () => void;
  onOpenComments: (id: string) => void;
  onShare: (clip: Clip) => void;
};

function VideoSlide({
  clip,
  active,
  playing,
  muted,
  onToggleMute,
  onAutoplayBlocked,
  onTogglePlay,
  onOpenComments,
  onShare,
}: SlideProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [liked, setLiked] = useState(false);
  const [following, setFollowing] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (!playing) {
      video.pause();
      return;
    }
    video.muted = muted;
    video.play().catch(() => {
      // Autoplay with sound was refused: retry silently.
      video.muted = true;
      onAutoplayBlocked();
      video.play().catch(() => undefined);
    });
  }, [playing, muted, onAutoplayBlocked]);

  // Rewind slides that leave the screen so they start fresh next time.
  useEffect(() => {
    const video = videoRef.current;
    if (!active && video && video.currentTime > 0) video.currentTime = 0;
  }, [active]);

  return (
    <section
      data-clip-id={clip.id}
      aria-label={`Videoclip de la @${clip.username}`}
      className="relative h-full w-full snap-start snap-always overflow-hidden"
    >
      <video
        ref={videoRef}
        src={clip.src}
        poster={clip.poster}
        preload={active ? "auto" : "none"}
        playsInline
        loop
        muted={muted}
        onClick={onTogglePlay}
        className="h-full w-full cursor-pointer object-cover"
      />

      {active && (
        <button
          type="button"
          onClick={onToggleMute}
          aria-label={muted ? "Pornește sunetul" : "Oprește sunetul"}
          className="absolute left-3 top-14 z-10 flex items-center gap-1.5 rounded-full bg-overlay/50 px-3 py-1.5 text-xs font-semibold text-foreground"
        >
          {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
          {muted ? "Atinge pentru sunet" : "Sunet pornit"}
        </button>
      )}

      {active && !playing && (
        <button
          type="button"
          onClick={onTogglePlay}
          aria-label="Pornește videoclipul"
          className="absolute inset-0 m-auto flex size-20 items-center justify-center rounded-full bg-overlay/50 text-foreground"
        >
          <Play className="ml-1 size-10 fill-current" />
        </button>
      )}

      {/* Right action column */}
      <div className="absolute bottom-6 right-2 z-10 flex flex-col items-center gap-5">
        <ActionButton
          label={following ? "Urmărești" : "Urmărește"}
          onClick={() => setFollowing((f) => !f)}
          pressed={following}
        >
          <span className="relative flex size-12 items-center justify-center rounded-full border-2 border-foreground bg-gradient-brand font-display text-xl text-primary-foreground">
            {clip.username.charAt(0).toUpperCase()}
            <span className="absolute -bottom-2 left-1/2 flex size-5 -translate-x-1/2 items-center justify-center rounded-full bg-primary text-primary-foreground">
              {following ? <Check className="size-3" strokeWidth={3} /> : <Plus className="size-3" strokeWidth={3} />}
            </span>
          </span>
        </ActionButton>

        <ActionButton
          label={formatCount(clip.likes + (liked ? 1 : 0))}
          ariaLabel={liked ? "Nu-mi mai place" : "Îmi place"}
          onClick={() => setLiked((l) => !l)}
          pressed={liked}
        >
          <Heart
            key={String(liked)}
            className={`size-9 ${liked ? "animate-heart-pop fill-primary text-primary" : "fill-foreground text-foreground"}`}
          />
        </ActionButton>

        <ActionButton
          label={formatCount(clip.comments.length)}
          ariaLabel="Comentarii"
          onClick={() => onOpenComments(clip.id)}
        >
          <MessageCircle className="size-9 fill-foreground text-foreground" />
        </ActionButton>

        <ActionButton label={formatCount(clip.shares)} ariaLabel="Distribuie" onClick={() => onShare(clip)}>
          <Share2 className="size-8 text-foreground" strokeWidth={2.5} />
        </ActionButton>
      </div>

      {/* Bottom info */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] bg-fade-bottom px-4 pb-5 pr-20 pt-16 text-shadow-soft">
        <p className="text-base font-bold">@{clip.username}</p>
        <p className="mt-1 text-sm leading-snug">{clip.description}</p>
        <p className="mt-2 flex items-center gap-1.5 text-sm">
          <Music2 className="size-4 shrink-0" />
          <span className="truncate">{clip.song}</span>
        </p>
      </div>
    </section>
  );
}

function ActionButton({
  children,
  label,
  ariaLabel,
  onClick,
  pressed,
}: {
  children: React.ReactNode;
  label: string;
  ariaLabel?: string;
  onClick: () => void;
  pressed?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel ?? label}
      aria-pressed={pressed}
      className="flex flex-col items-center gap-1 text-xs font-bold text-foreground text-shadow-soft active:scale-90"
    >
      {children}
      <span>{label}</span>
    </button>
  );
}

function CommentsSheet({
  clip,
  onClose,
  onAdd,
}: {
  clip: Clip;
  onClose: () => void;
  onAdd: (text: string) => void;
}) {
  const [text, setText] = useState("");

  return (
    <div className="absolute inset-0 z-40 flex flex-col justify-end">
      <button type="button" aria-label="Închide comentariile" onClick={onClose} className="flex-1 bg-overlay/50" />
      <div role="dialog" aria-label="Comentarii" className="max-h-[65%] rounded-t-2xl bg-card animate-in slide-in-from-bottom duration-200">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <span className="w-6" />
          <h2 className="text-sm font-bold">{clip.comments.length} comentarii</h2>
          <button type="button" aria-label="Închide" onClick={onClose} className="text-muted-foreground">
            <X className="size-6" />
          </button>
        </div>
        <ul className="max-h-64 space-y-4 overflow-y-auto px-4 py-4">
          {clip.comments.map((c, i) => (
            <li key={i} className="flex gap-3">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-bold">
                {c.user.charAt(0).toUpperCase()}
              </span>
              <div>
                <p className="text-xs font-semibold text-muted-foreground">{c.user}</p>
                <p className="text-sm">{c.text}</p>
              </div>
            </li>
          ))}
        </ul>
        <form
          className="flex items-center gap-2 border-t border-border px-3 py-3"
          onSubmit={(e) => {
            e.preventDefault();
            const value = text.trim();
            if (!value) return;
            onAdd(value);
            setText("");
          }}
        >
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Adaugă un comentariu..."
            aria-label="Scrie un comentariu"
            className="h-10 flex-1 rounded-full bg-secondary px-4 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
          />
          <button
            type="submit"
            aria-label="Trimite comentariul"
            className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground disabled:opacity-40"
            disabled={!text.trim()}
          >
            <Send className="size-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
