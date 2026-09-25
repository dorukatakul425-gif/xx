import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Apple, Crown, LogOut, MessageCircle, Mic, MicOff, MoreHorizontal, Radio, Send, Users, X } from "lucide-react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useVoiceRoom } from "@/hooks/use-voice-room";

const ROOM_ID = "11111111-1111-4111-8111-111111111111";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Velvet — Oyun & Səs" }] }),
  component: VelvetApp,
});

type Member = { user_id: string; role: string; is_muted: boolean };
type Message = { id: number; user_id: string; display_name: string; avatar_url: string | null; content: string; created_at: string };
type EntranceEvent = { name: string; userId: string } | null;

function VelvetApp() {
  const [session, setSession] = useState<Session | null>(null);
  const [screen, setScreen] = useState<"login" | "lobby" | "room">("login");
  const [myEntrance, setMyEntrance] = useState(false);
  const [globalEntrance, setGlobalEntrance] = useState<EntranceEvent>(null);
  const [loading, setLoading] = useState<"google" | "apple" | null>(null);
  const [error, setError] = useState("");
  const [members, setMembers] = useState<Member[]>([]);
  const [showChat, setShowChat] = useState(false);
  const voice = useVoiceRoom(ROOM_ID, session, screen === "room");
  const displayName = session?.user.user_metadata?.["full_name"] ?? session?.user.email?.split("@")[0] ?? "Qonaq";
  const avatarUrl = session?.user.user_metadata?.["avatar_url"] ?? null;

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
    supabase.from("room_members").upsert({ room_id: ROOM_ID, user_id: userId, role: "listener", is_muted: true }, { onConflict: "room_id,user_id" });
    const broadcastChannel = supabase.channel(`entrance-${ROOM_ID}`);
    broadcastChannel.subscribe((status) => {
      if (status === "SUBSCRIBED") broadcastChannel.send({ type: "broadcast", event: "user_entered", payload: { name: displayName, userId } });
    });
    broadcastChannel.on("broadcast", { event: "user_entered" }, ({ payload }) => {
      if (payload.userId !== userId) { setGlobalEntrance({ name: payload.name, userId: payload.userId }); setTimeout(() => setGlobalEntrance(null), 4000); }
    });
    const loadMembers = () => supabase.from("room_members").select("user_id,role,is_muted").eq("room_id", ROOM_ID).then(({ data }) => { if (data) setMembers([...data]); });
    loadMembers();
    const memberChannel = supabase.channel(`room-members-${ROOM_ID}`).on("postgres_changes", { event: "*", schema: "public", table: "room_members", filter: `room_id=eq.${ROOM_ID}` }, () => loadMembers()).subscribe();
    return () => { supabase.removeChannel(broadcastChannel); supabase.removeChannel(memberChannel); };
  }, [screen, session, displayName]);

  const signIn = async (provider: "google" | "apple") => {
    setLoading(provider); setError("");
    const result = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo: window.location.origin } });
    if (result.error) setError("Giriş alınmadı. Yenidən cəhd edin.");
    setLoading(null);
  };

  const enterRoom = () => { setScreen("room"); setMyEntrance(true); window.setTimeout(() => setMyEntrance(false), 3800); };
  const joinAsSpeaker = async () => {
    if (!session) return;
    await supabase.from("room_members").update({ role: "speaker", is_muted: false }).eq("room_id", ROOM_ID).eq("user_id", session.user.id);
    if (voice.muted) voice.toggleMic();
  };
  const leaveAsSpeaker = async () => {
    if (!session) return;
    await supabase.from("room_members").update({ role: "listener", is_muted: true }).eq("room_id", ROOM_ID).eq("user_id", session.user.id);
    if (!voice.muted) voice.toggleMic();
  };

  if (screen === "login") return <LoginScreen signIn={signIn} loading={loading} error={error} />;
  if (screen === "lobby") return <Lobby name={displayName} onEnter={enterRoom} onBack={async () => { if (session) await supabase.auth.signOut(); setScreen("login"); }} />;
  return (
    <>
      <Room name={displayName} avatarUrl={avatarUrl} session={session} memberCount={Math.max(members.length, 1)} members={members} muted={voice.muted} myEntrance={myEntrance} globalEntrance={globalEntrance} onToggleMic={voice.toggleMic} onJoinSeat={joinAsSpeaker} onLeaveSeat={leaveAsSpeaker} onReplay={() => { setMyEntrance(true); window.setTimeout(() => setMyEntrance(false), 3800); }} onLeave={() => { if (session) supabase.from("room_members").delete().eq("room_id", ROOM_ID).eq("user_id", session.user.id); setScreen("lobby"); }} onOpenChat={() => setShowChat(true)} error={error || voice.error} />
      {showChat && session && <ChatPanel session={session} displayName={displayName} avatarUrl={avatarUrl} onClose={() => setShowChat(false)} />}
    </>
  );
}

