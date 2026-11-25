import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Bookmark, CalendarDays, Grid3x3, Heart, Settings, Share2, UserCog, Users } from "lucide-react";
import { useEffect, useState } from "react";

import { AuthPanel } from "@/components/chat/AuthPanel";
import { PageHeader } from "@/components/PageHeader";
import { EditProfileSheet, SettingsSheet, SwitchAccountSheet, Avatar } from "@/components/profile/ProfileSheets";
import { ShareSheet } from "@/components/ShareSheet";
import { useAuth } from "@/hooks/useAuth";
import { useLibrary } from "@/hooks/useLibrary";
import { daysInApp, formatJoinDate } from "@/lib/accounts";
import { formatCount } from "@/lib/content";
import {
  EMPTY_TAB_TEXT,
  clipsForIds,
  profileByIdQuery,
  profileUrl,
  statsQuery,
  userVideosQuery,
  videosByIdsQuery,
  type FeedClip,
  type ProfileTab,
} from "@/lib/library";

export const Route = createFileRoute("/profil")({
  head: () => ({
    meta: [
      { title: "Profil — FainShow" },
      { name: "description", content: "Profilul tău FainShow: videoclipuri, favorite și aprecieri." },
      { property: "og:title", content: "Profil — FainShow" },
      { property: "og:description", content: "Profilul tău FainShow: videoclipuri, favorite și aprecieri." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProfilePage,
});

type Panel = "edit" | "settings" | "switch" | "share" | null;

const TABS: { id: ProfileTab; label: string; Icon: typeof Grid3x3 }[] = [
  { id: "videos", label: "Videoclipurile mele", Icon: Grid3x3 },
  { id: "favorite", label: "Favorite", Icon: Bookmark },
  { id: "aprecieri", label: "Aprecieri", Icon: Heart },
];

function ProfilePage() {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen" />;
  if (!user)
    return (
      <div className="mx-auto min-h-screen max-w-md pb-nav">
        <PageHeader title="Profil" />
        <AuthPanel next="/profil" />
      </div>
    );
  return <MyProfile key={user.id} uid={user.id} createdAt={user.created_at} />;
}

function MyProfile({ uid, createdAt }: { uid: string; createdAt: string }) {
  const profile = useQuery(profileByIdQuery(uid));
  const stats = useQuery(statsQuery(uid));
  const mine = useQuery(userVideosQuery(uid));
  const lib = useLibrary(uid);
  const [tab, setTab] = useState<ProfileTab>("videos");
  const [panel, setPanel] = useState<Panel>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const markIds = (tab === "favorite" ? lib.saves : lib.likes).map((m) => m.video_id);
  const known = useQuery({ ...videosByIdsQuery(markIds), enabled: tab !== "videos" });
  const items: FeedClip[] = tab === "videos" ? mine.data ?? [] : clipsForIds(markIds, known.data ?? []);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 2200);
    return () => clearTimeout(t);
  }, [notice]);

  const me = profile.data;
  if (!me) return <div className="min-h-screen" />;

  const days = daysInApp(createdAt);
  const s = stats.data ?? { followers: 0, following: 0, likes: 0 };
  const actions: { id: Exclude<Panel, null>; label: string; Icon: typeof Settings }[] = [
    { id: "edit", label: "Editează profilul", Icon: UserCog },
    { id: "settings", label: "Setări", Icon: Settings },
    { id: "switch", label: "Schimbă contul", Icon: Users },
    { id: "share", label: "Distribuția mea", Icon: Share2 },
  ];

  return (
    <div className="mx-auto min-h-screen max-w-md pb-nav">
      <PageHeader title={`@${me.username}`} />
      <div className="flex flex-col items-center px-4 pt-6 text-center">
        <Avatar me={me} size="size-24" />
        <h1 className="mt-3 text-lg font-bold">{me.display_name}</h1>
        <p className="text-sm text-muted-foreground">@{me.username}</p>
        <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
          <CalendarDays className="size-3.5 text-primary" />
          Cont creat pe: {formatJoinDate(createdAt)} · Zile în aplicație: {days}
        </p>

        <dl className="mt-5 grid w-full grid-cols-3 gap-2">
          {[
            { label: "Urmăriți", value: s.following },
            { label: "Urmăritori", value: s.followers },
            { label: "Like-uri", value: s.likes },
          ].map((x) => (
            <div key={x.label} className="flex flex-col-reverse">
              <dt className="text-xs text-muted-foreground">{x.label}</dt>
              <dd className="font-display text-2xl">{formatCount(x.value)}</dd>
            </div>
          ))}
        </dl>

        {me.bio && <p className="mt-4 text-sm">{me.bio}</p>}

        <div className="mt-5 grid w-full grid-cols-2 gap-2">
          {actions.map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setPanel(id)}
              className="flex h-10 items-center justify-center gap-2 rounded-lg border border-border bg-card text-sm font-bold active:bg-primary/20"
            >
              <Icon className="size-4 text-primary" />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div role="tablist" aria-label="Videoclipuri" className="mt-6 grid grid-cols-3 border-b border-border">
        {TABS.map(({ id, label, Icon }) => {
          const on = tab === id;
          return (
            <button
              key={id}
              role="tab"
              type="button"
              aria-selected={on}
              aria-label={label}
              onClick={() => setTab(id)}
              className={`flex flex-col items-center gap-1 border-b-2 py-2.5 text-[11px] font-bold ${on ? "border-primary text-primary" : "border-transparent text-muted-foreground"}`}
            >
              <Icon className={`size-5 ${on && id !== "videos" ? "fill-primary" : ""}`} />
              {label}
            </button>
          );
        })}
      </div>

      {items.length === 0 ? (
        <p className="px-6 py-14 text-center text-sm text-muted-foreground">{EMPTY_TAB_TEXT[tab]}</p>
      ) : (
        <ul className="grid grid-cols-3 gap-0.5 pt-0.5">
          {items.map((c) => (
            <li key={c.id} className="relative">
              <Link to="/video/$id" params={{ id: c.id }} aria-label={c.description || "Videoclip"}>
                {c.poster ? (
                  <img src={c.poster} alt="" loading="lazy" decoding="async" className="aspect-[9/16] w-full object-cover" />
                ) : (
                  <video src={c.src} preload="metadata" muted className="aspect-[9/16] w-full object-cover" />
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}

      {panel === "edit" && <EditProfileSheet me={me} onClose={() => setPanel(null)} onNotice={setNotice} />}
      {panel === "settings" && <SettingsSheet me={me} onClose={() => setPanel(null)} onNotice={setNotice} />}
      {panel === "switch" && <SwitchAccountSheet currentId={uid} onClose={() => setPanel(null)} onNotice={setNotice} />}
      {panel === "share" && (
        <ShareSheet
          title="Distribuie profilul"
          url={profileUrl(window.location.origin, me.username)}
          text={`Urmărește-mă pe FainShow: @${me.username}`}
          onClose={() => setPanel(null)}
          onNotice={setNotice}
        />
      )}

      {notice && (
        <div role="status" className="fixed left-1/2 top-16 z-[70] -translate-x-1/2 whitespace-nowrap rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
          {notice}
        </div>
      )}
    </div>
  );
}
