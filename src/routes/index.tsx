import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Apple,
  ChevronLeft,
  Crown,
  Headphones,
  LoaderCircle,
  LogOut,
  MessageCircle,
  Mic,
  MicOff,
  Radio,
  Send,
  ShieldCheck,
  X,
} from "lucide-react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useVoiceRoom } from "@/hooks/use-voice-room";

const ROOM_ID = "11111111-1111-4111-8111-111111111111";
const MAX_SPEAKERS = 6;

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Aurelia — VIP Sesli Sohbet" },
      { name: "description", content: "Aurelia canlı VIP sesli sohbet odası." },
      { property: "og:title", content: "Aurelia — VIP Sesli Sohbet" },
      {
        property: "og:description",
        content: "Canlı sohbet, gerçek katılımcılar ve özel ses odaları.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AureliaApp,
});

type RoomMember = { user_id: string; role: string; is_muted: boolean };
type LiveProfile = {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  online_at: string;
};
type Participant = RoomMember & LiveProfile;
type Message = {
  id: number;
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  content: string;
  created_at: string;
};
type EntranceEvent = { name: string; userId: string } | null;
type Screen = "login" | "lobby" | "room";

function readName(session: Session | null) {
  const metadata = session?.user.user_metadata;
  const metadataName = metadata?.["full_name"] ?? metadata?.["name"];
  if (typeof metadataName === "string" && metadataName.trim())
    return metadataName.trim();
  return session?.user.email?.split("@")[0] || "Misafir";
}

function readAvatar(session: Session | null) {
  const metadata = session?.user.user_metadata;
  const value = metadata?.["avatar_url"] ?? metadata?.["picture"];
  return typeof value === "string" && value.trim() ? value : null;
}

function initials(name: string) {
  const result = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toLocaleUpperCase("tr-TR") ?? "")
    .join("");
  return result || "A";
}

