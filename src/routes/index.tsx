import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Crown, LogOut, MessageCircle, Mic, MicOff, MoreHorizontal, Radio, Send, Users, X } from "lucide-react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useVoiceRoom } from "@/hooks/use-voice-room";

const ROOM_ID = "11111111-1111-4111-8111-111111111111";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Velvet" },
      { name: "viewport", content: "width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no, viewport-fit=cover" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
    ],
  }),
  component: VelvetApp,
});

type Screen = "login" | "home" | "room" | "profile" | "vip";
type Member = { user_id: string; role: string; is_muted: boolean };
type Message = { id: number; user_id: string; display_name: string; avatar_url: string | null; content: string; created_at: string };

const GLOBAL_CSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
  html, body { overflow-x: hidden; -webkit-text-size-adjust: 100%; touch-action: pan-y; background: #07000f; -webkit-user-select: none; user-select: none; }
  input, textarea { -webkit-user-select: text; user-select: text; touch-action: pan-y; }
  * { touch-action: pan-y; }
  img, svg, button, div { touch-action: pan-y; }
  body { overscroll-behavior: none; }
  @keyframes vfloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-9px)}}
  @keyframes vblink{0%,88%,100%{transform:scaleY(1)}91%,96%{transform:scaleY(.06)}}
  @keyframes vbar{0%,100%{transform:scaleY(.2)}50%{transform:scaleY(1)}}
  @keyframes vear{0%,100%{transform:rotate(0deg)}50%{transform:rotate(-12deg)}}
  @keyframes vtwinkle{0%,100%{opacity:0;transform:scale(0)}50%{opacity:1;transform:scale(1.2)}}
  @keyframes vrp{0%,100%{opacity:.3;transform:scale(1)}50%{opacity:.6;transform:scale(1.06)}}
  @keyframes vwave{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
  @keyframes vpulse{0%,100%{opacity:.5;transform:scale(1)}50%{opacity:1;transform:scale(1.08)}}
  @keyframes vrotate{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
  @keyframes vglow{0%,100%{box-shadow:0 0 20px rgba(123,47,247,.3)}50%{box-shadow:0 0 40px rgba(123,47,247,.6),0 0 80px rgba(255,62,165,.2)}}
  @keyframes vshimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
  @keyframes vorbit{from{transform:rotate(0deg) translateX(52px) rotate(0deg)}to{transform:rotate(360deg) translateX(52px) rotate(-360deg)}}
  @keyframes vorbit2{from{transform:rotate(120deg) translateX(52px) rotate(-120deg)}to{transform:rotate(480deg) translateX(52px) rotate(-480deg)}}
  @keyframes vorbit3{from{transform:rotate(240deg) translateX(52px) rotate(-240deg)}to{transform:rotate(600deg) translateX(52px) rotate(-600deg)}}
  @keyframes vpopIn{0%{opacity:0;transform:translate(-50%,-50%) scale(.5)}60%{transform:translate(-50%,-50%) scale(1.05)}100%{opacity:1;transform:translate(-50%,-50%) scale(1)}}
  @keyframes vfadeIn{from{opacity:0}to{opacity:1}}
  @keyframes vcoinPulse{0%,100%{filter:drop-shadow(0 0 6px rgba(255,200,0,.4))}50%{filter:drop-shadow(0 0 18px rgba(255,200,0,.9))}}
  @keyframes vslideUp{0%{opacity:0;transform:translateY(40px)}15%{opacity:1;transform:translateY(0)}75%{opacity:1;transform:translateY(0)}100%{opacity:0;transform:translateY(-20px)}}
  .vf{animation:vfloat 3s ease-in-out infinite}
  .ve{animation:vblink 3.8s ease-in-out infinite}
  .vb1{animation:vbar .8s ease-in-out infinite 0s;transform-origin:50% 100%}
  .vb2{animation:vbar .8s ease-in-out infinite .1s;transform-origin:50% 100%}
  .vb3{animation:vbar .8s ease-in-out infinite .2s;transform-origin:50% 100%}
  .vb4{animation:vbar .8s ease-in-out infinite .3s;transform-origin:50% 100%}
  .vb5{animation:vbar .8s ease-in-out infinite .4s;transform-origin:50% 100%}
  .vel{animation:vear 2s ease-in-out infinite;transform-origin:54px 44px}
  .ver{animation:vear 2s ease-in-out infinite .3s;transform-origin:126px 44px}
  .vtw1{animation:vtwinkle 2s ease-in-out infinite 0s}
  .vtw2{animation:vtwinkle 2s ease-in-out infinite .5s}
  .vtw3{animation:vtwinkle 2s ease-in-out infinite 1s}
  .vrp1{animation:vrp 2.5s ease-in-out infinite}
  .vrp2{animation:vrp 2.5s ease-in-out infinite .6s}
`;

function VelvetApp() {
  const [session, setSession] = useState<Session | null>(null);
  const [screen, setScreen] = useState<Screen>("login");
  const [showChat, setShowChat] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState<"google" | "apple" | null>(null);
  const [error, setError] = useState("");
  const [myEntrance, setMyEntrance] = useState(false);
  const voice = useVoiceRoom(ROOM_ID, session, screen === "room");
  const displayName = session?.user.user_metadata?.["full_name"] ?? session?.user.email?.split("@")[0] ?? "Qonaq";
  const avatarUrl = session?.user.user_metadata?.["avatar_url"] ?? null;

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session) {
        const saved = localStorage.getItem("velvet_screen") as Screen | null;
        setScreen(saved && saved !== "login" ? saved : "home");
      }
    });
    const { data } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      if (!s) { setScreen("login"); localStorage.removeItem("velvet_screen"); }
    });
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session || screen !== "room") return;
    supabase.from("room_members").upsert({ room_id: ROOM_ID, user_id: session.user.id, role: "listener", is_muted: true }, { onConflict: "room_id,user_id" });
    const load = () => supabase.from("room_members").select("user_id,role,is_muted").eq("room_id", ROOM_ID).then(({ data }) => { if (data) setMembers([...data]); });
    load();
    const ch = supabase.channel(`rm-${ROOM_ID}`).on("postgres_changes", { event: "*", schema: "public", table: "room_members", filter: `room_id=eq.${ROOM_ID}` }, load).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [screen, session]);

  const signIn = async (provider: "google" | "apple") => {
    setLoading(provider); setError("");
    const r = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo: window.location.origin } });
    if (r.error) setError("Giriş alınmadı. Yenidən cəhd edin.");
    setLoading(null);
  };

  const enterRoom = () => { setScreen("room"); setMyEntrance(true); setTimeout(() => setMyEntrance(false), 3500); };

  const go = (s: Screen) => { setScreen(s); localStorage.setItem("velvet_screen", s); };

  if (screen === "login") return <><style>{GLOBAL_CSS}</style><LoginScreen signIn={signIn} loading={loading} error={error} /></>;
  if (screen === "home") return <><style>{GLOBAL_CSS}</style><HomeScreen name={displayName} onEnterRoom={() => { enterRoom(); go("room"); }} onProfile={() => go("profile")} /></>;
  if (screen === "profile") return <><style>{GLOBAL_CSS}</style><ProfileScreen name={displayName} onBack={() => go("home")} onEnterRoom={() => { enterRoom(); go("room"); }} onVip={() => go("vip")} /></>;
  if (screen === "vip") return <><style>{GLOBAL_CSS}</style><VipScreen onBack={() => go("profile")} /></>;
  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <RoomScreen name={displayName} avatarUrl={avatarUrl} session={session} members={members} muted={voice.muted} myEntrance={myEntrance}
        onToggleMic={voice.toggleMic}
        onJoinSeat={async () => { if (!session) return; await supabase.from("room_members").update({ role: "speaker", is_muted: false }).eq("room_id", ROOM_ID).eq("user_id", session.user.id); if (voice.muted) voice.toggleMic(); }}
        onLeaveSeat={async () => { if (!session) return; await supabase.from("room_members").update({ role: "listener", is_muted: true }).eq("room_id", ROOM_ID).eq("user_id", session.user.id); if (!voice.muted) voice.toggleMic(); }}
        onLeave={() => { if (session) supabase.from("room_members").delete().eq("room_id", ROOM_ID).eq("user_id", session.user.id); setScreen("home"); }}
        onOpenChat={() => setShowChat(true)}
        onHome={() => setScreen("home")}
        onProfile={() => setScreen("profile")}
        error={error || voice.error}
      />
      {showChat && session && <ChatPanel session={session} displayName={displayName} avatarUrl={avatarUrl} onClose={() => setShowChat(false)} />}
      {myEntrance && <VipEntrance name={displayName} />}
    </>
  );
}

/* ─── MASCOT ─── */
function VelvetMascot({ size = 160 }: { size?: number }) {
  return (
    <svg className="vf" width={size} height={size} viewBox="0 0 180 180" style={{ display: "block", flexShrink: 0 }}>
      <defs>
        <linearGradient id="vface" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#fff0ff"/><stop offset="100%" stopColor="#e8d0ff"/></linearGradient>
        <linearGradient id="vbody" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#9b30f7"/><stop offset="100%" stopColor="#5008b0"/></linearGradient>
        <radialGradient id="vglow" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#7b2ff7" stopOpacity=".35"/><stop offset="100%" stopColor="#7b2ff7" stopOpacity="0"/></radialGradient>
      </defs>
      <circle cx="90" cy="90" r="85" fill="url(#vglow)"/>
      <circle className="vrp1" cx="90" cy="90" r="78" fill="none" stroke="#7b2ff7" strokeWidth="1.5" opacity=".35"/>
      <circle className="vrp2" cx="90" cy="90" r="68" fill="none" stroke="#c084fc" strokeWidth=".8" opacity=".2"/>
      <rect x="22" y="22" width="136" height="136" rx="36" fill="#1a0035"/>
      <rect x="22" y="22" width="136" height="136" rx="36" fill="none" stroke="#7b2ff7" strokeWidth="2" opacity=".7"/>
      <g className="vtw1"><text x="30" y="52" fontSize="13" fill="#ff3ea5">✦</text></g>
      <g className="vtw2"><text x="140" y="48" fontSize="10" fill="#00d4ff">✦</text></g>
      <g className="vtw3"><text x="138" y="150" fontSize="11" fill="#ff6b35">✦</text></g>
      <g className="vel"><ellipse cx="54" cy="62" rx="18" ry="22" fill="#ff3ea5"/><ellipse cx="54" cy="64" rx="10" ry="14" fill="#ffb3d9"/></g>
      <g className="ver"><ellipse cx="126" cy="62" rx="18" ry="22" fill="#ff3ea5"/><ellipse cx="126" cy="64" rx="10" ry="14" fill="#ffb3d9"/></g>
      <ellipse cx="90" cy="138" rx="36" ry="24" fill="url(#vbody)"/>
      <ellipse cx="90" cy="98" rx="48" ry="46" fill="url(#vface)"/>
      <path d="M72 60 Q80 38 90 32 Q100 38 108 60" fill="#2a005a"/>
      <ellipse cx="82" cy="42" rx="5" ry="10" fill="#ff3ea5" transform="rotate(-15,82,42)"/>
      <ellipse cx="90" cy="36" rx="5" ry="10" fill="#c084fc"/>
      <ellipse cx="98" cy="42" rx="5" ry="10" fill="#00d4ff" transform="rotate(15,98,42)"/>
      <ellipse cx="76" cy="100" rx="13" ry="15" fill="#1a0030"/>
      <ellipse cx="104" cy="100" rx="13" ry="15" fill="#1a0030"/>
      <g className="ve">
        <ellipse cx="76" cy="100" rx="9" ry="11" fill="#7b2ff7"/><ellipse cx="104" cy="100" rx="9" ry="11" fill="#7b2ff7"/>
        <circle cx="81" cy="94" r="4" fill="white"/><circle cx="109" cy="94" r="4" fill="white"/>
        <circle cx="74" cy="103" r="2" fill="white" opacity=".5"/><circle cx="102" cy="103" r="2" fill="white" opacity=".5"/>
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
        <rect className="vb1" x="0" y="-13" width="7" height="13" rx="3.5" fill="#ff6b35"/>
        <rect className="vb2" x="11" y="-13" width="7" height="13" rx="3.5" fill="#ff3ea5"/>
        <rect className="vb3" x="22" y="-13" width="7" height="13" rx="3.5" fill="white" opacity=".9"/>
        <rect className="vb4" x="33" y="-13" width="7" height="13" rx="3.5" fill="#c084fc"/>
        <rect className="vb5" x="44" y="-13" width="7" height="13" rx="3.5" fill="#00d4ff"/>
      </g>
    </svg>
  );
}

/* ─── LOGIN ─── */
function LoginScreen({ signIn, loading, error }: { signIn: (p: "google" | "apple") => void; loading: string | null; error: string }) {
  return (
    <main style={{ background: "#0a0018", minHeight: "100dvh", display: "flex", flexDirection: "column", alignItems: "center", padding: `max(32px, env(safe-area-inset-top)) 24px 0`, position: "relative", overflow: "hidden" }}>
      <style>{`
        .v-orb1{position:absolute;width:280px;height:280px;border-radius:50%;background:#7b2ff7;opacity:.09;top:-70px;left:-70px;pointer-events:none}
        .v-orb2{position:absolute;width:220px;height:220px;border-radius:50%;background:#c084fc;opacity:.06;top:50px;right:-60px;pointer-events:none}
        .v-help{position:absolute;top:max(20px,env(safe-area-inset-top));right:16px;display:flex;align-items:center;gap:6px;background:rgba(255,255,255,.06);border:1px solid rgba(192,132,252,.25);border-radius:50px;padding:8px 12px;cursor:pointer;z-index:10}
        .v-help span{font-size:11px;color:#c084fc;font-weight:500;white-space:nowrap}
        .v-brand{font-size:clamp(38px,11vw,56px);font-weight:900;letter-spacing:6px;color:#fff;margin-top:10px;line-height:1}
        .v-feats{display:flex;gap:10px;margin-top:18px;margin-bottom:4px;width:100%;justify-content:center}
        .v-feat{display:flex;flex-direction:column;align-items:center;gap:7px}
        .v-feat-icon{width:clamp(44px,12vw,52px);height:clamp(44px,12vw,52px);border-radius:14px;background:rgba(123,47,247,.2);border:1px solid rgba(123,47,247,.35);display:flex;align-items:center;justify-content:center}
        .v-feat-label{font-size:9px;letter-spacing:2px;color:#5a3a7a;text-transform:uppercase;font-weight:600}
        .v-bottom{width:calc(100% + 48px);margin-top:24px;padding:22px 24px max(32px,env(safe-area-inset-bottom));position:relative;overflow:hidden;border-radius:28px 28px 0 0;flex-shrink:0}
        .v-bottom-bg{position:absolute;inset:0;background:linear-gradient(135deg,#16003a,#2a0a55,#1a003a,#0e0025,#250845);background-size:400% 400%;animation:vwave 5s ease infinite}
        .v-rp1{position:absolute;width:220px;height:220px;top:-70px;left:-50px;border-radius:50%;background:radial-gradient(ellipse,rgba(123,47,247,.28) 0%,transparent 65%);animation:vrp 3.5s ease-in-out infinite}
        .v-rp2b{position:absolute;width:180px;height:180px;bottom:-50px;right:-40px;border-radius:50%;background:radial-gradient(ellipse,rgba(255,62,165,.16) 0%,transparent 65%);animation:vrp 3.5s ease-in-out infinite .8s}
        .v-bc{position:relative;z-index:2}
        .v-div{display:flex;align-items:center;gap:12px;width:100%;margin-bottom:14px}
        .v-dl{flex:1;height:1px;background:rgba(192,132,252,.18)}
        .v-dt{font-size:10px;color:#6b3a90;letter-spacing:4px;font-weight:600}
        .v-btn{width:100%;height:52px;border-radius:16px;border:none;display:flex;align-items:center;justify-content:center;gap:10px;font-size:15px;font-weight:700;cursor:pointer;margin-bottom:10px;-webkit-appearance:none;appearance:none}
        .v-btn:active{opacity:.85;transform:scale(.98)}
        .v-ba{background:#fff;color:#000}
        .v-bg{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);color:#fff}
        .v-bp{background:rgba(123,47,247,.22);border:1px solid rgba(123,47,247,.45);color:#c084fc}
        .v-terms{font-size:10px;color:#3e2060;text-align:center;margin-top:12px;line-height:1.8}
        .v-terms a{color:#7b2ff7;text-decoration:none}
      `}</style>
      <div className="v-orb1"/><div className="v-orb2"/>
      <div className="v-help">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c084fc" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><circle cx="12" cy="17" r=".5" fill="#c084fc"/></svg>
        <span>Girişdə çətinlik çəkirsiniz?</span>
      </div>
      <VelvetMascot size={150}/>
      <div className="v-brand">VELVET</div>
      <div className="v-feats">
        {[
          { label:"Oyunlar", icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c084fc" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="6"/><path d="M8 12h4M10 10v4"/><circle cx="16" cy="11" r="1" fill="#c084fc"/><circle cx="18" cy="13" r="1" fill="#c084fc"/></svg> },
          { label:"Səs", icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c084fc" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z"/><path d="M19 10a7 7 0 0 1-14 0"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="9" y1="22" x2="15" y2="22"/></svg> },
          { label:"VIP", icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c084fc" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 8l4 8h12l4-8-5 3-5-7-5 7-5-3z"/></svg> },
          { label:"Söhbət", icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c084fc" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
        ].map(f => (
          <div key={f.label} className="v-feat">
            <div className="v-feat-icon">{f.icon}</div>
            <div className="v-feat-label">{f.label}</div>
          </div>
        ))}
      </div>
      <div className="v-bottom">
        <div className="v-bottom-bg"/><div className="v-rp1"/><div className="v-rp2b"/>
        <div className="v-bc">
          <div className="v-div"><div className="v-dl"/><div className="v-dt">DAXİL OL</div><div className="v-dl"/></div>
          <button className="v-btn v-ba" onClick={() => signIn("apple")} disabled={!!loading}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
            {loading === "apple" ? "Yüklənir…" : "Apple ilə daxil ol"}
          </button>
          <button className="v-btn v-bg" onClick={() => signIn("google")} disabled={!!loading}>
            <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#EA4335" d="M5.27 9.76A7.08 7.08 0 0 1 12 4.9c1.69 0 3.22.6 4.41 1.57l3.3-3.3A11.95 11.95 0 0 0 12 1C8.41 1 5.24 2.97 3.44 5.88l3.83 2.88z"/><path fill="#34A853" d="M16.04 18.01A7.07 7.07 0 0 1 12 19.1c-2.94 0-5.47-1.79-6.61-4.37l-3.83 2.88A11.97 11.97 0 0 0 12 23c3.05 0 5.88-1.14 8.01-3l-3.97-1.99z"/><path fill="#4A90D9" d="M20.01 12c0-.69-.07-1.36-.18-2H12v3.79h4.51a4 4 0 0 1-1.67 2.56l3.97 1.99C20.45 16.59 21 14.42 21 12z"/><path fill="#FBBC05" d="M5.39 14.73A7.06 7.06 0 0 1 4.9 12c0-.95.17-1.87.49-2.73L1.56 6.39A11.97 11.97 0 0 0 1 12c0 1.93.46 3.75 1.27 5.38l3.12-2.65z"/></svg>
            {loading === "google" ? "Yüklənir…" : "Google ilə daxil ol"}
          </button>
          <button className="v-btn v-bp">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="5" y="2" width="14" height="20" rx="2"/><circle cx="12" cy="17" r="1" fill="#c084fc"/></svg>
            Telefon nömrəsi
          </button>
          {error && <p style={{ color:"#ff3ea5", fontSize:12, textAlign:"center", marginTop:8 }}>{error}</p>}
          <div className="v-terms">Davam etməklə <a href="#">İstifadə Şərtlərini</a> və <a href="#">Gizlilik Siyasətini</a> qəbul edirsiniz</div>
        </div>
      </div>
    </main>
  );
}

/* ─── NAV BAR ─── */
function BottomNav({ active, onHome, onRoom, onProfile }: { active: Screen; onHome: () => void; onRoom: () => void; onProfile: () => void }) {
  const items = [
    { key:"home", label:"Ana səhifə", onTap: onHome, icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
    { key:"games", label:"Oyunlar", onTap: onHome, icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="6" width="20" height="12" rx="6"/><path d="M8 12h4M10 10v4"/><circle cx="16" cy="11" r="1" fill="currentColor"/><circle cx="18" cy="13" r="1" fill="currentColor"/></svg> },
    { key:"room", label:"Otaq", onTap: onRoom, icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 2a3 3 0 013 3v7a3 3 0 01-6 0V5a3 3 0 013-3z"/><path d="M19 10a7 7 0 01-14 0"/><line x1="12" y1="19" x2="12" y2="23"/></svg> },
    { key:"messages", label:"Mesajlar", onTap: onHome, badge:"18", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg> },
    { key:"profile", label:"Profil", onTap: onProfile, icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
  ] as const;
  return (
    <nav style={{ position:"fixed", bottom:0, left:0, right:0, background:"rgba(7,0,15,.97)", borderTop:"1px solid rgba(123,47,247,.15)", display:"flex", paddingBottom:`max(8px,env(safe-area-inset-bottom))`, zIndex:100 }}>
      {items.map(it => (
        <button key={it.key} onClick={it.onTap} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:3, paddingTop:10, paddingBottom:4, background:"none", border:"none", cursor:"pointer", color: active === it.key ? "#c084fc" : "rgba(255,255,255,.2)", position:"relative" }}>
          <div style={{ position:"relative" }}>
            {it.icon}
            {"badge" in it && it.badge && <span style={{ position:"absolute", top:-5, right:-7, minWidth:14, height:14, borderRadius:7, background:"#ff3ea5", border:"2px solid #07000f", display:"flex", alignItems:"center", justifyContent:"center", fontSize:7, color:"#fff", fontWeight:700, padding:"0 2px" }}>{it.badge}</span>}
          </div>
          <span style={{ fontSize:9, fontWeight:600, letterSpacing:.3 }}>{it.label}</span>
        </button>
      ))}
    </nav>
  );
}

/* ─── HOME ─── */
function HomeScreen({ name, onEnterRoom, onProfile }: { name: string; onEnterRoom: () => void; onProfile: () => void }) {
  const [showModal, setShowModal] = useState(false);
  return (
    <main style={{ background:"#0a0018", minHeight:"100dvh", display:"flex", flexDirection:"column", fontFamily:"'Helvetica Neue',Arial,sans-serif", position:"relative", overflow:"hidden" }}>
      <style>{`
        .h-orb1{position:absolute;width:260px;height:260px;border-radius:50%;background:#7b2ff7;opacity:.09;top:-80px;left:-60px;pointer-events:none}
        .h-orb2{position:absolute;width:200px;height:200px;border-radius:50%;background:#ff3ea5;opacity:.06;top:-20px;right:-40px;pointer-events:none}
        .h-scroll{flex:1;overflow-y:auto;padding-bottom:80px}
        .h-scroll::-webkit-scrollbar{display:none}
        .topbar{display:flex;align-items:center;padding:max(16px,env(safe-area-inset-top)) 16px 10px;gap:10px;position:relative;z-index:10}
        .t-av{width:42px;height:42px;border-radius:50%;background:linear-gradient(135deg,#7b2ff7,#ff3ea5);border:2px solid rgba(192,132,252,.5);display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:900;color:#fff;flex-shrink:0}
        .t-coins{display:flex;align-items:center;gap:6px;background:rgba(10,0,30,.6);border:1px solid rgba(255,180,0,.3);border-radius:24px;padding:5px 10px 5px 5px}
        .coin-hex{width:26px;height:26px;position:relative;display:flex;align-items:center;justify-content:center;flex-shrink:0}
        .coin-hex-bg{position:absolute;inset:0;background:linear-gradient(135deg,#ffd700,#ff8c00);clip-path:polygon(50% 0%,93% 25%,93% 75%,50% 100%,7% 75%,7% 25%)}
        .coin-hex-v{position:relative;z-index:1;font-size:9px;font-weight:900;color:#5a2800;font-style:italic}
        .t-coin-num{font-size:13px;font-weight:800;color:#ffd700}
        .t-add{width:20px;height:20px;border-radius:50%;background:rgba(123,47,247,.5);border:1px solid rgba(192,132,252,.4);display:flex;align-items:center;justify-content:center;flex-shrink:0}
        .t-icon-btn{width:38px;height:38px;border-radius:50%;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.08);display:flex;align-items:center;justify-content:center;flex-shrink:0}
        .t-notif-dot{position:absolute;top:1px;right:1px;width:9px;height:9px;border-radius:50%;background:#ff3ea5;border:2px solid #0a0018}
        .hero-box{margin:8px 16px 14px;border-radius:24px;overflow:hidden;position:relative;height:150px}
        .hero-bg2{position:absolute;inset:0;background:#0d0022}
        .hero-g1{position:absolute;width:180px;height:180px;border-radius:50%;background:radial-gradient(circle,rgba(123,47,247,.35) 0%,transparent 70%);top:-40px;left:-20px;animation:vpulse 3s ease-in-out infinite}
        .hero-g2{position:absolute;width:150px;height:150px;border-radius:50%;background:radial-gradient(circle,rgba(255,62,165,.25) 0%,transparent 70%);bottom:-30px;right:20px;animation:vpulse 3s ease-in-out infinite .8s}
        .hero-r1{position:absolute;inset:0;border:1.5px solid rgba(192,132,252,.18);border-radius:50%;width:200px;height:200px;top:-30px;left:-30px;animation:vrotate 10s linear infinite}
        .hero-r2{position:absolute;border:1px dashed rgba(255,62,165,.15);border-radius:50%;width:160px;height:160px;top:-10px;left:-10px;animation:vrotate 7s linear infinite reverse}
        .hero-center{position:absolute;inset:0;display:flex;align-items:center;justify-content:center}
        .logo-wrap{position:relative;width:100px;height:100px;display:flex;align-items:center;justify-content:center}
        .logo-ring-o{position:absolute;inset:0;border-radius:50%;border:1.5px solid rgba(192,132,252,.2);animation:vrotate 10s linear infinite}
        .logo-ring-m{position:absolute;inset:8px;border-radius:50%;border:1px dashed rgba(255,62,165,.18);animation:vrotate 7s linear infinite reverse}
        .logo-ring-i{position:absolute;inset:16px;border-radius:50%;border:1px solid rgba(123,47,247,.18);animation:vrotate 5s linear infinite}
        .od1{position:absolute;top:50%;left:50%;width:8px;height:8px;border-radius:50%;background:#ff3ea5;margin:-4px 0 0 -4px;animation:vorbit 4s linear infinite}
        .od2{position:absolute;top:50%;left:50%;width:8px;height:8px;border-radius:50%;background:#c084fc;margin:-4px 0 0 -4px;animation:vorbit2 4s linear infinite}
        .od3{position:absolute;top:50%;left:50%;width:8px;height:8px;border-radius:50%;background:#00d4ff;margin:-4px 0 0 -4px;animation:vorbit3 4s linear infinite}
        .logo-c{width:62px;height:62px;border-radius:50%;background:linear-gradient(135deg,#1a0035,#2d0060);border:2px solid rgba(123,47,247,.6);display:flex;align-items:center;justify-content:center;animation:vpulse 2s ease-in-out infinite}
        .logo-v-txt{font-size:28px;font-weight:900;color:#fff;font-style:italic}
        .h-star{position:absolute;font-size:10px;animation:vtwinkle ease-in-out infinite}
        .h-bars{position:absolute;right:20px;top:50%;transform:translateY(-50%);display:flex;align-items:flex-end;gap:3px;height:46px}
        .hbar{width:5px;border-radius:3px;transform-origin:bottom}
        .hbar:nth-child(1){background:#ff6b35;animation:vbar .75s ease-in-out infinite 0s;height:46px}
        .hbar:nth-child(2){background:#ff3ea5;animation:vbar .75s ease-in-out infinite .1s;height:46px}
        .hbar:nth-child(3){background:#c084fc;animation:vbar .75s ease-in-out infinite .2s;height:46px}
        .hbar:nth-child(4){background:#7b2ff7;animation:vbar .75s ease-in-out infinite .3s;height:46px}
        .hbar:nth-child(5){background:#00d4ff;animation:vbar .75s ease-in-out infinite .4s;height:46px}
        .hbar:nth-child(6){background:#c084fc;animation:vbar .75s ease-in-out infinite .5s;height:46px}
        .h-mascot{position:absolute;left:14px;top:50%;transform:translateY(-50%);animation:vfloat 3s ease-in-out infinite}
        .section{padding:0 16px;margin-bottom:18px}
        .section-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}
        .section-title{font-size:16px;font-weight:800;color:#fff}
        .section-chip{display:flex;align-items:center;gap:4px;background:rgba(123,47,247,.15);border:1px solid rgba(123,47,247,.3);border-radius:20px;padding:4px 10px;font-size:10px;color:#c084fc;font-weight:600}
        .dom-card{border-radius:22px;overflow:hidden;position:relative;height:200px;cursor:pointer;background:#0d001e}
        .dom-felt{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 50%,#1a0050 0%,#0a0018 80%)}
        .dom-l1{position:absolute;width:300px;height:300px;border-radius:50%;background:radial-gradient(circle,rgba(123,47,247,.2) 0%,transparent 65%);top:-80px;left:-60px;animation:vpulse 4s ease-in-out infinite}
        .dom-l2{position:absolute;width:200px;height:200px;border-radius:50%;background:radial-gradient(circle,rgba(255,62,165,.15) 0%,transparent 65%);bottom:-60px;right:-20px;animation:vpulse 4s ease-in-out infinite .8s}
        .dp{position:absolute;background:rgba(255,255,255,.9);border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,.5)}
        .dp-line{position:absolute;left:0;right:0;height:1.5px;background:rgba(0,0,0,.2);top:50%;transform:translateY(-50%)}
        .dot{position:absolute;width:5px;height:5px;border-radius:50%;background:#1a0030}
        .dom-center{position:absolute;width:48px;height:86px;background:rgba(255,255,255,.96);border-radius:10px;box-shadow:0 8px 24px rgba(0,0,0,.6),0 0 30px rgba(123,47,247,.3);left:50%;top:50%;transform:translate(-50%,-50%) rotate(-4deg)}
        .dom-center .dp-line{height:2px;background:rgba(0,0,0,.15)}
        .dom-online{position:absolute;top:14px;right:14px;display:flex;align-items:center;gap:5px;background:rgba(0,0,0,.6);border:1px solid rgba(0,212,255,.4);border-radius:20px;padding:5px 10px;font-size:10px;color:#00d4ff;font-weight:700}
        .dom-play{position:absolute;bottom:14px;right:14px;width:48px;height:48px;border-radius:50%;background:linear-gradient(135deg,#7b2ff7,#ff3ea5);border:2px solid rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 16px rgba(123,47,247,.5)}
        .dom-players{position:absolute;bottom:18px;left:14px;display:flex;align-items:center;gap:6px}
        .dom-av{width:26px;height:26px;border-radius:50%;border:2px solid rgba(255,255,255,.3)}
        .rooms-row{display:flex;gap:10px;overflow-x:auto;padding-bottom:4px}
        .rooms-row::-webkit-scrollbar{display:none}
        .room-card{flex-shrink:0;width:140px;background:rgba(123,47,247,.1);border:1px solid rgba(123,47,247,.25);border-radius:18px;padding:12px}
        .rc-live{display:flex;align-items:center;gap:4px;margin-bottom:8px}
        .rc-dot{width:5px;height:5px;border-radius:50%;background:#00d4ff;animation:vpulse 1.5s ease-in-out infinite}
        .rc-avs{display:flex;margin-bottom:8px}
        .rc-av{width:26px;height:26px;border-radius:50%;border:2px solid #0a0018;margin-left:-7px}
        .rc-av:first-child{margin-left:0}
        .modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.8);z-index:200;display:flex;align-items:center;justify-content:center;animation:vfadeIn .2s ease}
        .modal-box{background:linear-gradient(145deg,#1a0035,#0d001e);border:1px solid rgba(123,47,247,.5);border-radius:28px;padding:32px 24px 24px;width:min(300px,85vw);text-align:center;animation:vpopIn .3s ease;position:relative}
      `}</style>
      <div className="h-orb1"/><div className="h-orb2"/>

      {/* TOPBAR */}
      <div className="topbar">
        <div className="t-av">D</div>
        <div className="t-coins">
          <div className="coin-hex"><div className="coin-hex-bg"/><span className="coin-hex-v">V</span></div>
          <span className="t-coin-num">210</span>
          <div className="t-add"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#c084fc" strokeWidth="3.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></div>
        </div>
        <div style={{ marginLeft:"auto", display:"flex", gap:8 }}>
          <div style={{ position:"relative" }}>
            <div className="t-icon-btn"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#5a3a7a" strokeWidth="2" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg></div>
            <div className="t-notif-dot"/>
          </div>
          <div className="t-icon-btn"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#5a3a7a" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></div>
        </div>
      </div>

      <div className="h-scroll">
        {/* HERO */}
        <div className="hero-box">
          <div className="hero-bg2"/><div className="hero-g1"/><div className="hero-g2"/>
          <div className="hero-r1"/><div className="hero-r2"/>
          <span className="h-star" style={{ top:14, right:30, color:"#ff3ea5", animationDuration:"2.2s" }}>✦</span>
          <span className="h-star" style={{ top:38, right:58, color:"#c084fc", fontSize:7, animationDuration:"1.8s", animationDelay:".5s" }}>✦</span>
          <span className="h-star" style={{ bottom:18, right:18, color:"#00d4ff", fontSize:8, animationDuration:"2.4s", animationDelay:".9s" }}>✦</span>
          <div className="h-mascot">
            <svg className="vf" width="62" height="62" viewBox="0 0 180 180">
              <defs><linearGradient id="hf3" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#fff0ff"/><stop offset="100%" stopColor="#e8d0ff"/></linearGradient></defs>
              <ellipse cx="54" cy="50" rx="16" ry="20" fill="#ff3ea5"/><ellipse cx="54" cy="52" rx="9" ry="13" fill="#ffb3d9"/>
              <ellipse cx="126" cy="50" rx="16" ry="20" fill="#ff3ea5"/><ellipse cx="126" cy="52" rx="9" ry="13" fill="#ffb3d9"/>
              <ellipse cx="90" cy="100" rx="50" ry="48" fill="url(#hf3)"/>
              <path d="M68 62 Q76 40 90 36 Q104 40 112 62" fill="#2a005a"/>
              <ellipse cx="80" cy="44" rx="5" ry="10" fill="#ff3ea5" transform="rotate(-15,80,44)"/>
              <ellipse cx="90" cy="38" rx="5" ry="10" fill="#c084fc"/>
              <ellipse cx="100" cy="44" rx="5" ry="10" fill="#00d4ff" transform="rotate(15,100,44)"/>
              <ellipse cx="76" cy="102" rx="13" ry="15" fill="#1a0030"/><ellipse cx="104" cy="102" rx="13" ry="15" fill="#1a0030"/>
              <ellipse cx="76" cy="102" rx="9" ry="11" fill="#7b2ff7"/><ellipse cx="104" cy="102" rx="9" ry="11" fill="#7b2ff7"/>
              <circle cx="81" cy="96" r="4" fill="white"/><circle cx="109" cy="96" r="4" fill="white"/>
              <ellipse cx="60" cy="116" rx="10" ry="7" fill="#ff6b9d" opacity=".5"/><ellipse cx="120" cy="116" rx="10" ry="7" fill="#ff6b9d" opacity=".5"/>
              <path d="M72 124 Q90 140 108 124" fill="none" stroke="#d4006e" strokeWidth="3" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="hero-center">
            <div className="logo-wrap">
              <div className="logo-ring-o"/><div className="logo-ring-m"/><div className="logo-ring-i"/>
              <div className="od1"/><div className="od2"/><div className="od3"/>
              <div className="logo-c"><span className="logo-v-txt">V</span></div>
            </div>
          </div>
          <div className="h-bars">
            <div className="hbar"/><div className="hbar"/><div className="hbar"/>
            <div className="hbar"/><div className="hbar"/><div className="hbar"/>
          </div>
        </div>

        {/* OYUNLAR */}
        <div className="section">
          <div className="section-header">
            <span className="section-title">Oyunlar</span>
            <div className="section-chip">Tezliklə daha çox <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#c084fc" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg></div>
          </div>
          <div className="dom-card" onClick={() => setShowModal(true)}>
            <div className="dom-felt"/><div className="dom-l1"/><div className="dom-l2"/>
            <div className="dp" style={{ width:32, height:58, left:28, top:24, transform:"rotate(-10deg)" }}><div className="dp-line"/><div className="dot" style={{ top:7, left:7 }}/><div className="dot" style={{ top:7, right:7 }}/><div className="dot" style={{ bottom:7, left:"50%", transform:"translateX(-50%)" }}/></div>
            <div className="dp" style={{ width:32, height:58, left:66, top:38, transform:"rotate(8deg)" }}><div className="dp-line"/><div className="dot" style={{ top:7, left:"50%", transform:"translateX(-50%)" }}/><div className="dot" style={{ bottom:7, left:7 }}/><div className="dot" style={{ bottom:7, right:7 }}/></div>
            <div className="dp" style={{ width:32, height:58, right:48, top:18, transform:"rotate(-5deg)" }}><div className="dp-line"/><div className="dot" style={{ top:7, left:7 }}/><div className="dot" style={{ top:7, right:7 }}/><div className="dot" style={{ top:"50%", left:"50%", transform:"translate(-50%,-50%)" }}/><div className="dot" style={{ bottom:7, left:7 }}/><div className="dot" style={{ bottom:7, right:7 }}/></div>
            <div className="dp" style={{ width:32, height:58, right:88, top:44, transform:"rotate(12deg)" }}><div className="dp-line"/><div className="dot" style={{ top:7, left:7 }}/><div className="dot" style={{ bottom:7, right:7 }}/></div>
            <div className="dom-center"><div className="dp-line"/><div className="dot" style={{ top:10, left:9, width:7, height:7, background:"#7b2ff7" }}/><div className="dot" style={{ top:10, right:9, width:7, height:7, background:"#7b2ff7" }}/><div className="dot" style={{ top:22, left:"50%", transform:"translateX(-50%)", width:7, height:7, background:"#7b2ff7" }}/><div className="dot" style={{ bottom:10, left:9, width:7, height:7, background:"#ff3ea5" }}/><div className="dot" style={{ bottom:10, right:9, width:7, height:7, background:"#ff3ea5" }}/><div className="dot" style={{ bottom:22, left:"50%", transform:"translateX(-50%)", width:7, height:7, background:"#ff3ea5" }}/></div>
            <div className="dom-online"><div style={{ width:6, height:6, borderRadius:"50%", background:"#00d4ff", animation:"vpulse 1.5s ease-in-out infinite" }}/> 1.2K</div>
            <div className="dom-players"><div className="dom-av" style={{ background:"#ff3ea5" }}/><div className="dom-av" style={{ background:"#7b2ff7", marginLeft:-10 }}/><div className="dom-av" style={{ background:"#00d4ff", marginLeft:-10 }}/><span style={{ fontSize:10, color:"rgba(255,255,255,.6)", fontWeight:600, marginLeft:4 }}>+48</span></div>
            <div className="dom-play"><svg width="16" height="16" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg></div>
          </div>
        </div>

        {/* CANLI OTAQLAR */}
        <div className="section">
          <div className="section-header">
            <span className="section-title">Canlı otaqlar</span>
            <div className="section-chip">Hamısı <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#c084fc" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg></div>
          </div>
          <div className="rooms-row">
            {[{name:"Qızıl Saatlar",count:"128",colors:["#ff3ea5","#7b2ff7","#00d4ff"]},{name:"Gecə Partisi",count:"64",colors:["#c084fc","#ff6b35","#ff3ea5"]},{name:"VIP Lounge",count:"256",colors:["#ff3ea5","#7b2ff7","#c084fc"]}].map(r => (
              <div key={r.name} className="room-card" onClick={onEnterRoom}>
                <div className="rc-live"><div className="rc-dot"/><span style={{ fontSize:8, color:"#00d4ff", fontWeight:700, letterSpacing:1.5 }}>CANLI</span></div>
                <div className="rc-avs">{r.colors.map((c,i) => <div key={i} className="rc-av" style={{ background:c }}/>)}</div>
                <div style={{ fontSize:12, fontWeight:700, color:"#fff", marginBottom:2 }}>{r.name}</div>
                <div style={{ fontSize:9, color:"#5a3a7a", marginBottom:8 }}>{r.count} dinləyici</div>
                <div style={{ background:"rgba(123,47,247,.3)", border:"1px solid rgba(123,47,247,.5)", borderRadius:8, padding:5, textAlign:"center", fontSize:9, color:"#c084fc", fontWeight:700 }}>Qoşul →</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowModal(false)} style={{ position:"absolute", top:14, right:14, width:28, height:28, borderRadius:"50%", background:"rgba(255,255,255,.06)", border:"1px solid rgba(255,255,255,.1)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.5)" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
            <div style={{ width:70, height:70, borderRadius:"50%", background:"linear-gradient(135deg,#7b2ff7,#ff3ea5)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px", animation:"vpulse 2s ease-in-out infinite" }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><rect x="2" y="6" width="20" height="12" rx="6"/><path d="M8 12h4M10 10v4"/><circle cx="16" cy="11" r="1.5" fill="white"/><circle cx="18" cy="13" r="1.5" fill="white"/></svg>
            </div>
            <p style={{ fontSize:9, letterSpacing:3, color:"#c084fc", textTransform:"uppercase", fontWeight:700, marginBottom:8 }}>Domino</p>
            <p style={{ fontSize:22, fontWeight:900, color:"#fff", marginBottom:8 }}>Tezliklə!</p>
            <p style={{ fontSize:12, color:"#6b3fa0", lineHeight:1.6, marginBottom:20 }}>Bu oyun hazırlanır. Tezliklə aktiv olacaqdır. Bildiriş almaq üçün gözləyin.</p>
            <button onClick={() => setShowModal(false)} style={{ width:"100%", height:48, borderRadius:14, background:"linear-gradient(135deg,#7b2ff7,#ff3ea5)", border:"none", color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer" }}>Anladım</button>
          </div>
        </div>
      )}

      <BottomNav active="home" onHome={() => {}} onRoom={onEnterRoom} onProfile={onProfile}/>
    </main>
  );
}

/* ─── PROFILE ─── */
const COUNTRY_CITIES: Record<string, string[]> = {
  "Azərbaycan": ["Bakı","Gəncə","Sumqayıt","Mingəçevir","Naxçıvan","Lənkəran","Şirvan","Yevlax","Şuşa","Ağdam","Bərdə","Goranboy","Göyçay","İmişli","Kürdəmir","Masallı","Saatlı","Salyan","Sabirabad","Şamaxı","Şəki","Şəmkir","Zaqatala","Balakən","Qax","Quba","Qusar","Lerik","Astara","Cəlilabad","Füzuli","Xocavənd","Laçın","Kəlbəcər","Ağcabədi","Ağdaş","Ağstafa","Ağsu","Biləsuvar","Daşkəsən","Gədəbəy","Gobustan","Hacıqabul","Xızı","İsmayıllı","Neftçala","Oğuz","Qazax","Qəbələ","Samux","Şahbuz","Şərur","Terter","Tovuz","Ucar"],
  "Türkiyə": ["İstanbul","Ankara","İzmir","Bursa","Antalya","Adana","Konya","Gaziantep","Şanlıurfa","Kayseri","Mersin","Eskişehir","Trabzon","Samsun","Diyarbakır","Van","Malatya","Erzurum","Kocaeli","Balıkesir"],
  "Rusiya": ["Moskva","Sankt-Peterburq","Novosibirsk","Yekaterinburq","Kazan","Nijniy Novqorod","Çelyabinsk","Samara","Ufa","Rostov-na-Donu","Krasnodar","Omsk","Voronej","Perm","Volqoqrad"],
  "ABŞ": ["Nyu-York","Los-Anceles","Çikaqo","Hyuston","Filadelfiya","Feniks","San-Antonio","San-Dieqo","Dallas","San-Xose","Detroit","Ceksonvil","Indianapolis","San-Fransisko","Kolumbus"],
  "Almaniya": ["Berlin","Hamburq","Münhen","Köln","Frankfurt","Stuttgart","Düsseldorf","Dortmund","Essen","Breman","Dresden","Hannover","Nürnberq","Duisburq","Buxum"],
  "Fransa": ["Paris","Marsel","Lion","Tuluz","Nis","Nant","Strasburq","Monpelye","Bordo","Lil","Ren","Reym","Sen-Etyen","Tul","Havr"],
  "İngiltərə": ["London","Birminqem","Lids","Qlazqo","Şeffield","Bradford","Edinburq","Liverpool","Mançester","Bristol","Veyks","Koventry","Lester","Nottinam","Nyukastle"],
  "İtaliya": ["Roma","Milan","Neapol","Turin","Palermo","Genuya","Bolonya","Florensiya","Bari","Katanya","Venetsiya","Verona","Messina","Padova","Triyest"],
  "İspaniya": ["Madrid","Barselona","Valensiya","Sevilya","Saraqosa","Malaqqa","Mursia","Palma","Las-Palmas","Bilbao","Alikante","Kordoba","Valladolid","Viqo","Xixon"],
  "Türkmənistan": ["Aşqabad","Türkmenabat","Daşoğuz","Mary","Balkanabat","Bayramali","Tejen","Serdar","Türkmenbaşy","Abadan"],
  "Ukrayna": ["Kiyev","Xarkov","Odessa","Dnepr","Donetsk","Zaporijye","Lvov","Krivoy Roq","Nikolayev","Mariupol"],
  "Gürcüstan": ["Tbilisi","Kutaisi","Batumi","Rustavi","Gori","Zugdidi","Poti","Samtredia","Xaşuri","Senaki"],
  "Qazaxıstan": ["Almatı","Astana","Şymkent","Karaganda","Aktobe","Taraz","Pavlodar","Öskemen","Semey","Atyrau"],
  "Özbəkistan": ["Daşkənd","Samarqənd","Namangan","Əndican","Fərqanə","Buxara","Nükus","Qoqand","Marg'ilon","Chirchiq"],
  "default": ["Paytaxt","Şəhər 1","Şəhər 2","Şəhər 3"],
};

const COUNTRIES = ["Azərbaycan","Türkiyə","Rusiya","ABŞ","Almaniya","Fransa","İngiltərə","İtaliya","İspaniya","Hollandiya","Belçika","Polşa","Ukrayna","Gürcüstan","Qazaxıstan","Özbəkistan","Türkmənistan","İsveçrə","Avstriya","İsveç","Norveç","Danimarka","Finlandiya","Kanada","Avstraliya","Yaponiya","Çin","Hindistan","Braziliya","Argentina","Meksika","Cənubi Koreya","İran","Ərəbistan","BƏƏ","Qatar","Küveyt","İordaniya","Misir","Cənubi Afrika"];

function ProfileScreen({ name, onBack, onEnterRoom, onVip }: { name: string; onBack: () => void; onEnterRoom: () => void; onVip: () => void }) {
  const [editOpen, setEditOpen] = useState(false);
  const [visitorOpen, setVisitorOpen] = useState(false);
  const [copyDone, setCopyDone] = useState(false);

  // Sabit 8 rəqəmli ID — localStorage-də saxlanır
  const userId = (() => {
    try {
      let id = localStorage.getItem("velvet_uid");
      if (!id) { id = Math.floor(10000000 + Math.random() * 90000000).toString(); localStorage.setItem("velvet_uid", id); }
      return id;
    } catch { return "12345678"; }
  })();

  // Hesab açılış tarixi
  const joinedDate = (() => {
    try {
      let d = localStorage.getItem("velvet_joined");
      if (!d) { d = new Date().toISOString(); localStorage.setItem("velvet_joined", d); }
      const diff = Math.floor((Date.now() - new Date(d).getTime()) / 86400000);
      return Math.max(1, diff);
    } catch { return 142; }
  })();

  const userVip = 0; // Yeni qeydiyyat → VIP0
  const displayVip = Math.min(userVip, 15);

  const [avatarPreview, setAvatarPreview] = useState<string|null>(() => { try { return localStorage.getItem("profile_avatar"); } catch { return null; } });
  const [showAvatarFull, setShowAvatarFull] = useState(false);

  const [profileData, setProfileData] = useState(() => {
    try {
      const s = localStorage.getItem("velvet_profile");
      if (s) return JSON.parse(s);
      // Yeni istifadəçi — real məlumatlar auth-dan
      return { username: name || "İstifadəçi", gender: "", age: 18, country: "Azərbaycan", city: "Bakı", bio: "" };
    } catch { return { username: name || "İstifadəçi", gender: "", age: 18, country: "Azərbaycan", city: "Bakı", bio: "" }; }
  });
  const [draft, setDraft] = useState(profileData);
  const saveProfile = (d: typeof profileData) => {
    setProfileData(d);
    try { localStorage.setItem("velvet_profile", JSON.stringify(d)); } catch {}
  };

  // Ziyarətçilər — ziyarət sayı ilə
  const visitors = [
    { name:"Aynur M.", initials:"AM", color:"#7b2ff7", vip:7, country:"Azərbaycan", time:"2 dəq əvvəl", visits:4 },
    { name:"Rauf K.", initials:"RK", color:"#ff3ea5", vip:3, country:"Türkiyə", time:"18 dəq əvvəl", visits:1 },
    { name:"Sevinc H.", initials:"SH", color:"#00d4ff", vip:12, country:"Azərbaycan", time:"1 saat əvvəl", visits:7 },
    { name:"Tural B.", initials:"TB", color:"#ff6b35", vip:0, country:"Rusiya", time:"3 saat əvvəl", visits:2 },
    { name:"Nigar A.", initials:"NA", color:"#50c050", vip:5, country:"Azərbaycan", time:"Dünən 22:14", visits:3 },
    { name:"Kənan S.", initials:"KS", color:"#c084fc", vip:9, country:"Türkiyə", time:"Dünən 19:40", visits:1 },
  ];
  return (
    <main style={{ background:"#07000f", minHeight:"100dvh", fontFamily:"'Helvetica Neue',Arial,sans-serif", position:"relative" }}>
      <style>{`
        .p-scroll{overflow-y:auto;padding-bottom:90px;height:100dvh;touch-action:pan-y!important}
        .p-scroll::-webkit-scrollbar{display:none}
        .p-hero{position:relative;height:200px;overflow:hidden;flex-shrink:0}
        .p-cover{position:absolute;inset:0;background:linear-gradient(160deg,#1a0035 0%,#0d0022 50%,#07000f 100%)}
        .p-fade{position:absolute;bottom:0;left:0;right:0;height:80px;background:linear-gradient(to top,#07000f 0%,transparent 100%);z-index:3}
        .p-mesh{position:absolute;inset:0;background:radial-gradient(ellipse at 20% 50%,rgba(123,47,247,.2) 0%,transparent 55%),radial-gradient(ellipse at 80% 20%,rgba(255,62,165,.15) 0%,transparent 50%);z-index:2}
        .p-ring1{position:absolute;width:320px;height:320px;top:-100px;left:-80px;border-radius:50%;border:1px solid rgba(192,132,252,.06);animation:vrotate 20s linear infinite;z-index:2}
        .p-ring2{position:absolute;width:240px;height:240px;top:-60px;left:-40px;border-radius:50%;border:1px dashed rgba(255,62,165,.05);animation:vrotate 14s linear infinite reverse;z-index:2}
        .p-top{position:absolute;top:0;left:0;right:0;display:flex;align-items:center;justify-content:space-between;padding:max(16px,env(safe-area-inset-top)) 18px 0;z-index:8}
        .p-ibtn{width:36px;height:36px;border-radius:12px;background:rgba(0,0,0,.4);border:1px solid rgba(255,255,255,.1);display:flex;align-items:center;justify-content:center;cursor:pointer}
        .p-upload{position:absolute;bottom:12px;right:14px;z-index:8;display:flex;align-items:center;gap:5px;background:rgba(0,0,0,.55);border:1px solid rgba(255,255,255,.15);border-radius:20px;padding:6px 11px;cursor:pointer}
        .p-av-outer{width:78px;height:78px;border-radius:50%;background:conic-gradient(#ffd700,#ff8c00,#c084fc,#7b2ff7,#ffd700);padding:2.5px;animation:vglow 3s ease-in-out infinite;flex-shrink:0}
        .p-av-inner{width:100%;height:100%;border-radius:50%;background:#1a0035;display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:900;color:#fff;overflow:hidden}
        .p-crown{position:absolute;top:-12px;left:50%;transform:translateX(-50%)}
        .p-status{position:absolute;bottom:2px;right:2px;width:14px;height:14px;border-radius:50%;background:#00ff88;border:2.5px solid #07000f}
        .vip-rozet{display:inline-flex;align-items:center;margin:12px 18px 0}
        .p-coin{margin:16px 18px 0;border-radius:22px;overflow:hidden;position:relative;background:#0e0020}
        .p-coin-inner{position:relative;z-index:2;padding:18px 20px;display:flex;align-items:center;gap:16px}
        .p-coin-bg{position:absolute;inset:0;background:radial-gradient(ellipse at 30% 50%,rgba(255,180,0,.12) 0%,transparent 60%),radial-gradient(ellipse at 80% 30%,rgba(123,47,247,.12) 0%,transparent 60%);z-index:1}
        .p-coin-border{position:absolute;inset:0;border-radius:22px;border:1px solid rgba(255,180,0,.2);z-index:3;pointer-events:none}
        .p-coin-shine{position:absolute;inset:0;background:linear-gradient(105deg,transparent 35%,rgba(255,220,100,.05) 50%,transparent 65%);background-size:200% 100%;animation:vshimmer 4s ease-in-out infinite;z-index:2}
        .gem{position:relative;width:56px;height:56px;flex-shrink:0;animation:vcoinPulse 2.5s ease-in-out infinite}
        .p-menu{margin:16px 18px 0}
        .p-ms-title{font-size:10px;letter-spacing:3px;color:rgba(255,255,255,.12);text-transform:uppercase;margin-bottom:10px;padding-left:4px}
        .p-mi{display:flex;align-items:center;gap:12px;padding:14px 16px;border-radius:14px;cursor:pointer;background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.04);margin-bottom:4px}
        .p-mi:active{background:rgba(255,255,255,.05)}
        .p-mi-l{width:40px;height:40px;border-radius:13px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
        .p-mi-lbl{flex:1;font-size:14px;font-weight:600;color:rgba(255,255,255,.8)}
        .p-badge{font-size:10px;font-weight:700;padding:2px 8px;border-radius:6px}
      `}</style>
      <div className="p-scroll">
        <div className="p-hero">
          <div className="p-cover">
            <img id="p-cover-img" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", display:"none", zIndex:1 }} alt=""
              ref={(el) => {
                if (el) {
                  try {
                    const saved = localStorage.getItem("profile_cover");
                    if (saved) { el.src = saved; el.style.display = "block";
                      const svg = document.getElementById("p-cover-svg");
                      if (svg) svg.style.display = "none";
                    }
                  } catch {}
                }
              }}
            />
            <svg id="p-cover-svg" width="100%" height="100%" viewBox="0 0 430 290" preserveAspectRatio="xMidYMid slice">
              <defs>
                <radialGradient id="pb1" cx="30%" cy="40%"><stop offset="0%" stopColor="#3a0070" stopOpacity=".9"/><stop offset="100%" stopColor="#07000f" stopOpacity="0"/></radialGradient>
                <radialGradient id="pb2" cx="80%" cy="20%"><stop offset="0%" stopColor="#7b0050" stopOpacity=".6"/><stop offset="100%" stopColor="#07000f" stopOpacity="0"/></radialGradient>
              </defs>
              <rect width="430" height="290" fill="#0d001e"/>
              <ellipse cx="130" cy="120" rx="200" ry="180" fill="url(#pb1)"/>
              <ellipse cx="360" cy="60" rx="160" ry="140" fill="url(#pb2)"/>
              <text x="300" y="230" fontSize="180" fontWeight="900" fill="rgba(123,47,247,.05)" fontStyle="italic">V</text>
            </svg>
          </div>
          <div className="p-upload" onClick={() => document.getElementById("p-file-input")?.click()}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.55)" strokeWidth="2.5" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            <span style={{ fontSize:9, color:"rgba(255,255,255,.55)", letterSpacing:.5 }}>Şəkil yüklə</span>
          </div>
          <input id="p-file-input" type="file" accept="image/*" style={{ display:"none" }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = (ev) => {
                const base64 = String(ev.target?.result || "");
                if (!base64) return;
                try { localStorage.setItem("profile_cover", base64); } catch {}
                const cover = document.getElementById("p-cover-img") as HTMLImageElement;
                if (cover) { cover.src = base64; cover.style.display = "block"; }
                const svgEl = document.getElementById("p-cover-svg");
                if (svgEl) svgEl.style.display = "none";
              };
              reader.readAsDataURL(file);
            }}
          />
          <div className="p-mesh"/><div className="p-ring1"/><div className="p-ring2"/><div className="p-fade"/>
          <div className="p-top">
            <button className="p-ibtn" onClick={onBack}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.5)" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg></button>
            <span style={{ fontSize:13, fontWeight:700, color:"rgba(255,255,255,.5)", letterSpacing:3, textTransform:"uppercase" }}>Profil</span>
            <div style={{ display:"flex", gap:8 }}>
              <button className="p-ibtn" onClick={() => setVisitorOpen(true)}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.5)" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              </button>
              <button className="p-ibtn" onClick={() => { setDraft(profileData); setEditOpen(true); }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.5)" strokeWidth="2" strokeLinecap="round"><path d="M17 3a2.828 2.828 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
              </button>
            </div>
          </div>
        </div>

        {/* PROFİL MƏLUMATLARI — hero-dan aşağıda, normal axımda */}
        <div style={{ padding:"0 18px", marginTop:-20, position:"relative", zIndex:5 }}>
          <div style={{ display:"flex", alignItems:"flex-end", gap:14, marginBottom:14 }}>
            {/* Avatar */}
            <div style={{ position:"relative", flexShrink:0 }}>
              <div className="p-av-outer" onClick={() => setShowAvatarFull(true)} style={{ cursor:"pointer" }}>
                <div className="p-av-inner">
                  {avatarPreview
                    ? <img src={avatarPreview} style={{ width:"100%", height:"100%", objectFit:"cover", borderRadius:"50%" }} alt=""/>
                    : (profileData.username[0]?.toUpperCase() || "İ")
                  }
                </div>
              </div>
              <div className="p-status"/>
            </div>
            {/* Ad + ID */}
            <div style={{ flex:1, paddingBottom:4 }}>
              <div style={{ fontSize:20, fontWeight:900, color:"#fff", marginBottom:2 }}>{profileData.username}</div>
              <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                <span style={{ fontSize:11, color:"rgba(255,255,255,.3)" }}>ID: {userId}</span>
                <button onClick={() => { navigator.clipboard?.writeText(userId).then(() => { setCopyDone(true); setTimeout(() => setCopyDone(false), 1500); }); }}
                  style={{ background:"transparent", border:"none", cursor:"pointer", padding:2, display:"flex", alignItems:"center" }}>
                  {copyDone
                    ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#50c050" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                    : <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.3)" strokeWidth="2" strokeLinecap="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                  }
                </button>
              </div>
            </div>
          </div>
          {/* Bio */}
          {profileData.bio ? <div style={{ fontSize:12, color:"rgba(255,255,255,.4)", marginBottom:10, lineHeight:1.5 }}>{profileData.bio}</div> : null}
          {/* Meta pillər */}
          <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:4 }}>
            {[
              { icon:<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.35)" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 010 20"/></svg>, txt:profileData.country },
              { icon:<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.35)" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="2"/></svg>, txt:profileData.city },
              { icon:<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.35)" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>, txt:`${profileData.age} yaş` },
              { icon:<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.35)" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>, txt:`${joinedDate} gün` },
            ].map((m,i) => (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:4, background:"rgba(255,255,255,.05)", borderRadius:8, padding:"3px 7px" }}>
                {m.icon}<span style={{ fontSize:10, color:"rgba(255,255,255,.4)" }}>{m.txt}</span>
              </div>
            ))}
          </div>
        </div>

        {/* VIP ROZET */}
        <div style={{ position:"relative", width:160, height:56, overflow:"hidden", borderRadius:12, margin:"10px 18px 0" }}>
          <img src="/images/images/viparxaplan.PNG" style={{ position:"absolute", top:0, left:0, width:"auto", height:"100%", objectFit:"cover", objectPosition:"left center", maxWidth:"none" }} alt=""/>
          <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,.2)" }}/>
          <img src={`/images/images/VIP${displayVip}.png`} style={{ position:"absolute", left:8, top:"50%", transform:"translateY(-50%)", width:46, height:46, objectFit:"contain" }} alt=""/>
          <div style={{ position:"absolute", left:62, top:"50%", transform:"translateY(-50%)" }}>
            <span style={{ fontSize:21, fontWeight:900, fontFamily:"-apple-system,sans-serif", letterSpacing:.5, lineHeight:1, background:"linear-gradient(135deg,#fff8c0,#ffd700,#c8860a)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", filter:"drop-shadow(0 1px 4px rgba(0,0,0,.7))" }}>VIP {displayVip}</span>
          </div>
        </div>

        {/* JETON — Premium UI */}
        <div style={{ margin:"14px 18px 0", borderRadius:24, overflow:"hidden", position:"relative" }}>
          {/* Arxa plan */}
          <div style={{ position:"absolute", inset:0, background:"linear-gradient(135deg,#0a001e 0%,#120030 50%,#0a001e 100%)" }}/>
          <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse at 20% 50%,rgba(255,180,0,.12) 0%,transparent 55%),radial-gradient(ellipse at 85% 20%,rgba(123,47,247,.15) 0%,transparent 55%)" }}/>
          {/* Parlama zolağı */}
          <div style={{ position:"absolute", top:0, left:0, right:0, height:1, background:"linear-gradient(90deg,transparent,rgba(255,200,0,.3),transparent)" }}/>
          <div style={{ position:"absolute", bottom:0, left:0, right:0, height:1, background:"linear-gradient(90deg,transparent,rgba(123,47,247,.2),transparent)" }}/>
          <div style={{ position:"relative", zIndex:2, padding:"18px 20px" }}>
            {/* Üst sətir */}
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                {/* 3D Brilyant */}
                <div style={{ width:48, height:48, position:"relative" }}>
                  <svg width="48" height="48" viewBox="0 0 60 60" fill="none">
                    <defs>
                      <linearGradient id="jg1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#fff8d0"/><stop offset="40%" stopColor="#ffd700"/><stop offset="100%" stopColor="#cc7000"/></linearGradient>
                      <linearGradient id="jg2" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#cc7000"/><stop offset="100%" stopColor="#ffb800"/></linearGradient>
                      <linearGradient id="jg3" x1="100%" y1="0%" x2="0%" y2="0%"><stop offset="0%" stopColor="#884400"/><stop offset="100%" stopColor="#ffb800"/></linearGradient>
                      <filter id="jgf"><feGaussianBlur stdDeviation="1.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
                      <filter id="jglow"><feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="rgba(255,200,0,.5)"/></filter>
                    </defs>
                    <g filter="url(#jglow)">
                      <polygon points="30,10 44,24 30,22 16,24" fill="url(#jg1)" strokeWidth=".5" stroke="rgba(255,220,100,.5)"/>
                      <polygon points="16,24 30,22 22,42" fill="url(#jg2)" strokeWidth=".5" stroke="rgba(255,180,0,.3)"/>
                      <polygon points="44,24 30,22 38,42" fill="url(#jg3)" strokeWidth=".5" stroke="rgba(200,100,0,.3)"/>
                      <polygon points="22,42 30,22 38,42" fill="url(#jg1)" strokeWidth=".5" stroke="rgba(255,220,100,.3)" opacity=".8"/>
                    </g>
                    <circle cx="22" cy="16" r="2.5" fill="rgba(255,255,255,.7)"/>
                    <circle cx="27" cy="13" r="1.2" fill="rgba(255,255,255,.5)"/>
                    <ellipse cx="30" cy="44" rx="12" ry="3" fill="rgba(255,180,0,.15)"/>
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize:9, letterSpacing:3, color:"rgba(255,180,0,.5)", textTransform:"uppercase", marginBottom:3 }}>Velvet Jeton</div>
                  <div style={{ display:"flex", alignItems:"baseline", gap:4 }}>
                    <span style={{ fontSize:32, fontWeight:900, color:"#ffd700", letterSpacing:-1, lineHeight:1, filter:"drop-shadow(0 0 12px rgba(255,200,0,.5))" }}>210</span>
                    <span style={{ fontSize:11, color:"rgba(255,180,0,.4)" }}>≈ 2.10 AZN</span>
                  </div>
                </div>
              </div>
              {/* Tarixçə düyməsi */}
              <button style={{ background:"rgba(255,255,255,.05)", border:"1px solid rgba(255,255,255,.08)", borderRadius:12, padding:"7px 12px", color:"rgba(255,255,255,.4)", fontSize:11, cursor:"pointer", display:"flex", alignItems:"center", gap:5 }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                Tarixçə
              </button>
            </div>
            {/* Sürətli paketlər */}
            <div style={{ display:"flex", gap:8, marginBottom:14 }}>
              {[{v:100,p:"1.00 AZN"},{v:500,p:"4.50 AZN",hot:true},{v:1000,p:"8.00 AZN"},{v:5000,p:"35 AZN"}].map(pkg => (
                <div key={pkg.v} style={{ flex:1, background: pkg.hot ? "rgba(255,200,0,.08)" : "rgba(255,255,255,.03)", border:`1px solid ${pkg.hot ? "rgba(255,200,0,.25)" : "rgba(255,255,255,.06)"}`, borderRadius:14, padding:"10px 6px", textAlign:"center", cursor:"pointer", position:"relative" }}>
                  {pkg.hot && <div style={{ position:"absolute", top:-8, left:"50%", transform:"translateX(-50%)", background:"linear-gradient(90deg,#ffd700,#ff8c00)", borderRadius:6, padding:"2px 7px", fontSize:8, fontWeight:800, color:"#3a1800", whiteSpace:"nowrap" }}>🔥 ƏN ÇOX</div>}
                  <div style={{ fontSize:15, fontWeight:800, color:pkg.hot ? "#ffd700" : "#fff", marginBottom:2 }}>{pkg.v}</div>
                  <div style={{ fontSize:9, color:"rgba(255,255,255,.3)" }}>{pkg.p}</div>
                </div>
              ))}
            </div>
            {/* Yüklə düyməsi */}
            <button style={{ width:"100%", background:"linear-gradient(135deg,#ffd700 0%,#ff9500 50%,#ff6000 100%)", border:"none", borderRadius:16, padding:"14px", fontSize:14, fontWeight:800, color:"#2a0e00", cursor:"pointer", letterSpacing:.3, boxShadow:"0 6px 24px rgba(255,150,0,.35)", position:"relative", overflow:"hidden" }}>
              <div style={{ position:"absolute", inset:0, background:"linear-gradient(90deg,transparent 30%,rgba(255,255,255,.15) 50%,transparent 70%)", backgroundSize:"200% 100%" }}/>
              <span style={{ position:"relative" }}>+ Jeton Yüklə</span>
            </button>
          </div>
        </div>

        {/* MENU */}
        <div className="p-menu">
          <div className="p-ms-title">Hesabım</div>
          {[
            { icon:"#2563eb", bg:"rgba(37,99,235,.25),rgba(59,130,246,.12)", svg:<svg width="22" height="22" viewBox="0 0 52 52" fill="none"><defs><linearGradient id="wg1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#1d4ed8"/><stop offset="100%" stopColor="#3b82f6"/></linearGradient><linearGradient id="wg2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#60a5fa"/><stop offset="100%" stopColor="#93c5fd"/></linearGradient><linearGradient id="wg3" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#2563eb" stopOpacity=".7"/><stop offset="100%" stopColor="#60a5fa" stopOpacity=".5"/></linearGradient></defs>{/* Arxadakı kartlar */}<rect x="14" y="5" width="30" height="20" rx="4" fill="url(#wg3)" transform="rotate(-8,29,15)"/><rect x="18" y="4" width="28" height="18" rx="3.5" fill="url(#wg2)" transform="rotate(-3,32,13)"/>{/* Ana cüzdan gövdəsi */}<rect x="4" y="16" width="38" height="28" rx="6" fill="url(#wg1)"/>{/* Sağ klips/düymə hissəsi */}<rect x="34" y="26" width="14" height="14" rx="4" fill="url(#wg2)"/>{/* Düymə dairəsi */}<circle cx="41" cy="33" r="3" fill="url(#wg1)"/><circle cx="41" cy="33" r="1.5" fill="#1d4ed8"/>{/* Parlama */}<ellipse cx="12" cy="22" rx="6" ry="3" fill="rgba(255,255,255,.12)" transform="rotate(-10,12,22)"/></svg>, label:"Cüzdanım" },
            { icon:"#ffd700", bg:"rgba(255,200,0,.2),rgba(255,160,0,.1)", svg:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffd700" strokeWidth="1.7" strokeLinecap="round"><path d="M2 8l4 8h12l4-8-5 3-5-7-5 7-5-3z"/></svg>, label:"VIP", badge:"VIP 17", badgeColor:"rgba(255,200,0,.12)", badgeText:"#ffd700", badgeBorder:"rgba(255,200,0,.25)" },
            { icon:"#00d4ff", bg:"rgba(0,212,255,.12),rgba(0,150,200,.08)", svg:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00d4ff" strokeWidth="1.7" strokeLinecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>, label:"Sıralamam", badge:"#142", badgeColor:"rgba(0,212,255,.08)", badgeText:"#00d4ff", badgeBorder:"rgba(0,212,255,.18)" },
            { icon:"#c084fc", bg:"rgba(123,47,247,.2),rgba(80,20,180,.1)", svg:<img src="/images/images/store.PNG" width="26" height="26" style={{objectFit:"contain"}}/>, label:"Mağaza" },
            { icon:"#00ff88", bg:"rgba(0,255,136,.1),rgba(0,180,100,.06)", svg:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00ff88" strokeWidth="1.7" strokeLinecap="round"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>, label:"Dostları dəvət et" },
            { icon:"#ff3ea5", bg:"rgba(255,62,165,.15),rgba(200,0,100,.08)", svg:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ff3ea5" strokeWidth="1.7" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17" strokeWidth="3"/></svg>, label:"Yardım" },
            { icon:"rgba(255,255,255,.25)", bg:"rgba(255,255,255,.04)", svg:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.25)" strokeWidth="1.7" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>, label:"Ayarlar", muted:true },
          ].map((item, i) => (
            <div key={i} className="p-mi" onClick={item.label === "VIP" ? onVip : undefined} style={item.label === "VIP" ? { cursor: "pointer" } : {}}>
              <div className="p-mi-l" style={{ background:`linear-gradient(135deg,${item.bg})` }}>{item.svg}</div>
              <span className="p-mi-lbl" style={item.muted ? { color:"rgba(255,255,255,.35)" } : {}}>{item.label}</span>
              <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                {item.badge && <span className="p-badge" style={{ background:item.badgeColor, color:item.badgeText, border:`1px solid ${item.badgeBorder}` }}>{item.badge}</span>}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.15)" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
              </div>
            </div>
          ))}
        </div>

        <div onClick={() => { supabase.auth.signOut(); }} style={{ margin:"16px 18px 24px", display:"flex", alignItems:"center", justifyContent:"center", gap:8, padding:15, borderRadius:16, background:"rgba(255,60,60,.05)", border:"1px solid rgba(255,60,60,.12)", cursor:"pointer" }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(255,80,80,.6)" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          <span style={{ fontSize:13, fontWeight:700, color:"rgba(255,80,80,.6)" }}>Çıxış</span>
        </div>
      </div>

      <BottomNav active="profile" onHome={onBack} onRoom={onEnterRoom} onProfile={() => {}}/>

      {/* AVATAR TAM EKRAN */}
      {showAvatarFull && (
        <div style={{ position:"fixed", inset:0, zIndex:1000, background:"rgba(0,0,0,.92)", backdropFilter:"blur(16px)", display:"flex", alignItems:"center", justifyContent:"center" }}
          onClick={() => setShowAvatarFull(false)}>
          <button style={{ position:"absolute", top:"max(20px,env(safe-area-inset-top))", right:20, width:40, height:40, borderRadius:"50%", background:"rgba(255,255,255,.1)", border:"1px solid rgba(255,255,255,.15)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", zIndex:2 }}
            onClick={() => setShowAvatarFull(false)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
          <div style={{ width:280, height:280, borderRadius:"50%", background:"conic-gradient(#ffd700,#ff8c00,#c084fc,#7b2ff7,#ffd700)", padding:4, boxShadow:"0 0 60px rgba(123,47,247,.4)" }}
            onClick={e => e.stopPropagation()}>
            <div style={{ width:"100%", height:"100%", borderRadius:"50%", background:"#1a0035", overflow:"hidden", display:"flex", alignItems:"center", justifyContent:"center", fontSize:80, fontWeight:900, color:"#fff" }}>
              {avatarPreview
                ? <img src={avatarPreview} style={{ width:"100%", height:"100%", objectFit:"cover" }} alt=""/>
                : (profileData.username[0]?.toUpperCase() || "İ")
              }
            </div>
          </div>
        </div>
      )}

      {/* ZİYARƏTÇİLƏR PANELİ */}
      {visitorOpen && (
        <div style={{ position:"fixed", inset:0, zIndex:998, background:"rgba(0,0,0,.88)", backdropFilter:"blur(10px)" }} onClick={() => setVisitorOpen(false)}>
          <div style={{ position:"absolute", bottom:0, left:0, right:0, maxWidth:430, margin:"0 auto", background:"linear-gradient(180deg,#130028,#0b001e)", borderRadius:"24px 24px 0 0", border:"1px solid rgba(255,255,255,.07)", paddingBottom:"env(safe-area-inset-bottom,16px)", maxHeight:"80vh", display:"flex", flexDirection:"column" }}
            onClick={e => e.stopPropagation()}>
            {/* Handle */}
            <div style={{ display:"flex", justifyContent:"center", padding:"12px 0 0" }}><div style={{ width:36, height:4, borderRadius:2, background:"rgba(255,255,255,.12)" }}/></div>
            {/* Header */}
            <div style={{ padding:"14px 20px 12px", display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
              <div>
                <div style={{ fontSize:16, fontWeight:700, color:"#fff" }}>Profil Ziyarətçiləri</div>
                <div style={{ fontSize:11, color:"rgba(255,255,255,.3)", marginTop:2 }}>Son 7 günün statistikası</div>
              </div>
              <div style={{ textAlign:"right" }}>
                <div style={{ fontSize:26, fontWeight:900, background:"linear-gradient(135deg,#c084fc,#ff3ea5)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>143</div>
                <div style={{ fontSize:10, color:"rgba(192,132,252,.5)" }}>ümumi ziyarət</div>
              </div>
            </div>
            {/* Siyahı */}
            <div style={{ overflowY:"auto", padding:"0 16px 20px", flex:1 }}>
              {visitors.map((v, i) => {
                const isBlurred = userVip === 0;
                return (
                  <div key={i} style={{ position:"relative", marginBottom:8 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 14px", background:"rgba(255,255,255,.03)", border:"1px solid rgba(255,255,255,.05)", borderRadius:16, filter: isBlurred ? "blur(5px)" : "none", pointerEvents: isBlurred ? "none" : "auto" }}>
                      {/* Avatar */}
                      <div style={{ width:44, height:44, borderRadius:"50%", background:v.color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:800, color:"#fff", flexShrink:0 }}>{v.initials}</div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:14, fontWeight:700, color:"#fff", marginBottom:2 }}>{v.name}</div>
                        <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>
                          <span style={{ fontSize:10, color:"rgba(255,255,255,.35)" }}>{v.country}</span>
                          <span style={{ width:3, height:3, borderRadius:"50%", background:"rgba(255,255,255,.2)", display:"inline-block" }}/>
                          <span style={{ fontSize:10, color:"rgba(255,255,255,.35)" }}>{v.time}</span>
                          <span style={{ width:3, height:3, borderRadius:"50%", background:"rgba(255,255,255,.2)", display:"inline-block" }}/>
                          <span style={{ fontSize:10, color:"rgba(192,132,252,.6)" }}>{v.visits}× ziyarət</span>
                        </div>
                      </div>
                      {v.vip > 0
                        ? <div style={{ background:"rgba(255,200,0,.1)", border:"1px solid rgba(255,200,0,.22)", borderRadius:8, padding:"3px 8px", fontSize:10, fontWeight:700, color:"#ffd700", flexShrink:0 }}>VIP{v.vip}</div>
                        : <div style={{ background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.08)", borderRadius:8, padding:"3px 8px", fontSize:10, color:"rgba(255,255,255,.2)", flexShrink:0 }}>VIP0</div>
                      }
                    </div>
                    {/* Blur overlay */}
                    {isBlurred && (
                      <div style={{ position:"absolute", inset:0, borderRadius:16, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(10,0,25,.5)" }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.3)" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* VIP0 — alt CTA */}
              {userVip === 0 && (
                <div style={{ margin:"8px 0 0", padding:"16px", background:"linear-gradient(135deg,rgba(123,47,247,.12),rgba(255,62,165,.08))", border:"1px solid rgba(123,47,247,.2)", borderRadius:20, textAlign:"center" }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(255,200,0,.7)" strokeWidth="2" strokeLinecap="round" style={{ marginBottom:8 }}><path d="M2 8l4 8h12l4-8-5 3-5-7-5 7-5-3z"/></svg>
                  <div style={{ fontSize:14, fontWeight:700, color:"#fff", marginBottom:4 }}>Ziyarət edənləri görmək üçün</div>
                  <div style={{ fontSize:13, color:"rgba(255,200,0,.8)", fontWeight:700, marginBottom:12 }}>VIP 1-ə yüksəlin</div>
                  <button onClick={() => { setVisitorOpen(false); onVip(); }} style={{ background:"linear-gradient(135deg,#ffd700,#ff9500)", border:"none", borderRadius:14, padding:"10px 28px", fontSize:13, fontWeight:800, color:"#2a0e00", cursor:"pointer" }}>
                    VIP-ə keç →
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editOpen && (() => {
        const cities = COUNTRY_CITIES[draft.country] || COUNTRY_CITIES["default"];
        const IcUser = <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.4)" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
        const IcGender = <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.4)" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="8" r="4"/><path d="M20 21v-1a8 8 0 00-16 0v1"/></svg>;
        const IcAge = <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.4)" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
        const IcGlobe = <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.4)" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"/></svg>;
        const IcMap = <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.4)" strokeWidth="2" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>;
        const IcBio = <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.4)" strokeWidth="2" strokeLinecap="round"><line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="17" y1="18" x2="3" y2="18"/></svg>;
        const IcImg = <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.4)" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>;
        const row = (icon: JSX.Element, label: string, right: JSX.Element) => (
          <div style={{ background:"rgba(255,255,255,.03)", border:"1px solid rgba(255,255,255,.06)", borderRadius:16, margin:"0 18px 8px", padding:"14px 18px", display:"flex", alignItems:"center", gap:12 }}>
            {icon}
            <span style={{ fontSize:13, color:"rgba(255,255,255,.45)", flexShrink:0, minWidth:100 }}>{label}</span>
            <div style={{ flex:1, display:"flex", justifyContent:"flex-end" }}>{right}</div>
          </div>
        );
        return (
          <div style={{ position:"fixed", inset:0, zIndex:999, background:"rgba(0,0,0,.9)", backdropFilter:"blur(10px)", overflowY:"auto", WebkitOverflowScrolling:"touch" }}>
            <div style={{ maxWidth:430, margin:"0 auto", paddingBottom:40 }}>
              {/* Header */}
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"max(20px,env(safe-area-inset-top)) 20px 16px" }}>
                <button onClick={() => setEditOpen(false)} style={{ background:"rgba(255,255,255,.07)", border:"1px solid rgba(255,255,255,.1)", borderRadius:12, width:38, height:38, color:"rgba(255,255,255,.6)", fontSize:18, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
                <span style={{ fontSize:16, fontWeight:700, color:"#fff" }}>Profili Düzəlt</span>
                <button onClick={() => { saveProfile(draft); setEditOpen(false); }} style={{ background:"linear-gradient(135deg,#7b2ff7,#ff3ea5)", border:"none", borderRadius:12, padding:"8px 18px", color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer" }}>Saxla</button>
              </div>

              {/* Avatar */}
              {row(IcImg, "Şəkil",
                <div onClick={() => document.getElementById("edit-av-inp")?.click()} style={{ cursor:"pointer", position:"relative" }}>
                  <div style={{ width:52, height:52, borderRadius:"50%", background:"conic-gradient(#ffd700,#c084fc,#7b2ff7,#ffd700)", padding:2 }}>
                    <div id="edit-av-preview" style={{ width:"100%", height:"100%", borderRadius:"50%", background:"#1a0035", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, fontWeight:900, color:"#fff", overflow:"hidden" }}>
                      {draft.username[0]?.toUpperCase()}
                    </div>
                  </div>
                  <div style={{ position:"absolute", bottom:0, right:0, width:18, height:18, borderRadius:"50%", background:"#7b2ff7", border:"2px solid #07000f", display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  </div>
                </div>
              )}
              <input id="edit-av-inp" type="file" accept="image/*" style={{ display:"none" }}
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = ev => {
                    const b64 = String(ev.target?.result || "");
                    if (!b64) return;
                    // Profil cover-ı yenilə
                    const coverImg = document.getElementById("p-cover-img") as HTMLImageElement;
                    if (coverImg) { coverImg.src = b64; coverImg.style.display = "block"; }
                    // Avatar preview
                    const prev = document.getElementById("edit-av-preview");
                    if (prev) { prev.innerHTML = `<img src="${b64}" style="width:100%;height:100%;object-fit:cover;border-radius:50%"/>`; }
                    try { localStorage.setItem("profile_avatar", b64); } catch {}
                    setAvatarPreview(b64);
                  };
                  reader.readAsDataURL(file);
                }}
              />

              {/* İstifadəçi adı */}
              {row(IcUser, "İstifadəçi adı",
                <input value={draft.username} onChange={e => setDraft({...draft, username:e.target.value})}
                  style={{ background:"transparent", border:"none", outline:"none", color:"#fff", fontSize:14, fontWeight:600, textAlign:"right", width:"100%" }} placeholder="Ad daxil edin"/>
              )}

              {/* Cins */}
              {row(IcGender, "Cins",
                <div style={{ display:"flex", gap:6 }}>
                  {[
                    {v:"Kişi", icon:<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="10" cy="14" r="6"/><line x1="16" y1="8" x2="22" y2="2"/><polyline points="18 2 22 2 22 6"/></svg>},
                    {v:"Qadın", icon:<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="8" r="6"/><line x1="12" y1="14" x2="12" y2="21"/><line x1="9" y1="18" x2="15" y2="18"/></svg>},
                    {v:"Digər", icon:<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><line x1="12" y1="2" x2="12" y2="9"/><line x1="12" y1="15" x2="12" y2="22"/><line x1="2" y1="12" x2="9" y2="12"/><line x1="15" y1="12" x2="22" y2="12"/></svg>},
                  ].map(({v, icon}) => (
                    <button key={v} onClick={() => setDraft({...draft, gender:v})} style={{ display:"flex", alignItems:"center", gap:4, padding:"5px 10px", borderRadius:9, border:`1px solid ${draft.gender===v ? "#7b2ff7" : "rgba(255,255,255,.1)"}`, background:draft.gender===v ? "rgba(123,47,247,.25)" : "transparent", color:draft.gender===v ? "#c084fc" : "rgba(255,255,255,.35)", fontSize:11, cursor:"pointer" }}>
                      {icon}{v}
                    </button>
                  ))}
                </div>
              )}

              {/* Yaş */}
              {row(IcAge, "Yaş",
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <button onClick={() => setDraft({...draft, age:Math.max(13,draft.age-1)})} style={{ width:30, height:30, borderRadius:9, border:"1px solid rgba(255,255,255,.12)", background:"rgba(255,255,255,.05)", color:"#fff", fontSize:17, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  </button>
                  <span style={{ fontSize:18, fontWeight:800, color:"#fff", minWidth:32, textAlign:"center" }}>{draft.age}</span>
                  <button onClick={() => setDraft({...draft, age:Math.min(99,draft.age+1)})} style={{ width:30, height:30, borderRadius:9, border:"1px solid rgba(255,255,255,.12)", background:"rgba(255,255,255,.05)", color:"#fff", fontSize:17, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  </button>
                </div>
              )}

              {/* Ölkə */}
              {row(IcGlobe, "Ölkə",
                <select value={draft.country}
                  onChange={e => {
                    const c = e.target.value;
                    const newCities = COUNTRY_CITIES[c] || COUNTRY_CITIES["default"];
                    setDraft({...draft, country:c, city:newCities[0]});
                  }}
                  style={{ background:"#1a0035", border:"1px solid rgba(255,255,255,.1)", borderRadius:9, padding:"4px 8px", outline:"none", color:"#fff", fontSize:13, fontWeight:600, cursor:"pointer", maxWidth:160 }}>
                  {COUNTRIES.map(c => <option key={c} value={c} style={{ background:"#1a0035" }}>{c}</option>)}
                </select>
              )}

              {/* Bölgə — ölkəyə görə */}
              {row(IcMap, "Yaşadığın bölgə",
                <select value={draft.city} onChange={e => setDraft({...draft, city:e.target.value})}
                  style={{ background:"#1a0035", border:"1px solid rgba(255,255,255,.1)", borderRadius:9, padding:"4px 8px", outline:"none", color:"#fff", fontSize:13, fontWeight:600, cursor:"pointer", maxWidth:160 }}>
                  {cities.map(c => <option key={c} value={c} style={{ background:"#1a0035" }}>{c}</option>)}
                </select>
              )}

              {/* Haqqında */}
              <div style={{ background:"rgba(255,255,255,.03)", border:"1px solid rgba(255,255,255,.06)", borderRadius:16, margin:"0 18px 8px", padding:"14px 18px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
                  {IcBio}
                  <span style={{ fontSize:13, color:"rgba(255,255,255,.45)" }}>Haqqında</span>
                </div>
                <textarea value={draft.bio} onChange={e => setDraft({...draft, bio:e.target.value})}
                  rows={3} placeholder="Özün haqqında yaz..."
                  style={{ width:"100%", background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.08)", borderRadius:12, padding:"10px 12px", color:"#fff", fontSize:13, resize:"none", outline:"none", fontFamily:"inherit", lineHeight:1.5 }}/>
              </div>
            </div>
          </div>
        );
      })()}
    </main>
  );
}

/* ─── ROOM ─── */
function RoomScreen({ name, avatarUrl, session, members, muted, myEntrance, onToggleMic, onJoinSeat, onLeaveSeat, onLeave, onOpenChat, onHome, onProfile, error }: any) {
  const speakers = members.filter((m: Member) => !m.is_muted);
  const listeners = members.filter((m: Member) => m.is_muted);
  const emptySeatCount = Math.max(0, 3 - speakers.length);
  const iAmSpeaker = session ? !!members.find((m: Member) => m.user_id === session.user.id && !m.is_muted) : false;
  return (
    <main style={{ background:"#0a0018", minHeight:"100dvh", position:"relative", fontFamily:"'Helvetica Neue',Arial,sans-serif", color:"#fff" }}>
      <style>{`
        .r-scroll{overflow-y:auto;padding:max(16px,env(safe-area-inset-top)) 16px 160px}
        .r-scroll::-webkit-scrollbar{display:none}
      `}</style>
      <div className="r-scroll">
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20 }}>
          <div style={{ width:40, height:40, borderRadius:"50%", background:"#7b2ff7", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:900, color:"#fff", flexShrink:0 }}>V</div>
          <div style={{ flex:1, minWidth:0 }}>
            <p style={{ fontSize:9, letterSpacing:"0.28em", color:"#7b2ff7", textTransform:"uppercase" }}>VELVET · VIP</p>
            <p style={{ fontSize:13, fontWeight:600, color:"#fff", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>Salam, {name}</p>
          </div>
          <button onClick={onLeave} style={{ background:"none", border:"none", cursor:"pointer" }}><MoreHorizontal className="size-5" color="#5a3a7a"/></button>
        </div>
        <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", marginBottom:16 }}>
          <div><p style={{ fontSize:9, letterSpacing:"0.24em", color:"#7b2ff7", textTransform:"uppercase" }}>Gecə Salonu</p><h1 style={{ fontSize:28, fontWeight:900, color:"#fff" }}>Qızıl Saatlar</h1></div>
          <div style={{ display:"flex", alignItems:"center", gap:6, borderRadius:20, border:"1px solid rgba(255,255,255,.1)", padding:"5px 10px", background:"rgba(255,255,255,.04)", fontSize:11, color:"#fff" }}><span style={{ width:6, height:6, borderRadius:"50%", background:"#00d4ff", display:"block" }}/>Canlı · {Math.max(members.length,1)}</div>
        </div>
        <div style={{ background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.08)", borderRadius:16, padding:16, marginBottom:16 }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:14 }}>
            <span style={{ fontSize:9, letterSpacing:"0.2em", color:"#5a3a7a", textTransform:"uppercase" }}>Danışan koltuklar</span>
            <span style={{ fontSize:9, color:"#5a3a7a" }}>{speakers.length} / 6</span>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 }}>
            {speakers.map((m: Member) => (
              <div key={m.user_id} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:6 }}>
                <div style={{ position:"relative", cursor:"pointer" }} onClick={m.user_id === session?.user.id ? onLeaveSeat : undefined}>
                  <div style={{ width:56, height:56, borderRadius:"50%", border:"2px solid rgba(123,47,247,.6)", background:"rgba(123,47,247,.2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, fontWeight:900, color:"#c084fc" }}>{(m.user_id === session?.user.id ? name : "Üzv")[0]}</div>
                  <span style={{ position:"absolute", bottom:-2, right:-2, width:18, height:18, borderRadius:"50%", background:"#7b2ff7", display:"flex", alignItems:"center", justifyContent:"center" }}><Radio size={8} color="white"/></span>
                </div>
                <p style={{ fontSize:10, fontWeight:600, color:"#fff" }}>{m.user_id === session?.user.id ? name.split(" ")[0] : "Üzv"}</p>
              </div>
            ))}
            {Array.from({ length: emptySeatCount }).map((_, i) => (
              <button key={i} onClick={!iAmSpeaker ? onJoinSeat : undefined} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:6, background:"none", border:"none", cursor:iAmSpeaker ? "default" : "pointer" }}>
                <div style={{ width:56, height:56, borderRadius:"50%", border:"2px dashed rgba(123,47,247,.35)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, color:"#7b2ff7" }}>+</div>
                <p style={{ fontSize:10, color:iAmSpeaker ? "#3a2050" : "#7b2ff7" }}>{iAmSpeaker ? "Dolu" : "Qoşul"}</p>
              </button>
            ))}
          </div>
        </div>
        {listeners.length > 0 && (
          <div>
            <p style={{ fontSize:9, letterSpacing:"0.2em", color:"#5a3a7a", textTransform:"uppercase", marginBottom:10 }}>Dinləyicilər · {listeners.length}</p>
            <div style={{ display:"flex", gap:12, overflowX:"auto", paddingBottom:4 }}>
              {listeners.slice(0,8).map((m: Member) => (
                <div key={m.user_id} style={{ flexShrink:0, textAlign:"center" }}>
                  <div style={{ width:42, height:42, borderRadius:"50%", border:"2px solid rgba(123,47,247,.4)", background:"rgba(123,47,247,.15)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:700, color:"#c084fc" }}>{(m.user_id === session?.user.id ? name : "Ü")[0]}</div>
                  <p style={{ fontSize:9, color:"#5a3a7a", marginTop:4 }}>{m.user_id === session?.user.id ? name.split(" ")[0] : "Üzv"}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        {error ? <p style={{ color:"#ff3ea5", fontSize:11, textAlign:"center", marginTop:12 }}>{error}</p> : null}
      </div>
      <div style={{ position:"fixed", bottom:0, left:0, right:0, background:"rgba(10,0,24,.94)", borderTop:"1px solid rgba(123,47,247,.15)", padding:`12px 20px max(${68}px,calc(env(safe-area-inset-bottom) + 68px))`, zIndex:50 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.08)", borderRadius:16, padding:10 }}>
          <button onClick={onToggleMic} style={{ width:44, height:44, borderRadius:12, background:"rgba(255,255,255,.06)", border:"1px solid rgba(255,255,255,.1)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>{muted ? <MicOff size={18} color="#5a3a7a"/> : <Mic size={18} color="#c084fc"/>}</button>
          <button onClick={onToggleMic} style={{ width:52, height:52, borderRadius:50, background:"linear-gradient(135deg,#7b2ff7,#ff3ea5)", border:"2px solid rgba(255,255,255,.2)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}><Mic size={22} color="white"/></button>
          <button onClick={onOpenChat} style={{ width:44, height:44, borderRadius:12, background:"rgba(255,255,255,.06)", border:"1px solid rgba(255,255,255,.1)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}><MessageCircle size={18} color="#5a3a7a"/></button>
          <button style={{ width:44, height:44, borderRadius:12, background:"rgba(255,255,255,.06)", border:"1px solid rgba(255,255,255,.1)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}><Users size={18} color="#5a3a7a"/></button>
          <button onClick={onLeave} style={{ width:44, height:44, borderRadius:12, background:"rgba(255,60,60,.15)", border:"1px solid rgba(255,60,60,.3)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}><X size={18} color="#ff4444"/></button>
        </div>
      </div>
      <BottomNav active="room" onHome={onHome} onRoom={() => {}} onProfile={onProfile}/>
    </main>
  );
}

/* ─── CHAT ─── */
function ChatPanel({ session, displayName, avatarUrl, onClose }: { session: Session; displayName: string; avatarUrl: string | null; onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    supabase.from("messages").select("*").eq("room_id", ROOM_ID).order("created_at", { ascending: true }).limit(50).then(({ data }) => { if (data) setMessages(data as Message[]); });
    const ch = supabase.channel(`chat-${ROOM_ID}`).on("postgres_changes", { event:"INSERT", schema:"public", table:"messages", filter:`room_id=eq.${ROOM_ID}` }, p => setMessages(prev => [...prev, p.new as Message])).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:"smooth" }); }, [messages]);
  const send = async () => {
    if (!text.trim()) return;
    await supabase.from("messages").insert({ room_id: ROOM_ID, user_id: session.user.id, display_name: displayName, avatar_url: avatarUrl, content: text.trim() });
    setText("");
  };
  return (
    <div style={{ position:"fixed", inset:0, zIndex:150, display:"flex", flexDirection:"column", background:"rgba(7,0,15,.98)" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:`max(16px,env(safe-area-inset-top)) 20px 14px`, borderBottom:"1px solid rgba(123,47,247,.15)" }}>
        <p style={{ fontSize:18, fontWeight:800, color:"#fff" }}>Söhbət</p>
        <button onClick={onClose} style={{ width:36, height:36, borderRadius:12, background:"rgba(255,255,255,.06)", border:"1px solid rgba(255,255,255,.1)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}><X size={16} color="rgba(255,255,255,.5)"/></button>
      </div>
      <div style={{ flex:1, overflowY:"auto", padding:"16px 20px" }}>
        {messages.length === 0 && <p style={{ textAlign:"center", color:"#5a3a7a", fontSize:13, marginTop:40 }}>Hələ mesaj yoxdur.</p>}
        {messages.map(msg => {
          const isMe = msg.user_id === session.user.id;
          return (
            <div key={msg.id} style={{ display:"flex", gap:10, flexDirection: isMe ? "row-reverse" : "row", marginBottom:14 }}>
              <div style={{ width:32, height:32, borderRadius:"50%", background:"rgba(123,47,247,.3)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, color:"#c084fc", flexShrink:0 }}>{msg.display_name[0]}</div>
              <div style={{ maxWidth:"70%", display:"flex", flexDirection:"column", gap:3, alignItems: isMe ? "flex-end" : "flex-start" }}>
                {!isMe && <p style={{ fontSize:10, color:"#5a3a7a" }}>{msg.display_name}</p>}
                <div style={{ borderRadius:16, padding:"8px 14px", fontSize:13, background: isMe ? "linear-gradient(135deg,#7b2ff7,#ff3ea5)" : "rgba(255,255,255,.06)", border: isMe ? "none" : "1px solid rgba(255,255,255,.08)", color:"#fff" }}>{msg.content}</div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef}/>
      </div>
      <div style={{ borderTop:"1px solid rgba(123,47,247,.15)", padding:`12px 16px max(12px,env(safe-area-inset-bottom))` }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.08)", borderRadius:24, padding:"8px 16px" }}>
          <input style={{ flex:1, background:"transparent", border:"none", outline:"none", fontSize:14, color:"#fff" }} placeholder="Mesaj yaz…" value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === "Enter" && send()}/>
          <button onClick={send} style={{ width:34, height:34, borderRadius:"50%", background:"linear-gradient(135deg,#7b2ff7,#ff3ea5)", border:"none", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", flexShrink:0 }}><Send size={14} color="white"/></button>
        </div>
      </div>
    </div>
  );
}

/* ─── VIP SCREEN ─── */
const VIP_LEVELS = [
  {n:0,req:0,next:2000},{n:1,req:2000,next:4500},{n:2,req:4500,next:8000},
  {n:3,req:8000,next:14000},{n:4,req:14000,next:22000},{n:5,req:22000,next:34000},
  {n:6,req:34000,next:50000},{n:7,req:50000,next:72000},{n:8,req:72000,next:100000},
  {n:9,req:100000,next:135000},{n:10,req:135000,next:175000},{n:11,req:175000,next:225000},
  {n:12,req:225000,next:285000},{n:13,req:285000,next:355000},{n:14,req:355000,next:440000},
  {n:15,req:440000,next:540000},{n:16,req:540000,next:660000},{n:17,req:660000,next:null},
] as const;

const CURRENT_EXP = 587000;

function fmtExp(n: number) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(n >= 10000 ? 0 : 1) + "K";
  return String(n);
}

function VipShieldLogo({ size = 58 }: { size?: number }) {
  const h = Math.round(size * 136 / 120);
  return (
    <svg width={size} height={h} viewBox="0 0 120 136" style={{ filter:"drop-shadow(0 0 12px rgba(255,200,0,.5))" }}>
      <defs>
        <linearGradient id="vsg_out" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a07800"/><stop offset="20%" stopColor="#ffd700"/>
          <stop offset="40%" stopColor="#ffe566"/><stop offset="60%" stopColor="#ffd700"/>
          <stop offset="80%" stopColor="#cc9900"/><stop offset="100%" stopColor="#886600"/>
        </linearGradient>
        <linearGradient id="vsg_body" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1e1e1e"/><stop offset="40%" stopColor="#2a2a2a"/>
          <stop offset="70%" stopColor="#222222"/><stop offset="100%" stopColor="#111111"/>
        </linearGradient>
        <linearGradient id="vsg_gold" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fff8c0"/><stop offset="25%" stopColor="#ffd700"/>
          <stop offset="60%" stopColor="#cc9900"/><stop offset="100%" stopColor="#886600"/>
        </linearGradient>
        <linearGradient id="vsg_vip" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fff8d0"/><stop offset="35%" stopColor="#ffd700"/>
          <stop offset="70%" stopColor="#cc8800"/><stop offset="100%" stopColor="#886600"/>
        </linearGradient>
        <linearGradient id="vsg_shine" x1="0%" y1="0%" x2="60%" y2="100%">
          <stop offset="0%" stopColor="rgba(255,255,255,.18)"/><stop offset="100%" stopColor="rgba(255,255,255,0)"/>
        </linearGradient>
        <filter id="vsg_shadow"><feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="rgba(0,0,0,.7)"/></filter>
        <filter id="vsg_gg"><feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="rgba(255,200,0,.5)"/></filter>
        <filter id="vsg_blur"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      <path d="M60 4 C60 4 14 18 10 22 L10 72 C10 102 60 132 60 132 C60 132 110 102 110 72 L110 22 C106 18 60 4 60 4Z" fill="url(#vsg_out)" filter="url(#vsg_shadow)"/>
      <path d="M60 12 C60 12 20 24 17 27 L17 72 C17 98 60 124 60 124 C60 124 103 98 103 72 L103 27 C100 24 60 12 60 12Z" fill="url(#vsg_body)"/>
      <path d="M60 18 C60 18 24 29 22 32 L22 72 C22 95 60 118 60 118 C60 118 98 95 98 72 L98 32 C96 29 60 18 60 18Z" fill="none" stroke="url(#vsg_out)" strokeWidth="2.5"/>
      <path d="M60 22 C60 22 26 32 24 35 L24 72 C24 93 60 114 60 114 C60 114 96 93 96 72 L96 35 C94 32 60 22 60 22Z" fill="rgba(255,220,50,.03)" opacity=".6"/>
      <path d="M50 14 L50 128" stroke="rgba(255,255,255,.04)" strokeWidth="18"/>
      <g filter="url(#vsg_gg)" transform="translate(60,38)">
        <path d="M-22 14 L-26 0 L-14 9 L0 -10 L14 9 L26 0 L22 14Z" fill="url(#vsg_gold)"/>
        <rect x="-22" y="14" width="44" height="6" rx="3" fill="url(#vsg_gold)"/>
        <rect x="-22" y="14" width="44" height="2.5" rx="1.2" fill="rgba(255,255,200,.3)"/>
        <circle cx="0" cy="-11" r="4" fill="#ff3060" filter="url(#vsg_blur)"/>
        <circle cx="-1.2" cy="-12.2" r="1.5" fill="rgba(255,200,220,.7)"/>
        <circle cx="-14" cy="9" r="3" fill="#4090ff" filter="url(#vsg_blur)"/>
        <circle cx="14" cy="9" r="3" fill="#4090ff" filter="url(#vsg_blur)"/>
        <circle cx="-26" cy="0" r="2.5" fill="#ffd700"/>
        <circle cx="26" cy="0" r="2.5" fill="#ffd700"/>
      </g>
      <text x="60" y="90" textAnchor="middle" fontSize="32" fontWeight="900" letterSpacing="2" fill="url(#vsg_vip)" fontFamily="Arial,sans-serif" filter="url(#vsg_gg)">VIP</text>
      <g filter="url(#vsg_gg)">
        <path d="M42 104 L43.5 109 L49 109 L44.5 112 L46 117 L42 114 L38 117 L39.5 112 L35 109 L40.5 109Z" fill="url(#vsg_gold)" opacity=".9"/>
        <path d="M60 104 L61.5 109 L67 109 L62.5 112 L64 117 L60 114 L56 117 L57.5 112 L53 109 L58.5 109Z" fill="url(#vsg_gold)"/>
        <path d="M78 104 L79.5 109 L85 109 L80.5 112 L82 117 L78 114 L74 117 L75.5 112 L71 109 L76.5 109Z" fill="url(#vsg_gold)" opacity=".9"/>
      </g>
      <path d="M18 22 Q30 15 50 18 L46 50 Q28 42 18 30 Z" fill="url(#vsg_shine)" opacity=".7"/>
    </svg>
  );
}

function VipLevelIcon({ n, state }: { n: number; state: "done" | "active" | "locked" }) {
  const c = state === "done" ? "rgba(80,200,80,.8)" : state === "active" ? "#ffd700" : "rgba(255,255,255,.2)";
  const icons: Record<number, JSX.Element> = {
    0: <svg width="20" height="20" viewBox="0 0 52 52"><defs><radialGradient id={`ig0`} cx="40%" cy="30%" r="70%"><stop offset="0%" stopColor={state==="done"?"#a0e0ff":state==="active"?"#ffe080":"#888"}/><stop offset="100%" stopColor={state==="done"?"#2060b0":state==="active"?"#a06000":"#444"}/></radialGradient></defs><ellipse cx="26" cy="28" rx="14" ry="17" fill={`url(#ig0)`}/><ellipse cx="20" cy="22" rx="4" ry="2.5" fill="rgba(255,255,255,.4)" transform="rotate(-30,20,22)"/><path d="M22 20 L24 24 L21 27 L25 32" stroke="rgba(255,255,255,.5)" strokeWidth="1.2" fill="none" strokeLinecap="round"/></svg>,
    1: <svg width="20" height="20" viewBox="0 0 52 52"><defs><linearGradient id={`ig1`} x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor={state==="done"?"#e8a060":state==="active"?"#ffe080":"#888"}/><stop offset="100%" stopColor={state==="done"?"#7a3a10":state==="active"?"#a06000":"#333"}/></linearGradient></defs><path d="M26 8 L40 14 L40 26 C40 34 33 40 26 44 C19 40 12 34 12 26 L12 14 Z" fill={`url(#ig1)`}/><ellipse cx="20" cy="18" rx="5" ry="2.5" fill="rgba(255,255,255,.25)" transform="rotate(-30,20,18)"/><text x="26" y="30" textAnchor="middle" fontSize="13" fontWeight="900" fill="rgba(255,255,200,.8)" fontFamily="Arial">I</text></svg>,
    2: <svg width="20" height="20" viewBox="0 0 52 52"><defs><linearGradient id={`ig2`} x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#ffe566"/><stop offset="100%" stopColor={state==="done"?"#cc4400":"#886600"}/></linearGradient></defs><path d="M30 8 L18 26 L24 26 L22 44 L34 22 L28 22 Z" fill={`url(#ig2)`}/><path d="M28 12 L20 26 L25 26 L23 38 L31 24 L26 24 Z" fill="rgba(255,240,180,.4)"/></svg>,
    3: <svg width="20" height="20" viewBox="0 0 52 52"><defs><linearGradient id={`ig3`} x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#c0e8ff"/><stop offset="100%" stopColor="#2060b0"/></linearGradient></defs><polygon points="26,9 38,17 14,17" fill={c} opacity=".9"/><polygon points="38,17 32,43 14,17 20,43" fill={`url(#ig3)`}/><polygon points="26,11 35,17 26,17" fill="rgba(255,255,255,.5)"/></svg>,
    4: <svg width="20" height="20" viewBox="0 0 52 52"><defs><radialGradient id={`ig4`} cx="50%" cy="60%" r="50%"><stop offset="0%" stopColor="#fff060"/><stop offset="60%" stopColor="#ff8000"/><stop offset="100%" stopColor="#660000"/></radialGradient></defs><path d="M26 44 C16 38 10 28 14 18 C16 24 20 22 20 16 C22 22 18 28 22 32 C22 26 26 20 24 12 C28 18 30 26 28 32 C30 28 34 24 32 18 C36 26 36 34 30 40 C28 42 26 44 26 44Z" fill={`url(#ig4)`}/><ellipse cx="26" cy="28" rx="5" ry="6" fill="rgba(255,255,200,.25)"/></svg>,
    5: <svg width="20" height="20" viewBox="0 0 52 52"><defs><linearGradient id={`ig5`} x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#fff0a0"/><stop offset="60%" stopColor="#ffd700"/><stop offset="100%" stopColor="#886600"/></linearGradient></defs><polygon points="26,6 29.8,17.8 42,17.8 32.2,24.8 36,36.4 26,29.8 16,36.4 19.8,24.8 10,17.8 22.2,17.8" fill={`url(#ig5)`}/><polygon points="26,7 29,17 22,17" fill="rgba(255,255,200,.6)"/></svg>,
    6: <svg width="20" height="20" viewBox="0 0 52 52"><defs><radialGradient id={`ig6`} cx="35%" cy="30%" r="70%"><stop offset="0%" stopColor="#a060ff"/><stop offset="100%" stopColor="#200060"/></radialGradient></defs><ellipse cx="26" cy="28" rx="14" ry="18" fill={`url(#ig6)`}/><path d="M18 22 Q21 18 24 22 Q21 26 18 22Z" fill="rgba(180,100,255,.6)"/><path d="M24 18 Q27 14 30 18 Q27 22 24 18Z" fill="rgba(180,100,255,.6)"/><path d="M30 22 Q33 18 36 22 Q33 26 30 22Z" fill="rgba(180,100,255,.6)"/><ellipse cx="22" cy="26" rx="2" ry="2.5" fill="rgba(0,200,255,.9)"/><ellipse cx="30" cy="26" rx="2" ry="2.5" fill="rgba(0,200,255,.9)"/></svg>,
    7: <svg width="20" height="20" viewBox="0 0 52 52"><defs><linearGradient id={`ig7`} x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#fff0a0"/><stop offset="50%" stopColor="#ffd700"/><stop offset="100%" stopColor="#886600"/></linearGradient></defs><path d="M8 38 L8 24 L16 30 L26 12 L36 30 L44 24 L44 38 Z" fill={`url(#ig7)`}/><rect x="8" y="36" width="36" height="5" rx="2" fill={`url(#ig7)`}/><circle cx="26" cy="36.5" r="3" fill="#ff3060"/><circle cx="16" cy="36.5" r="2.5" fill="#4080ff"/><circle cx="36" cy="36.5" r="2.5" fill="#40c060"/><ellipse cx="16" cy="26" rx="4" ry="2" fill="rgba(255,255,200,.25)" transform="rotate(-30,16,26)"/></svg>,
    8: <svg width="20" height="20" viewBox="0 0 52 52"><defs><radialGradient id={`ig8`} cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#60ffff"/><stop offset="70%" stopColor="#0060a0"/><stop offset="100%" stopColor="#001840"/></radialGradient></defs><path d="M6 26 Q16 10 26 10 Q36 10 46 26 Q36 42 26 42 Q16 42 6 26Z" fill="#001840"/><circle cx="26" cy="26" r="12" fill={`url(#ig8)`}/><circle cx="26" cy="26" r="5" fill="rgba(0,10,30,.95)"/><circle cx="22" cy="22" r="3" fill="rgba(200,255,255,.5)"/><line x1="26" y1="26" x2="44" y2="16" stroke="rgba(0,255,255,.7)" strokeWidth="1.5" strokeLinecap="round"/></svg>,
    9: <svg width="20" height="20" viewBox="0 0 52 52"><defs><linearGradient id={`ig9a`} x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#e8f8ff"/><stop offset="100%" stopColor="#2060b8"/></linearGradient><linearGradient id={`ig9b`} x1="100%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#c0e8ff"/><stop offset="100%" stopColor="#1040a0"/></linearGradient></defs><polygon points="14,18 26,9 38,18" fill={`url(#ig9a)`}/><polygon points="14,18 9,30 26,44" fill={`url(#ig9b)`}/><polygon points="38,18 43,30 26,44" fill={`url(#ig9a)`} opacity=".7"/><polygon points="14,18 26,9 26,18" fill="rgba(255,255,255,.4)"/></svg>,
    10: <svg width="20" height="20" viewBox="0 0 52 52"><defs><linearGradient id={`ig10`} x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#e8eef4"/><stop offset="60%" stopColor="#7090a8"/><stop offset="100%" stopColor="#304050"/></linearGradient></defs><path d="M26 7 L42 13 L42 27 C42 36 35 42 26 46 C17 42 10 36 10 27 L10 13 Z" fill={`url(#ig10)`}/><circle cx="26" cy="20" r="4" fill="#60d0ff"/><text x="26" y="35" textAnchor="middle" fontSize="11" fontWeight="900" fill="rgba(220,240,255,.9)" fontFamily="Arial">X</text></svg>,
    11: <svg width="20" height="20" viewBox="0 0 52 52"><defs><linearGradient id={`ig11`} x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#ff8040"/><stop offset="100%" stopColor="#600800"/></linearGradient></defs><path d="M26 7 L42 13 L42 27 C42 36 35 42 26 46 C17 42 10 36 10 27 L10 13 Z" fill={`url(#ig11)`}/><path d="M20 32 C18 28 20 22 22 18 C22 22 24 20 24 16 C26 20 25 26 26 28 C26 24 28 20 28 16 C30 20 30 26 28 30 C30 28 32 24 30 20 C32 26 30 32 26 36 C24 38 20 36 20 32Z" fill="rgba(255,200,60,.5)"/></svg>,
    12: <svg width="20" height="20" viewBox="0 0 52 52"><defs><linearGradient id={`ig12a`} x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#e8c0ff"/><stop offset="100%" stopColor="#400080"/></linearGradient><linearGradient id={`ig12b`} x1="100%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#c080ff"/><stop offset="100%" stopColor="#200060"/></linearGradient></defs><polygon points="14,18 26,9 38,18" fill={`url(#ig12a)`}/><polygon points="14,18 9,30 26,44" fill={`url(#ig12b)`}/><polygon points="38,18 43,30 26,44" fill={`url(#ig12a)`} opacity=".7"/><polygon points="14,18 26,9 26,18" fill="rgba(255,220,255,.4)"/></svg>,
    13: <svg width="20" height="20" viewBox="0 0 52 52"><defs><linearGradient id={`ig13a`} x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#a0ffb0"/><stop offset="100%" stopColor="#006020"/></linearGradient><linearGradient id={`ig13b`} x1="100%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#60e080"/><stop offset="100%" stopColor="#004010"/></linearGradient></defs><polygon points="14,18 26,9 38,18" fill={`url(#ig13a)`}/><polygon points="14,18 9,30 26,44" fill={`url(#ig13b)`}/><polygon points="38,18 43,30 26,44" fill={`url(#ig13a)`} opacity=".7"/><polygon points="14,18 26,9 26,18" fill="rgba(200,255,210,.45)"/></svg>,
    14: <svg width="20" height="20" viewBox="0 0 52 52"><defs><linearGradient id={`ig14a`} x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#ffb0a0"/><stop offset="100%" stopColor="#600000"/></linearGradient><linearGradient id={`ig14b`} x1="100%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#ff6050"/><stop offset="100%" stopColor="#400000"/></linearGradient></defs><polygon points="14,18 26,9 38,18" fill={`url(#ig14a)`}/><polygon points="14,18 9,30 26,44" fill={`url(#ig14b)`}/><polygon points="38,18 43,30 26,44" fill={`url(#ig14a)`} opacity=".7"/><polygon points="14,18 26,9 26,18" fill="rgba(255,220,210,.4)"/></svg>,
    15: <svg width="20" height="20" viewBox="0 0 52 52"><defs><radialGradient id={`ig15`} cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#fff8a0"/><stop offset="50%" stopColor="#ffc000"/><stop offset="100%" stopColor="#cc2000"/></radialGradient></defs><g style={{animation:"vrotate 4s linear infinite",transformOrigin:"26px 26px"}}><ellipse cx="26" cy="10" rx="2" ry="4" fill="#ffb000" opacity=".8"/><ellipse cx="26" cy="42" rx="2" ry="4" fill="#ffb000" opacity=".8"/><ellipse cx="10" cy="26" rx="4" ry="2" fill="#ffb000" opacity=".8"/><ellipse cx="42" cy="26" rx="4" ry="2" fill="#ffb000" opacity=".8"/></g><circle cx="26" cy="26" r="13" fill={`url(#ig15)`}/><ellipse cx="20" cy="20" rx="4" ry="2.5" fill="rgba(255,255,200,.4)" transform="rotate(-30,20,20)"/></svg>,
    16: <svg width="20" height="20" viewBox="0 0 52 52"><defs><radialGradient id={`ig16`} cx="40%" cy="30%" r="70%"><stop offset="0%" stopColor="#9060ff"/><stop offset="100%" stopColor="#100030"/></radialGradient></defs><circle cx="26" cy="26" r="18" fill={`url(#ig16)`}/><circle cx="26" cy="26" r="18" fill="none" stroke="rgba(180,100,255,.5)" strokeWidth="1.5"/><polygon points="26,12 29.8,22.1 40.7,22.1 31.9,28.3 34.8,38.5 26,32.4 17.2,38.5 20.1,28.3 11.3,22.1 22.2,22.1" fill="none" stroke="rgba(180,100,255,.6)" strokeWidth="1"/><circle cx="26" cy="26" r="4" fill="#ff1060"/><circle cx="24.5" cy="24.5" r="1.5" fill="rgba(255,180,200,.5)"/></svg>,
    17: <svg width="22" height="22" viewBox="0 0 52 52"><defs><linearGradient id={`ig17`} x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#fff8b0"/><stop offset="50%" stopColor="#ffd700"/><stop offset="100%" stopColor="#886600"/></linearGradient></defs><path d="M6 44 L6 28 L16 36 L26 12 L36 36 L46 28 L46 44 Z" fill={`url(#ig17)`}/><rect x="6" y="42" width="40" height="5" rx="2.5" fill={`url(#ig17)`}/><circle cx="26" cy="43" r="4" fill="#ff1060"/><circle cx="16" cy="43" r="3" fill="#0060ff"/><circle cx="36" cy="43" r="3" fill="#00c040"/><circle cx="26" cy="12" r="3.5" fill="#ff2060"/><ellipse cx="18" cy="22" rx="5" ry="2.5" fill="rgba(255,255,200,.2)" transform="rotate(-30,18,22)"/></svg>,
  };
  return icons[n] ?? icons[0];
}

function VipScreen({ onBack }: { onBack: () => void }) {
  const CSS = `
    @keyframes vsgGlow{0%,100%{filter:drop-shadow(0 0 6px rgba(200,150,0,.4))}50%{filter:drop-shadow(0 0 22px rgba(255,200,0,.9))}}
    @keyframes vsgShimmer{0%{background-position:-300% 0}100%{background-position:300% 0}}
    @keyframes vsgScan{0%{transform:translateY(-100%)}100%{transform:translateY(800%)}}
    @keyframes vsgStar{0%,100%{opacity:.05}50%{opacity:.14}}
    @keyframes vsgPulse{0%,100%{opacity:.5;transform:scale(1)}50%{opacity:1;transform:scale(1.06)}}
    @keyframes vsgBar{0%,100%{transform:scaleY(.15)}50%{transform:scaleY(1)}}
    @keyframes vsgBlink{0%,100%{opacity:.2;transform:scale(.8)}50%{opacity:.9;transform:scale(1.2)}}
    @keyframes vsgBarD{0%,100%{box-shadow:0 0 5px rgba(80,220,80,.5)}50%{box-shadow:0 0 16px rgba(80,220,80,1)}}
    .vs-scroll{overflow-y:auto;height:100dvh;padding-bottom:40px}
    .vs-scroll::-webkit-scrollbar{display:none}
    .vs-nav{display:flex;align-items:center;justify-content:space-between;padding:max(18px,env(safe-area-inset-top)) 20px 14px}
    .vs-nav-btn{width:38px;height:38px;border-radius:13px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.07);display:flex;align-items:center;justify-content:center;cursor:pointer}
    .vs-card{margin:0 18px 16px;border-radius:24px;overflow:hidden;position:relative}
    .vs-card-bg{display:none}
    .vs-card-stars{position:absolute;inset:0;overflow:hidden;pointer-events:none}
    .vs-card-sheen{position:absolute;inset:0;background:linear-gradient(115deg,transparent 20%,rgba(255,255,255,.015) 38%,rgba(255,255,255,.04) 50%,rgba(255,255,255,.015) 62%,transparent 80%);background-size:300% 100%;animation:vsgShimmer 7s ease-in-out infinite}
    .vs-card-scanw{position:absolute;inset:0;overflow:hidden}
    .vs-card-scan{position:absolute;left:0;right:0;height:40px;background:linear-gradient(180deg,transparent,rgba(255,255,255,.008),transparent);animation:vsgScan 8s linear infinite}
    .vs-card-bd{position:absolute;inset:0;border-radius:24px;border:1px solid rgba(255,255,255,.09)}
    .vs-card-body{position:relative;z-index:3;padding:20px 22px 18px}
    .vs-card-top{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:18px}
    .vs-card-left{display:flex;align-items:center;gap:14px}
    .vs-info-tag{font-size:9px;font-weight:600;letter-spacing:3px;color:rgba(255,255,255,.25);text-transform:uppercase;margin-bottom:4px}
    .vs-info-level{font-size:20px;font-weight:800;color:rgba(90,210,90,.95);letter-spacing:-.3px;line-height:1.1;margin-bottom:8px}
    .vs-active{display:inline-flex;align-items:center;gap:5px;background:rgba(80,200,80,.09);border:1px solid rgba(80,200,80,.22);border-radius:7px;padding:3px 9px}
    .vs-active-dot{width:5px;height:5px;border-radius:50%;background:#50c050;animation:vsgPulse 2s ease-in-out infinite}
    .vs-active-txt{font-size:9px;font-weight:700;color:rgba(80,200,80,.85);letter-spacing:.8px}
    .vs-deer{width:72px;height:72px;flex-shrink:0;animation:vfloat 4s ease-in-out infinite;filter:drop-shadow(0 6px 16px rgba(0,0,0,.6))}
    .vs-divider{height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,.06),transparent);margin-bottom:16px}
    .vs-exp-label{font-size:9px;letter-spacing:2px;color:rgba(255,255,255,.22);text-transform:uppercase;margin-bottom:7px}
    .vs-exp-row{display:flex;align-items:baseline;gap:7px;margin-bottom:11px}
    .vs-exp-n{font-size:26px;font-weight:800;color:#fff;letter-spacing:-.5px}
    .vs-exp-u{font-size:11px;color:rgba(255,255,255,.3)}
    .vs-exp-h{font-size:10px;color:rgba(200,155,0,.65)}
    .vs-bar-track{height:5px;background:rgba(255,255,255,.055);border-radius:3px;overflow:visible;position:relative;margin-bottom:8px}
    .vs-bar-fill{height:100%;border-radius:3px;background:linear-gradient(90deg,#1e6e1e,#3eae3e,#70e070);position:relative;transition:width 2.5s ease-out}
    .vs-lvl-row{display:flex;justify-content:space-between}
    .vs-lvl{font-size:9px;color:rgba(255,255,255,.18)}
    .vs-lvl-g{color:rgba(80,200,80,.4)}
    /* Velvet anim */
    .vs-vanim{margin:0 18px 20px;border-radius:20px;overflow:hidden;position:relative;height:72px;background:#08001a}
    .vs-va-bg{position:absolute;inset:0;background:linear-gradient(135deg,#08001c,#12002e,#08001c)}
    .vs-va-g1{position:absolute;width:160px;height:160px;top:-80px;left:15px;border-radius:50%;background:radial-gradient(circle,rgba(123,47,247,.2) 0%,transparent 70%);animation:vsgPulse 3.5s ease-in-out infinite}
    .vs-va-g2{position:absolute;width:130px;height:130px;top:-65px;right:25px;border-radius:50%;background:radial-gradient(circle,rgba(255,62,165,.14) 0%,transparent 70%);animation:vsgPulse 3.5s ease-in-out infinite .8s}
    .vs-va-center{position:absolute;inset:0;display:flex;align-items:center;justify-content:center}
    .vs-va-logo{position:relative;width:50px;height:50px;display:flex;align-items:center;justify-content:center}
    .vs-va-r1{position:absolute;inset:0;border-radius:50%;border:1.5px solid rgba(192,132,252,.2);animation:vrotate 9s linear infinite}
    .vs-va-r2{position:absolute;inset:6px;border-radius:50%;border:1px dashed rgba(255,62,165,.14);animation:vsgShimmer 6s linear infinite}
    .vs-va-v{width:30px;height:30px;border-radius:50%;background:linear-gradient(135deg,#1e003e,#320068);border:1.5px solid rgba(123,47,247,.5);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:900;color:#fff;font-style:italic}
    .vs-va-bars{position:absolute;right:22px;top:50%;transform:translateY(-50%);display:flex;align-items:flex-end;gap:2.5px;height:32px}
    .vs-va-bar{width:4px;border-radius:2px;transform-origin:bottom}
    .vs-va-stars{position:absolute;left:18px;top:50%;transform:translateY(-50%);display:flex;flex-direction:column;gap:7px}
    .vs-vstar{font-size:9px;animation:vsgBlink ease-in-out infinite}
    .vs-va-bd{position:absolute;inset:0;border-radius:20px;border:1px solid rgba(123,47,247,.2)}
    /* Road */
    .vs-road-hdr{padding:0 20px 14px;display:flex;align-items:center;gap:12px}
    .vs-rh-line{flex:1;height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,.06),transparent)}
    .vs-rh-title{font-size:10px;font-weight:700;letter-spacing:3px;color:rgba(255,255,255,.2);text-transform:uppercase;white-space:nowrap}
    .vs-road{padding:0 18px 8px}
    .vs-conn{margin-left:20px;height:10px;display:flex;align-items:center}
    .vs-conn-line{width:2px;height:100%;border-radius:1px}
    .vs-item{display:flex;align-items:center;gap:14px;padding:10px 14px;border-radius:16px;margin-bottom:2px}
    .vs-item.done{background:rgba(80,200,80,.03)}
    .vs-item.active{background:rgba(255,200,0,.05);border:1px solid rgba(255,200,0,.1)}
    .vs-circle{width:42px;height:42px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;position:relative}
    .vs-circle.done{background:rgba(80,200,80,.1);border:1.5px solid rgba(80,200,80,.3)}
    .vs-circle.active{background:rgba(255,200,0,.1);border:2px solid rgba(255,200,0,.6);box-shadow:0 0 18px rgba(255,200,0,.18)}
    .vs-circle.locked{background:rgba(255,255,255,.025);border:1.5px solid rgba(255,255,255,.07)}
    .vs-chk{position:absolute;bottom:-2px;right:-2px;width:15px;height:15px;border-radius:50%;background:linear-gradient(135deg,#30b030,#50d050);border:2px solid #07000f;display:flex;align-items:center;justify-content:center}
    .vs-crown{position:absolute;top:-10px;left:50%;transform:translateX(-50%)}
    .vs-info{flex:1;min-width:0}
    .vs-name{font-size:13px;font-weight:700;margin-bottom:4px;display:flex;align-items:center;gap:6px}
    .vs-name.done{color:rgba(255,255,255,.7)}.vs-name.active{color:#fff}.vs-name.locked{color:rgba(255,255,255,.2)}
    .vs-cur-tag{font-size:8px;font-weight:600;background:rgba(255,200,0,.15);color:rgba(255,200,0,.8);border:1px solid rgba(255,200,0,.2);border-radius:5px;padding:1px 6px;letter-spacing:.5px}
    .vs-bar-t{height:3px;background:rgba(255,255,255,.05);border-radius:2px;overflow:hidden;margin-bottom:4px}
    .vs-bar-f{height:100%;border-radius:2px}
    .vs-sub{display:flex;justify-content:space-between;align-items:center}
    .vs-badge{display:inline-flex;align-items:center;gap:4px;padding:4px 10px;border-radius:8px;font-size:9px;font-weight:700;white-space:nowrap;flex-shrink:0}
    .vs-badge.done{background:rgba(80,200,80,.08);color:rgba(80,200,80,.65);border:1px solid rgba(80,200,80,.14)}
    .vs-badge.active{background:rgba(255,200,0,.1);color:#ffd700;border:1px solid rgba(255,200,0,.25)}
    .vs-badge.locked{background:rgba(255,255,255,.03);color:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.06)}
  `;

  return (
    <main style={{ background:"#07000f", minHeight:"100dvh", fontFamily:"'Helvetica Neue',Arial,sans-serif" }}>
      <style>{CSS}</style>
      <div className="vs-scroll">
        {/* NAV */}
        <div className="vs-nav">
          <div className="vs-nav-btn" onClick={onBack}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.5)" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          </div>
          <span style={{ fontSize:17, fontWeight:700, color:"#fff" }}>Mənim VIP-im</span>
          <div className="vs-nav-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.3)" strokeWidth="2"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>
          </div>
        </div>

        {/* HERO CARD */}
        <div className="vs-card">
          <img src="/images/images/vip.png" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", borderRadius:24, opacity:1, zIndex:0 }} alt=""/>
          <div className="vs-card-stars">
            <svg style={{ position:"absolute", left:-8, bottom:10, animation:"vsgStar 3s infinite" }} width="140" height="140" viewBox="0 0 100 100"><path d="M50 5L61 35L95 35L67 57L79 91L50 70L21 91L33 57L5 35L39 35Z" fill="rgba(255,255,255,.065)"/></svg>
            <svg style={{ position:"absolute", right:72, top:12, animation:"vsgStar 3.5s infinite .7s" }} width="88" height="88" viewBox="0 0 100 100"><path d="M50 5L61 35L95 35L67 57L79 91L50 70L21 91L33 57L5 35L39 35Z" fill="rgba(255,255,255,.04)"/></svg>
            <svg style={{ position:"absolute", right:4, bottom:12, animation:"vsgStar 2.8s infinite 1.2s" }} width="48" height="48" viewBox="0 0 100 100"><path d="M50 5L61 35L95 35L67 57L79 91L50 70L21 91L33 57L5 35L39 35Z" fill="rgba(255,255,255,.05)"/></svg>
          </div>
          <div className="vs-card-sheen"/>
          <div className="vs-card-scanw"><div className="vs-card-scan"/></div>
          <div className="vs-card-bd"/>
          <div className="vs-card-body">
            <div className="vs-card-top">
              <div className="vs-card-left">
                {/* Shield Logo */}
                <div style={{ animation:"vsgGlow 3s ease-in-out infinite", flexShrink:0 }}>
                  <VipShieldLogo size={58}/>
                </div>
                <div>
                  <div className="vs-info-tag">Velvet VIP</div>
                  <div className="vs-info-level">Səviyyə 17</div>
                  <div className="vs-active">
                    <div className="vs-active-dot"/><span className="vs-active-txt">AKTİV</span>
                  </div>
                </div>
              </div>
              {/* 3D Deer */}
              <svg className="vs-deer" viewBox="0 0 120 120" fill="none">
                <defs>
                  <linearGradient id="vsdbb" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#8ab08a"/><stop offset="55%" stopColor="#608060"/><stop offset="100%" stopColor="#3a5a3a"/></linearGradient>
                  <linearGradient id="vsdff" x1="0%" y1="0%" x2="80%" y2="100%"><stop offset="0%" stopColor="#a0c4a0"/><stop offset="100%" stopColor="#507050"/></linearGradient>
                  <linearGradient id="vsdaa" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#9ab89a"/><stop offset="100%" stopColor="#4a6a4a"/></linearGradient>
                  <filter id="vsdss"><feDropShadow dx="0" dy="3" stdDeviation="5" floodColor="rgba(0,0,0,.55)"/></filter>
                  <filter id="vsdgg"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
                </defs>
                <ellipse cx="60" cy="70" rx="34" ry="11" fill="rgba(0,0,0,.2)"/>
                <polygon points="60,8 96,44 60,80 24,44" fill="none" stroke="rgba(80,160,80,.25)" strokeWidth="1.5" filter="url(#vsdgg)"/>
                <g filter="url(#vsdss)">
                  <path d="M48 40C44 32 39 24 34 18C37 22 39 18 41 14C43 18 43 24 44 30C46 26 49 22 51 18C50 24 48 32 48 40Z" fill="url(#vsdaa)"/>
                  <path d="M48 40C42 34 35 30 29 32C33 28 37 24 42 22C44 28 46 34 48 40Z" fill="url(#vsdaa)"/>
                  <path d="M36 22C32 18 30 13 28 9" stroke="url(#vsdaa)" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
                  <path d="M72 40C76 32 81 24 86 18C83 22 81 18 79 14C77 18 77 24 76 30C74 26 71 22 69 18C70 24 72 32 72 40Z" fill="url(#vsdaa)"/>
                  <path d="M72 40C78 34 85 30 91 32C87 28 83 24 78 22C76 28 74 34 72 40Z" fill="url(#vsdaa)"/>
                  <path d="M84 22C88 18 90 13 92 9" stroke="url(#vsdaa)" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
                </g>
                <ellipse cx="60" cy="64" rx="18" ry="20" fill="url(#vsdbb)" filter="url(#vsdss)"/>
                <ellipse cx="60" cy="62" rx="13" ry="14" fill="url(#vsdff)"/>
                <ellipse cx="53.5" cy="58" rx="3.5" ry="4" fill="#1a2a1a"/>
                <ellipse cx="66.5" cy="58" rx="3.5" ry="4" fill="#1a2a1a"/>
                <ellipse cx="53.5" cy="58" rx="2" ry="2.5" fill="#2d4a2d"/>
                <ellipse cx="66.5" cy="58" rx="2" ry="2.5" fill="#2d4a2d"/>
                <circle cx="55" cy="56.5" r="1.5" fill="rgba(200,240,200,.7)"/>
                <circle cx="68" cy="56.5" r="1.5" fill="rgba(200,240,200,.7)"/>
                <ellipse cx="60" cy="69" rx="4.5" ry="3" fill="rgba(40,60,40,.7)"/>
                <ellipse cx="44.5" cy="48" rx="5.5" ry="8.5" fill="url(#vsdbb)" transform="rotate(-18,44.5,48)"/>
                <ellipse cx="75.5" cy="48" rx="5.5" ry="8.5" fill="url(#vsdbb)" transform="rotate(18,75.5,48)"/>
                <path d="M51 77Q60 83 69 77L67 88Q60 92 53 88Z" fill="url(#vsdbb)"/>
              </svg>
            </div>
            <div className="vs-divider"/>
            <div className="vs-exp-label">TOPLAM TƏCRÜBƏ</div>
            <div className="vs-exp-row">
              <div className="vs-exp-n">2,847</div>
              <div className="vs-exp-u">Exp</div>
              <div className="vs-exp-h">· VIP18 üçün +1,153 lazım</div>
            </div>
            <div className="vs-bar-track">
              <div className="vs-bar-fill" style={{ width:"68%" }}/>
              <div style={{ position:"absolute", left:"68%", top:"50%", transform:"translateY(-50%)", width:11, height:11, borderRadius:"50%", background:"#78e878", border:"2.5px solid #131318", animation:"vsgBarD 2s ease-in-out infinite" }}/>
              {[25,50,75].map(p => <div key={p} style={{ position:"absolute", left:`${p}%`, top:-3, width:1, height:11, background:"rgba(255,255,255,.08)", borderRadius:1 }}/>)}
            </div>
            <div className="vs-lvl-row" style={{ marginTop:8 }}>
              <span className="vs-lvl vs-lvl-g">VIP17 qorunması: 2,400 Exp</span>
              <span className="vs-lvl">VIP18 →</span>
            </div>
          </div>
        </div>

        {/* VELVET ANİM */}
        <div className="vs-vanim">
          <div className="vs-va-bg"/><div className="vs-va-g1"/><div className="vs-va-g2"/>
          <div className="vs-va-stars">
            <span className="vs-vstar" style={{ color:"#ff3ea5", animationDuration:"1.8s" }}>✦</span>
            <span className="vs-vstar" style={{ color:"#c084fc", animationDuration:"2.3s", animationDelay:".6s", fontSize:7 }}>✦</span>
            <span className="vs-vstar" style={{ color:"#00d4ff", animationDuration:"1.6s", animationDelay:"1.1s" }}>✦</span>
          </div>
          <div className="vs-va-center">
            <div className="vs-va-logo">
              <div className="vs-va-r1"/><div className="vs-va-r2"/>
              {/* orbit dots */}
              {[
                { color:"#ff3ea5", delay:"0s" },
                { color:"#c084fc", delay:"1.2s" },
                { color:"#00d4ff", delay:"2.4s" },
              ].map((o, i) => (
                <div key={i} style={{ position:"absolute", top:"50%", left:"50%", width:5, height:5, borderRadius:"50%", background:o.color, marginLeft:-2.5, marginTop:-2.5, boxShadow:`0 0 6px ${o.color}`, animation:`vorbit 3.5s linear infinite ${o.delay}` }}/>
              ))}
              <div className="vs-va-v">V</div>
            </div>
          </div>
          <div className="vs-va-bars">
            {["#ff6b35","#ff3ea5","#c084fc","#7b2ff7","#00d4ff","#ff3ea5","#c084fc"].map((c, i) => (
              <div key={i} className="vs-va-bar" style={{ background:c, height:32, animation:`vsgBar .75s ease-in-out infinite ${i * 0.1}s`, transformOrigin:"bottom" }}/>
            ))}
          </div>
          <div className="vs-va-bd"/>
        </div>

        {/* VIP YOLU */}
        <div className="vs-road-hdr">
          <div className="vs-rh-line"/><div className="vs-rh-title">VIP Yolu</div><div className="vs-rh-line"/>
        </div>

        <div className="vs-road">
          {VIP_LEVELS.map((lv, i) => {
            const isDone = lv.next !== null && CURRENT_EXP >= lv.next;
            const isActive = !isDone && CURRENT_EXP >= lv.req;
            const st: "done" | "active" | "locked" = isDone ? "done" : isActive ? "active" : "locked";
            const prev = VIP_LEVELS[i - 1]?.req ?? 0;
            const span = lv.next ? lv.next - lv.req : 1;
            const pct = st === "done" ? 100 : st === "active" ? Math.min(100, Math.round((CURRENT_EXP - lv.req) / span * 100)) : 0;
            const barC = st === "done" ? "linear-gradient(90deg,#1e6e1e,#3aae3a)" : st === "active" ? "linear-gradient(90deg,#aa7700,#ffd700,#ffee66)" : "rgba(255,255,255,.04)";
            return (
              <div key={lv.n}>
                {i > 0 && (
                  <div className="vs-conn">
                    <div className="vs-conn-line" style={{ background: st === "done" ? "rgba(80,200,80,.2)" : st === "active" ? "rgba(255,200,0,.2)" : "rgba(255,255,255,.04)" }}/>
                  </div>
                )}
                <div className={`vs-item ${st}`}>
                  <div style={{ position:"relative", flexShrink:0 }}>
                    <div className={`vs-circle ${st}`}>
                      <VipLevelIcon n={lv.n} state={st}/>
                      {st === "done" && (
                        <div className="vs-chk">
                          <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4"><polyline points="20 6 9 17 4 12"/></svg>
                        </div>
                      )}
                      {st === "active" && (
                        <div className="vs-crown">
                          <svg width="16" height="10" viewBox="0 0 16 10">
                            <defs><linearGradient id={`vcr${lv.n}`} x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#ffd700"/><stop offset="100%" stopColor="#cc8800"/></linearGradient></defs>
                            <path d="M1 9L2.5 1L6 5.5L8 0.5L10 5.5L13.5 1L15 9H1Z" fill={`url(#vcr${lv.n})`}/>
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="vs-info">
                    <div className={`vs-name ${st}`}>
                      VIP {lv.n}
                      {lv.n === 0 && <span style={{ fontSize:10, fontWeight:400, color:"rgba(255,255,255,.3)" }}>· Başlanğıc</span>}
                      {st === "active" && <span className="vs-cur-tag">CARİ</span>}
                    </div>
                    <div className="vs-bar-t"><div className="vs-bar-f" style={{ width:`${pct}%`, background:barC }}/></div>
                    <div className="vs-sub">
                      {st === "done" && <span style={{ fontSize:9, color:"rgba(80,200,80,.5)" }}>✓ Tamamlandı</span>}
                      {st === "active" && <span style={{ fontSize:9, color:"rgba(255,200,0,.6)" }}>{fmtExp(CURRENT_EXP)} / {fmtExp(lv.next ?? lv.req)} Exp</span>}
                      {st === "locked" && <span style={{ fontSize:9, color:"rgba(255,255,255,.15)" }}>{fmtExp(lv.req)} Exp lazım</span>}
                      <span style={{ fontSize:9, color:"rgba(255,255,255,.15)" }}>{lv.req > 0 ? fmtExp(lv.req) + " Exp" : "Başlanğıc"}</span>
                    </div>
                  </div>
                  <div className={`vs-badge ${st}`}>
                    {st === "done" ? "✓ Keçildi" : st === "active" ? "★ Aktiv" : lv.n === 0 ? "Başlanğıc" : "Kilidli"}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}

/* ─── VIP ENTRANCE ─── */
function VipEntrance({ name }: { name: string }) {
  return (
    <div style={{ position:"fixed", inset:0, zIndex:200, background:"rgba(7,0,15,.96)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", animation:"vfadeIn .3s ease" }}>
      <VelvetMascot size={130}/>
      <p style={{ fontSize:10, fontWeight:700, letterSpacing:"0.4em", color:"#ff3ea5", textTransform:"uppercase", marginTop:16 }}>VELVET VIP</p>
      <h2 style={{ fontSize:32, fontWeight:900, color:"#fff", marginTop:8, textAlign:"center" }}>Qızıl Qapılar Açılır</h2>
      <p style={{ fontSize:13, color:"#5a3a7a", marginTop:10, textAlign:"center" }}>{name}, işıqlar sənin üçün yanır.</p>
      <div style={{ width:120, height:1, background:"rgba(123,47,247,.5)", marginTop:24 }}/>
    </div>
  );
}