function VelvetMascot() {
  return (
    <svg style={{ animation: "float 3s ease-in-out infinite" }} width="180" height="180" viewBox="0 0 180 180">
      <defs>
        <style>{`
          @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
          @keyframes blink { 0%,88%,100%{transform:scaleY(1)} 91%,96%{transform:scaleY(.06)} }
          @keyframes vbar { 0%,100%{transform:scaleY(.2)} 50%{transform:scaleY(1)} }
          @keyframes ear { 0%,100%{transform:rotate(0deg)} 50%{transform:rotate(-12deg)} }
          @keyframes twinkle { 0%,100%{opacity:.2;transform:scale(.5)} 50%{opacity:1;transform:scale(1.2)} }
          @keyframes rp { 0%,100%{opacity:.3;transform:scale(1)} 50%{opacity:.6;transform:scale(1.06)} }
          .v-eyes { animation: blink 3.8s ease-in-out infinite; }
          .v-b1 { animation: vbar .8s ease-in-out infinite 0s; transform-origin:50% 100%; }
          .v-b2 { animation: vbar .8s ease-in-out infinite .1s; transform-origin:50% 100%; }
          .v-b3 { animation: vbar .8s ease-in-out infinite .2s; transform-origin:50% 100%; }
          .v-b4 { animation: vbar .8s ease-in-out infinite .3s; transform-origin:50% 100%; }
          .v-b5 { animation: vbar .8s ease-in-out infinite .4s; transform-origin:50% 100%; }
          .v-ear-l { animation: ear 2s ease-in-out infinite; transform-origin:54px 44px; }
          .v-ear-r { animation: ear 2s ease-in-out infinite .3s; transform-origin:126px 44px; }
          .v-tw1 { animation: twinkle 2s ease-in-out infinite 0s; }
          .v-tw2 { animation: twinkle 2s ease-in-out infinite .5s; }
          .v-tw3 { animation: twinkle 2s ease-in-out infinite 1s; }
          .v-rp { animation: rp 2.5s ease-in-out infinite; }
          .v-rp2 { animation: rp 2.5s ease-in-out infinite .6s; }
        `}</style>
        <linearGradient id="vface" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fff0ff"/>
          <stop offset="100%" stopColor="#e8d0ff"/>
        </linearGradient>
        <linearGradient id="vbody" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#9b30f7"/>
          <stop offset="100%" stopColor="#5008b0"/>
        </linearGradient>
        <radialGradient id="vglow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#7b2ff7" stopOpacity=".4"/>
          <stop offset="100%" stopColor="#7b2ff7" stopOpacity="0"/>
        </radialGradient>
      </defs>
      <circle cx="90" cy="90" r="85" fill="url(#vglow)"/>
      <circle className="v-rp" cx="90" cy="90" r="78" fill="none" stroke="#7b2ff7" strokeWidth="1.5" opacity=".35"/>
      <circle className="v-rp2" cx="90" cy="90" r="68" fill="none" stroke="#c084fc" strokeWidth=".8" opacity=".2"/>
      <rect x="22" y="22" width="136" height="136" rx="36" fill="#1a0035"/>
      <rect x="22" y="22" width="136" height="136" rx="36" fill="none" stroke="#7b2ff7" strokeWidth="2" opacity=".7"/>
      <g className="v-tw1"><text x="30" y="52" fontSize="13" fill="#ff3ea5">✦</text></g>
      <g className="v-tw2"><text x="140" y="48" fontSize="10" fill="#00d4ff">✦</text></g>
      <g className="v-tw3"><text x="138" y="150" fontSize="11" fill="#ff6b35">✦</text></g>
      <g className="v-ear-l"><ellipse cx="54" cy="62" rx="18" ry="22" fill="#ff3ea5"/><ellipse cx="54" cy="64" rx="10" ry="14" fill="#ffb3d9"/></g>
      <g className="v-ear-r"><ellipse cx="126" cy="62" rx="18" ry="22" fill="#ff3ea5"/><ellipse cx="126" cy="64" rx="10" ry="14" fill="#ffb3d9"/></g>
      <ellipse cx="90" cy="138" rx="36" ry="24" fill="url(#vbody)"/>
      <ellipse cx="90" cy="98" rx="48" ry="46" fill="url(#vface)"/>
      <path d="M72 60 Q80 38 90 32 Q100 38 108 60" fill="#2a005a"/>
      <ellipse cx="82" cy="42" rx="5" ry="10" fill="#ff3ea5" transform="rotate(-15,82,42)"/>
      <ellipse cx="90" cy="36" rx="5" ry="10" fill="#c084fc"/>
      <ellipse cx="98" cy="42" rx="5" ry="10" fill="#00d4ff" transform="rotate(15,98,42)"/>
      <ellipse cx="76" cy="100" rx="13" ry="15" fill="#1a0030"/>
      <ellipse cx="104" cy="100" rx="13" ry="15" fill="#1a0030"/>
      <g className="v-eyes">
        <ellipse cx="76" cy="100" rx="9" ry="11" fill="#7b2ff7"/>
        <ellipse cx="104" cy="100" rx="9" ry="11" fill="#7b2ff7"/>
        <circle cx="81" cy="94" r="4" fill="white"/>
        <circle cx="109" cy="94" r="4" fill="white"/>
        <circle cx="74" cy="103" r="2" fill="white" opacity=".5"/>
        <circle cx="102" cy="103" r="2" fill="white" opacity=".5"/>
      </g>
      <ellipse cx="60" cy="112" rx="10" ry="7" fill="#ff6b9d" opacity=".5"/>
      <ellipse cx="120" cy="112" rx="10" ry="7" fill="#ff6b9d" opacity=".5"/>
      <path d="M74 118 Q90 134 106 118" fill="#ffb3d9" opacity=".6"/>
      <path d="M74 118 Q90 132 106 118" fill="none" stroke="#d4006e" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M80 122 Q90 130 100 122" fill="white" opacity=".8"/>
      <path d="M46 95 Q44 72 90 70 Q136 72 134 95" fill="none" stroke="#c084fc" strokeWidth="3.5" strokeLinecap="round"/>
      <rect x="38" y="92" width="13" height="20" rx="6.5" fill="#9b30f7"/>
      <rect x="129" y="92" width="13" height="20" rx="6.5" fill="#9b30f7"/>
      <g transform="translate(66,150)">
        <rect className="v-b1" x="0" y="-13" width="7" height="13" rx="3.5" fill="#ff6b35"/>
        <rect className="v-b2" x="11" y="-13" width="7" height="13" rx="3.5" fill="#ff3ea5"/>
        <rect className="v-b3" x="22" y="-13" width="7" height="13" rx="3.5" fill="white" opacity=".9"/>
        <rect className="v-b4" x="33" y="-13" width="7" height="13" rx="3.5" fill="#c084fc"/>
        <rect className="v-b5" x="44" y="-13" width="7" height="13" rx="3.5" fill="#00d4ff"/>
      </g>
    </svg>
  );
}

