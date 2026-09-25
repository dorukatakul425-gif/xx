import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Apple, Crown, LogOut, MessageCircle, Mic, MicOff, MoreHorizontal, Radio, Users, X } from "lucide-react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useVoiceRoom } from "@/hooks/use-voice-room";

const ROOM_ID = "11111111-1111-4111-8111-111111111111";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Aurelia — VIP Sesli Sohbet" },
      { name: "description", content: "VIP 17 ayrıcalığı, canlı sesli odalar." },
    ],
  }),
  component: AureliaApp,
});

type Member = { user_id: string; role: string; is_muted: boolean };
type EntranceEvent = { name: string; userId: string } | null;

function AureliaApp() {
  const [session, setSession] = useState<Session | null>(null);
  const [screen, setScreen] = useState<"login" | "lobby" | "room">("login");
  const [myEntrance, setMyEntrance] = useState(false);
  const [globalEntrance, setGlobalEntrance] = useState<EntranceEvent>(null);
  const [loading, setLoading] = useState<"google" | "apple" | null>(null);
  const [error, setError] = useState("");
  const [members, setMembers] = useState<Member[]>([]);
  const voice = useVoiceRoom(ROOM_ID, session, screen === "room");
  const displayName = session?.user.user_metadata?.["full_name"] ?? session?.user.email?.split("@")[0] ?? "Misafir";

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session) setScreen("lobby");
    });
    const { data } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setScreen(next ? "lobby" : "login");
    });
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session || screen !== "room") return;
    const userId = session.user.id;
    const name = displayName;

    supabase.from("room_members").upsert(
      { room_id: ROOM_ID, user_id: userId, role: "listener", is_muted: true },
      { onConflict: "room_id,user_id" }
    );

    const broadcastChannel = supabase.channel(`entrance-${ROOM_ID}`);
    broadcastChannel.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        broadcastChannel.send({ type: "broadcast", event: "user_entered", payload: { name, userId } });
      }
    });
    broadcastChannel.on("broadcast", { event: "user_entered" }, ({ payload }) => {
      if (payload.userId !== userId) {
        setGlobalEntrance({ name: payload.name, userId: payload.userId });
        setTimeout(() => setGlobalEntrance(null), 4000);
      }
    });

    const loadMembers = () =>
      supabase.from("room_members").select("user_id,role,is_muted").eq("room_id", ROOM_ID).then(({ data }) => setMembers(data ?? []));
    loadMembers();

    const memberChannel = supabase.channel(`room-${ROOM_ID}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "room_members", filter: `room_id=eq.${ROOM_ID}` }, loadMembers)
      .subscribe();

    return () => {
      supabase.removeChannel(broadcastChannel);
      supabase.removeChannel(memberChannel);
    };
  }, [screen, session, displayName]);

  const signIn = async (provider: "google" | "apple") => {
    setLoading(provider); setError("");
    const result = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo: window.location.origin } });
    if (result.error) setError("Giriş başlatılamadı. Lütfen tekrar deneyin.");
    setLoading(null);
  };

  const enterRoom = () => {
    setScreen("room");
    setMyEntrance(true);
    window.setTimeout(() => setMyEntrance(false), 3800);
  };

  const joinAsSpeaker = async () => {
    if (!session) return;
    await supabase.from("room_members").update({ role: "speaker", is_muted: false }).eq("room_id", ROOM_ID).eq("user_id", session.user.id);
    voice.toggleMic();
  };

  if (screen === "login") return <LoginScreen signIn={signIn} loading={loading} error={error} />;
  if (screen === "lobby") return <Lobby name={displayName} onEnter={enterRoom} onBack={async () => { if (session) await supabase.auth.signOut(); setScreen("login"); }} />;
  return (
    <Room
      name={displayName}
      session={session}
      memberCount={Math.max(members.length, 1)}
      members={members}
      muted={voice.muted}
      myEntrance={myEntrance}
      globalEntrance={globalEntrance}
      onToggleMic={voice.toggleMic}
      onJoinSeat={joinAsSpeaker}
      onReplay={() => { setMyEntrance(true); window.setTimeout(() => setMyEntrance(false), 3800); }}
      onLeave={() => {
        if (session) supabase.from("room_members").delete().eq("room_id", ROOM_ID).eq("user_id", session.user.id);
        setScreen("lobby");
      }}
      error={error || voice.error}
    />
  );
}

function Brand() {
  return <div className="flex items-center gap-3"><div className="grid size-11 place-items-center rounded-full border border-primary/50 bg-primary/10 shadow-luxe"><Crown className="size-5 text-primary" /></div><div><p className="font-display text-2xl font-semibold leading-none">Aurelia</p><p className="mt-1 text-[9px] uppercase tracking-[0.28em] text-primary/70">Private voice society</p></div></div>;
}

function LoginScreen({ signIn, loading, error }: { signIn: (p: "google" | "apple") => void; loading: string | null; error: string }) {
  return <main className="room-atmosphere relative min-h-dvh overflow-hidden px-6 text-foreground">
    <Motes />
    <div className="relative z-10 mx-auto flex min-h-dvh max-w-md flex-col pb-8 pt-8">
      <Brand />
      <div className="flex flex-1 flex-col justify-center py-12">
        <div className="relative mx-auto mb-10 grid size-40 place-items-center rounded-full border border-primary/30 bg-primary/5">
          <div className="halo absolute inset-2 rounded-full border border-primary/40" />
          <Crown className="size-14 text-primary" strokeWidth={1.25} />
          <span className="absolute -bottom-2 rounded-full bg-primary px-4 py-1 text-xs font-bold text-primary-foreground">VIP 17</span>
        </div>
        <p className="text-center text-[11px] uppercase tracking-[0.34em] text-primary/80">Sadece seçkin sesler</p>
        <h1 className="mt-3 text-center font-display text-5xl font-semibold leading-[.95]">Gecenin en özel<br />odasına gir.</h1>
        <p className="mx-auto mt-5 max-w-xs text-center text-sm leading-6 text-muted-foreground">Canlı sohbetler, göz alıcı girişler ve herkese özel VIP ayrıcalığı.</p>
      </div>
      <div className="space-y-3">
        <Button variant="gold" className="w-full" onClick={() => signIn("google")} disabled={!!loading}><GoogleMark />{loading === "google" ? "Bağlanıyor…" : "Google ile devam et"}</Button>
        <Button className="w-full" onClick={() => signIn("apple")} disabled={!!loading}><Apple className="size-5" />{loading === "apple" ? "Bağlanıyor…" : "Apple ile devam et"}</Button>
        {error && <p className="text-center text-xs text-danger">{error}</p>}
        <p className="text-center text-[10px] leading-4 text-muted-foreground">Devam ederek topluluk kurallarını kabul edersin.</p>
      </div>
    </div>
  </main>;
}

function Lobby({ name, onEnter, onBack }: { name: string; onEnter: () => void; onBack: () => void | Promise<void> }) {
  return <main className="room-atmosphere relative min-h-dvh overflow-hidden px-5 text-foreground"><Motes /><div className="relative z-10 mx-auto max-w-md py-6">
    <div className="flex items-center justify-between"><Brand /><Button size="icon" onClick={onBack}><LogOut className="size-4" /></Button></div>
    <div className="mt-12"><p className="text-[11px] uppercase tracking-[0.28em] text-primary/70">İyi akşamlar, {name}</p><h1 className="mt-2 font-display text-5xl font-semibold leading-none">Salonlar<br />seni bekliyor.</h1></div>
    <button onClick={onEnter} className="group relative mt-10 w-full overflow-hidden rounded-lg border border-primary/30 bg-surface p-5 text-left shadow-luxe backdrop-blur-xl">
      <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-primary/10 blur-3xl" />
      <div className="relative flex items-start justify-between"><div><p className="text-[10px] uppercase tracking-[0.25em] text-primary/70">Gece Salonu</p><h2 className="mt-1 font-display text-3xl font-semibold">Altın Saatler</h2><p className="mt-2 text-xs text-muted-foreground">Müzik, sohbet ve gecenin ritmi</p></div><span className="flex items-center gap-2 rounded-full bg-accent/15 px-3 py-1 text-[10px] font-bold text-accent"><span className="size-1.5 rounded-full bg-accent" /> CANLI</span></div>
      <div className="relative mt-7 flex items-center"><span className="ml-auto text-sm font-semibold text-primary">Odaya gir →</span></div>
    </button>
    <div className="mt-5 flex items-center justify-between border-t border-border pt-5"><div><p className="text-sm font-semibold">Üyelik seviyen</p><p className="text-xs text-muted-foreground">Tüm özellikler açık</p></div><span className="flex items-center gap-2 rounded-full bg-primary/15 px-4 py-2 text-xs font-bold text-primary"><Crown className="size-4" /> VIP 17</span></div>
  </div></main>;
}

function Room({ name, session, memberCount, members, muted, myEntrance, globalEntrance, onToggleMic, onJoinSeat, onReplay, onLeave, error }: {
  name: string; session: Session | null; memberCount: number; members: Member[]; muted: boolean;
  myEntrance: boolean; globalEntrance: EntranceEvent;
  onToggleMic: () => void; onJoinSeat: () => void; onReplay: () => void; onLeave: () => void; error: string;
}) {
  const speakers = members.filter(m => !m.is_muted).slice(0, 6);
  const listeners = members.filter(m => m.is_muted);
  const emptySeatCount = Math.max(0, 3 - speakers.length);
  const iAmSpeaker = session ? members.find(m => m.user_id === session.user.id && !m.is_muted) : false;

  return <main className="room-atmosphere relative min-h-dvh overflow-hidden text-foreground"><Motes /><div className="relative z-10 mx-auto max-w-md px-5 pb-28 pt-5">
    <div className="flex items-center gap-3">
      <div className="grid size-11 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground shadow-luxe">17</div>
      <div className="min-w-0"><p className="text-[10px] uppercase tracking-[0.28em] text-primary/80">VIP 17 · Altın</p><p className="truncate text-sm font-semibold">Selam, {name} — özel salonuna hoş geldin</p></div>
      <Button size="icon" className="ml-auto" onClick={onReplay}><MoreHorizontal className="size-5" /></Button>
    </div>
    <div className="mt-6 flex items-end justify-between">
      <div><p className="text-[10px] uppercase tracking-[0.24em] text-primary/70">Gece Salonu</p><h1 className="font-display text-3xl font-semibold">Altın Saatler</h1></div>
      <div className="flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-xs"><span className="size-1.5 rounded-full bg-accent" />Canlı · {memberCount}</div>
    </div>

    <section className="mt-6 rounded-lg border border-border bg-surface p-4 backdrop-blur-xl">
      <div className="mb-5 flex items-center justify-between">
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Konuşmacı koltukları</p>
        <span className="text-[10px] text-muted-foreground">{speakers.length} / 6</span>
      </div>
      <div className="grid grid-cols-3 gap-x-3 gap-y-6">
        {speakers.map((m) => <RealSpeaker key={m.user_id} userId={m.user_id} session={session} />)}
        {Array.from({ length: emptySeatCount }).map((_, i) => (
          <button key={i} onClick={iAmSpeaker ? undefined : onJoinSeat} className="flex flex-col items-center group">
            <div className="grid size-16 place-items-center rounded-full border-2 border-dashed border-primary/40 text-2xl text-primary/60 group-active:bg-primary/10 group-hover:border-primary group-hover:text-primary transition-all">+</div>
            <p className="mt-2 text-xs text-primary/70">{iAmSpeaker ? "Dolu" : "Katıl"}</p>
          </button>
        ))}
      </div>
    </section>

    {listeners.length > 0 && (
      <section className="mt-5">
        <div className="flex items-center justify-between"><p className="text-[10px] uppercase tracking-[.2em] text-muted-foreground">Dinleyiciler</p><span className="text-[10px] text-muted-foreground">{listeners.length} kişi</span></div>
        <div className="mt-3 flex gap-4 overflow-x-auto pb-1">
          {listeners.slice(0, 8).map((m) => <RealListener key={m.user_id} userId={m.user_id} session={session} />)}
        </div>
      </section>
    )}

    {error && <p className="mt-3 text-center text-xs text-danger">{error}</p>}
  </div>

  <div className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-md bg-background/90 px-5 pb-[max(18px,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl">
    <div className="flex items-center justify-between rounded-lg border border-border bg-surface p-3">
      <Button size="icon" onClick={onToggleMic}>{muted ? <MicOff className="size-5" /> : <VoiceIcon />}</Button>
      <Button size="icon" variant="gold" onClick={onToggleMic}><Mic className="size-6" /></Button>
      <Button size="icon"><Users className="size-5" /></Button>
      <Button size="icon"><MessageCircle className="size-5" /></Button>
      <Button size="icon" variant="danger" onClick={onLeave}><X className="size-5" /></Button>
    </div>
  </div>

  {myEntrance && <MyVipEntrance name={name} />}
  {globalEntrance && <OtherUserEntrance name={globalEntrance.name} />}
  </main>;
}

function MyVipEntrance({ name }: { name: string }) {
  return (
    <div className="vip-overlay fixed inset-0 z-50 grid place-items-center bg-background/95 backdrop-blur-md">
      <Motes />
      <div className="vip-reveal relative flex flex-col items-center px-8 text-center">
        <div className="relative mb-7">
          <div className="halo absolute inset-0 rounded-full border border-primary" />
          <div className="grid size-28 place-items-center rounded-full bg-primary text-primary-foreground shadow-luxe">
            <div><Crown className="mx-auto size-7" /><span className="font-display text-4xl font-semibold">17</span></div>
          </div>
        </div>
        <p className="text-[11px] font-bold uppercase tracking-[0.4em] text-primary">VIP 17</p>
        <h2 className="mt-3 font-display text-4xl font-semibold leading-none">Altın Kapılar Açılıyor</h2>
        <p className="mt-4 max-w-xs text-sm leading-6 text-muted-foreground">{name}, ışıklar senin için yanıyor.</p>
        <div className="mt-7 h-px w-40 bg-primary/60" />
        <p className="mt-4 text-[10px] uppercase tracking-[.28em] text-muted-foreground">Özel giriş animasyonun</p>
      </div>
    </div>
  );
}

function OtherUserEntrance({ name }: { name: string }) {
  return (
    <div className="fixed bottom-32 inset-x-0 z-40 mx-auto max-w-md px-5" style={{ animation: "slideUpFade 4s ease forwards" }}>
      <div className="flex items-center gap-3 rounded-2xl border border-primary/40 bg-background/90 px-4 py-3 shadow-luxe backdrop-blur-xl">
        <div className="grid size-10 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground text-xs font-bold shadow-luxe"><Crown className="size-4" /></div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{name}</p>
          <p className="text-[10px] text-primary/80 uppercase tracking-wider">odaya katıldı · VIP 17</p>
        </div>
        <span className="text-xl">✦</span>
      </div>
      <style>{`@keyframes slideUpFade { 0% { opacity:0; transform:translateY(40px); } 15% { opacity:1; transform:translateY(0); } 75% { opacity:1; transform:translateY(0); } 100% { opacity:0; transform:translateY(-20px); } }`}</style>
    </div>
  );
}

function RealSpeaker({ userId, session }: { userId: string; session: Session | null }) {
  const isMe = session?.user.id === userId;
  const initials = isMe ? (session?.user.user_metadata?.["full_name"]?.[0] ?? "?") : userId.slice(0, 2).toUpperCase();
  const label = isMe ? (session?.user.user_metadata?.["full_name"]?.split(" ")[0] ?? "Sen") : "Üye";
  const avatarUrl = isMe ? session?.user.user_metadata?.["avatar_url"] : null;
  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <span className="halo absolute inset-0 rounded-full border border-primary/70" />
        {avatarUrl ? <img src={avatarUrl} alt={label} className="size-16 rounded-full border-2 border-primary/50 object-cover" /> : <div className="size-16 rounded-full border-2 border-primary/50 bg-primary/20 grid place-items-center text-lg font-bold text-primary">{initials}</div>}
        <span className="absolute -bottom-1 -right-1 grid size-5 place-items-center rounded-full bg-primary text-primary-foreground"><Radio className="size-2.5" /></span>
      </div>
      <p className="mt-2 text-xs font-semibold">{label}</p>
      <p className="text-[9px] text-primary/80">Konuşuyor · VIP 17</p>
    </div>
  );
}

function RealListener({ userId, session }: { userId: string; session: Session | null }) {
  const isMe = session?.user.id === userId;
  const initials = isMe ? (session?.user.user_metadata?.["full_name"]?.[0] ?? "?") : userId.slice(0, 2).toUpperCase();
  const label = isMe ? (session?.user.user_metadata?.["full_name"]?.split(" ")[0] ?? "Sen") : "Üye";
  const avatarUrl = isMe ? session?.user.user_metadata?.["avatar_url"] : null;
  return (
    <div className="shrink-0 text-center">
      {avatarUrl ? <img src={avatarUrl} alt={label} className="size-11 rounded-full border-2 border-primary/50 object-cover" /> : <div className="size-11 rounded-full border-2 border-primary/50 bg-primary/20 grid place-items-center text-sm font-bold text-primary">{initials}</div>}
      <p className="mt-1 text-[10px] text-muted-foreground">{label}</p>
      <span className="text-[8px] font-bold text-primary">VIP 17</span>
    </div>
  );
}

function VoiceIcon() { return <span className="flex h-5 items-center gap-0.5">{[1,2,3,4].map((n) => <span key={n} className="voice-bar h-4 w-0.5 rounded-full bg-primary" style={{ animationDelay: `${n * .12}s` }} />)}</span>; }
function Motes() { return <div className="pointer-events-none absolute inset-0 overflow-hidden">{["left-[8%] top-[35%]","left-[24%] top-[65%]","right-[12%] top-[30%]","right-[28%] top-[75%]","left-[52%] top-[52%]"].map((p,i) => <span key={p} className={`mote-rise absolute ${p} size-1 rounded-full bg-primary`} style={{ animationDelay: `${i * .8}s` }} />)}</div>; }
function GoogleMark() { return <svg className="size-5" viewBox="0 0 24 24"><path fill="currentColor" d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.9h5.4a4.6 4.6 0 0 1-2 3v2.6h3.2c1.9-1.8 3-4.4 3-7.5Z"/><path fill="currentColor" opacity=".75" d="M12 22c2.7 0 5-.9 6.6-2.3l-3.2-2.6c-.9.6-2 1-3.4 1a5.8 5.8 0 0 1-5.5-4H3.2v2.6A10 10 0 0 0 12 22Z"/><path fill="currentColor" opacity=".55" d="M6.5 14.1a6 6 0 0 1 0-4.2V7.3H3.2a10 10 0 0 0 0 9.4l3.3-2.6Z"/><path fill="currentColor" opacity=".35" d="M12 5.9c1.5 0 2.8.5 3.8 1.5l2.9-2.8A9.7 9.7 0 0 0 3.2 7.3l3.3 2.6a5.8 5.8 0 0 1 5.5-4Z"/></svg>; }