function AureliaApp() {
  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [screen, setScreen] = useState<Screen>("login");
  const [loading, setLoading] = useState<"google" | "apple" | null>(null);
  const [error, setError] = useState("");
  const [members, setMembers] = useState<RoomMember[]>([]);
  const [liveProfiles, setLiveProfiles] = useState<Record<string, LiveProfile>>(
    {},
  );
  const [myEntrance, setMyEntrance] = useState(false);
  const [globalEntrance, setGlobalEntrance] = useState<EntranceEvent>(null);
  const voice = useVoiceRoom(ROOM_ID, session, screen === "room");
  const displayName = readName(session);
  const avatarUrl = readAvatar(session);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!active) return;
      setSession(data.session);
      setScreen(data.session ? "lobby" : "login");
      setAuthReady(true);
      if (sessionError)
        setError("Oturum bilgisi alınamadı. Lütfen tekrar deneyin.");
    });
    const { data } = supabase.auth.onAuthStateChange((event, next) => {
      if (
        !active ||
        (event !== "SIGNED_IN" &&
          event !== "SIGNED_OUT" &&
          event !== "USER_UPDATED")
      )
        return;
      setSession(next);
      setScreen(next ? "lobby" : "login");
      setAuthReady(true);
    });
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!session || screen !== "room") return;
    let active = true;
    const userId = session.user.id;
    const me: LiveProfile = {
      user_id: userId,
      display_name: displayName,
      avatar_url: avatarUrl,
      online_at: new Date().toISOString(),
    };

    setLiveProfiles((current) => ({ ...current, [userId]: me }));

    const loadMembers = async () => {
      const { data, error: membersError } = await supabase
        .from("room_members")
        .select("user_id,role,is_muted")
        .eq("room_id", ROOM_ID);
      if (!active) return;
      if (membersError) {
        setError("Katılımcılar yüklenemedi. Bağlantınızı kontrol edin.");
        return;
      }
      setMembers((data ?? []) as RoomMember[]);
    };

    const registerMember = async () => {
      const { data: existing } = await supabase
        .from("room_members")
        .select("user_id,role,is_muted")
        .eq("room_id", ROOM_ID)
        .eq("user_id", userId)
        .maybeSingle();
      if (!existing) {
        const { error: insertError } = await supabase
          .from("room_members")
          .insert({
            room_id: ROOM_ID,
            user_id: userId,
            role: "listener",
            is_muted: true,
          });
        if (insertError && active)
          setError("Odaya katılım tamamlanamadı. Lütfen tekrar deneyin.");
      }
      await loadMembers();
    };

    const roomChannel = supabase.channel(`room-live-${ROOM_ID}`, {
      config: { presence: { key: userId } },
    });

    roomChannel
      .on("presence", { event: "sync" }, () => {
        const state = roomChannel.presenceState<LiveProfile>();
        const next: Record<string, LiveProfile> = { [userId]: me };
        Object.values(state)
          .flat()
          .forEach((profile) => {
            if (profile?.user_id) next[profile.user_id] = profile;
          });
        if (active) setLiveProfiles(next);
      })
      .on("broadcast", { event: "user_entered" }, ({ payload }) => {
        const incoming = payload as { name?: string; userId?: string };
        if (!active || !incoming.userId || incoming.userId === userId) return;
        setGlobalEntrance({
          name: incoming.name || "Yeni üye",
          userId: incoming.userId,
        });
        window.setTimeout(() => setGlobalEntrance(null), 3600);
      })
      .subscribe(async (status) => {
        if (status !== "SUBSCRIBED") return;
        await roomChannel.track(me);
        await roomChannel.send({
          type: "broadcast",
          event: "user_entered",
          payload: { name: displayName, userId },
        });
      });

    const memberChannel = supabase
      .channel(`room-members-${ROOM_ID}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "room_members",
          filter: `room_id=eq.${ROOM_ID}`,
        },
        loadMembers,
      )
      .subscribe();

    registerMember();

    return () => {
      active = false;
      roomChannel.untrack();
      supabase.removeChannel(roomChannel);
      supabase.removeChannel(memberChannel);
      setLiveProfiles({});
    };
  }, [avatarUrl, displayName, screen, session]);

  const participants = useMemo<Participant[]>(() => {
    if (!session) return [];
    const selfId = session.user.id;
    const activeIds = new Set([...Object.keys(liveProfiles), selfId]);
    const activeMembers = members.filter((member) =>
      activeIds.has(member.user_id),
    );
    if (!activeMembers.some((member) => member.user_id === selfId)) {
      activeMembers.push({ user_id: selfId, role: "listener", is_muted: true });
    }
    return activeMembers.map((member) => ({
      ...member,
      ...(liveProfiles[member.user_id] ?? {
        user_id: member.user_id,
        display_name: member.user_id === selfId ? displayName : "Aurelia Üyesi",
        avatar_url: member.user_id === selfId ? avatarUrl : null,
        online_at: new Date().toISOString(),
      }),
    }));
  }, [avatarUrl, displayName, liveProfiles, members, session]);

  const signIn = async (provider: "google" | "apple") => {
    setLoading(provider);
    setError("");
    const result = await supabase.auth.signInWithOAuth({ provider, options: {
      redirectTo: window.location.origin
    });
    if (result.error) setError("Giriş başlatılamadı. Lütfen tekrar deneyin.");
    setLoading(null);
  };

  const enterRoom = () => {
    setError("");
    setScreen("room");
    setMyEntrance(true);
    window.setTimeout(() => setMyEntrance(false), 3200);
  };

  const updateMySeat = async (speaker: boolean) => {
    if (!session) return;
    setError("");
    const next = { role: speaker ? "speaker" : "listener", is_muted: !speaker };
    setMembers((current) =>
      current.map((member) =>
        member.user_id === session.user.id ? { ...member, ...next } : member,
      ),
    );
    const { error: updateError } = await supabase
      .from("room_members")
      .update(next)
      .eq("room_id", ROOM_ID)
      .eq("user_id", session.user.id);
    if (updateError) {
      setError("Koltuk durumu değiştirilemedi. Lütfen tekrar deneyin.");
      return;
    }
    if (voice.muted === speaker) voice.toggleMic();
  };

  const leaveRoom = async () => {
    if (session) {
      await supabase
        .from("room_members")
        .delete()
        .eq("room_id", ROOM_ID)
        .eq("user_id", session.user.id);
    }
    setScreen("lobby");
  };

  if (!authReady) return <LoadingScreen />;
  if (screen === "login")
    return <LoginScreen signIn={signIn} loading={loading} error={error} />;
  if (screen === "lobby") {
    return (
      <Lobby
        name={displayName}
        avatarUrl={avatarUrl}
        onEnter={enterRoom}
        onBack={async () => {
          await supabase.auth.signOut();
          setScreen("login");
        }}
      />
    );
  }

  return session ? (
    <Room
      name={displayName}
      avatarUrl={avatarUrl}
      session={session}
      participants={participants}
      muted={voice.muted}
      myEntrance={myEntrance}
      globalEntrance={globalEntrance}
      onToggleMic={voice.toggleMic}
      onJoinSeat={() => updateMySeat(true)}
      onLeaveSeat={() => updateMySeat(false)}
      onLeave={leaveRoom}
      error={error || voice.error}
    />
  ) : null;
}

function LoadingScreen() {
  return (
    <main className="room-atmosphere grid min-h-dvh place-items-center text-foreground">
      <LoaderCircle
        className="size-7 animate-spin text-primary"
        aria-label="Yükleniyor"
      />
    </main>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-3">
      <div className="grid size-11 place-items-center rounded-full border border-primary/50 bg-primary/10 shadow-luxe">
        <Crown className="size-5 text-primary" />
      </div>
      <div>
        <p className="font-display text-2xl font-semibold leading-none">
          Aurelia
        </p>
        <p className="mt-1 text-[9px] uppercase tracking-[0.28em] text-primary/70">
          Private voice society
        </p>
      </div>
    </div>
  );
}

function LoginScreen({
  signIn,
  loading,
  error,
}: {
  signIn: (provider: "google" | "apple") => void;
  loading: string | null;
  error: string;
}) {
  return (
    <main className="room-atmosphere relative min-h-dvh overflow-hidden px-6 text-foreground">
      <Motes />
      <div className="relative z-10 mx-auto flex min-h-dvh max-w-md flex-col pb-8 pt-8">
        <Brand />
        <div className="flex flex-1 flex-col justify-center py-12">
          <div className="relative mx-auto mb-10 grid size-40 place-items-center rounded-full border border-primary/30 bg-primary/5">
            <div className="halo absolute inset-2 rounded-full border border-primary/40" />
            <Crown className="size-14 text-primary" strokeWidth={1.25} />
            <span className="absolute -bottom-2 rounded-full bg-primary px-4 py-1 text-xs font-bold text-primary-foreground">
              VIP 17
            </span>
          </div>
          <p className="text-center text-[11px] uppercase tracking-[0.34em] text-primary/80">
            Sadece seçkin sesler
          </p>
          <h1 className="mt-3 text-center font-display text-5xl font-semibold leading-[.95]">
            Gecenin en özel
            <br />
            odasına gir.
          </h1>
          <p className="mx-auto mt-5 max-w-xs text-center text-sm leading-6 text-muted-foreground">
            Canlı sohbetler, gerçek profiller ve sana özel VIP deneyimi.
          </p>
        </div>
        <div className="space-y-3">
          <Button
            variant="gold"
            className="w-full"
            onClick={() => signIn("google")}
            disabled={Boolean(loading)}
          >
            <GoogleMark />
            {loading === "google" ? "Bağlanıyor…" : "Google ile devam et"}
          </Button>
          <Button
            className="w-full"
            onClick={() => signIn("apple")}
            disabled={Boolean(loading)}
          >
            <Apple className="size-5" />
            {loading === "apple" ? "Bağlanıyor…" : "Apple ile devam et"}
          </Button>
          {error && <p className="text-center text-xs text-danger">{error}</p>}
        </div>
      </div>
    </main>
  );
}

function Lobby({
  name,
  avatarUrl,
  onEnter,
  onBack,
}: {
  name: string;
  avatarUrl: string | null;
  onEnter: () => void;
  onBack: () => void | Promise<void>;
}) {
  return (
    <main className="room-atmosphere relative min-h-dvh overflow-hidden px-5 text-foreground">
      <Motes />
      <div className="relative z-10 mx-auto max-w-md py-6">
        <div className="flex items-center justify-between">
          <Brand />
          <Button size="icon" onClick={onBack} aria-label="Çıkış yap">
            <LogOut />
          </Button>
        </div>
        <div className="mt-12 flex items-center gap-4">
          <Avatar name={name} url={avatarUrl} size="lg" />
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-primary/70">
              İyi akşamlar
            </p>
            <h1 className="mt-1 font-display text-3xl font-semibold">{name}</h1>
          </div>
        </div>
        <div className="mt-9 overflow-hidden rounded-lg border border-primary/30 bg-surface p-5 shadow-luxe backdrop-blur-xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] text-primary/70">
                Gece Salonu
              </p>
              <h2 className="mt-1 font-display text-3xl font-semibold">
                Altın Saatler
              </h2>
              <p className="mt-2 text-xs text-muted-foreground">
                Müzik, sohbet ve gecenin ritmi
              </p>
            </div>
            <span className="flex items-center gap-2 rounded-full bg-accent/15 px-3 py-1 text-[10px] font-bold text-accent">
              <span className="size-1.5 rounded-full bg-accent" /> CANLI
            </span>
          </div>
          <Button variant="gold" className="mt-7 w-full" onClick={onEnter}>
            <Radio /> Odaya katıl
          </Button>
        </div>
      </div>
    </main>
  );
}

function Room({
  name,
  avatarUrl,
  session,
  participants,
  muted,
  myEntrance,
  globalEntrance,
  onToggleMic,
  onJoinSeat,
  onLeaveSeat,
  onLeave,
  error,
}: {
  name: string;
  avatarUrl: string | null;
  session: Session;
  participants: Participant[];
  muted: boolean;
  myEntrance: boolean;
  globalEntrance: EntranceEvent;
  onToggleMic: () => void;
  onJoinSeat: () => void;
  onLeaveSeat: () => void;
  onLeave: () => void;
  error: string;
}) {
  const speakers = participants.filter(
    (participant) => participant.role === "speaker",
  );
  const listeners = participants.filter(
    (participant) => participant.role !== "speaker",
  );
  const emptySeatCount = Math.max(0, MAX_SPEAKERS - speakers.length);
  const iAmSpeaker = speakers.some(
    (participant) => participant.user_id === session.user.id,
  );

  return (
    <main className="room-atmosphere relative h-dvh overflow-hidden text-foreground">
      <Motes />
      <div className="relative z-10 mx-auto grid h-dvh max-w-md grid-rows-[auto_auto_auto_auto_minmax(0,1fr)_auto] gap-2 px-3 pb-[max(8px,env(safe-area-inset-bottom))] pt-3">
        <header className="flex items-center gap-3">
          <Button
            size="icon"
            variant="ghost"
            onClick={onLeave}
            aria-label="Salona dön"
          >
            <ChevronLeft />
          </Button>
          <Avatar name={name} url={avatarUrl} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{name}</p>
            <p className="text-[9px] uppercase tracking-[0.2em] text-primary/80">
              VIP 17 · Altın
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-xs">
            <span className="size-1.5 rounded-full bg-accent" />
            {participants.length}
          </div>
        </header>

        <section className="mt-1">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.24em] text-primary/70">
                Gece Salonu
              </p>
              <h1 className="font-display text-3xl font-semibold">
                Altın Saatler
              </h1>
            </div>
            <ShieldCheck className="size-5 text-primary" />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Saygılı sohbet, gerçek insanlar, kesintisiz ses.
          </p>
        </section>

        <section className="rounded-lg border border-border bg-surface p-3 backdrop-blur-xl">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Konuşmacılar
            </p>
            <span className="text-[10px] text-muted-foreground">
              {speakers.length} / {MAX_SPEAKERS}
            </span>
          </div>
          <div className="grid grid-cols-6 gap-2">
            {speakers.map((participant) => (
              <ParticipantSeat
                key={participant.user_id}
                participant={participant}
                isMe={participant.user_id === session.user.id}
                onLeave={
                  participant.user_id === session.user.id
                    ? onLeaveSeat
                    : undefined
                }
              />
            ))}
            {Array.from({ length: emptySeatCount }).map((_, index) => (
              <Button
                key={`empty-${index}`}
                variant="ghost"
                onClick={!iAmSpeaker ? onJoinSeat : undefined}
                disabled={iAmSpeaker}
                className="h-auto min-w-0 flex-col gap-1 py-0"
                aria-label={
                  iAmSpeaker
                    ? "Boş konuşmacı koltuğu"
                    : "Konuşmacı olarak katıl"
                }
              >
                <span className="grid size-12 place-items-center rounded-full border-2 border-dashed border-primary/45 text-lg text-primary sm:size-14">
                  +
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {iAmSpeaker ? "Boş koltuk" : "Katıl"}
                </span>
              </Button>
            ))}
          </div>
        </section>

        <section className="min-h-12">
          <div className="flex items-center justify-between">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Dinleyiciler
            </p>
            <span className="text-[10px] text-muted-foreground">
              {listeners.length} kişi
            </span>
          </div>
          {listeners.length ? (
            <div className="mt-1 flex gap-3 overflow-x-auto pb-1">
              {listeners.map((participant) => (
                <Listener
                  key={participant.user_id}
                  participant={participant}
                  isMe={participant.user_id === session.user.id}
                />
              ))}
            </div>
          ) : (
            <p className="mt-3 text-xs text-muted-foreground">
              Henüz dinleyici yok.
            </p>
          )}
        </section>

        {error && (
          <p className="mt-2 rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-center text-xs text-danger">
            {error}
          </p>
        )}

        <ChatDock session={session} displayName={name} avatarUrl={avatarUrl} />

        <footer className="bg-background/90 pt-1 backdrop-blur-xl">
          <div className="flex items-center justify-between rounded-lg border border-border bg-surface px-3 py-2 shadow-luxe">
            <div className="flex items-center gap-2">
              <Headphones className="size-4 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground">
                {iAmSpeaker ? "Sahnedesin" : "Dinliyorsun"}
              </span>
            </div>
            <Button
              size="icon"
              variant={muted ? "default" : "gold"}
              onClick={onToggleMic}
              aria-label={muted ? "Mikrofonu aç" : "Mikrofonu kapat"}
            >
              {muted ? <MicOff /> : <VoiceIcon />}
            </Button>
            <Button
              size="icon"
              variant="danger"
              onClick={onLeave}
              aria-label="Odadan ayrıl"
            >
              <X />
            </Button>
          </div>
        </footer>
      </div>
      {myEntrance && <MyVipEntrance name={name} />}
      {globalEntrance && <OtherUserEntrance name={globalEntrance.name} />}
    </main>
  );
}

function ChatDock({
  session,
  displayName,
  avatarUrl,
}: {
  session: Session;
  displayName: string;
  avatarUrl: string | null;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [chatError, setChatError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    supabase
      .from("messages")
      .select("id,user_id,display_name,avatar_url,content,created_at")
      .eq("room_id", ROOM_ID)
      .order("created_at", { ascending: true })
      .limit(60)
      .then(({ data, error }) => {
        if (!active) return;
        if (error) setChatError("Mesajlar şu anda yüklenemiyor.");
        else setMessages((data ?? []) as Message[]);
      });
    const channel = supabase
      .channel(`chat-${ROOM_ID}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `room_id=eq.${ROOM_ID}`,
        },
        (payload) => {
          const incoming = payload.new as Message;
          if (active)
            setMessages((current) =>
              current.some((message) => message.id === incoming.id)
                ? current
                : [...current, incoming],
            );
        },
      )
      .subscribe();
    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages]);

  const send = async () => {
    const content = text.trim();
    if (!content || sending || content.length > 500) return;
    setSending(true);
    setChatError("");
    const { data, error } = await supabase
      .from("messages")
      .insert({
        room_id: ROOM_ID,
        user_id: session.user.id,
        display_name: displayName,
        avatar_url: avatarUrl,
        content,
      })
      .select("id,user_id,display_name,avatar_url,content,created_at")
      .single();
    if (error) setChatError("Mesaj gönderilemedi. Tekrar deneyin.");
    else {
      setText("");
      setMessages((current) =>
        current.some((message) => message.id === data.id)
          ? current
          : [...current, data as Message],
      );
    }
    setSending(false);
  };

  return (
    <section className="flex min-h-0 flex-col overflow-hidden rounded-lg border border-border bg-surface/80 backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <MessageCircle className="size-4 text-primary" />
          <h2 className="text-sm font-semibold">Oda sohbeti</h2>
        </div>
        <span className="text-[10px] text-muted-foreground">Canlı</span>
      </div>
      <div
        className="min-h-0 flex-1 space-y-2 overflow-y-auto px-3 py-2"
        aria-live="polite"
      >
        {!messages.length && !chatError && (
          <p className="py-8 text-center text-xs text-muted-foreground">
            Sohbeti ilk sen başlat.
          </p>
        )}
        {messages.map((message) => {
          const isMe = message.user_id === session.user.id;
          return (
            <div
              key={message.id}
              className={`flex gap-2 ${isMe ? "flex-row-reverse" : ""}`}
            >
              <Avatar
                name={message.display_name}
                url={message.avatar_url}
                size="xs"
              />
              <div
                className={`flex max-w-[76%] flex-col ${isMe ? "items-end" : "items-start"}`}
              >
                {!isMe && (
                  <span className="mb-1 text-[9px] text-muted-foreground">
                    {message.display_name}
                  </span>
                )}
                <p
                  className={`rounded-xl px-3 py-2 text-xs leading-5 ${isMe ? "bg-primary text-primary-foreground" : "border border-border bg-background"}`}
                >
                  {message.content}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      {chatError && (
        <p className="px-4 pb-2 text-center text-[10px] text-danger">
          {chatError}
        </p>
      )}
      <form
        className="flex items-center gap-2 border-t border-border p-3"
        onSubmit={(event) => {
          event.preventDefault();
          send();
        }}
      >
        <input
          className="h-10 min-w-0 flex-1 rounded-md border border-input bg-background px-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary"
          placeholder="Mesaj yaz…"
          value={text}
          maxLength={500}
          onChange={(event) => setText(event.target.value)}
          aria-label="Mesaj"
        />
        <Button
          size="icon"
          variant="gold"
          type="submit"
          disabled={!text.trim() || sending}
          aria-label="Mesajı gönder"
        >
          {sending ? <LoaderCircle className="animate-spin" /> : <Send />}
        </Button>
      </form>
    </section>
  );
}

function Avatar({
  name,
  url,
  size,
}: {
  name: string;
  url: string | null;
  size: "xs" | "sm" | "md" | "lg";
}) {
  const sizes = {
    xs: "size-8 text-[10px]",
    sm: "size-10 text-xs",
    md: "size-12 text-sm sm:size-14",
    lg: "size-20 text-2xl",
  };
  return url ? (
    <img
      src={url}
      alt={`${name} profil fotoğrafı`}
      referrerPolicy="no-referrer"
      className={`${sizes[size]} shrink-0 rounded-full border-2 border-primary/45 object-cover bg-muted`}
    />
  ) : (
    <div
      role="img"
      aria-label={`${name} profil fotoğrafı`}
      className={`${sizes[size]} grid shrink-0 place-items-center rounded-full border-2 border-primary/45 bg-primary/15 font-bold text-primary`}
    >
      {initials(name)}
    </div>
  );
}

function ParticipantSeat({
  participant,
  isMe,
  onLeave,
}: {
  participant: Participant;
  isMe: boolean;
  onLeave?: (() => void) | undefined;
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <Button
        variant="ghost"
        className="relative h-auto rounded-full p-0"
        onClick={onLeave}
        aria-label={
          isMe
            ? "Konuşmacı koltuğundan ayrıl"
            : `${participant.display_name} konuşuyor`
        }
      >
        <span className="absolute -inset-1 rounded-full border-2 border-primary/55" />
        <span className="absolute -inset-1 animate-ping rounded-full border border-primary/30" />
        <Avatar
          name={participant.display_name}
          url={participant.avatar_url}
          size="md"
        />
        <span className="absolute -bottom-1 -right-1 grid size-5 place-items-center rounded-full bg-primary text-primary-foreground">
          <Radio className="size-2.5" />
        </span>
      </Button>
      <p className="mt-2 max-w-full truncate text-xs font-semibold">
        {isMe ? "Sen" : participant.display_name.split(" ")[0]}
      </p>
      <p className="text-[9px] text-primary/80">Konuşmacı</p>
    </div>
  );
}

function Listener({
  participant,
  isMe,
}: {
  participant: Participant;
  isMe: boolean;
}) {
  return (
    <div className="w-14 shrink-0 text-center">
      <div className="relative inline-block">
        <Avatar
          name={participant.display_name}
          url={participant.avatar_url}
          size="sm"
        />
        {participant.is_muted && (
          <span className="absolute -bottom-1 -right-1 grid size-4 place-items-center rounded-full bg-muted">
            <MicOff className="size-2.5 text-muted-foreground" />
          </span>
        )}
      </div>
      <p className="mt-1 truncate text-[10px] text-muted-foreground">
        {isMe ? "Sen" : participant.display_name.split(" ")[0]}
      </p>
    </div>
  );
}

function MyVipEntrance({ name }: { name: string }) {
  return (
    <div className="vip-overlay fixed inset-0 z-50 grid place-items-center bg-background/95 backdrop-blur-md">
      <Motes />
      <div className="vip-reveal relative flex flex-col items-center px-8 text-center">
        <div className="relative mb-7">
          <div className="halo absolute inset-0 rounded-full border border-primary" />
          <div className="grid size-28 place-items-center rounded-full bg-primary text-primary-foreground shadow-luxe">
            <div>
              <Crown className="mx-auto size-7" />
              <span className="font-display text-4xl font-semibold">17</span>
            </div>
          </div>
        </div>
        <p className="text-[11px] font-bold uppercase tracking-[0.4em] text-primary">
          VIP 17
        </p>
        <h2 className="mt-3 font-display text-4xl font-semibold leading-none">
          Altın Kapılar Açılıyor
        </h2>
        <p className="mt-4 max-w-xs text-sm leading-6 text-muted-foreground">
          {name}, odadaki yerin hazır.
        </p>
      </div>
    </div>
  );
}

function OtherUserEntrance({ name }: { name: string }) {
  return (
    <div className="entrance-toast fixed inset-x-0 bottom-28 z-40 mx-auto max-w-md px-5">
      <div className="flex items-center gap-3 rounded-lg border border-primary/40 bg-background/95 px-4 py-3 shadow-luxe backdrop-blur-xl">
        <div className="grid size-10 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
          <Crown />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{name}</p>
          <p className="text-[9px] uppercase tracking-[0.16em] text-primary/80">
            odaya katıldı · VIP 17
          </p>
        </div>
      </div>
    </div>
  );
}

function VoiceIcon() {
  return (
    <span className="flex h-5 items-center gap-0.5" aria-hidden="true">
      {[1, 2, 3, 4].map((number) => (
        <span
          key={number}
          className={`voice-bar voice-delay-${number} h-4 w-0.5 rounded-full bg-primary-foreground`}
        />
      ))}
    </span>
  );
}

function Motes() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      {[
        "left-[8%] top-[35%]",
        "left-[24%] top-[65%]",
        "right-[12%] top-[30%]",
        "right-[28%] top-[75%]",
        "left-[52%] top-[52%]",
      ].map((position, index) => (
        <span
          key={position}
          className={`mote-rise mote-delay-${index + 1} absolute ${position} size-1 rounded-full bg-primary`}
        />
      ))}
    </div>
  );
}

function GoogleMark() {
  return (
    <svg className="size-5" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.9h5.4a4.6 4.6 0 0 1-2 3v2.6h3.2c1.9-1.8 3-4.4 3-7.5Z"
      />
      <path
        fill="currentColor"
        opacity=".75"
        d="M12 22c2.7 0 5-.9 6.6-2.3l-3.2-2.6c-.9.6-2 1-3.4 1a5.8 5.8 0 0 1-5.5-4H3.2v2.6A10 10 0 0 0 12 22Z"
      />
      <path
        fill="currentColor"
        opacity=".55"
        d="M6.5 14.1a6 6 0 0 1 0-4.2V7.3H3.2a10 10 0 0 0 0 9.4l3.3-2.6Z"
      />
      <path
        fill="currentColor"
        opacity=".35"
        d="M12 5.9c1.5 0 2.8.5 3.8 1.5l2.9-2.8A9.7 9.7 0 0 0 3.2 7.3l3.3 2.6a5.8 5.8 0 0 1 5.5-4Z"
      />
    </svg>
  );
}