function LoginScreen({ signIn, loading, error }: { signIn: (p: "google" | "apple") => void; loading: string | null; error: string }) {
  return (
    <main style={{ background: "#0a0018", minHeight: "100dvh", display: "flex", flexDirection: "column", alignItems: "center", padding: "32px 24px 0", fontFamily: "'Helvetica Neue', Arial, sans-serif", position: "relative", overflow: "hidden" }}>
      <style>{`
        .v-orb1{position:absolute;width:320px;height:320px;border-radius:50%;background:#7b2ff7;opacity:.09;top:-80px;left:-80px;pointer-events:none;}
        .v-orb2{position:absolute;width:260px;height:260px;border-radius:50%;background:#c084fc;opacity:.06;top:60px;right:-70px;pointer-events:none;}
        .v-help{position:absolute;top:20px;right:16px;display:flex;align-items:center;gap:6px;background:rgba(255,255,255,.06);border:1px solid rgba(192,132,252,.25);border-radius:50px;padding:8px 14px;cursor:pointer;z-index:10;}
        .v-help span{font-size:10px;letter-spacing:.5px;color:#c084fc;font-weight:500;white-space:nowrap;}
        .v-brand{font-size:58px;font-weight:900;letter-spacing:6px;color:#fff;margin-top:12px;line-height:1;}
        .v-feats{display:flex;gap:12px;margin-top:22px;margin-bottom:4px;}
        .v-feat{display:flex;flex-direction:column;align-items:center;gap:8px;}
        .v-feat-icon{width:52px;height:52px;border-radius:16px;background:rgba(123,47,247,.2);border:1px solid rgba(123,47,247,.35);display:flex;align-items:center;justify-content:center;}
        .v-feat-label{font-size:9px;letter-spacing:2px;color:#5a3a7a;text-transform:uppercase;font-weight:600;}
        .v-bottom{width:calc(100% + 48px);margin-top:28px;padding:24px 24px 36px;position:relative;overflow:hidden;border-radius:32px 32px 0 0;}
        @keyframes vwave{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
        @keyframes vrp{0%,100%{opacity:.3;transform:scale(1)}50%{opacity:.6;transform:scale(1.06)}}
        .v-bottom-bg{position:absolute;inset:0;background:linear-gradient(135deg,#16003a,#2a0a55,#1a003a,#0e0025,#250845);background-size:400% 400%;animation:vwave 5s ease infinite;}
        .v-rp1{position:absolute;width:250px;height:250px;top:-80px;left:-60px;border-radius:50%;background:radial-gradient(ellipse,rgba(123,47,247,.3) 0%,transparent 65%);animation:vrp 3.5s ease-in-out infinite;}
        .v-rp2b{position:absolute;width:200px;height:200px;bottom:-60px;right:-40px;border-radius:50%;background:radial-gradient(ellipse,rgba(255,62,165,.18) 0%,transparent 65%);animation:vrp 3.5s ease-in-out infinite .8s;}
        .v-bottom-content{position:relative;z-index:2;}
        .v-divider{display:flex;align-items:center;gap:12px;width:100%;margin-bottom:16px;}
        .v-divider-line{flex:1;height:1px;background:rgba(192,132,252,.18);}
        .v-divider-text{font-size:10px;color:#6b3a90;letter-spacing:4px;font-weight:600;}
        .v-btn{width:100%;height:56px;border-radius:18px;border:none;display:flex;align-items:center;justify-content:center;gap:12px;font-size:15px;font-weight:700;cursor:pointer;margin-bottom:12px;letter-spacing:.3px;transition:transform .15s;}
        .v-btn:active{transform:scale(.97);}
        .v-btn-apple{background:#fff;color:#000;}
        .v-btn-google{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);color:#fff;}
        .v-btn-phone{background:rgba(123,47,247,.22);border:1px solid rgba(123,47,247,.45);color:#c084fc;}
        .v-terms{font-size:10px;color:#3e2060;text-align:center;margin-top:14px;line-height:1.8;}
        .v-terms a{color:#7b2ff7;}
      `}</style>
      <div className="v-orb1"/>
      <div className="v-orb2"/>
      <div className="v-help">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c084fc" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><circle cx="12" cy="17" r=".5" fill="#c084fc"/></svg>
        <span>Girişdə çətinlik çəkirsiniz?</span>
      </div>
      <VelvetMascot />
      <div className="v-brand">VELVET</div>
      <div className="v-feats">
        <div className="v-feat">
          <div className="v-feat-icon">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#c084fc" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="6"/><path d="M8 12h4M10 10v4"/><circle cx="16" cy="11" r="1" fill="#c084fc"/><circle cx="18" cy="13" r="1" fill="#c084fc"/></svg>
          </div>
          <div className="v-feat-label">Oyunlar</div>
        </div>
        <div className="v-feat">
          <div className="v-feat-icon">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#c084fc" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z"/><path d="M19 10a7 7 0 0 1-14 0"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="9" y1="22" x2="15" y2="22"/></svg>
          </div>
          <div className="v-feat-label">Səs</div>
        </div>
        <div className="v-feat">
          <div className="v-feat-icon">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#c084fc" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 8l4 8h12l4-8-5 3-5-7-5 7-5-3z"/></svg>
          </div>
          <div className="v-feat-label">VIP</div>
        </div>
        <div className="v-feat">
          <div className="v-feat-icon">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#c084fc" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          </div>
          <div className="v-feat-label">Söhbət</div>
        </div>
      </div>
      <div className="v-bottom">
        <div className="v-bottom-bg"/>
        <div className="v-rp1"/>
        <div className="v-rp2b"/>
        <div className="v-bottom-content">
          <div className="v-divider">
            <div className="v-divider-line"/>
            <div className="v-divider-text">DAXİL OL</div>
            <div className="v-divider-line"/>
          </div>
          <button className="v-btn v-btn-apple" onClick={() => signIn("apple")} disabled={!!loading}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
            {loading === "apple" ? "Yüklənir…" : "Apple ilə daxil ol"}
          </button>
          <button className="v-btn v-btn-google" onClick={() => signIn("google")} disabled={!!loading}>
            <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#EA4335" d="M5.27 9.76A7.08 7.08 0 0 1 12 4.9c1.69 0 3.22.6 4.41 1.57l3.3-3.3A11.95 11.95 0 0 0 12 1C8.41 1 5.24 2.97 3.44 5.88l3.83 2.88z"/><path fill="#34A853" d="M16.04 18.01A7.07 7.07 0 0 1 12 19.1c-2.94 0-5.47-1.79-6.61-4.37l-3.83 2.88A11.97 11.97 0 0 0 12 23c3.05 0 5.88-1.14 8.01-3l-3.97-1.99z"/><path fill="#4A90D9" d="M20.01 12c0-.69-.07-1.36-.18-2H12v3.79h4.51a4 4 0 0 1-1.67 2.56l3.97 1.99C20.45 16.59 21 14.42 21 12z"/><path fill="#FBBC05" d="M5.39 14.73A7.06 7.06 0 0 1 4.9 12c0-.95.17-1.87.49-2.73L1.56 6.39A11.97 11.97 0 0 0 1 12c0 1.93.46 3.75 1.27 5.38l3.12-2.65z"/></svg>
            {loading === "google" ? "Yüklənir…" : "Google ilə daxil ol"}
          </button>
          <button className="v-btn v-btn-phone">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="5" y="2" width="14" height="20" rx="2"/><circle cx="12" cy="17" r="1" fill="#c084fc"/></svg>
            Telefon nömrəsi
          </button>
          {error && <p style={{ color: "#ff3ea5", fontSize: "12px", textAlign: "center", marginTop: "8px" }}>{error}</p>}
          <div className="v-terms">Davam etməklə <a href="#">İstifadə Şərtlərini</a> və <a href="#">Gizlilik Siyasətini</a> qəbul edirsiniz</div>
        </div>
      </div>
    </main>
  );
}

function Lobby({ name, onEnter, onBack }: { name: string; onEnter: () => void; onBack: () => void | Promise<void> }) {
  return (
    <main className="room-atmosphere relative min-h-dvh overflow-hidden px-5 text-foreground">
      <Motes />
      <div className="relative z-10 mx-auto max-w-md py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3"><div style={{ width: 44, height: 44, borderRadius: "50%", background: "#7b2ff7", display: "flex", alignItems: "center", justifyContent: "center" }}><Crown className="size-5 text-white" /></div><div><p style={{ fontSize: 20, fontWeight: 900, letterSpacing: 3, color: "#fff" }}>VELVET</p></div></div>
          <Button size="icon" onClick={onBack}><LogOut className="size-4" /></Button>
        </div>
        <div className="mt-12"><p style={{ fontSize: 11, letterSpacing: "0.28em", color: "#7b2ff7", textTransform: "uppercase" }}>Xoş gəldin, {name}</p><h1 className="mt-2 font-display text-5xl font-semibold leading-none">Otaqlar<br />sizi gözləyir.</h1></div>
        <button onClick={onEnter} className="group relative mt-10 w-full overflow-hidden rounded-lg border border-primary/30 bg-surface p-5 text-left shadow-luxe backdrop-blur-xl">
          <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-primary/10 blur-3xl" />
          <div className="relative flex items-start justify-between"><div><p style={{ fontSize: 10, letterSpacing: "0.25em", color: "#7b2ff7", textTransform: "uppercase" }}>Gecə Salonu</p><h2 className="mt-1 font-display text-3xl font-semibold">Qızıl Saatlar</h2><p className="mt-2 text-xs text-muted-foreground">Musiqi, söhbət və gecənin ritmi</p></div><span className="flex items-center gap-2 rounded-full bg-accent/15 px-3 py-1 text-[10px] font-bold text-accent"><span className="size-1.5 rounded-full bg-accent" /> CANLI</span></div>
          <div className="relative mt-7 flex items-center"><span className="ml-auto text-sm font-semibold text-primary">Otağa gir →</span></div>
        </button>
        <div className="mt-5 flex items-center justify-between border-t border-border pt-5"><div><p className="text-sm font-semibold">Üzvlük səviyyən</p><p className="text-xs text-muted-foreground">Bütün funksiyalar açıqdır</p></div><span className="flex items-center gap-2 rounded-full bg-primary/15 px-4 py-2 text-xs font-bold text-primary"><Crown className="size-4" /> VIP 17</span></div>
      </div>
    </main>
  );
}

function Room({ name, avatarUrl, session, memberCount, members, muted, myEntrance, globalEntrance, onToggleMic, onJoinSeat, onLeaveSeat, onReplay, onLeave, onOpenChat, error }: {
  name: string; avatarUrl: string | null; session: Session | null; memberCount: number; members: Member[]; muted: boolean;
  myEntrance: boolean; globalEntrance: EntranceEvent;
  onToggleMic: () => void; onJoinSeat: () => void; onLeaveSeat: () => void; onReplay: () => void; onLeave: () => void; onOpenChat: () => void; error: string;
}) {
  const speakers = members.filter(m => !m.is_muted);
  const listeners = members.filter(m => m.is_muted);
  const emptySeatCount = Math.max(0, 3 - speakers.length);
  const iAmSpeaker = session ? !!members.find(m => m.user_id === session.user.id && !m.is_muted) : false;
  return (
    <main className="room-atmosphere relative min-h-dvh overflow-hidden text-foreground"><Motes />
    <div className="relative z-10 mx-auto max-w-md px-5 pb-36 pt-5">
      <div className="flex items-center gap-3">
        <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#7b2ff7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 900, color: "#fff" }}>V</div>
        <div className="min-w-0"><p style={{ fontSize: 10, letterSpacing: "0.28em", color: "#7b2ff7", textTransform: "uppercase" }}>VELVET · VIP</p><p className="truncate text-sm font-semibold">Salam, {name}</p></div>
        <Button size="icon" className="ml-auto" onClick={onReplay}><MoreHorizontal className="size-5" /></Button>
      </div>
      <div className="mt-6 flex items-end justify-between">
        <div><p style={{ fontSize: 10, letterSpacing: "0.24em", color: "#7b2ff7", textTransform: "uppercase" }}>Gecə Salonu</p><h1 className="font-display text-3xl font-semibold">Qızıl Saatlar</h1></div>
        <div className="flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-xs"><span className="size-1.5 rounded-full bg-accent" />Canlı · {memberCount}</div>
      </div>
      <section className="mt-6 rounded-lg border border-border bg-surface p-4 backdrop-blur-xl">
        <div className="mb-5 flex items-center justify-between"><p style={{ fontSize: 10, letterSpacing: "0.2em", color: "var(--muted-foreground)", textTransform: "uppercase" }}>Danışan koltuklar</p><span style={{ fontSize: 10, color: "var(--muted-foreground)" }}>{speakers.length} / 6</span></div>
        <div className="grid grid-cols-3 gap-x-3 gap-y-6">
          {speakers.map((m) => <RealSpeaker key={m.user_id} userId={m.user_id} session={session} isMe={m.user_id === session?.user.id} myAvatarUrl={avatarUrl} myName={name} onLeave={m.user_id === session?.user.id ? onLeaveSeat : undefined} />)}
          {Array.from({ length: emptySeatCount }).map((_, i) => (
            <button key={i} onClick={!iAmSpeaker ? onJoinSeat : undefined} disabled={iAmSpeaker} className="flex flex-col items-center group">
              <div className={`grid size-16 place-items-center rounded-full border-2 border-dashed transition-all text-2xl ${iAmSpeaker ? "border-border text-muted-foreground" : "border-primary/50 text-primary/70 group-active:bg-primary/10 group-hover:border-primary"}`}>+</div>
              <p className={`mt-2 text-xs ${iAmSpeaker ? "text-muted-foreground" : "text-primary/80"}`}>{iAmSpeaker ? "Dolu" : "Qoşul"}</p>
            </button>
          ))}
        </div>
      </section>
      {listeners.length > 0 && (
        <section className="mt-5">
          <div className="flex items-center justify-between"><p style={{ fontSize: 10, letterSpacing: ".2em", color: "var(--muted-foreground)", textTransform: "uppercase" }}>Dinləyicilər</p><span style={{ fontSize: 10, color: "var(--muted-foreground)" }}>{listeners.length} nəfər</span></div>
          <div className="mt-3 flex gap-4 overflow-x-auto pb-1">{listeners.slice(0, 8).map((m) => <RealListener key={m.user_id} userId={m.user_id} session={session} myAvatarUrl={avatarUrl} myName={name} />)}</div>
        </section>
      )}
      {error && <p className="mt-3 text-center text-xs text-danger">{error}</p>}
    </div>
    <div className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-md bg-background/90 px-5 pb-[max(18px,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl">
      <div className="flex items-center justify-between rounded-lg border border-border bg-surface p-3">
        <Button size="icon" onClick={onToggleMic}>{muted ? <MicOff className="size-5" /> : <VoiceIcon />}</Button>
        <Button size="icon" variant="gold" onClick={onToggleMic}><Mic className="size-6" /></Button>
        <Button size="icon" onClick={onOpenChat}><MessageCircle className="size-5" /></Button>
        <Button size="icon"><Users className="size-5" /></Button>
        <Button size="icon" variant="danger" onClick={onLeave}><X className="size-5" /></Button>
      </div>
    </div>
    {myEntrance && <MyVipEntrance name={name} />}
    {globalEntrance && <OtherUserEntrance name={globalEntrance.name} />}
    </main>
  );
}

function ChatPanel({ session, displayName, avatarUrl, onClose }: { session: Session; displayName: string; avatarUrl: string | null; onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    supabase.from("messages").select("*").eq("room_id", ROOM_ID).order("created_at", { ascending: true }).limit(50).then(({ data }) => { if (data) setMessages(data as Message[]); });
    const channel = supabase.channel(`chat-${ROOM_ID}`).on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `room_id=eq.${ROOM_ID}` }, (payload) => setMessages(prev => [...prev, payload.new as Message])).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
  const send = async () => {
    if (!text.trim()) return;
    await supabase.from("messages").insert({ room_id: ROOM_ID, user_id: session.user.id, display_name: displayName, avatar_url: avatarUrl, content: text.trim() });
    setText("");
  };
  return (
    <div className="fixed inset-0 z-30 flex flex-col bg-background/98 backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <p className="font-display text-xl font-semibold">Söhbət</p>
        <Button size="icon" onClick={onClose}><X className="size-5" /></Button>
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {messages.length === 0 && <p className="text-center text-sm text-muted-foreground mt-10">Hələ mesaj yoxdur.</p>}
        {messages.map((msg) => {
          const isMe = msg.user_id === session.user.id;
          return (
            <div key={msg.id} className={`flex gap-3 ${isMe ? "flex-row-reverse" : ""}`}>
              {msg.avatar_url ? <img src={msg.avatar_url} alt={msg.display_name} className="size-8 rounded-full border border-primary/30 object-cover shrink-0" /> : <div className="size-8 rounded-full border border-primary/30 bg-primary/20 grid place-items-center text-xs font-bold text-primary shrink-0">{msg.display_name[0]}</div>}
              <div className={`max-w-[70%] flex flex-col gap-1 ${isMe ? "items-end" : "items-start"}`}>
                {!isMe && <p className="text-[10px] text-muted-foreground">{msg.display_name}</p>}
                <div className={`rounded-2xl px-4 py-2 text-sm ${isMe ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-surface border border-border rounded-tl-sm"}`}>{msg.content}</div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      <div className="border-t border-border px-4 py-3 pb-[max(12px,env(safe-area-inset-bottom))]">
        <div className="flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2">
          <input className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" placeholder="Mesaj yaz…" value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} />
          <button onClick={send} className="grid size-8 place-items-center rounded-full bg-primary text-primary-foreground"><Send className="size-4" /></button>
        </div>
      </div>
    </div>
  );
}

function MyVipEntrance({ name }: { name: string }) {
  return (
    <div className="vip-overlay fixed inset-0 z-50 grid place-items-center bg-background/95 backdrop-blur-md">
      <Motes />
      <div className="vip-reveal relative flex flex-col items-center px-8 text-center">
        <VelvetMascot />
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.4em", color: "#ff3ea5", textTransform: "uppercase", marginTop: 16 }}>VELVET VIP</p>
        <h2 className="mt-3 font-display text-4xl font-semibold leading-none">Qızıl Qapılar Açılır</h2>
        <p className="mt-4 max-w-xs text-sm leading-6 text-muted-foreground">{name}, işıqlar sənin üçün yanır.</p>
        <div className="mt-7 h-px w-40 bg-primary/60" />
      </div>
    </div>
  );
}

function OtherUserEntrance({ name }: { name: string }) {
  return (
    <div className="fixed bottom-32 inset-x-0 z-40 mx-auto max-w-md px-5" style={{ animation: "slideUpFade 4s ease forwards" }}>
      <div className="flex items-center gap-3 rounded-2xl border border-primary/40 bg-background/90 px-4 py-3 shadow-luxe backdrop-blur-xl">
        <div className="grid size-10 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground shadow-luxe"><Crown className="size-4" /></div>
        <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{name}</p><p style={{ fontSize: 10, color: "#7b2ff7", letterSpacing: "0.15em", textTransform: "uppercase" }}>otağa qoşuldu · VIP</p></div>
        <span className="text-xl">✦</span>
      </div>
      <style>{`@keyframes slideUpFade{0%{opacity:0;transform:translateY(40px)}15%{opacity:1;transform:translateY(0)}75%{opacity:1;transform:translateY(0)}100%{opacity:0;transform:translateY(-20px)}}`}</style>
    </div>
  );
}

function RealSpeaker({ userId, session, isMe, myAvatarUrl, myName, onLeave }: { userId: string; session: Session | null; isMe: boolean; myAvatarUrl: string | null; myName: string; onLeave?: () => void }) {
  const initials = isMe ? myName[0] : userId.slice(0, 2).toUpperCase();
  const label = isMe ? myName.split(" ")[0] : "Üzv";
  const url = isMe ? myAvatarUrl : null;
  return (
    <div className="flex flex-col items-center">
      <div className="relative cursor-pointer" onClick={onLeave}>
        <span className="absolute inset-0 rounded-full border-2 border-primary animate-ping opacity-25" />
        <span className="absolute inset-0 rounded-full border-2 border-primary/60" />
        {url ? <img src={url} alt={label} className="size-16 rounded-full border-2 border-primary/50 object-cover" /> : <div className="size-16 rounded-full border-2 border-primary/50 bg-primary/20 grid place-items-center text-xl font-bold text-primary">{initials}</div>}
        <span className="absolute -bottom-1 -right-1 grid size-5 place-items-center rounded-full bg-primary text-primary-foreground"><Radio className="size-2.5" /></span>
        {isMe && <span className="absolute -top-1 -left-1 grid size-5 place-items-center rounded-full bg-red-500 text-white text-[9px] font-bold">✕</span>}
      </div>
      <p className="mt-2 text-xs font-semibold">{label}</p>
      <p style={{ fontSize: 9, color: "#7b2ff7" }}>Danışır · VIP</p>
    </div>
  );
}

function RealListener({ userId, session, myAvatarUrl, myName }: { userId: string; session: Session | null; myAvatarUrl: string | null; myName: string }) {
  const isMe = session?.user.id === userId;
  const initials = isMe ? myName[0] : userId.slice(0, 2).toUpperCase();
  const label = isMe ? myName.split(" ")[0] : "Üzv";
  const url = isMe ? myAvatarUrl : null;
  return (
    <div className="shrink-0 text-center">
      {url ? <img src={url} alt={label} className="size-11 rounded-full border-2 border-primary/50 object-cover" /> : <div className="size-11 rounded-full border-2 border-primary/50 bg-primary/20 grid place-items-center text-sm font-bold text-primary">{initials}</div>}
      <p className="mt-1 text-[10px] text-muted-foreground">{label}</p>
      <span style={{ fontSize: 8, color: "#7b2ff7", fontWeight: 700 }}>VIP</span>
    </div>
  );
}

function VoiceIcon() { return <span className="flex h-5 items-center gap-0.5">{[1,2,3,4].map((n) => <span key={n} className="voice-bar h-4 w-0.5 rounded-full bg-primary" style={{ animationDelay: `${n*.12}s` }} />)}</span>; }
function Motes() { return <div className="pointer-events-none absolute inset-0 overflow-hidden">{["left-[8%] top-[35%]","left-[24%] top-[65%]","right-[12%] top-[30%]","right-[28%] top-[75%]","left-[52%] top-[52%]"].map((p,i) => <span key={p} className={`mote-rise absolute ${p} size-1 rounded-full bg-primary`} style={{ animationDelay: `${i*.8}s` }} />)}</div>; }
