// @ts-nocheck — imported prototype contains intentionally loose backend response shapes.
import { ClientOnly, createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { BadgeHelp, CalendarDays, ChevronRight, Crown, DoorOpen, Gift, LogOut, Medal, MessageCircle, Mic, MicOff, Minimize2, MoreHorizontal, PackageOpen, Plus, Power, Radio, Send, Settings, ShieldCheck, ShoppingBag, Trophy, UserPlus, Users, WalletCards, X } from "lucide-react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
const roomBackground = "/images/images/velvet-room-bg.JPG";
const dominoArtwork = "/images/images/domino-4d.JPG";
const homeHeader = "/images/images/home-header.JPG";
import { Button } from "@/components/ui/button";
import { useVoiceRoom } from "@/hooks/use-voice-room";

const ROOM_ID = "11111111-1111-4111-8111-111111111111";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Velvet — Sosial səsli söhbət" },
      { name: "description", content: "Velvet sosial səsli söhbət tətbiqi" },
      { property: "og:title", content: "Velvet — Sosial səsli söhbət" },
      { property: "og:description", content: "Velvet sosial səsli söhbət tətbiqi" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "viewport", content: "width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no, viewport-fit=cover" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
    ],
  }),
  component: VelvetAppClient,
});

function VelvetAppClient() {
  return <ClientOnly fallback={null}><VelvetApp /></ClientOnly>;
}

type Screen = "login" | "home" | "room" | "profile" | "vip";
type Member = { user_id: string; role: string; is_muted: boolean; seat_index?: number | null; display_name?: string | null; avatar_url?: string | null };
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
  const [splash, setSplash] = useState(true);
  const [splashProgress, setSplashProgress] = useState(0);

  const voice = useVoiceRoom(ROOM_ID, session, screen === "room");
  const demoProfile = (() => { try { const p = localStorage.getItem("velvet_profile"); return p ? JSON.parse(p) : null; } catch { return null; } })();
  const displayName = session?.user.user_metadata?.["full_name"] ?? session?.user.email?.split("@")[0] ?? demoProfile?.username ?? "Qonaq";
  const avatarUrl = session?.user.user_metadata?.["avatar_url"] ?? null;

  useEffect(() => {
    let prog = 0;
    const interval = setInterval(() => {
      prog += Math.random() * 18 + 8;
      if (prog >= 100) { prog = 100; clearInterval(interval); setTimeout(() => setSplash(false), 400); }
      setSplashProgress(Math.min(100, prog));
    }, 120);
    return () => clearInterval(interval);
  }, []);



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
    supabase.from("room_members").upsert({ room_id: ROOM_ID, user_id: session.user.id, role: "listener", is_muted: true, seat_index: null, display_name: displayName, avatar_url: avatarUrl }, { onConflict: "room_id,user_id" });
    const load = () => supabase.from("room_members").select("user_id,role,is_muted,seat_index,display_name,avatar_url").eq("room_id", ROOM_ID).then(({ data }) => { if (data) setMembers([...data]); });
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

  // DEMO GİRİŞ — Supabase olmadan birbaşa keçid
  const demoLogin = () => {
    try {
      localStorage.setItem("velvet_demo", "1");
      localStorage.setItem("velvet_screen", "home");
      localStorage.setItem("velvet_profile", JSON.stringify({
        username: "Demo İstifadəçi", gender: "Kişi", age: 22,
        country: "Azərbaycan", city: "Bakı", bio: "Velvet demo hesabı 🎮"
      }));
    } catch {}
    setScreen("home");
  };

  const isDemo = (() => { try { return localStorage.getItem("velvet_demo") === "1"; } catch { return false; } })();
  if (isDemo && screen === "login") { setScreen("home"); }



  const enterRoom = () => { setScreen("room"); };

  const go = (s: Screen) => { setScreen(s); localStorage.setItem("velvet_screen", s); };

  if (splash) return (
    <>
      <style>{GLOBAL_CSS}{`
        @keyframes splashFade{from{opacity:0}to{opacity:1}}
        @keyframes splashOut{from{opacity:1}to{opacity:0}}
        @keyframes barShine{0%{background-position:-200% 0}100%{background-position:200% 0}}
        @keyframes logoFloat{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-8px) scale(1.03)}}
        @keyframes dotBlink{0%,80%,100%{opacity:.2}40%{opacity:1}}
        .splash-wrap{position:fixed;inset:0;z-index:9999;background:#ffffff;display:flex;flex-direction:column;align-items:center;justify-content:center;animation:splashFade .4s ease}
        .splash-logo{animation:logoFloat 3s ease-in-out infinite}
        .splash-bar-track{width:200px;height:4px;background:rgba(100,80,160,.09);border-radius:2px;overflow:hidden;margin-top:48px}
        .splash-bar-fill{height:100%;border-radius:2px;background:linear-gradient(90deg,#7b2ff7,#c084fc,#ff3ea5,#c084fc,#7b2ff7);background-size:200% 100%;animation:barShine 1.5s linear infinite;transition:width .12s ease}
        .splash-text{font-size:11px;color:rgba(60,40,120,.3);letter-spacing:3px;margin-top:16px;text-transform:uppercase}
        .splash-dots span{animation:dotBlink 1.4s ease-in-out infinite}
        .splash-dots span:nth-child(2){animation-delay:.2s}
        .splash-dots span:nth-child(3){animation-delay:.4s}
        .splash-brand{font-size:42px;font-weight:900;letter-spacing:8px;margin-top:20px;background:linear-gradient(135deg,#fff,#c084fc,#ff3ea5);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
      `}</style>
      <div className="splash-wrap" style={{ opacity: splashProgress >= 100 ? 0 : 1, transition:"opacity .4s ease" }}>
        {/* Arxa plan efektləri */}
        <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse at 30% 30%,rgba(123,47,247,.15) 0%,transparent 60%),radial-gradient(ellipse at 70% 70%,rgba(255,62,165,.1) 0%,transparent 60%)" }}/>
        <div style={{ position:"absolute", width:300, height:300, borderRadius:"50%", border:"1px solid rgba(123,47,247,.08)", top:"50%", left:"50%", transform:"translate(-50%,-50%)", animation:"vrp 4s ease-in-out infinite" }}/>
        <div style={{ position:"absolute", width:200, height:200, borderRadius:"50%", border:"1px dashed rgba(192,132,252,.06)", top:"50%", left:"50%", transform:"translate(-50%,-50%)", animation:"vrp 3s ease-in-out infinite .5s" }}/>

        <div style={{ position:"relative", zIndex:2, display:"flex", flexDirection:"column", alignItems:"center" }}>
          {/* Logo/Maskot */}
          <div className="splash-logo">
            <VelvetMascot size={120}/>
          </div>
          {/* Brand adı */}
          <div className="splash-brand">VELVET</div>
          {/* Loading bar */}
          <div className="splash-bar-track">
            <div className="splash-bar-fill" style={{ width:`${splashProgress}%` }}/>
          </div>
          {/* Yüklənir yazısı */}
          <div className="splash-text">
            Yüklənir<span className="splash-dots"><span>.</span><span>.</span><span>.</span></span>
          </div>
        </div>
      </div>
    </>
  );



  if (screen === "login" && !isDemo) return <><style>{GLOBAL_CSS}</style><LoginScreen signIn={signIn} loading={loading} error={error} demoLogin={demoLogin} /></>;
  if (screen === "home" && (session || isDemo)) return <><style>{GLOBAL_CSS}</style><HomeScreen name={displayName} onEnterRoom={() => { enterRoom(); go("room"); }} onProfile={() => go("profile")} /></>;
  if (screen === "profile" && (session || isDemo)) return <><style>{GLOBAL_CSS}</style><ProfileScreen name={displayName} onBack={() => go("home")} onEnterRoom={() => { enterRoom(); go("room"); }} onVip={() => go("vip")} /></>;
  if (screen === "vip" && (session || isDemo)) return <><style>{GLOBAL_CSS}</style><VipScreen onBack={() => go("profile")} /></>;

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <RoomScreen name={displayName} avatarUrl={avatarUrl} session={session} members={members} muted={voice.muted}
        connected={voice.connected}
        onToggleMic={voice.toggleMic}
        onJoinSeat={async (seatIndex: number) => { if (!session) { setError("Canlı konuşma için gerçek hesapla giriş yapın."); return; } if (seatIndex < 0 || seatIndex > 23) { setError("Boş koltuk bulunamadı."); return; } const micReady = await voice.setMic(true); if (!micReady) return; const { error: seatError } = await supabase.from("room_members").upsert({ room_id: ROOM_ID, user_id: session.user.id, role: "speaker", is_muted: false, seat_index: seatIndex, display_name: displayName, avatar_url: avatarUrl }, { onConflict: "room_id,user_id" }); if (seatError) { await voice.setMic(false); setError("Bu koltuk az önce doldu. Başka bir koltuk seçin."); } else setError(""); }}
        onLeaveSeat={async () => { if (!session) return; await supabase.from("room_members").update({ role: "listener", is_muted: true, seat_index: null }).eq("room_id", ROOM_ID).eq("user_id", session.user.id); await voice.setMic(false); }}
        onLeave={() => { if (session) supabase.from("room_members").delete().eq("room_id", ROOM_ID).eq("user_id", session.user.id); setScreen("home"); }}
        onOpenChat={() => setShowChat(true)}
        error={error || voice.error}
      />
      {showChat && <ChatPanel session={session} displayName={displayName} avatarUrl={avatarUrl} onClose={() => setShowChat(false)} />}
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
function LoginScreen({ signIn, loading, error, demoLogin }: { signIn: (p: "google" | "apple") => void; loading: string | null; error: string; demoLogin: () => void }) {
  const [mode, setMode] = useState<"main"|"login"|"register">("main");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [age, setAge] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState("");

  const doLogin = async () => {
    if (!email || !password) { setAuthError("Email və şifrə daxil edin"); return; }
    setAuthLoading(true); setAuthError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setAuthError("Email və ya şifrə yanlışdır");
    setAuthLoading(false);
  };

  const doRegister = async () => {
    if (!email || !password || !username) { setAuthError("Bütün xanaları doldurun"); return; }
    if (password.length < 6) { setAuthError("Şifrə ən az 6 simvol olmalıdır"); return; }
    setAuthLoading(true); setAuthError("");
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: username, age: age || "18" } }
    });
    if (error) setAuthError(error.message);
    else { setAuthSuccess("Hesab yaradıldı! Email-i yoxlayın."); setTimeout(() => setMode("login"), 2000); }
    setAuthLoading(false);
  };

  return (
    <main style={{ background:"#07000f", minHeight:"100dvh", display:"flex", flexDirection:"column", alignItems:"center", padding:`max(32px,env(safe-area-inset-top)) 24px 0`, position:"relative", overflow:"hidden" }}>
      <video autoPlay muted loop playsInline style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", opacity:.25, zIndex:0, pointerEvents:"none" }}>
        <source src="/images/images/giris.mp4" type="video/mp4"/>
      </video>
      <div style={{ position:"absolute", inset:0, background:"linear-gradient(180deg,rgba(7,0,15,.6) 0%,rgba(7,0,15,.3) 50%,rgba(7,0,15,.9) 100%)", zIndex:1, pointerEvents:"none" }}/>
      <style>{`
        .v-orb1{position:absolute;width:280px;height:280px;border-radius:50%;background:#7b2ff7;opacity:.12;top:-70px;left:-70px;pointer-events:none;z-index:2}
        .v-orb2{position:absolute;width:220px;height:220px;border-radius:50%;background:#c084fc;opacity:.08;top:50px;right:-60px;pointer-events:none;z-index:2}
        .v-brand{font-size:clamp(38px,11vw,56px);font-weight:900;letter-spacing:6px;color:#fff;margin-top:10px;line-height:1}
        .v-feats{display:flex;gap:10px;margin-top:18px;margin-bottom:4px;width:100%;justify-content:center}
        .v-feat{display:flex;flex-direction:column;align-items:center;gap:7px}
        .v-feat-icon{width:clamp(44px,12vw,52px);height:clamp(44px,12vw,52px);border-radius:14px;background:rgba(123,47,247,.2);border:1px solid rgba(123,47,247,.35);display:flex;align-items:center;justify-content:center}
        .v-feat-label{font-size:9px;letter-spacing:2px;color:rgba(255,255,255,.5);text-transform:uppercase;font-weight:600}
        .v-bottom{width:calc(100% + 48px);margin-top:24px;padding:22px 24px max(32px,env(safe-area-inset-bottom));position:relative;overflow:hidden;border-radius:28px 28px 0 0;flex-shrink:0}
        .v-bottom-bg{position:absolute;inset:0;background:linear-gradient(135deg,#16003a,#2a0a55,#1a003a,#0e0025,#250845);background-size:400% 400%;animation:vwave 5s ease infinite}
        .v-rp1{position:absolute;width:220px;height:220px;top:-70px;left:-50px;border-radius:50%;background:radial-gradient(ellipse,rgba(123,47,247,.28) 0%,transparent 65%);animation:vrp 3.5s ease-in-out infinite}
        .v-rp2b{position:absolute;width:180px;height:180px;bottom:-50px;right:-40px;border-radius:50%;background:radial-gradient(ellipse,rgba(255,62,165,.16) 0%,transparent 65%);animation:vrp 3.5s ease-in-out infinite .8s}
        .v-bc{position:relative;z-index:2}
        .v-inp{width:100%;height:50px;border-radius:14px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.07);color:#fff;font-size:15px;padding:0 16px;outline:none;margin-bottom:10px;-webkit-appearance:none}
        .v-inp::placeholder{color:rgba(255,255,255,.3)}
        .v-inp:focus{border-color:rgba(123,47,247,.6);background:rgba(123,47,247,.08)}
        .v-btn{width:100%;height:52px;border-radius:16px;border:none;display:flex;align-items:center;justify-content:center;gap:10px;font-size:15px;font-weight:700;cursor:pointer;margin-bottom:10px;-webkit-appearance:none;appearance:none}
        .v-btn:active{opacity:.85;transform:scale(.98)}
        .v-btn-main{background:linear-gradient(135deg,#7b2ff7,#ff3ea5);color:#fff}
        .v-btn-sec{background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.12);color:rgba(255,255,255,.7)}
        .v-btn-back{background:transparent;border:none;color:rgba(255,255,255,.4);font-size:13px;cursor:pointer;margin-bottom:8px;display:flex;align-items:center;gap:6px}
        .v-terms{font-size:10px;color:rgba(255,255,255,.3);text-align:center;margin-top:12px;line-height:1.8}
        .v-terms a{color:#c084fc;text-decoration:none}
        .v-div{display:flex;align-items:center;gap:12px;width:100%;margin-bottom:14px}
        .v-dl{flex:1;height:1px;background:rgba(255,255,255,.1)}
        .v-dt{font-size:10px;color:rgba(255,255,255,.3);letter-spacing:3px;font-weight:600}
      `}</style>
      <div className="v-orb1"/><div className="v-orb2"/>
      <div style={{ position:"relative", zIndex:2, display:"contents" }}>
        <VelvetMascot size={mode==="main" ? 150 : 90}/>
        <div className="v-brand">VELVET</div>

        {mode === "main" && (
          <>
            <div className="v-feats">
              {[
                { label:"Oyunlar", icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c084fc" strokeWidth="1.8" strokeLinecap="round"><rect x="2" y="6" width="20" height="12" rx="6"/><path d="M8 12h4M10 10v4"/><circle cx="16" cy="11" r="1" fill="#c084fc"/><circle cx="18" cy="13" r="1" fill="#c084fc"/></svg> },
                { label:"Səs", icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c084fc" strokeWidth="1.8" strokeLinecap="round"><path d="M12 2a3 3 0 013 3v7a3 3 0 01-6 0V5a3 3 0 013-3z"/><path d="M19 10a7 7 0 01-14 0"/><line x1="12" y1="19" x2="12" y2="22"/></svg> },
                { label:"VIP", icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c084fc" strokeWidth="1.8" strokeLinecap="round"><path d="M2 8l4 8h12l4-8-5 3-5-7-5 7-5-3z"/></svg> },
                { label:"Söhbət", icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c084fc" strokeWidth="1.8" strokeLinecap="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg> },
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
                <button className="v-btn v-btn-main" onClick={() => setMode("register")}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
                  Qeydiyyatdan keç
                </button>
                <button className="v-btn v-btn-sec" onClick={() => setMode("login")}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
                  Daxil ol
                </button>
                <div className="v-div" style={{marginTop:4}}><div className="v-dl"/><div className="v-dt">YA DA</div><div className="v-dl"/></div>
                <button className="v-btn" style={{background:"#fff",color:"#000"}} onClick={() => signIn("google")} disabled={!!loading}>
                  <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#EA4335" d="M5.27 9.76A7.08 7.08 0 0 1 12 4.9c1.69 0 3.22.6 4.41 1.57l3.3-3.3A11.95 11.95 0 0 0 12 1C8.41 1 5.24 2.97 3.44 5.88l3.83 2.88z"/><path fill="#34A853" d="M16.04 18.01A7.07 7.07 0 0 1 12 19.1c-2.94 0-5.47-1.79-6.61-4.37l-3.83 2.88A11.97 11.97 0 0 0 12 23c3.05 0 5.88-1.14 8.01-3l-3.97-1.99z"/><path fill="#4A90D9" d="M20.01 12c0-.69-.07-1.36-.18-2H12v3.79h4.51a4 4 0 0 1-1.67 2.56l3.97 1.99C20.45 16.59 21 14.42 21 12z"/><path fill="#FBBC05" d="M5.39 14.73A7.06 7.06 0 0 1 4.9 12c0-.95.17-1.87.49-2.73L1.56 6.39A11.97 11.97 0 0 0 1 12c0 1.93.46 3.75 1.27 5.38l3.12-2.65z"/></svg>
                  {loading === "google" ? "Yüklənir…" : "Google ilə daxil ol"}
                </button>
                <div style={{ display:"flex", alignItems:"center", gap:12, margin:"8px 0 4px" }}>
                  <div style={{ flex:1, height:1, background:"rgba(255,255,255,.08)" }}/>
                  <span style={{ fontSize:10, color:"rgba(255,255,255,.25)", letterSpacing:2 }}>DEMO</span>
                  <div style={{ flex:1, height:1, background:"rgba(255,255,255,.08)" }}/>
                </div>
                <button className="v-btn" style={{ background:"rgba(255,255,255,.06)", border:"1px solid rgba(255,255,255,.1)", color:"rgba(255,255,255,.5)", fontSize:13 }} onClick={demoLogin}>
                  Demo ilə giriş et
                </button>
                <div className="v-terms">Davam etməklə <a href="#">İstifadə Şərtlərini</a> qəbul edirsiniz</div>
              </div>
            </div>
          </>
        )}

        {mode === "login" && (
          <div className="v-bottom" style={{ marginTop:16 }}>
            <div className="v-bottom-bg"/><div className="v-rp1"/><div className="v-rp2b"/>
            <div className="v-bc">
              <button className="v-btn-back" onClick={() => { setMode("main"); setAuthError(""); }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
                Geri
              </button>
              <div className="v-div"><div className="v-dl"/><div className="v-dt">DAXİL OL</div><div className="v-dl"/></div>
              <input className="v-inp" type="email" placeholder="Email ünvanı" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email"/>
              <input className="v-inp" type="password" placeholder="Şifrə" value={password} onChange={e=>setPassword(e.target.value)} autoComplete="current-password" onKeyDown={e=>e.key==="Enter"&&doLogin()}/>
              {authError && <div style={{color:"#ff6090",fontSize:12,textAlign:"center",marginBottom:10}}>{authError}</div>}
              <button className="v-btn v-btn-main" onClick={doLogin} disabled={authLoading}>
                {authLoading ? "Yüklənir..." : "Daxil ol"}
              </button>
              <button className="v-btn v-btn-sec" onClick={()=>{setMode("register");setAuthError("");}}>Hesabım yoxdur → Qeydiyyat</button>
              <div className="v-div" style={{marginTop:14}}><div className="v-dl"/><div className="v-dt">YA DA</div><div className="v-dl"/></div>
              <button className="v-btn" style={{background:"#fff",color:"#000",marginBottom:8}} onClick={() => signIn("google")} disabled={!!loading}>
                <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#EA4335" d="M5.27 9.76A7.08 7.08 0 0 1 12 4.9c1.69 0 3.22.6 4.41 1.57l3.3-3.3A11.95 11.95 0 0 0 12 1C8.41 1 5.24 2.97 3.44 5.88l3.83 2.88z"/><path fill="#34A853" d="M16.04 18.01A7.07 7.07 0 0 1 12 19.1c-2.94 0-5.47-1.79-6.61-4.37l-3.83 2.88A11.97 11.97 0 0 0 12 23c3.05 0 5.88-1.14 8.01-3l-3.97-1.99z"/><path fill="#4A90D9" d="M20.01 12c0-.69-.07-1.36-.18-2H12v3.79h4.51a4 4 0 0 1-1.67 2.56l3.97 1.99C20.45 16.59 21 14.42 21 12z"/><path fill="#FBBC05" d="M5.39 14.73A7.06 7.06 0 0 1 4.9 12c0-.95.17-1.87.49-2.73L1.56 6.39A11.97 11.97 0 0 0 1 12c0 1.93.46 3.75 1.27 5.38l3.12-2.65z"/></svg>
                {loading === "google" ? "Yüklənir…" : "Google ilə daxil ol"}
              </button>
              <div className="v-terms"><a href="#">Şifrəni unutdum?</a></div>
            </div>
          </div>
        )}

        {mode === "register" && (
          <div className="v-bottom" style={{ marginTop:16 }}>
            <div className="v-bottom-bg"/><div className="v-rp1"/><div className="v-rp2b"/>
            <div className="v-bc">
              <button className="v-btn-back" onClick={() => { setMode("main"); setAuthError(""); }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
                Geri
              </button>
              <div className="v-div"><div className="v-dl"/><div className="v-dt">QEYDİYYAT</div><div className="v-dl"/></div>
              <input className="v-inp" type="text" placeholder="İstifadəçi adı" value={username} onChange={e=>setUsername(e.target.value)} autoComplete="username"/>
              <input className="v-inp" type="email" placeholder="Email ünvanı" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email"/>
              <input className="v-inp" type="password" placeholder="Şifrə (min. 6 simvol)" value={password} onChange={e=>setPassword(e.target.value)} autoComplete="new-password"/>
              <input className="v-inp" type="number" placeholder="Yaş" value={age} onChange={e=>setAge(e.target.value)} style={{marginBottom:14}}/>
              {authError && <div style={{color:"#ff6090",fontSize:12,textAlign:"center",marginBottom:10}}>{authError}</div>}
              {authSuccess && <div style={{color:"#50c050",fontSize:12,textAlign:"center",marginBottom:10}}>{authSuccess}</div>}
              <button className="v-btn v-btn-main" onClick={doRegister} disabled={authLoading}>
                {authLoading ? "Yüklənir..." : "Hesab yarat"}
              </button>
              <button className="v-btn v-btn-sec" onClick={()=>{setMode("login");setAuthError("");}}>Artıq hesabım var → Daxil ol</button>
              <div className="v-terms">Qeydiyyatla <a href="#">İstifadə Şərtlərini</a> qəbul edirsiniz</div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

/* ─── NAV BAR ─── */
function BottomNav({ active, onHome, onRoom, onProfile }: { active: Screen; onHome: () => void; onRoom: () => void; onProfile: () => void }) {
  const sw = 1.8;
  const items = [
    { key:"home", label:"Ana səhifə", onTap:onHome, icon:(on:boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill={on?"currentColor":"none"} stroke="currentColor" strokeWidth={sw} strokeLinejoin="round" strokeLinecap="round">
        <path d="M3.5 10.2 12 3.5l8.5 6.7V19a1.5 1.5 0 0 1-1.5 1.5h-4v-6h-6v6H5A1.5 1.5 0 0 1 3.5 19z"/>
      </svg>
    )},
    { key:"games", label:"Oyunlar", onTap:onHome, icon:(on:boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 7h10a4.5 4.5 0 0 1 4.4 3.6l.9 4.9a2.6 2.6 0 0 1-4.5 2.2L15.6 16H8.4l-2.2 1.7a2.6 2.6 0 0 1-4.5-2.2l.9-4.9A4.5 4.5 0 0 1 7 7z" fill={on?"currentColor":"none"}/>
        <path d="M8 10v3M6.5 11.5h3" stroke={on?"#fff":"currentColor"}/>
        <circle cx="15.5" cy="10.8" r=".9" fill={on?"#fff":"currentColor"} stroke="none"/>
        <circle cx="17.3" cy="12.6" r=".9" fill={on?"#fff":"currentColor"} stroke="none"/>
      </svg>
    )},
    { key:"room", label:"Otaq", onTap:onRoom, icon:(on:boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
        <rect x="8.5" y="2.8" width="7" height="12" rx="3.5" fill={on?"currentColor":"none"}/>
        <path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>
      </svg>
    )},
    { key:"messages", label:"Mesajlar", onTap:onHome, badge:"18", icon:(on:boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill={on?"currentColor":"none"} stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.5 11.6c0 4.3-3.8 7.7-8.5 7.7-1.1 0-2.2-.2-3.2-.6L4 20l1.2-3.6a7.3 7.3 0 0 1-1.7-4.8C3.5 7.3 7.3 3.9 12 3.9s8.5 3.4 8.5 7.7z"/>
      </svg>
    )},
    { key:"profile", label:"Profil", onTap:onProfile, icon:(on:boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill={on?"currentColor":"none"} stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4"/>
        <path d="M4.5 20.5c.8-3.7 3.7-5.7 7.5-5.7s6.7 2 7.5 5.7z"/>
      </svg>
    )},
  ];
  return (
    <nav aria-label="Əsas menyu" style={{ position:"fixed", bottom:0, left:0, right:0, zIndex:100, background:"rgba(13,0,30,.92)", backdropFilter:"saturate(1.8) blur(20px)", WebkitBackdropFilter:"saturate(1.8) blur(20px)", borderTop:".5px solid rgba(255,255,255,.1)", display:"flex", paddingBottom:"max(6px,env(safe-area-inset-bottom))" }}>
      <style>{`.bn-it{flex:1;min-width:0;height:54px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;background:none;border:0;padding:0;cursor:pointer;font-family:inherit;transition:color .18s}.bn-it:active .bn-ic{transform:scale(.86)}.bn-ic{position:relative;display:flex;transition:transform .15s}`}</style>
      {items.map(it => {
        const on = active === it.key;
        return (
          <button type="button" key={it.key} className="bn-it" onClick={it.onTap} aria-label={it.label} aria-current={on ? "page" : undefined} style={{ color: on ? "#7b2ff7" : "#8e8e93" }}>
            <span className="bn-ic">
              {it.icon(on)}
              {"badge" in it && it.badge && <span style={{ position:"absolute", top:-4, right:-9, minWidth:17, height:17, padding:"0 4px", borderRadius:9, background:"#ff3b30", color:"#fff", fontSize:10, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", border:"2px solid #07000f" }}>{it.badge}</span>}
            </span>
            <span style={{ fontSize:10, fontWeight: on ? 600 : 500, letterSpacing:.1, whiteSpace:"nowrap" }}>{it.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

/* ─── HOME ─── */
function HomeScreen({ name, onEnterRoom, onProfile }: { name: string; onEnterRoom: () => void; onProfile: () => void }) {
  const [showModal, setShowModal] = useState<"Domino" | "Kart" | null>(null);
  const [slide, setSlide] = useState(0);
  const [roomCat, setRoomCat] = useState(0);
  useEffect(() => { const t = setInterval(() => setSlide(x => (x + 1) % 2), 3500); return () => clearInterval(t); }, []);
  useEffect(() => {
    if (!showModal) return;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setShowModal(false); };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [showModal]);
  return (
    <main style={{ background:"#07000f", minHeight:"100dvh", display:"flex", flexDirection:"column", fontFamily:"'Helvetica Neue',Arial,sans-serif", position:"relative", overflow:"hidden" }}>
      <style>{`
        .h-orb1{position:absolute;width:260px;height:260px;border-radius:50%;background:#7b2ff7;opacity:.09;top:-80px;left:-60px;pointer-events:none}
        .h-orb2{position:absolute;width:200px;height:200px;border-radius:50%;background:#ff3ea5;opacity:.06;top:-20px;right:-40px;pointer-events:none}
        .h-scroll{flex:1;overflow-y:auto;padding-bottom:80px}
        .h-scroll::-webkit-scrollbar{display:none}
        .topbar{position:relative;z-index:20;background-image:linear-gradient(to bottom,rgba(7,0,15,.12) 0%,rgba(7,0,15,.25) 24%,rgba(7,0,15,.72) 64%,#07000f 100%),url("${homeHeader}");background-position:center top;background-size:cover;background-repeat:no-repeat;padding-bottom:40px!important;padding:max(10px,env(safe-area-inset-top)) 16px 12px}
        .tb-row{display:flex;align-items:center;gap:10px;height:44px}
        .tb-user{display:flex;align-items:center;gap:10px;min-width:0;flex:1;background:none;border:0;padding:0;cursor:pointer;text-align:left}
        .tb-user:active{opacity:.7}
        .tb-av{position:relative;width:40px;height:40px;border-radius:50%;padding:2px;background:linear-gradient(135deg,#7b2ff7,#ff3ea5);flex-shrink:0}
        .tb-av-in{width:100%;height:100%;border-radius:50%;background:#1a0035;border:2px solid #1a0035;display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:800;color:#7b2ff7;overflow:hidden}
        .tb-av-in img{width:100%;height:100%;object-fit:cover}
        .tb-dot{position:absolute;right:0;bottom:0;width:11px;height:11px;border-radius:50%;background:#22c55e;border:2px solid #07000f}
        .tb-txt{display:flex;flex-direction:column;min-width:0}
        .tb-hi{font-size:12px;color:#8e8e93;font-weight:500;line-height:1.2}
        .tb-name{font-size:17px;color:#fff;font-weight:700;letter-spacing:-.3px;line-height:1.25;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .tb-coin{display:flex;align-items:center;gap:6px;height:34px;padding:0 4px 0 8px;border-radius:17px;background:rgba(255,255,255,.08);border:0;cursor:pointer;flex-shrink:0}
        .tb-coin:active{transform:scale(.96)}
        .tb-coin img{width:18px;height:18px;object-fit:contain}
        .tb-coin b{font-size:14px;font-weight:700;color:#fff;font-variant-numeric:tabular-nums}
        .tb-plus{width:26px;height:26px;border-radius:50%;background:#7b2ff7;display:flex;align-items:center;justify-content:center}
        .tb-btn{position:relative;width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,.08);border:0;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;color:#fff}
        .tb-btn:active{transform:scale(.92);background:rgba(255,255,255,.14)}
        .tb-badge{position:absolute;top:-2px;right:-3px;min-width:17px;height:17px;padding:0 4px;border-radius:9px;background:#ff3b30;color:#fff;font-size:10px;font-weight:700;display:flex;align-items:center;justify-content:center;border:2px solid #07000f}
        .tb-search{margin-top:10px;height:38px;border-radius:12px;background:rgba(255,255,255,.08);display:flex;align-items:center;gap:8px;padding:0 12px;color:#8e8e93;font-size:15px}
        .tb-search input{flex:1;border:0;background:none;outline:none;font-size:15px;color:#fff;min-width:0}
        .tb-search input::placeholder{color:#8e8e93}
        .quick-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin:20px 16px 24px}
        .quick-item{border:0;background:transparent;padding:0;display:flex;flex-direction:column;align-items:center;gap:8px;color:#fff;cursor:pointer;min-width:0}
        .quick-item:active .quick-icon{transform:scale(.92)}
        .quick-icon{position:relative;width:58px;height:58px;border-radius:19px;display:grid;place-items:center;overflow:hidden;transition:transform .14s ease;box-shadow:0 9px 22px var(--quick-shadow),inset 0 1px 1px rgba(255,255,255,.42),inset 0 -8px 18px rgba(0,0,0,.2);border:1px solid rgba(255,255,255,.24)}
        .quick-icon:before{content:"";position:absolute;inset:1px;border-radius:18px;background:linear-gradient(145deg,rgba(255,255,255,.34),transparent 45%,rgba(0,0,0,.16));pointer-events:none}
        .quick-icon:after{content:"";position:absolute;width:35px;height:13px;border-radius:50%;left:7px;top:4px;background:rgba(255,255,255,.25);filter:blur(5px);transform:rotate(-18deg);pointer-events:none}
        .quick-icon svg{position:relative;z-index:1;filter:drop-shadow(0 2px 2px rgba(0,0,0,.34))}
        .quick-label{max-width:100%;overflow:hidden;text-overflow:ellipsis;font-size:12px;line-height:1.15;font-weight:650;color:rgba(255,255,255,.9);white-space:nowrap}
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
        .dp{position:absolute;background:rgba(10,5,40,.9);border-radius:8px;box-shadow:0 4px 12px rgba(100,80,160,.2)}
        .dp-line{position:absolute;left:0;right:0;height:1.5px;background:rgba(0,0,0,.2);top:50%;transform:translateY(-50%)}
        .dot{position:absolute;width:5px;height:5px;border-radius:50%;background:#1a0030}
        .dom-center{position:absolute;width:48px;height:86px;background:rgba(255,255,255,.96);border-radius:10px;box-shadow:0 8px 24px rgba(100,80,160,.25),0 0 30px rgba(123,47,247,.3);left:50%;top:50%;transform:translate(-50%,-50%) rotate(-4deg)}
        .dom-center .dp-line{height:2px;background:rgba(0,0,0,.15)}
        .dom-online{position:absolute;top:14px;right:14px;display:flex;align-items:center;gap:5px;background:rgba(100,80,160,.25);border:1px solid rgba(0,212,255,.4);border-radius:20px;padding:5px 10px;font-size:10px;color:#00d4ff;font-weight:700}
        .dom-play{position:absolute;bottom:14px;right:14px;width:48px;height:48px;border-radius:50%;background:linear-gradient(135deg,#7b2ff7,#ff3ea5);border:2px solid rgba(80,60,140,.2);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 16px rgba(123,47,247,.5)}
        .dom-players{position:absolute;bottom:18px;left:14px;display:flex;align-items:center;gap:6px}
        .dom-av{width:26px;height:26px;border-radius:50%;border:2px solid rgba(60,40,120,.3)}
        .rooms-row{display:flex;gap:10px;overflow-x:auto;padding-bottom:4px}
        .rooms-row::-webkit-scrollbar{display:none}
        .room-card{flex-shrink:0;width:140px;background:rgba(123,47,247,.1);border:1px solid rgba(123,47,247,.25);border-radius:18px;padding:12px}
        .rc-live{display:flex;align-items:center;gap:4px;margin-bottom:8px}
        .rc-dot{width:5px;height:5px;border-radius:50%;background:#00d4ff;animation:vpulse 1.5s ease-in-out infinite}
        .rc-avs{display:flex;margin-bottom:8px}
        .rc-av{width:26px;height:26px;border-radius:50%;border:2px solid #0a0018;margin-left:-7px}
        .rc-av:first-child{margin-left:0}
         @keyframes dominoHover{0%,100%{transform:translateY(0) scale(1.03)}50%{transform:translateY(-4px) scale(1.07)}}
         .domino-art{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center;animation:dominoHover 4s ease-in-out infinite}
         .game-card{position:relative;height:120px;border-radius:20px;overflow:hidden;padding:12px;text-align:left;color:#fff;box-shadow:0 8px 20px rgba(80,34,140,.24)}
         .game-card:active{transform:scale(.96)}
         .modal-overlay{position:fixed;inset:0;background:rgba(5,1,14,.75);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);z-index:200;display:flex;align-items:center;justify-content:center;padding:20px;animation:vfadeIn .2s ease}
         .modal-box{background:linear-gradient(155deg,#29134a,#110b20 70%);border:1px solid rgba(255,255,255,.2);border-radius:24px;padding:28px 24px 24px;width:min(350px,100%);text-align:center;box-shadow:0 24px 70px rgba(0,0,0,.48);animation:vfadeIn .24s ease;position:relative}
         .modal-confirm{background:linear-gradient(135deg,#7b2ff7,#e535a4);color:#fff;box-shadow:0 6px 20px rgba(123,47,247,.28)}
         .modal-confirm:hover{filter:brightness(1.08)}
         @media(prefers-reduced-motion:reduce){.domino-art{animation:none}.modal-overlay,.modal-box{animation:none}}
      `}</style>
      <div className="h-orb1"/><div className="h-orb2"/>

      {/* TOPBAR */}
      <header className="topbar">
        <div className="tb-row">
          <button type="button" className="tb-av" onClick={onProfile} aria-label="Profil" style={{ border:0, cursor:"pointer" }}>
            <div className="tb-av-in">{(() => { try { const a = localStorage.getItem("profile_avatar"); return a ? <img src={a} alt=""/> : (name.trim()[0]?.toUpperCase() || "V"); } catch { return "V"; } })()}</div>
            <span className="tb-dot"/>
          </button>
          <button type="button" className="tb-coin" aria-label="Jeton yüklə" style={{ marginLeft:6 }}>
            <img src="/images/images/jeton.PNG" alt=""/>
            <b>{(() => { try { return parseInt(localStorage.getItem("velvet_jeton") || "10000").toLocaleString(); } catch { return "0"; } })()}</b>
            <span className="tb-plus"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg></span>
          </button>
          <div style={{ marginLeft:"auto", display:"flex", gap:8 }}>
            <button type="button" className="tb-btn" aria-label="Axtar">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
            </button>
            <button type="button" aria-label="Gündəlik bonus" style={{ width:36, height:36, overflow:"visible", border:0, background:"none", padding:0, cursor:"pointer", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <img src="/images/images/icon.gif" alt="" style={{ width:36, height:36, objectFit:"contain", display:"block", transform:"scale(1.4)", transformOrigin:"center" }}/>
            </button>
          </div>
        </div>
      </header>

      <div className="h-scroll">
        <style>{`
          .hp{transition:transform .14s ease}.hp:active{transform:scale(.96)}
          @keyframes hpBar{0%,100%{transform:scaleY(.25)}50%{transform:scaleY(1)}}
          @keyframes hpShine{0%{transform:translateX(-120%) skewX(-18deg)}100%{transform:translateX(260%) skewX(-18deg)}}
          @keyframes hpFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
          @keyframes hpLive{0%,100%{opacity:1}50%{opacity:.35}}
          .hp-h{display:flex;justify-content:space-between;align-items:center;margin:0 16px 12px}
          .hp-h b{font-size:17px;font-weight:700;color:#fff}
          .hp-h span{font-size:12px;color:rgba(255,255,255,.5)}
          .hp-noscroll::-webkit-scrollbar{display:none}
        `}</style>

        {/* BANNER SLAYDER */}
        {(() => {
          const SL = [
            { img:"/images/images/turnir.JPG", t:"Həftəlik Turnir", s:"Domino çempionatı • 50,000 jeton mükafat", b:"Qoşul", g:"linear-gradient(120deg,#3C3489 0%,#7b2ff7 55%,#ff3ea5 100%)", ic:<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0zM17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"/> },
            { img:"/images/images/vipheftesi.JPG", t:"VIP həftəsi", s:"İlk yükləmədə +30% bonus jeton", b:"Bax", g:"linear-gradient(120deg,#412402 0%,#BA7517 55%,#FAC775 100%)", ic:<path d="M3 8l4 4 5-7 5 7 4-4-2 11H5z"/> },
          ];
          return (
            <div style={{ margin:"-18px 16px 0", position:"relative", height:168, borderRadius:24, overflow:"hidden", zIndex:5 }}>
              <div style={{ display:"flex", height:"100%", transform:`translateX(-${slide*100}%)`, transition:"transform .5s cubic-bezier(.2,.8,.2,1)" }}>
                {SL.map((x, i) => (
                  <div key={i} className="hp" style={{ flex:"0 0 100%", position:"relative", background: x.img ? "#140a24" : x.g, padding:18, overflow:"hidden", cursor:"pointer" }}>
                    {x.img && <img src={x.img} alt="" loading="eager" fetchPriority="high" decoding="async" onLoad={e => { e.currentTarget.style.opacity = "1"; }} style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", zIndex:3, opacity:0, transition:"opacity .35s ease" }}/>}
                    <div style={{ position:"absolute", right:-18, top:-10, width:170, height:170, borderRadius:"50%", background:"radial-gradient(circle,rgba(255,255,255,.22),transparent 65%)" }}/>
                    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ display: x.img ? "none" : "block", position:"absolute", right:16, top:28, opacity:.9, animation:"hpFloat 3s ease-in-out infinite", filter:"drop-shadow(0 6px 14px rgba(0,0,0,.25))" }}>{x.ic}</svg>
                    <div style={{ position:"absolute", inset:0, overflow:"hidden", pointerEvents:"none" }}>
                      <div style={{ position:"absolute", top:0, bottom:0, width:"40%", background:"linear-gradient(90deg,transparent,rgba(255,255,255,.18),transparent)", animation:"hpShine 3.5s ease-in-out infinite" }}/>
                    </div>
                    <div style={{ position:"relative", maxWidth:"62%", display: x.img ? "none" : "block" }}>
                      <div style={{ display:"inline-block", fontSize:10, letterSpacing:1.5, background:"rgba(0,0,0,.25)", padding:"3px 8px", borderRadius:10, marginBottom:10, color:"#fff" }}>YENİ</div>
                      <div style={{ fontSize:21, fontWeight:800, lineHeight:1.15, color:"#fff" }}>{x.t}</div>
                      <div style={{ fontSize:12, color:"rgba(255,255,255,.88)", margin:"6px 0 12px", lineHeight:1.4 }}>{x.s}</div>
                      <span style={{ display:"inline-block", background:"#fff", color:"#1a0035", fontSize:12, fontWeight:700, padding:"7px 16px", borderRadius:16 }}>{x.b} →</span>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ position:"absolute", bottom:10, left:0, right:0, display:"flex", justifyContent:"center", gap:5 }}>
                {SL.map((_, k) => <span key={k} onClick={() => setSlide(k)} style={{ height:6, width: k === slide ? 18 : 6, borderRadius:3, background: k === slide ? "#fff" : "rgba(255,255,255,.45)", transition:".3s", cursor:"pointer" }}/>)}
              </div>
            </div>
          );
        })()}

        {/* SÜRƏTLİ KEÇİD */}
        <div className="quick-grid">
          {[
            { l:"Bonus", from:"#ff7b6d", to:"#ff174d", shadow:"rgba(255,47,90,.38)", icon:<PackageOpen size={29} strokeWidth={2.15}/> },
            { l:"Mağaza", from:"#d170ff", to:"#7c2cff", shadow:"rgba(156,69,255,.4)", icon:<ShoppingBag size={29} strokeWidth={2.15}/> },
            { l:"Reytinq", from:"#ffd257", to:"#f47b0b", shadow:"rgba(255,158,28,.4)", icon:<Trophy size={30} strokeWidth={2.15}/> },
            { l:"Tədbirlər", from:"#5ad8ff", to:"#087ee8", shadow:"rgba(33,169,255,.4)", icon:<CalendarDays size={29} strokeWidth={2.15}/> },
          ].map(q => (
            <button key={q.l} className="quick-item" onClick={q.l === "Mağaza" || q.l === "Bonus" ? onProfile : undefined}>
              <span className="quick-icon" style={{background:`linear-gradient(145deg,${q.from},${q.to})`,"--quick-shadow":q.shadow} as any}>{q.icon}</span>
              <span className="quick-label">{q.l}</span>
            </button>
          ))}
        </div>

        {/* OYUNLAR */}
        <div className="hp-h"><b>Oyunlar</b><span>Hamısı ›</span></div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, margin:"0 16px 26px" }}>
          {[
            { n:"Domino", p:"1.2K", c1:"#7b2ff7", c2:"#3C3489", img:dominoArtwork },
            { n:"Kart", p:"840", c1:"#ff3ea5", c2:"#72243E", img:null },
          ].map(g => (
            <Button type="button" key={g.n} variant="ghost" className="game-card hp w-full" aria-label={`${g.n} — tezliklə`} onClick={() => setShowModal(g.n as "Domino" | "Kart")} style={{ background:g.img ? "#160817" : `linear-gradient(150deg,${g.c1},${g.c2})` }}>
              {g.img
                ? <img className="domino-art" src={g.img} alt="" loading="lazy" width={1024} height={768}/>
                : <div style={{ position:"absolute", right:-10, bottom:-18, width:96, height:96, borderRadius:"50%", background:"rgba(255,255,255,.14)" }}/>}
              <span style={{ position:"absolute", right:10, top:10, fontSize:10, background:"rgba(0,0,0,.28)", padding:"3px 7px", borderRadius:9, color:"#fff" }}>Tezliklə</span>
              <div style={{ position:"absolute", left:12, bottom:12 }}>
                <div style={{ fontSize:16, fontWeight:800, color:"#fff" }}>{g.n}</div>
                <div style={{ fontSize:11, color:"rgba(255,255,255,.88)", display:"flex", alignItems:"center", gap:4 }}>
                  <span style={{ width:6, height:6, borderRadius:"50%", background:"#5DCAA5", animation:"hpLive 1.4s infinite" }}/>{g.p} oynayır
                </div>
              </div>
            </Button>
          ))}
        </div>

        {/* CANLI OTAQLAR */}
        <div className="hp-h"><b>Canlı otaqlar</b><span>Hamısı ›</span></div>
        <div className="hp-noscroll" style={{ display:"flex", gap:8, overflowX:"auto", scrollbarWidth:"none", padding:"0 16px 12px" }}>
          {["Hamısı","🔥 Populyar","🎵 Musiqi","💬 Söhbət","🎮 Oyun"].map((c, k) => (
            <button key={c} onClick={() => setRoomCat(k)} style={{ flexShrink:0, height:32, padding:"0 14px", borderRadius:16, border: k === roomCat ? "0" : ".5px solid rgba(255,255,255,.14)", background: k === roomCat ? "#fff" : "rgba(255,255,255,.05)", color: k === roomCat ? "#1a0035" : "rgba(255,255,255,.78)", fontSize:12, fontWeight: k === roomCat ? 700 : 500, cursor:"pointer" }}>{c}</button>
          ))}
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:10, margin:"0 16px 10px" }}>
          {[
            { n:"Qızıl Saatlar", h:"Aynur", c:"128", tag:"Söhbət", g1:"#7b2ff7", g2:"#ff3ea5" },
            { n:"Gecə Partisi", h:"Rauf", c:"64", tag:"Musiqi", g1:"#0F6E56", g2:"#00d4ff" },
            { n:"VIP Lounge", h:"Sevinc", c:"256", tag:"VIP", g1:"#BA7517", g2:"#FAC775" },
          ].map(r => (
            <div key={r.n} className="hp" onClick={onEnterRoom} style={{ display:"flex", gap:12, padding:10, borderRadius:20, background:"rgba(255,255,255,.045)", border:".5px solid rgba(255,255,255,.08)", cursor:"pointer" }}>
              <div style={{ position:"relative", width:78, height:78, borderRadius:16, flexShrink:0, background:`linear-gradient(140deg,${r.g1},${r.g2})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:26, fontWeight:800, color:"#fff" }}>
                {r.h[0]}
                <span style={{ position:"absolute", left:6, top:6, fontSize:9, fontWeight:700, background:"#ff3b30", padding:"2px 6px", borderRadius:7, letterSpacing:.5 }}>CANLI</span>
                <span style={{ position:"absolute", bottom:7, left:"50%", transform:"translateX(-50%)", display:"flex", alignItems:"flex-end", gap:2, height:14 }}>
                  {[0,1,2,3].map(k => <span key={k} style={{ width:3, height:14, borderRadius:2, background:"#fff", transformOrigin:"bottom", animation:`hpBar .8s ease-in-out infinite ${k*.15}s` }}/>)}
                </span>
              </div>
              <div style={{ flex:1, minWidth:0, display:"flex", flexDirection:"column", justifyContent:"center" }}>
                <div style={{ fontSize:15, fontWeight:700, color:"#fff", marginBottom:3 }}>{r.n}</div>
                <div style={{ fontSize:12, color:"rgba(255,255,255,.55)", marginBottom:8 }}>Aparıcı: {r.h} • #{r.tag}</div>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <div style={{ display:"flex" }}>
                    {["#D4537E","#378ADD","#1D9E75"].map((c, k) => <span key={k} style={{ width:22, height:22, borderRadius:"50%", border:"2px solid #0d0620", marginLeft: k ? -7 : 0, background:c }}/>)}
                  </div>
                  <span style={{ fontSize:12, color:"rgba(255,255,255,.72)", display:"flex", alignItems:"center", gap:3 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M4 14v-2a8 8 0 0 1 16 0v2"/><rect x="3" y="13" width="4" height="6" rx="1.5"/><rect x="17" y="13" width="4" height="6" rx="1.5"/></svg>
                    {r.c}
                  </span>
                </div>
              </div>
              <div style={{ alignSelf:"center", width:36, height:36, borderRadius:"50%", background:"linear-gradient(135deg,#7b2ff7,#ff3ea5)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, boxShadow:"0 4px 12px rgba(123,47,247,.4)" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#fff"><path d="M7 4.5v15l12-7.5z"/></svg>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showModal && (
         <div className="modal-overlay" onClick={() => setShowModal(false)}>
           <div className="modal-box" role="dialog" aria-modal="true" aria-labelledby="game-coming-title" onClick={e => e.stopPropagation()}>
             <Button type="button" variant="ghost" size="icon" aria-label="Bağla" onClick={() => setShowModal(false)} className="absolute right-3 top-3 rounded-full text-white/70 hover:bg-white/10 hover:text-white"><X size={19}/></Button>
             <div style={{ width:78, height:78, borderRadius:18, overflow:"hidden", margin:"0 auto 18px", boxShadow:"0 8px 24px rgba(123,47,247,.32)" }}>{showModal === "Domino" ? <img src={dominoArtwork} alt="" width={1024} height={768} style={{ width:"100%", height:"100%", objectFit:"cover", objectPosition:"73% center" }}/> : <div className="flex h-full w-full items-center justify-center bg-primary text-primary-foreground"><Trophy size={32}/></div>}</div>
             <p style={{ fontSize:11, color:"#dcb9ff", fontWeight:700, marginBottom:8 }}>{showModal.toLocaleUpperCase("az")}</p>
             <h2 id="game-coming-title" style={{ fontSize:23, fontWeight:800, color:"#fff", marginBottom:10 }}>Tezliklə yayımlanacaq</h2>
             <p style={{ fontSize:14, color:"#c9bed7", lineHeight:1.55, marginBottom:24 }}>{showModal} oyunu hazırlanır. Çox yaxında burada oynaya biləcəksiniz.</p>
             <Button type="button" onClick={() => setShowModal(false)} className="modal-confirm h-12 w-full rounded-xl">Bağla</Button>
          </div>
        </div>
      )}

      <BottomNav active="home" onHome={() => {}} onRoom={onEnterRoom} onProfile={onProfile}/>
    </main>
  );
}

/* ─── XİDMƏT ŞƏRTLƏRİ ─── */
const VELVET_TERMS: { t: string; p: string[] }[] = [
 {
  "t": "Qısa xülasə",
  "p": [
   "Bu Xidmət Şərtləri (\"Şərtlər\") siz və Velvet (\"Velvet\", \"biz\") arasında bağlanan hüquqi razılaşmadır. Velvet tətbiqinə, veb saytına, səsli otaqlara, oyunlara və digər xidmətlərə (birlikdə \"Xidmətlər\") daxil olmaqla və ya onlardan istifadə etməklə bu Şərtləri qəbul etmiş olursunuz.",
   "Paylaşdığınız məzmuna görə məsuliyyət sizin üzərinizdədir. Qaydalara zidd məzmun aşkar edildikdə və ya bizə bildirildikdə, onu öz qərarımızla silə bilərik.",
   "Şəxsi məlumatlarınızın necə istifadə edildiyini Məxfilik Siyasətimizdən öyrənə bilərsiniz.",
   "Velvet-dən qanunsuz, aldadıcı, zərərli və ya ayrı-seçkilik xarakterli heç bir məqsəd üçün istifadə etməyəcəyinizi qəbul edirsiniz.",
   "ŞƏRTLƏRLƏ RAZI DEYİLSİNİZSƏ, XİDMƏTLƏRDƏN İSTİFADƏ ETMƏYİN."
  ]
 },
 {
  "t": "1. Xidmət haqqında",
  "p": [
   "Velvet istifadəçilərə səsli otaqlarda ünsiyyət qurmaq, oyun oynamaq, yeni dostlar tapmaq və əyləncəli vaxt keçirmək imkanı verən sosial platformadır. Platformanın təhlükəsiz və mehriban mühit olaraq qalması hər birimiz üçün vacibdir. Buna görə də Xidmətlərdən yalnız məqsədinə uyğun və bu Şərtlərə əməl etməklə istifadə etməlisiniz."
  ]
 },
 {
  "t": "2. Yaş həddi",
  "p": [
   "Velvet-dən istifadə etmək üçün ən azı 18 yaşınız olmalıdır. Qeydiyyat zamanı yaşınızı düzgün göstərməyi öhdənizə götürürsünüz. Yaş həddinə uyğun olmayan hesablar xəbərdarlıq edilmədən bağlana bilər."
  ]
 },
 {
  "t": "3. Məxfilik",
  "p": [
   "Məxfiliyiniz bizim üçün önəmlidir. Hansı məlumatları topladığımızı, necə istifadə etdiyimizi və necə qoruduğumuzu Məxfilik Siyasətində izah etmişik. Xidmətlərdən istifadə etməklə məlumatlarınızın həmin siyasətə uyğun emal olunmasına razılıq verirsiniz."
  ]
 },
 {
  "t": "4. Məzmun paylaşımı",
  "p": [
   "Velvet-də mesaj, şəkil, səs və digər məzmun (\"Məzmun\") paylaşa bilərsiniz. Paylaşdığınız məzmun sizə məxsusdur, lakin aşağıdakıları ehtiva edən məzmun qadağandır:",
   "• söyüş, təhqir, hədə və ya başqalarını narahat edən, alçaldan ifadələr;",
   "• açıq-saçıq, pornoqrafik və insan ləyaqətini alçaldan materiallar;",
   "• irqçilik, cinsi, dini və ya milli ayrı-seçkilik və nifrət təbliği;",
   "• terrorizm, zorakılıq və ya hər hansı qanunsuz fəaliyyətə çağırış;",
   "• böhtan və başqalarının şərəf və ləyaqətini ləkələyən məlumatlar;",
   "• icazəsiz reklam, satış, spam və başqa saytlara yönləndirmə;",
   "• virus, zərərli kod və ya sistemlərin işini pozan hər hansı proqram;",
   "• üçüncü şəxslərin müəllif, əqli mülkiyyət və ya məxfilik hüquqlarını pozan materiallar;",
   "• başqa şəxsin razılığı olmadan onun şəkli, səsi və ya şəxsi məlumatları.",
   "Rəy və təklifləriniz bizim üçün dəyərlidir. Onlardan heç bir öhdəlik və ödəniş olmadan istifadə edə biləcəyimizi qəbul edirsiniz."
  ]
 },
 {
  "t": "5. Başqalarının hüquqlarının qorunması",
  "p": [
   "Başqalarının hüquqlarını pozan və ya Velvet İcma Qaydalarına zidd məzmun paylaşmamalısınız. Bu Şərtləri pozan məzmunu silmək və ya hesabı bloklamaq hüququmuz var.",
   "Başqalarının şəxsiyyət sənədlərini, bank və maliyyə məlumatlarını paylaşmaq qadağandır. İstifadəçilərdən məlumat toplayırsınızsa, onların açıq razılığını almalısınız.",
   "Velvet adından, loqosundan və ticarət nişanlarından yazılı icazəmiz olmadan istifadə edə bilməzsiniz."
  ]
 },
 {
  "t": "6. Qeydiyyat və hesab",
  "p": [
   "Qeydiyyat üçün istifadəçi adı, e-poçt ünvanı və ya Google hesabı tələb olunur. Hesabınızla bağlı aşağıdakıları öhdənizə götürürsünüz:",
   "• yalan şəxsi məlumat verməyəcəksiniz;",
   "• başqası adına hesab yaratmayacaqsınız;",
   "• hesabınızı yazılı icazəmiz olmadan başqasına verməyəcək və satmayacaqsınız;",
   "• şifrənizin təhlükəsizliyinə özünüz cavabdehsiniz.",
   "Qaydaları pozan hesabları dayandırmaq, bağlamaq və ya silmək hüququmuzu saxlayırıq. Bu halda istifadə olunmamış ödənişli xidmətlərin dəyəri geri qaytarılmır."
  ]
 },
 {
  "t": "7. Xidmətin dayandırılması",
  "p": [
   "Bu Şərtləri pozduğunuz və ya bizim üçün hüquqi risk yaratdığınız halda, əvvəlcədən xəbərdarlıq etmədən və heç bir kompensasiya ödəmədən:",
   "• hesabınızı müvəqqəti və ya birdəfəlik bağlaya bilərik;",
   "• IP ünvanı, cihaz və digər texniki vasitələrlə girişinizi məhdudlaşdıra bilərik.",
   "Mümkün olduqda bu barədə sizə məlumat verməyə çalışacağıq, lakin bu bizim öhdəliyimiz deyil."
  ]
 },
 {
  "t": "8. Virtual valyuta (Jeton)",
  "p": [
   "Velvet daxilində istifadə üçün \"Jeton\" adlanan virtual valyuta almaq mümkündür. Jetonlar yalnız tətbiq daxilində çərçivə, giriş animasiyası, hədiyyə və digər xidmətlər üçün istifadə olunur.",
   "Jetonların real pula dəyişdirilməsi, geri qaytarılması və ya başqa hesaba satılması mümkün deyil. Xərcləmə təsdiqləndikdən sonra əməliyyat geri qaytarılmır.",
   "Jetonların qiyməti və məzənnəsi ölkəyə görə fərqlənə bilər və Velvet tərəfindən istənilən vaxt dəyişdirilə bilər. Satınalma anında göstərilən qiyməti qəbul etmiş sayılırsınız.",
   "Paket alışlarında göstərilən 15% bonus və VİP EXP kampaniya şərtlərinə bağlıdır və dəyişdirilə bilər.",
   "Ödəniş üçün istifadə olunan vəsait qanuni yolla əldə edilməlidir. Qaydaları pozduğunuza görə hesabınız bağlandıqda, hesabdakı jetonlar geri qaytarılmır.",
   "Ödənişi bankdan geri çağırmaq (chargeback) və ya əsassız mübahisə açmaq qadağandır. Belə hallarda hesab və cihaz birdəfəlik bloklana, jetonlar isə silinə bilər."
  ]
 },
 {
  "t": "9. VIP statusu və ödənişli xidmətlər",
  "p": [
   "Velvet istifadəçilərə VIP səviyyələri, avatar çərçivələri, giriş animasiyaları və digər ödənişli imkanlar təqdim edir. Bu imkanlar Velvet-ə məxsusdur və sizə yalnız şəxsi, müddətli və başqasına ötürülə bilməyən istifadə hüququ verilir.",
   "VIP səviyyəsi toplanan VİP EXP əsasında hesablanır. Səviyyələrin şərtləri və üstünlükləri Velvet tərəfindən dəyişdirilə bilər.",
   "Müddətli əşyalar (məsələn, 3, 7 və ya 30 günlük çərçivələr) müddət bitdikdə avtomatik olaraq deaktiv olur.",
   "App Store və ya Google Play vasitəsilə edilən ödənişlər həmin platformaların qaydalarına tabedir. Aktivləşdirilmiş ödənişli xidmətlər başqasına ötürülmür və geri qaytarılmır.",
   "Texniki xidmət, yeniləmə və ya nəzarətimizdən kənar səbəblərlə yaranan qısa fasilələrə görə əlavə kompensasiya verilmir."
  ]
 },
 {
  "t": "10. Məzmun üzərində hüquqlar",
  "p": [
   "Paylaşdığınız məzmunun sahibi sizsiniz. Lakin onu Velvet-də paylaşmaqla, Velvet-ə həmin məzmunu Xidmətlər daxilində göstərmək, saxlamaq, formatını dəyişmək və yaymaq üçün pulsuz, qeyri-eksklüziv və dünya üzrə keçərli lisenziya verirsiniz. Şəxsi mesajlarınız Xidmətlərdən kənarda yayılmır.",
   "Velvet-in dizaynı, loqosu, maskotu, proqram təminatı və digər məzmunu Velvet-ə məxsusdur və qanunla qorunur.",
   "Qaydalara zidd məzmunu xəbərdarlıq etmədən silə bilərik. Velvet ehtiyat nüsxə xidməti deyil, buna görə vacib məzmununuzun nüsxəsini özünüz saxlayın."
  ]
 },
 {
  "t": "11. Məsuliyyətin məhdudlaşdırılması",
  "p": [
   "Xidmətlər \"olduğu kimi\" təqdim olunur. Qanunla icazə verilən maksimum həddə Velvet Xidmətlərdən istifadə nəticəsində yaranan birbaşa və ya dolayı zərərlərə, məlumat itkisinə, gəlir itkisinə, virus və texniki nasazlıqlara görə məsuliyyət daşımır.",
   "İstifadəçilərin paylaşdığı məzmuna görə Velvet məsuliyyət daşımır. Qanunsuz fəaliyyət aşkar edildikdə, səlahiyyətli dövlət orqanları ilə qanunvericiliyə uyğun əməkdaşlıq edirik."
  ]
 },
 {
  "t": "12. Təzminat",
  "p": [
   "Xidmətlərdən istifadəniz, bu Şərtləri pozmağınız və ya üçüncü şəxslərin hüquqlarını pozmağınız nəticəsində Velvet-ə qarşı irəli sürülən iddia, zərər və xərcləri (vəkil xərcləri daxil olmaqla) ödəməyi öhdənizə götürürsünüz."
  ]
 },
 {
  "t": "13. Tətbiq olunan qanun",
  "p": [
   "Bu Şərtlər Azərbaycan Respublikasının qanunvericiliyinə uyğun tənzimlənir. Mübahisələr ilk növbədə danışıqlar yolu ilə, razılıq əldə olunmadıqda isə Azərbaycan Respublikasının səlahiyyətli məhkəmələrində həll edilir."
  ]
 },
 {
  "t": "14. Dəyişikliklər",
  "p": [
   "Bu Şərtlərə vaxtaşırı dəyişiklik edə bilərik. Əhəmiyyətli dəyişikliklər barədə tətbiq daxilində məlumat verəcəyik. Dəyişikliklərdən sonra Xidmətlərdən istifadəyə davam etməyiniz yeni Şərtləri qəbul etdiyiniz mənasına gəlir."
  ]
 },
 {
  "t": "15. Əlaqə",
  "p": [
   "Suallarınız üçün Profil → Kömək mərkəzi bölməsindən bizimlə əlaqə saxlaya bilərsiniz."
  ]
 }
];

/* ─── MƏXFİLİK SİYASƏTİ ─── */
const VELVET_PRIVACY: { t: string; p: string[] }[] = [
 {
  "t": "Qısa xülasə",
  "p": [
   "Bu Məxfilik Siyasəti (\"Siyasət\") Velvet tətbiqindən, veb saytından, səsli otaqlarından, oyunlarından və digər xidmətlərindən (birlikdə \"Xidmətlər\") istifadə edərkən şəxsi məlumatlarınızı necə topladığımızı, istifadə etdiyimizi, paylaşdığımızı və qoruduğumuzu izah edir.",
   "Bu Siyasəti Xidmət Şərtləri ilə birlikdə oxumağı tövsiyə edirik. Xidmətlərə daxil olmaqla və ya onlardan istifadə etməklə məlumatlarınızın bu Siyasətə uyğun emal olunmasına razılıq verirsiniz.",
   "Bu Siyasət Azərbaycan Respublikasının \"Fərdi məlumatlar haqqında\" Qanununa və tətbiq olunan digər qanunvericiliyə uyğun hazırlanmışdır.",
   "MƏXFİLİK SİYASƏTİMİZLƏ RAZI DEYİLSİNİZSƏ, XİDMƏTLƏRDƏN İSTİFADƏ ETMƏYİN."
  ]
 },
 {
  "t": "1. Hansı məlumatları toplayırıq",
  "p": [
   "a) Bizə özünüzün verdiyi məlumatlar:",
   "• Qeydiyyat məlumatları: e-poçt ünvanı və şifrə, yaxud Google hesabı ilə girişdə adınız, e-poçtunuz və profil şəkliniz.",
   "• Profil məlumatları: istifadəçi adı, profil və örtük şəkli, cins, yaş, ölkə, şəhər və \"Haqqında\" mətni. Bunların bir hissəsini doldurmaq sizin seçiminizdir.",
   "• Yaratdığınız məzmun: otaq söhbətlərindəki mesajlar, göndərdiyiniz şəkil və digər materiallar.",
   "• Dəstək müraciətləri: Kömək mərkəzi vasitəsilə bizə göndərdiyiniz məlumatlar və şikayətlər.",
   "b) Xidmətlərdən istifadə zamanı avtomatik toplanan məlumatlar:",
   "• Cihaz məlumatları: cihaz modeli, əməliyyat sistemi, brauzer, tətbiq versiyası və IP ünvanı.",
   "• İstifadə məlumatları: daxil olduğunuz otaqlar, istifadə etdiyiniz funksiyalar, giriş vaxtları və profil ziyarətləri.",
   "• Mikrofon: Səsli otaqda danışmaq üçün mikrofon icazəsi tələb olunur. Səs real vaxtda digər iştirakçılara ötürülür və Velvet tərəfindən qeydə alınmır.",
   "• Əməliyyat məlumatları: Jeton, VIP və digər alışların tarixi, məbləği və məhsulu. Bank kartı nömrəsi və ödəniş şifrəsi kimi həssas məlumatları biz saxlamırıq. Onlar ödəniş xidməti təminatçısı (App Store, Google Play və ya digər) tərəfindən emal olunur.",
   "c) Üçüncü tərəflərdən alınan məlumatlar:",
   "• Google ilə daxil olduqda Google hesabınızdakı ad, e-poçt və profil şəkli. Hansı məlumatların ötürülməsi Google hesabınızdakı parametrlərdən asılıdır."
  ]
 },
 {
  "t": "2. Məlumatlardan necə istifadə edirik",
  "p": [
   "• hesab yaratmaq, sizi tanımaq və profilinizi göstərmək;",
   "• səsli otaqlar, söhbət, oyunlar, mağaza və VIP kimi funksiyaları işlətmək;",
   "• ödənişləri emal etmək, Jeton balansını və VIP EXP-ni hesablamaq;",
   "• xidməti təkmilləşdirmək, xətaları aşkar edib düzəltmək;",
   "• saxtakarlığın, spamın və qaydalara zidd davranışların qarşısını almaq;",
   "• şikayət və müraciətlərinizə cavab vermək;",
   "• yeniliklər, kampaniyalar və tədbirlər barədə sizə məlumat vermək.",
   "Tədbir və müsabiqələrdə iştirak etmək sizin seçiminizdir."
  ]
 },
 {
  "t": "3. Məlumatları kimlə paylaşırıq",
  "p": [
   "Şəxsi məlumatlarınızı satmırıq. Məlumatlarınızı yalnız aşağıdakı hallarda paylaşırıq:",
   "• Xidmət təminatçıları: server və verilənlər bazası (məs. Supabase), hostinq (məs. Vercel), analitika və ödəniş xidmətləri. Onlar məlumatlarınızdan yalnız bizə xidmət göstərmək üçün istifadə edə bilərlər.",
   "• Digər istifadəçilər: istifadəçi adınız, profil şəkliniz, ID-niz, VIP səviyyəniz, çərçivəniz, ölkəniz və otaqdakı mesajlarınız başqa istifadəçilərə görünür.",
   "• Qanuni tələblər: qanunvericilik, məhkəmə qərarı və ya səlahiyyətli dövlət orqanlarının qanuni sorğusu olduqda, həmçinin istifadəçilərin təhlükəsizliyini qorumaq üçün.",
   "• Biznes dəyişiklikləri: Velvet birləşdikdə, satıldıqda və ya yenidən təşkil olunduqda, məlumatlar bu Siyasətə uyğun olaraq yeni sahibə ötürülə bilər."
  ]
 },
 {
  "t": "4. Təhlükəsizlik və məlumatların saxlanması",
  "p": [
   "Məlumatlarınızı itki, sui-istifadə və icazəsiz dəyişiklikdən qorumaq üçün şifrələnmiş bağlantı (HTTPS), girişə nəzarət və digər ağlabatan təhlükəsizlik tədbirləri tətbiq edirik.",
   "Lakin heç bir internet ötürülməsi 100% təhlükəsiz deyil. Şifrənizi heç kimlə paylaşmayın və ortaq cihazlarda hesabdan çıxmağı unutmayın. Hesabınızın oğurlandığını düşünürsünüzsə, dərhal bizə bildirin.",
   "Bəzi məlumatlar (məsələn, profil şəkli və parametrlər) cihazınızın yaddaşında (localStorage) saxlanıla bilər. Cihazın yaddaşını təmizlədikdə bu məlumatlar silinir.",
   "Serverlərimiz Azərbaycandan kənarda yerləşə bilər. Bu halda məlumatlarınızın qanunvericiliyə uyğun qorunması üçün lazımi tədbirlər görürük."
  ]
 },
 {
  "t": "5. Hüquqlarınız",
  "p": [
   "• Tanış olmaq: Profil məlumatlarınızı istənilən vaxt görə bilərsiniz. Digər məlumatların surətini əldə etmək üçün bizə müraciət edə bilərsiniz.",
   "• Düzəliş etmək: Profil məlumatlarınızı \"Profili Düzəlt\" bölməsindən dəyişə və ya bizdən düzəliş tələb edə bilərsiniz.",
   "• Silmək: Məlumatlarınızın silinməsini tələb edə bilərsiniz. Qanuni öhdəliklərimiz üçün lazım olan məlumatlar müəyyən müddət saxlanıla bilər.",
   "• Razılığı geri götürmək: Mikrofon, bildiriş və digər icazələri cihaz parametrlərindən istənilən vaxt söndürə bilərsiniz. Bu halda həmin funksiyalar işləməyə bilər.",
   "Hesabınızı silmək üçün: Profil → Parametrlər → Hesabı sil. Hesab silindikdə profiliniz, Jeton balansınız, VIP səviyyəniz, çərçivələriniz və digər əşyalarınız birdəfəlik silinir və geri qaytarılmır. Şəxsiyyətinizi müəyyən etməyən anonim statistik məlumatlar saxlanıla bilər.",
   "Müraciətinizə cavab verməzdən əvvəl şəxsiyyətinizi təsdiqləməyi xahiş edə bilərik. Müraciətlərə ağlabatan müddətdə və qanunvericiliyə uyğun cavab veririk."
  ]
 },
 {
  "t": "6. Uşaqlar",
  "p": [
   "Velvet yalnız 18 yaş və yuxarı istifadəçilər üçündür. 18 yaşından kiçik şəxslərdən bilərəkdən məlumat toplamırıq. Belə hesab aşkar edildikdə bağlanır və məlumatlar silinir. Valideynsinizsə və övladınızın bizə məlumat verdiyini düşünürsünüzsə, bizimlə əlaqə saxlayın."
  ]
 },
 {
  "t": "7. Bu Siyasətdə dəyişikliklər",
  "p": [
   "Bu Siyasəti vaxtaşırı yeniləyə bilərik. Hüquqlarınıza ciddi təsir edən dəyişikliklər barədə tətbiq daxilində bildiriş göndərəcəyik. Ən son yenilənmə tarixi səhifənin yuxarısında göstərilir. Yenilənmədən sonra Xidmətlərdən istifadəyə davam etməyiniz yeni Siyasəti qəbul etdiyiniz mənasına gəlir."
  ]
 },
 {
  "t": "8. Əlaqə",
  "p": [
   "Bu Siyasətlə bağlı suallarınız varsa və ya hüquqlarınızdan istifadə etmək istəyirsinizsə, Profil → Kömək mərkəzi bölməsindən bizimlə əlaqə saxlayın."
  ]
 }
];

/* ─── PROFILE ─── */
const COUNTRY_FLAGS: Record<string,string> = {
  "Azərbaycan":"🇦🇿","Türkiyə":"🇹🇷","Rusiya":"🇷🇺","ABŞ":"🇺🇸","Almaniya":"🇩🇪",
  "Fransa":"🇫🇷","İngiltərə":"🇬🇧","İtaliya":"🇮🇹","İspaniya":"🇪🇸","Hollandiya":"🇳🇱",
  "Belçika":"🇧🇪","Polşa":"🇵🇱","Ukrayna":"🇺🇦","Gürcüstan":"🇬🇪","Qazaxıstan":"🇰🇿",
  "Özbəkistan":"🇺🇿","Türkmənistan":"🇹🇲","İsveçrə":"🇨🇭","Avstriya":"🇦🇹","İsveç":"🇸🇪",
  "Norveç":"🇳🇴","Danimarka":"🇩🇰","Finlandiya":"🇫🇮","Kanada":"🇨🇦","Avstraliya":"🇦🇺",
  "Yaponiya":"🇯🇵","Çin":"🇨🇳","Hindistan":"🇮🇳","Braziliya":"🇧🇷","Argentina":"🇦🇷",
  "Meksika":"🇲🇽","Cənubi Koreya":"🇰🇷","İran":"🇮🇷","Ərəbistan":"🇸🇦","BƏƏ":"🇦🇪",
  "Qatar":"🇶🇦","Küveyt":"🇰🇼","İordaniya":"🇯🇴","Misir":"🇪🇬","Cənubi Afrika":"🇿🇦",
};

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
  const [magazaOpen, setMagazaOpen] = useState(false);
  const [walletOpen, setWalletOpen] = useState(false);
  const [legalPage, setLegalPage] = useState<null|"terms"|"privacy">(null);
  const [copyDone, setCopyDone] = useState(false);
  const [jeton, setJeton] = useState(() => { try { return parseInt(localStorage.getItem("velvet_jeton") || "10000"); } catch { return 10000; } });
  const [selectedFrame, setSelectedFrame] = useState<string|null>(() => { try { return localStorage.getItem("velvet_frame"); } catch { return null; } });
  const [buyDone, setBuyDone] = useState<string|null>(null);
  const [framePopup, setFramePopup] = useState<string|null>(null);
  const [selectedDuration, setSelectedDuration] = useState<3|7|30>(7);
  const [noJetonWarn, setNoJetonWarn] = useState(false);
  const [magazaTab, setMagazaTab] = useState<"cerceve"|"giris">("cerceve");
  const [girisPreview, setGirisPreview] = useState(false);

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
        .p-scroll{overflow-y:auto;padding-bottom:90px;height:100dvh;touch-action:pan-y!important;background:radial-gradient(ellipse at 70% 0%,rgba(123,47,247,.35) 0%,transparent 55%),radial-gradient(ellipse at 20% 60%,rgba(255,62,165,.15) 0%,transparent 50%),#07000f;background-attachment:local}
        .p-scroll::-webkit-scrollbar{display:none}
        .p-hero{position:relative;height:240px;overflow:hidden;flex-shrink:0}
        .p-cover{position:absolute;inset:0;background:linear-gradient(160deg,#7b2ff7 0%,#c084fc 50%,#ff3ea5 100%)}
        .p-fade{position:absolute;bottom:0;left:0;right:0;height:80px;background:linear-gradient(to top,#07000f 0%,transparent 100%);z-index:3}
        .p-mesh{position:absolute;inset:0;background:radial-gradient(ellipse at 20% 50%,rgba(123,47,247,.2) 0%,transparent 55%),radial-gradient(ellipse at 80% 20%,rgba(255,62,165,.15) 0%,transparent 50%);z-index:2}
        .p-ring1{position:absolute;width:320px;height:320px;top:-100px;left:-80px;border-radius:50%;border:1px solid rgba(192,132,252,.06);animation:vrotate 20s linear infinite;z-index:2}
        .p-ring2{position:absolute;width:240px;height:240px;top:-60px;left:-40px;border-radius:50%;border:1px dashed rgba(255,62,165,.05);animation:vrotate 14s linear infinite reverse;z-index:2}
        .p-top{position:absolute;top:0;left:0;right:0;display:flex;align-items:center;justify-content:space-between;padding:max(16px,env(safe-area-inset-top)) 18px 0;z-index:8}
        .p-nb{width:40px;height:40px;border:0;background:none;padding:0;display:flex;align-items:center;justify-content:center;color:#fff;cursor:pointer;filter:drop-shadow(0 1px 3px rgba(0,0,0,.35));transition:transform .14s,opacity .14s}
        .p-nb:active{transform:scale(.88);opacity:.7}
        .p-ibtn{width:38px;height:38px;border-radius:12px;display:flex;align-items:center;justify-content:center;cursor:pointer;border:none;transition:transform .14s ease,filter .14s ease;-webkit-tap-highlight-color:transparent}
        .p-ibtn:active{transform:scale(.88);filter:brightness(.92)}
        .p-upload{position:absolute;bottom:12px;right:14px;z-index:8;display:flex;align-items:center;gap:5px;background:rgba(0,0,0,.55);border:1px solid rgba(160,110,245,.18);border-radius:20px;padding:6px 11px;cursor:pointer}
        .p-av-outer{width:78px;height:78px;border-radius:50%;background:conic-gradient(#ffd700,#ff8c00,#c084fc,#7b2ff7,#ffd700);padding:2.5px;animation:vglow 3s ease-in-out infinite;flex-shrink:0}
        .p-av-inner{width:100%;height:100%;border-radius:50%;background:#1a0035;display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:900;color:#ffffff;overflow:hidden}
        .p-crown{position:absolute;top:-12px;left:50%;transform:translateX(-50%)}
        .p-status{position:absolute;bottom:2px;right:2px;width:14px;height:14px;border-radius:50%;background:#00ff88;border:2.5px solid #07000f}
        .vip-rozet{display:inline-flex;align-items:center;margin:12px 18px 0}
        .p-coin{margin:16px 18px 0;border-radius:22px;overflow:hidden;position:relative;background:#0e0020}
        .p-coin-inner{position:relative;z-index:2;padding:18px 20px;display:flex;align-items:center;gap:16px}
        .p-coin-bg{position:absolute;inset:0;background:radial-gradient(ellipse at 30% 50%,rgba(255,180,0,.12) 0%,transparent 60%),radial-gradient(ellipse at 80% 30%,rgba(123,47,247,.12) 0%,transparent 60%);z-index:1}
        .p-coin-border{position:absolute;inset:0;border-radius:22px;border:1px solid rgba(255,180,0,.2);z-index:3;pointer-events:none}
        .p-coin-shine{position:absolute;inset:0;background:linear-gradient(105deg,transparent 35%,rgba(255,220,100,.05) 50%,transparent 65%);background-size:200% 100%;animation:vshimmer 4s ease-in-out infinite;z-index:2}
        .gem{position:relative;width:56px;height:56px;flex-shrink:0;animation:vcoinPulse 2.5s ease-in-out infinite}
        .p-menu{margin:16px 16px 0}
        .p-ms-title{font-size:11px;letter-spacing:0;color:#ffffff;margin-bottom:12px;padding-left:2px;font-weight:800;text-transform:none}
        .p-menu-section{margin-bottom:18px}
        .p-menu-section-title{font-size:10px;line-height:1.3;color:rgba(233,226,255,.46);font-weight:700;text-transform:uppercase;margin:0 4px 7px;letter-spacing:0}
        .p-menu-list{overflow:hidden;border:1px solid rgba(150,90,240,.1);border-radius:14px;background:rgba(255,255,255,.045);box-shadow:0 4px 16px rgba(0,0,0,.35)}
        .p-mi{width:100%;height:66px;display:flex;align-items:center;gap:12px;padding:0 14px;border-radius:0;cursor:pointer;background:rgba(255,255,255,.045);border:0;box-shadow:none;text-align:left;transition:background .16s ease}
        .p-mi+.p-mi{border-top:1px solid rgba(150,90,240,.075)}
        .p-mi:active{background:rgba(123,47,247,.18)}
        .p-mi-l{width:32px;height:32px;border-radius:9px;display:flex;align-items:center;justify-content:center;flex-shrink:0;color:#fff;box-shadow:inset 0 -1px 0 rgba(0,0,0,.08)}
        .p-mi-copy{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}
        .p-mi-lbl{font-size:13px;line-height:1.25;font-weight:750;color:#ffffff}
        .p-mi-desc{font-size:10px;line-height:1.3;color:rgba(233,226,255,.48);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .p-mi-end{display:flex;align-items:center;gap:8px;flex-shrink:0}
        .p-badge{font-size:9px;line-height:1;font-weight:800;padding:5px 7px;border-radius:6px}
        .p-badge-vip{background:#fff6d8;color:#8c6600;border:1px solid #f1df9a}
        .p-badge-rank{background:#eaf7fb;color:#17718b;border:1px solid #c9eaf2}
        .p-mi-end>svg{color:rgba(150,90,240,.28)}
        .p-logout{width:calc(100% - 32px);height:50px;margin:2px 16px 24px;border-radius:14px;border:.5px solid rgba(150,90,240,.3);background:rgba(255,255,255,.045);color:#ff3b30;box-shadow:0 2px 10px rgba(0,0,0,.35);font-size:15px;font-weight:600;display:flex;align-items:center;justify-content:center;gap:8px}
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
            <button className="p-nb" onClick={onBack} aria-label="Geri">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
            <div style={{ display:"flex", gap:4 }}>
              <button className="p-nb" onClick={() => setVisitorOpen(true)} aria-label="Profil ziyarətçiləri">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>
              </button>
              <button className="p-nb" onClick={() => { setDraft(profileData); setEditOpen(true); }} aria-label="Profili düzəlt">
                <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>
              </button>
            </div>
          </div>
        </div>

        {/* PROFİL MƏLUMATLARI — hero-dan aşağıda, normal axımda */}
        <div style={{ padding:"0 18px", marginTop:-20, position:"relative", zIndex:5 }}>
          <div style={{ display:"flex", alignItems:"flex-end", gap:14, marginBottom:14 }}>
            {/* Avatar */}
            <div style={{ position:"relative", flexShrink:0, width: selectedFrame ? 124 : 82, height: selectedFrame ? 124 : 82, transition:"width .3s,height .3s" }}>
              {/* Qızıl halqa */}
              <div style={{ position:"absolute", inset: selectedFrame ? "15%" : 0, borderRadius:"50%", background: selectedFrame ? "#fff" : "conic-gradient(#ffd700,#ff8c00,#c084fc,#7b2ff7,#ffd700)", padding: selectedFrame ? 1.5 : 2.5, animation:"vglow 3s ease-in-out infinite", zIndex:1 }}>
                <div style={{ width:"100%", height:"100%", borderRadius:"50%", background:"#1a0035", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, fontWeight:900, color:"#ffffff", overflow:"hidden", cursor:"pointer" }}
                  onClick={() => setShowAvatarFull(true)}>
                  {avatarPreview
                    ? <img src={avatarPreview} style={{ width:"100%", height:"100%", objectFit:"cover", borderRadius:"50%" }} alt=""/>
                    : (profileData.username[0]?.toUpperCase() || "İ")
                  }
                </div>
              </div>
              {/* Qanad çərçivəsi — mağazadan alınan, avatarın üstündə */}
              {selectedFrame && (
                <img
                  src={`/images/images/${({ gold:"frame-gold-flap", red:"frame-red-flap", blue:"frame-blue-flap", green:"frame-green-flap", "butterfly-sakura":"frame-butterfly-sakura", "cyber-wings":"frame-cyber-wings", "dragon-obsidian":"frame-dragon-obsidian" } as Record<string,string>)[selectedFrame] || "frame-gold-flap"}.gif`}
                  style={{
                    position:"absolute", inset:0,
                    width:"100%", height:"100%",
                    objectFit:"contain",
                    zIndex:5, pointerEvents:"none",
                    imageRendering:"auto"
                  }}
                  alt=""
                />
              )}
              {/* Online dot */}
              <div style={{ position:"absolute", bottom: selectedFrame ? 22 : 2, right: selectedFrame ? 22 : 2, width:14, height:14, borderRadius:"50%", background:"#00ff88", border:"2.5px solid #07000f", zIndex:6 }}/>
            </div>
            {/* Ad + ID */}
            <div style={{ flex:1, paddingBottom:4 }}>
              <div style={{ fontSize:20, fontWeight:900, color:"#ffffff", marginBottom:4 }}>{profileData.username}</div>
              <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                <span style={{ fontSize:11, color:"rgba(233,226,255,.55)" }}>ID: {userId}</span>
                <button onClick={() => { navigator.clipboard?.writeText(userId).then(() => { setCopyDone(true); setTimeout(() => setCopyDone(false), 1500); }); }}
                  style={{ background:"transparent", border:"none", cursor:"pointer", padding:2, display:"flex", alignItems:"center" }}>
                  {copyDone
                    ? <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#50c050" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                    : <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="rgba(210,195,250,.5)" strokeWidth="2" strokeLinecap="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                  }
                </button>
              </div>
            </div>
          </div>
          {/* Bio */}
          {profileData.bio ? <div style={{ fontSize:12, color:"rgba(233,226,255,.65)", marginBottom:10, lineHeight:1.5 }}>{profileData.bio}</div> : null}
          {/* Meta pillər */}
          <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:4 }}>
            {[
              { icon:<span style={{fontSize:13,lineHeight:1}}>{COUNTRY_FLAGS[profileData.country]||"🌍"}</span>, txt:profileData.country },
              { icon:<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(210,195,250,.4)" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="2"/></svg>, txt:profileData.city },
              { icon:<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(210,195,250,.4)" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>, txt:`${profileData.age} yaş` },
              { icon:<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(210,195,250,.4)" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>, txt:`${joinedDate} gün` },
            ].map((m,i) => (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:4, background:"rgba(160,110,245,.08)", borderRadius:8, padding:"3px 7px" }}>
                {m.icon}<span style={{ fontSize:10, color:"rgba(233,226,255,.65)" }}>{m.txt}</span>
              </div>
            ))}
          </div>
        </div>

        {/* VIP ROZET + adminunvan.gif */}
        <div style={{ display:"flex", alignItems:"center", gap:10, margin:"12px 18px 0" }}>
          {/* viparxaplan.PNG */}
          <div style={{ position:"relative", width:148, height:54, overflow:"hidden", borderRadius:12, flexShrink:0 }}>
            <img src="/images/images/viparxaplan.PNG"
              style={{ position:"absolute", top:0, left:0, height:"100%", width:"160%", objectFit:"cover", objectPosition:"left center" }} alt=""/>
            <img src={`/images/images/VIP${displayVip}.png`}
              style={{ position:"absolute", left:6, top:"50%", transform:"translateY(-50%)", width:42, height:42, objectFit:"contain" }} alt=""/>
            <div style={{ position:"absolute", left:54, top:"50%", transform:"translateY(-50%)" }}>
              <span style={{ fontSize:20, fontWeight:900, letterSpacing:.5, color:"#ffd700", filter:"drop-shadow(0 1px 4px rgba(160,110,245,.35))" }}>VIP {displayVip}</span>
            </div>
          </div>
          {/* adminunvan.gif — viparxaplan-dan bir az böyük, eyni hündürlük */}
          <div style={{ height:62, flexShrink:0 }}>
            <img src="/images/images/adminunvan.gif"
              style={{ height:"100%", width:"auto", objectFit:"contain", display:"block" }} alt=""/>
          </div>
        </div>

        {/* MENU */}
        <div className="p-menu">
          <div className="p-ms-title">Hesabım</div>
          {[
            {
              title:"Hesab və status",
              items:[
                { icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="7" width="18" height="13" rx="3.5"/><path d="M7 7V6a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1"/><path stroke="var(--ac)" d="M15 13.5h2"/></svg>, color:"#34C759", label:"Cüzdanım", description:"Balans və ödənişlər", onClick:() => setWalletOpen(true) },
                { icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l7.5 3v5.5c0 4.5-3.2 8-7.5 9.5-4.3-1.5-7.5-5-7.5-9.5V6z"/><path stroke="var(--ac)" d="M12 8.6l1.1 2.2 2.4.3-1.8 1.6.5 2.4-2.2-1.2-2.2 1.2.5-2.4-1.8-1.6 2.4-.3z"/></svg>, color:"#FF9F0A", label:"VIP", description:"Üstünlüklər və səviyyələr", badge:`VIP ${displayVip}`, badgeClass:"p-badge-vip", onClick:onVip },
                { icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M9 21h6M12 14v7"/><path stroke="var(--ac)" d="M17 6h2.5v1.5A3 3 0 0 1 17 10.5M7 6H4.5v1.5A3 3 0 0 0 7 10.5"/></svg>, color:"#0A84FF", label:"Reytinq", description:"Ümumi sıralamadakı yerin", badge:"#142", badgeClass:"p-badge-rank" },
              ],
            },
            {
              title:"Mağaza və bonuslar",
              items:[
                { icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 8h14l-1.2 11.5a1.5 1.5 0 0 1-1.5 1.5H7.7a1.5 1.5 0 0 1-1.5-1.5z"/><path d="M9 8V7a3 3 0 0 1 6 0v1"/><path stroke="var(--ac)" d="M9.5 13.5c.8 1.2 4.2 1.2 5 0"/></svg>, color:"#AF52DE", label:"Mağaza", description:"Çərçivələr və bəzəklər", onClick:() => setMagazaOpen(true) },
                { icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="9" width="16" height="11" rx="3"/><path d="M3 9h18"/><path stroke="var(--ac)" d="M12 9v11M12 9S10 4.5 8 5.5 8.5 9 12 9zM12 9s2-4.5 4-3.5S15.5 9 12 9z"/></svg>, color:"#FF375F", label:"Gündəlik bonus", description:"Bugünkü hədiyyəni götür" },
              ],
            },
            {
              title:"Dəstək",
              items:[
                { icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3.5a8.5 8.5 0 1 1-4.3 15.8L3.5 20.5l1.2-4.2A8.5 8.5 0 0 1 12 3.5z"/><path stroke="var(--ac)" d="M9 13.5c1.5 1.6 4.5 1.6 6 0"/></svg>, color:"#32ADE6", label:"Kömək mərkəzi", description:"Suallar və dəstək" },
                { icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l7.8 4.5v9L12 21l-7.8-4.5v-9z"/><circle stroke="var(--ac)" cx="12" cy="12" r="2.8"/></svg>, color:"#8E8E93", label:"Parametrlər", description:"Hesab və məxfilik" },
              ],
            },
          ].map((section) => (
            <section className="p-menu-section" key={section.title} aria-label={section.title}>
              <div className="p-menu-section-title">{section.title}</div>
              <div className="p-menu-list">
                {section.items.map((item) => {
                  return (
                    <Button key={item.label} type="button" variant="ghost" className="p-mi" onClick={item.onClick}>
                      <span className="p-mi-l" style={{ background:`linear-gradient(145deg,${item.color}33,${item.color}14)`, border:`1px solid ${item.color}55`, color:"#fff", ["--ac" as any]:item.color }}>{item.icon}</span>
                      <span className="p-mi-copy">
                        <span className="p-mi-lbl">{item.label}</span>
                        <span className="p-mi-desc">{item.description}</span>
                      </span>
                      <span className="p-mi-end">
                        {item.badge ? <span className={`p-badge ${item.badgeClass || ""}`}>{item.badge}</span> : null}
                        <ChevronRight size={15} strokeWidth={2.1}/>
                      </span>
                    </Button>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        <Button type="button" variant="outline" onClick={() => { supabase.auth.signOut(); }} className="p-logout">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M10 20H7a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h3"/><path stroke="#ff5a7a" d="M15 16l4-4-4-4M19 12H10"/></svg>
          Çıxış
        </Button>
      </div>

      <BottomNav active="profile" onHome={onBack} onRoom={onEnterRoom} onProfile={() => {}}/>

      {/* CÜZDANIM */}
      {walletOpen && (
        <div style={{ position:"fixed", inset:0, zIndex:998, background:"#f5f5f7", display:"flex", flexDirection:"column" }}>
          <header style={{ flexShrink:0, background:"rgba(255,255,255,.045)", borderBottom:".5px solid rgba(150,90,240,.3)", padding:"max(10px,env(safe-area-inset-top)) 8px 0" }}>
            <div style={{ position:"relative", height:44, display:"flex", alignItems:"center" }}>
              <button onClick={() => setWalletOpen(false)} aria-label="Geri" style={{ width:40, height:40, background:"none", border:0, display:"flex", alignItems:"center", justifyContent:"center", color:"#111", cursor:"pointer" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
              </button>
              <span style={{ position:"absolute", left:"50%", transform:"translateX(-50%)", fontSize:17, fontWeight:600, color:"#111", letterSpacing:-.3 }}>Cüzdanım</span>
              <div style={{ marginLeft:"auto", display:"flex" }}>
                <button aria-label="Dəstək" style={{ width:40, height:40, background:"none", border:0, display:"flex", alignItems:"center", justifyContent:"center", color:"#111", cursor:"pointer" }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14v-2a8 8 0 0 1 16 0v2"/><rect x="3" y="13" width="4" height="6" rx="1.5"/><rect x="17" y="13" width="4" height="6" rx="1.5"/><path d="M19 19c0 1.5-1.5 2.5-4 2.5h-2"/></svg>
                </button>
                <button aria-label="Keçmiş" style={{ width:40, height:40, background:"none", border:0, display:"flex", alignItems:"center", justifyContent:"center", color:"#111", cursor:"pointer" }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/><path d="M12 7.5V12l3 2"/></svg>
                </button>
              </div>
            </div>
          </header>

          <div style={{ flex:1, overflowY:"auto", padding:16 }}>
            <button onClick={() => { setWalletOpen(false); onVip(); }} style={{ width:"100%", display:"flex", alignItems:"center", gap:12, padding:"12px 14px", background:"rgba(255,255,255,.045)", border:".5px solid rgba(150,90,240,.3)", borderRadius:16, cursor:"pointer", textAlign:"left", boxShadow:"0 2px 10px rgba(0,0,0,.35)" }}>
              <img src={`/images/images/VIP${displayVip}.png`} alt={`VIP ${displayVip}`} style={{ width:44, height:44, objectFit:"contain", flexShrink:0 }}/>
              <span style={{ flex:1, fontSize:14, fontWeight:500, color:"#111", lineHeight:1.35 }}>Səviyyə keçmək üçün EXP lazımdır.</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c7c7cc" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0 }}><path d="M9 6l6 6-6 6"/></svg>
            </button>

            {/* JETON PAKETLƏRİ */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginTop:16 }}>
              {[
                { img:1, amt:18546,   bonus:2781,   exp:110,  usd:"0.80" },
                { img:2, amt:93500,   bonus:14025,  exp:510,  usd:"4.80" },
                { img:3, amt:222460,  bonus:33369,  exp:1100, usd:"9.99" },
                { img:4, amt:410888,  bonus:61633,  exp:1899, usd:"19.50" },
                { img:5, amt:980245,  bonus:147036, exp:5000, usd:"56.99" },
                { img:6, amt:2156789, bonus:323518, exp:9999, usd:"110.99" },
              ].map(p => (
                <div key={p.img} style={{ background:"rgba(255,255,255,.045)", border:".5px solid rgba(150,90,240,.3)", borderRadius:16, padding:"8px 6px 10px", display:"flex", flexDirection:"column", alignItems:"center", textAlign:"center", boxShadow:"0 2px 10px rgba(0,0,0,.35)" }}>
                  <div style={{ width:"100%", background:"#e8f8ee", color:"#15803d", borderRadius:8, padding:"4px 4px", fontSize:9, fontWeight:600, lineHeight:1.25 }}>15% tokenin geri qaytarılması</div>
                  <img src={`/images/images/v${p.img}.PNG`} alt="" style={{ width:72, height:72, objectFit:"contain", margin:"6px 0 4px" }}/>
                  <div style={{ fontSize:15, fontWeight:700, color:"#111", letterSpacing:-.3, fontVariantNumeric:"tabular-nums" }}>{p.amt.toLocaleString("en-US")}</div>
                  <div style={{ fontSize:11, fontWeight:600, color:"#e0102d", marginTop:1 }}>+{p.bonus.toLocaleString("en-US")}</div>
                  <div style={{ fontSize:10, fontWeight:500, color:"#8e8e93", marginTop:2 }}>{p.exp} VİP EXP</div>
                  <button style={{ marginTop:8, width:"100%", height:32, borderRadius:16, border:0, background:"linear-gradient(135deg,#7b2ff7,#9d5cff)", color:"#fff", fontSize:12, fontWeight:600, cursor:"pointer", boxShadow:"0 3px 10px rgba(123,47,247,.3)" }}>USD {p.usd}</button>
                </div>
              ))}
            </div>

            <p style={{ margin:"18px 8px 24px", fontSize:12, lineHeight:1.6, color:"#8e8e93", textAlign:"center" }}>
              Bu sifarişi təqdim etməklə, siz{" "}
              <button onClick={() => setLegalPage("terms")} style={{ background:"none", border:0, padding:0, color:"#7b2ff7", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>"Xidmət Şərtləri"</button>
              {" "}və{" "}
              <button onClick={() => setLegalPage("privacy")} style={{ background:"none", border:0, padding:0, color:"#7b2ff7", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>"Məxfilik Siyasəti"</button>
              {" "}ilə razılaşırsınız.
            </p>
          </div>
        </div>
      )}

      {/* HÜQUQİ SƏHİFƏ (boş — sonra dizayn) */}
      {legalPage && (
        <div style={{ position:"fixed", inset:0, zIndex:1100, background:"rgba(255,255,255,.045)", display:"flex", flexDirection:"column" }}>
          <header style={{ flexShrink:0, borderBottom:".5px solid rgba(150,90,240,.3)", padding:"max(10px,env(safe-area-inset-top)) 8px 0" }}>
            <div style={{ position:"relative", height:44, display:"flex", alignItems:"center" }}>
              <button onClick={() => setLegalPage(null)} aria-label="Geri" style={{ width:40, height:40, background:"none", border:0, display:"flex", alignItems:"center", justifyContent:"center", color:"#111", cursor:"pointer" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
              </button>
              <span style={{ position:"absolute", left:"50%", transform:"translateX(-50%)", fontSize:17, fontWeight:600, color:"#111" }}>{legalPage === "terms" ? "Xidmət Şərtləri" : "Məxfilik Siyasəti"}</span>
            </div>
          </header>
          <div style={{ flex:1, overflowY:"auto", padding:"16px 18px 40px" }}>
            {legalPage && (
              <>
                <div style={{ fontSize:22, fontWeight:700, color:"#111", letterSpacing:-.4, marginBottom:4 }}>{legalPage === "terms" ? "Velvet Xidmət Şərtləri" : "Velvet Məxfilik Siyasəti"}</div>
                <div style={{ fontSize:12, color:"#8e8e93", marginBottom:18 }}>Son yenilənmə: 28 sentyabr 2026</div>
                {(legalPage === "terms" ? VELVET_TERMS : VELVET_PRIVACY).map(sec => (
                  <section key={sec.t} style={{ marginBottom:20 }}>
                    <h3 style={{ fontSize:15, fontWeight:700, color:"#111", margin:"0 0 8px" }}>{sec.t}</h3>
                    {sec.p.map((x, i) => (
                      <p key={i} style={{ fontSize:14, lineHeight:1.6, color:"#3a3a3c", margin:"0 0 8px", paddingLeft: x.startsWith("•") ? 8 : 0, fontWeight: /^[a-c]\)/.test(x) ? 600 : 400 }}>{x}</p>
                    ))}
                  </section>
                ))}
              </>
            )}
          </div>
        </div>
      )}

      {/* MAĞAZA PANELİ */}
      {magazaOpen && (() => {
        const FRAMES = [
          { id:"gold",             name:"Qızıl Qanadlar",    file:"frame-gold-flap",             color:"#ffd700", glow:"rgba(255,200,0,.4)"   },
          { id:"red",              name:"Qırmızı Qanadlar",  file:"frame-red-flap",              color:"#ff6060", glow:"rgba(255,80,80,.4)"    },
          { id:"blue",             name:"Mavi Qanadlar",     file:"frame-blue-flap",             color:"#60a0ff", glow:"rgba(80,140,255,.4)"   },
          { id:"green",            name:"Yaşıl Qanadlar",    file:"frame-green-flap",            color:"#50c878", glow:"rgba(80,200,100,.4)"   },
          { id:"butterfly-sakura", name:"Kəpənək Sakura",    file:"frame-butterfly-sakura", color:"#ff80c0", glow:"rgba(255,100,180,.4)"  },
          { id:"cyber-wings",      name:"Kiber Qanadlar",    file:"frame-cyber-wings",      color:"#00d4ff", glow:"rgba(0,200,255,.4)"    },
          { id:"dragon-obsidian",  name:"Obsidian Əjdaha",   file:"frame-dragon-obsidian",  color:"#a060ff", glow:"rgba(160,80,255,.4)"   },
        ];
        const PRICES: Record<number,number> = { 3:100, 7:200, 30:500 };

        const getExpiry = (id: string) => { try { const d = localStorage.getItem(`velvet_frame_exp_${id}`); return d ? new Date(d) : null; } catch { return null; } };
        const isOwned = (id: string) => { const e = getExpiry(id); return e ? Date.now() < e.getTime() : false; };
        const getDaysLeft = (id: string) => { const e = getExpiry(id); return e ? Math.max(0, Math.ceil((e.getTime()-Date.now())/86400000)) : 0; };

        const popupFrame = FRAMES.find(f => f.id === framePopup);

        const activateFrame = () => {
          if (!popupFrame) return;
          const price = PRICES[selectedDuration];
          if (jeton < price) { setNoJetonWarn(true); setTimeout(() => setNoJetonWarn(false), 2800); return; }
          const newJ = jeton - price;
          setJeton(newJ);
          setSelectedFrame(popupFrame.id);
          const exp = new Date(Date.now() + selectedDuration * 86400000).toISOString();
          try { localStorage.setItem("velvet_jeton", String(newJ)); localStorage.setItem("velvet_frame", popupFrame.id); localStorage.setItem(`velvet_frame_exp_${popupFrame.id}`, exp); } catch {}
          setFramePopup(null);
          setBuyDone(popupFrame.id);
          setTimeout(() => setBuyDone(null), 2000);
        };

        const JetonImg = ({size=16}:{size?:number}) => (
          <img src="/images/images/jeton.PNG" width={size} height={size} style={{objectFit:"contain",flexShrink:0}} alt=""/>
        );

        return (
          <>
          <div style={{ position:"fixed", inset:0, zIndex:998, background:"rgba(210,195,250,.85)", backdropFilter:"blur(14px)" }} onClick={() => setMagazaOpen(false)}>
            <div style={{ position:"absolute", inset:0, maxWidth:430, margin:"0 auto", background:"linear-gradient(180deg,#f2eef8,#07000f)", display:"flex", flexDirection:"column" }}
              onClick={e => e.stopPropagation()}>
              <style>{`
                @keyframes mgS{0%{background-position:-200% 0}100%{background-position:200% 0}}
                @keyframes mgFd{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
                @keyframes warnSlide{from{opacity:0;transform:translateY(-20px)}to{opacity:1;transform:translateY(0)}}
                .mg-card{border-radius:16px;overflow:hidden;cursor:pointer;transition:transform .15s,box-shadow .15s;}
                .mg-card:active{transform:scale(.95);}
              `}</style>

              {/* Jeton az xəbərdarlığı */}
              {noJetonWarn && (
                <div style={{ position:"fixed", top:"max(24px,env(safe-area-inset-top))", left:0, right:0, margin:"0 auto", maxWidth:380, padding:"0 20px", zIndex:9999, animation:"warnSlide .3s ease" }}>
                  <div style={{ background:"linear-gradient(135deg,#2a0a00,#3a1000)", border:"1px solid rgba(255,120,0,.5)", borderRadius:18, padding:"16px 18px", display:"flex", alignItems:"center", gap:12, boxShadow:"0 8px 32px rgba(255,100,0,.3)" }}>
                    <div style={{ width:36, height:36, borderRadius:"50%", background:"rgba(255,120,0,.2)", border:"1px solid rgba(255,120,0,.4)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ff9500" strokeWidth="2.5" strokeLinecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17" strokeWidth="3"/></svg>
                    </div>
                    <div>
                      <div style={{ fontSize:13, fontWeight:700, color:"#ff9500", marginBottom:2 }}>Jeton kifayət etmir</div>
                      <div style={{ fontSize:11, color:"rgba(255,150,50,.6)" }}>Çərçivəni almaq üçün daha çox jeton lazımdır</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Header */}
              <div style={{ flexShrink:0, padding:"max(14px,env(safe-area-inset-top)) 16px 0", background:"rgba(255,255,255,.045)" }}>
                <div style={{ display:"flex", alignItems:"center", height:44, marginBottom:6 }}>
                  <button onClick={() => setMagazaOpen(false)} aria-label="Geri" style={{ width:36, height:36, borderRadius:"50%", background:"#f4f2f8", border:0, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"#1c1c1e", flexShrink:0 }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
                  </button>
                  <span style={{ marginLeft:8, fontSize:17, fontWeight:700, color:"#111", letterSpacing:-.3 }}>Dekorasiya Mağazası</span>
                  <button aria-label="Mənim" style={{ marginLeft:"auto", height:32, padding:"0 12px 0 9px", borderRadius:16, background:"#e0102d", border:0, color:"#fff", display:"flex", alignItems:"center", gap:5, fontSize:13, fontWeight:600, cursor:"pointer", boxShadow:"0 2px 8px rgba(224,16,45,.3)" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4.5 20.5c.8-3.7 3.7-5.7 7.5-5.7s6.7 2 7.5 5.7"/></svg>
                    Mənim
                  </button>
                </div>

                {/* Tab seçimi — sadə yazı */}
                <div style={{ display:"flex", gap:22, borderBottom:".5px solid rgba(20,10,40,.1)" }}>
                  {([
                    { key:"cerceve", label:"Çərçivələr" },
                    { key:"giris",   label:"Giriş Animasiyası" },
                  ] as const).map(t => {
                    const on = magazaTab === t.key;
                    return (
                      <button key={t.key} onClick={() => setMagazaTab(t.key)}
                        style={{ background:"none", border:0, padding:"10px 0", cursor:"pointer", fontSize:15, fontWeight: on ? 500 : 300, color: on ? "#111" : "#8e8e93", borderBottom: on ? "2px solid #111" : "2px solid transparent", marginBottom:-.5, fontFamily:"inherit" }}>
                        {t.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* GİRİŞ ANİMASYONU TAB */}
              {magazaTab === "giris" && (
                <div style={{ flex:1, overflowY:"auto", padding:"16px 16px 10px" }}>
                  {/* Video önizleme kartı */}
                  <div style={{ background:"rgba(160,110,245,.06)", border:"1px solid rgba(160,110,245,.1)", borderRadius:20, overflow:"hidden", marginBottom:14, position:"relative" }}>
                    <div style={{ position:"relative", width:"100%", paddingTop:"56.25%" }}>
                      {girisPreview ? (
                        <video autoPlay loop muted playsInline
                          style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover" }}>
                          <source src="/images/images/masingirisv1.mp4" type="video/mp4"/>
                        </video>
                      ) : (
                        <>
                          <video muted playsInline
                            style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", filter:"brightness(.4)" }}>
                            <source src="/images/images/masingirisv1.mp4" type="video/mp4"/>
                          </video>
                          <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
                            <button onClick={() => setGirisPreview(true)}
                              style={{ width:56, height:56, borderRadius:"50%", background:"rgba(123,47,247,.8)", border:"2px solid rgba(192,132,252,.5)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", boxShadow:"0 0 24px rgba(123,47,247,.6)" }}>
                              <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                            </button>
                          </div>
                        </>
                      )}
                      {girisPreview && (
                        <button onClick={() => setGirisPreview(false)}
                          style={{ position:"absolute", top:10, right:10, width:30, height:30, borderRadius:"50%", background:"rgba(160,110,245,.25)", border:"1px solid rgba(210,195,250,.2)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </button>
                      )}
                    </div>
                    <div style={{ padding:"14px 16px" }}>
                      <div style={{ fontSize:14, fontWeight:700, color:"#ffffff", marginBottom:4 }}>Maşın Giriş Animasyonu v1</div>
                      <div style={{ fontSize:11, color:"rgba(233,226,255,.6)", marginBottom:12 }}>Giriş ekranında fərqli arxa plan animasyonu</div>
                      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                          <JetonImg size={14}/>
                          <span style={{ fontSize:14, fontWeight:800, color:"#ffd700" }}>800 / 30 gün</span>
                        </div>
                        <button
                          onClick={() => {
                            if (jeton < 800) { setNoJetonWarn(true); setTimeout(() => setNoJetonWarn(false), 2800); return; }
                            const newJ = jeton - 800;
                            setJeton(newJ);
                            try { localStorage.setItem("velvet_jeton", String(newJ)); localStorage.setItem("velvet_giris_anim", "masingirisv1"); const exp = new Date(Date.now()+30*86400000).toISOString(); localStorage.setItem("velvet_giris_exp", exp); } catch {}
                          }}
                          style={{ background:"linear-gradient(135deg,#7b2ff7,#c084fc)", border:"none", borderRadius:12, padding:"9px 20px", fontSize:12, fontWeight:700, color:"#ffffff", cursor:"pointer" }}>
                          Aktivləşdir
                        </button>
                      </div>
                    </div>
                  </div>
                  <div style={{ padding:"10px 14px", background:"rgba(255,255,255,.02)", border:"1px solid rgba(160,110,245,.07)", borderRadius:12, display:"flex", gap:8 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(210,195,250,.2)" strokeWidth="1.5" strokeLinecap="round" style={{flexShrink:0,marginTop:1}}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2.5"/></svg>
                    <span style={{ fontSize:10, color:"rgba(210,195,250,.2)", lineHeight:1.6 }}>Animasiya 30 gün aktivdir. Müddət bitdikdə standart arxa plana qayıdır.</span>
                  </div>
                </div>
              )}

              {/* ÇƏRÇİVƏLƏR TAB */}
              {magazaTab === "cerceve" && <div style={{ flex:1, overflowY:"auto", padding:"14px 14px 10px" }}>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>
                  {FRAMES.map((item, idx) => {
                    const owned = isOwned(item.id);
                    const active = selectedFrame === item.id && owned;
                    const daysLeft = getDaysLeft(item.id);
                    return (
                      <div key={item.id} className="mg-card"
                        style={{ background: active ? `${item.color}11` : "rgba(255,255,255,.025)", border:`1.5px solid ${active ? item.color : "rgba(160,110,245,.1)"}`, boxShadow: active ? `0 0 18px ${item.glow}` : "none", animation:`mgFd .3s ease ${idx*.04}s both` }}
                        onClick={() => setFramePopup(item.id)}>
                        {active && <div style={{ position:"absolute", top:0, left:0, right:0, height:1.5, background:`linear-gradient(90deg,transparent,${item.color},transparent)` }}/>}

                        {/* Preview */}
                        <div style={{ position:"relative", width:"100%", paddingTop:"100%", background:"rgba(160,110,245,.12)" }}>
                          {/* Avatar ortada */}
                          <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", width:"68%", height:"68%", borderRadius:"50%", background:"#1a0035", border:"1.5px solid #fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:900, color:"#ffffff", zIndex:1, overflow:"hidden" }}>
                            {avatarPreview ? <img src={avatarPreview} style={{width:"100%",height:"100%",objectFit:"cover",borderRadius:"50%"}} alt=""/> : (profileData.username[0]?.toUpperCase()||"İ")}
                          </div>
                          {/* GIF çərçivə */}
                          <img src={`/images/images/${item.file}.gif`}
                            style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"contain", zIndex:2, imageRendering:"auto" }} alt=""/>
                          {/* Aktiv badge */}
                          {active && (
                            <div style={{ position:"absolute", top:5, right:5, width:18, height:18, borderRadius:"50%", background:item.color, display:"flex", alignItems:"center", justifyContent:"center", zIndex:3 }}>
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                            </div>
                          )}
                        </div>

                        {/* Alt — yalnız jeton qiyməti */}
                        <div style={{ padding:"7px 7px 8px", display:"flex", alignItems:"center", justifyContent:"center", gap:4 }}>
                          {owned ? (
                            <span style={{ fontSize:10, color: daysLeft < 4 ? "#ff6060" : item.color, fontWeight:700 }}>{daysLeft} gün</span>
                          ) : (
                            <>
                              <JetonImg size={12}/>
                              <span style={{ fontSize:12, fontWeight:800, color:"#ffd700" }}>{PRICES[7]}</span>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div style={{ marginTop:14, padding:"10px 14px", background:"rgba(255,255,255,.02)", border:"1px solid rgba(160,110,245,.07)", borderRadius:12, display:"flex", gap:8 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(210,195,250,.2)" strokeWidth="1.5" strokeLinecap="round" style={{flexShrink:0,marginTop:1}}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2.5"/></svg>
                  <span style={{ fontSize:10, color:"rgba(210,195,250,.2)", lineHeight:1.6 }}>Çərçivəni seçib müddət təyin edin. Müddət bitdikdə avtomatik silinir.</span>
                </div>
              </div>}

              {/* Alt panel */}
              <div style={{ flexShrink:0, padding:"12px 18px", paddingBottom:"max(16px,env(safe-area-inset-bottom))", borderTop:"1px solid rgba(160,110,245,.08)", background:"rgba(160,110,245,.15)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <div>
                  <div style={{ fontSize:9, color:"rgba(210,195,250,.2)", letterSpacing:2, textTransform:"uppercase", marginBottom:4 }}>Cari Jetonum</div>
                  <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                    <JetonImg size={22}/>
                    <span style={{ fontSize:26, fontWeight:900, color:"#ffd700", filter:"drop-shadow(0 0 10px rgba(255,200,0,.4))" }}>{jeton.toLocaleString()}</span>
                  </div>
                </div>
                <button style={{ background:"linear-gradient(135deg,#ffd700,#ff9500)", border:"none", borderRadius:14, padding:"11px 20px", fontSize:13, fontWeight:800, color:"#2a0e00", cursor:"pointer", boxShadow:"0 4px 16px rgba(255,150,0,.3)" }}>
                  + Yüklə
                </button>
              </div>
            </div>
          </div>

          {/* ÇƏRÇIVƏ POPUP */}
          {framePopup && popupFrame && (
            <div style={{ position:"fixed", inset:0, zIndex:1500, background:"rgba(210,195,250,.75)", backdropFilter:"blur(16px)", display:"flex", alignItems:"flex-end", justifyContent:"center" }}
              onClick={() => setFramePopup(null)}>
              <div style={{ width:"100%", maxWidth:430, background:"linear-gradient(180deg,#130030,#09001a)", borderRadius:"28px 28px 0 0", border:"1px solid rgba(160,110,245,.1)", paddingBottom:"max(28px,env(safe-area-inset-bottom))", overflow:"hidden", animation:"mgFd .25s ease" }}
                onClick={e => e.stopPropagation()}>

                {/* Handle */}
                <div style={{ display:"flex", justifyContent:"center", paddingTop:12, marginBottom:4 }}>
                  <div style={{ width:40, height:4, borderRadius:2, background:"rgba(160,110,245,.14)" }}/>
                </div>

                {/* Çərçivə önizleme — böyük */}
                <div style={{ position:"relative", width:180, height:180, margin:"0 auto 20px" }}>
                  {/* Avatar */}
                  <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", width:124, height:124, borderRadius:"50%", background:"rgba(255,255,255,.045)", padding:1.5, zIndex:1 }}>
                    <div style={{ width:"100%", height:"100%", borderRadius:"50%", background:"#1a0035", display:"flex", alignItems:"center", justifyContent:"center", fontSize:28, fontWeight:900, color:"#ffffff", overflow:"hidden" }}>
                      {avatarPreview ? <img src={avatarPreview} style={{width:"100%",height:"100%",objectFit:"cover",borderRadius:"50%"}} alt=""/> : (profileData.username[0]?.toUpperCase()||"İ")}
                    </div>
                  </div>
                  {/* GIF */}
                  <img src={`/images/images/${popupFrame.file}.gif`}
                    style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"contain", zIndex:2 }} alt=""/>
                </div>

                {/* Ad */}
                <div style={{ textAlign:"center", marginBottom:20, padding:"0 20px" }}>
                  <div style={{ fontSize:11, color:"rgba(210,195,250,.5)", letterSpacing:3, textTransform:"uppercase", marginBottom:6 }}>Avatar Çərçivəsi</div>
                  <div style={{ fontSize:20, fontWeight:900, color:popupFrame.color, filter:`drop-shadow(0 0 12px ${popupFrame.glow})` }}>{popupFrame.name}</div>
                </div>

                {/* Müddət seçimi */}
                <div style={{ padding:"0 20px", marginBottom:20 }}>
                  <div style={{ fontSize:10, color:"rgba(210,195,250,.2)", letterSpacing:2, textTransform:"uppercase", marginBottom:12, textAlign:"center" }}>Müddət seçin</div>
                  <div style={{ display:"flex", gap:10 }}>
                    {([3,7,30] as const).map(d => {
                      const price = PRICES[d];
                      const sel = selectedDuration === d;
                      return (
                        <div key={d} onClick={() => setSelectedDuration(d)}
                          style={{ flex:1, borderRadius:16, padding:"12px 6px", textAlign:"center", cursor:"pointer", background: sel ? `${popupFrame.color}18` : "rgba(160,110,245,.06)", border:`1.5px solid ${sel ? popupFrame.color : "rgba(160,110,245,.1)"}`, transition:".2s", boxShadow: sel ? `0 0 12px ${popupFrame.glow}` : "none" }}>
                          <div style={{ fontSize:20, fontWeight:900, color: sel ? popupFrame.color : "#fff", marginBottom:2 }}>{d}</div>
                          <div style={{ fontSize:9, color:"rgba(233,226,255,.55)", marginBottom:8 }}>GÜN</div>
                          <div style={{ height:1, background:"rgba(160,110,245,.09)", marginBottom:8 }}/>
                          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:4 }}>
                            <img src="/images/images/jeton.PNG" width={13} height={13} style={{objectFit:"contain"}} alt=""/>
                            <span style={{ fontSize:14, fontWeight:800, color: sel ? "#ffd700" : "rgba(255,200,0,.6)" }}>{price}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Aktivləşdir düyməsi */}
                <div style={{ padding:"0 20px" }}>
                  <button onClick={activateFrame}
                    style={{ width:"100%", background:`linear-gradient(135deg,${popupFrame.color},${popupFrame.color}aa)`, border:"none", borderRadius:16, padding:"15px", fontSize:15, fontWeight:800, color:"#000", cursor:"pointer", boxShadow:`0 6px 24px ${popupFrame.glow}`, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                    <img src="/images/images/jeton.PNG" width={16} height={16} style={{objectFit:"contain"}} alt=""/>
                    <span>Aktivləşdir — {PRICES[selectedDuration]} Jeton</span>
                  </button>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:6, marginTop:12 }}>
                    <img src="/images/images/jeton.PNG" width={12} height={12} style={{objectFit:"contain"}} alt=""/>
                    <span style={{ fontSize:11, color:"rgba(210,195,250,.5)" }}>Balans: {jeton.toLocaleString()} jeton</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          </>
        );
      })()}
      {/* AVATAR TAM EKRAN */}
      {showAvatarFull && (
        <div style={{ position:"fixed", inset:0, zIndex:1000, background:"rgba(210,195,250,.82)", backdropFilter:"blur(16px)", display:"flex", alignItems:"center", justifyContent:"center" }}
          onClick={() => setShowAvatarFull(false)}>
          <button style={{ position:"absolute", top:"max(20px,env(safe-area-inset-top))", right:20, width:40, height:40, borderRadius:"50%", background:"rgba(160,110,245,.14)", border:"1px solid rgba(160,110,245,.18)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", zIndex:2 }}
            onClick={() => setShowAvatarFull(false)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
          <div style={{ width:280, height:280, borderRadius:"50%", background:"conic-gradient(#ffd700,#ff8c00,#c084fc,#7b2ff7,#ffd700)", padding:4, boxShadow:"0 0 60px rgba(123,47,247,.4)" }}
            onClick={e => e.stopPropagation()}>
            <div style={{ width:"100%", height:"100%", borderRadius:"50%", background:"#1a0035", overflow:"hidden", display:"flex", alignItems:"center", justifyContent:"center", fontSize:80, fontWeight:900, color:"#ffffff" }}>
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
        <div style={{ position:"fixed", inset:0, zIndex:998, background:"rgba(210,195,250,.6)", backdropFilter:"blur(16px)", display:"flex", alignItems:"center", justifyContent:"center", padding:"20px" }} onClick={() => setVisitorOpen(false)}>
          <div style={{ width:"100%", maxWidth:400, background:"#07000f", borderRadius:28, border:"1px solid rgba(160,110,245,.12)", maxHeight:"80vh", display:"flex", flexDirection:"column", boxShadow:"0 24px 60px rgba(210,195,250,.25), 0 0 0 1px rgba(255,255,255,.8)" }}
            onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div style={{ padding:"20px 20px 14px", display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0, borderBottom:"1px solid rgba(160,110,245,.08)" }}>
              <div>
                <div style={{ fontSize:17, fontWeight:800, color:"#ffffff" }}>Profil Ziyarətçiləri</div>
                <div style={{ fontSize:11, color:"rgba(233,226,255,.45)", marginTop:2 }}>Son 7 günün statistikası</div>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontSize:26, fontWeight:900, background:"linear-gradient(135deg,#7b2ff7,#ff3ea5)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>143</div>
                  <div style={{ fontSize:10, color:"rgba(123,47,247,.4)" }}>ümumi ziyarət</div>
                </div>
                <button onClick={() => setVisitorOpen(false)} style={{ width:32, height:32, borderRadius:"50%", background:"rgba(160,110,245,.08)", border:"1px solid rgba(160,110,245,.12)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4a2880" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            </div>
            {/* Siyahı */}
            <div style={{ overflowY:"auto", padding:"0 16px 20px", flex:1 }}>
              {visitors.map((v, i) => {
                const isBlurred = userVip === 0;
                return (
                  <div key={i} style={{ position:"relative", marginBottom:8 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 14px", background:"rgba(160,110,245,.06)", border:"1px solid rgba(160,110,245,.08)", borderRadius:16, filter: isBlurred ? "blur(5px)" : "none", pointerEvents: isBlurred ? "none" : "auto" }}>
                      {/* Avatar */}
                      <div style={{ width:44, height:44, borderRadius:"50%", background:v.color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:800, color:"#ffffff", flexShrink:0 }}>{v.initials}</div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:14, fontWeight:700, color:"#ffffff", marginBottom:2 }}>{v.name}</div>
                        <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>
                          <span style={{ fontSize:10, color:"rgba(233,226,255,.6)" }}>{v.country}</span>
                          <span style={{ width:3, height:3, borderRadius:"50%", background:"rgba(210,195,250,.2)", display:"inline-block" }}/>
                          <span style={{ fontSize:10, color:"rgba(233,226,255,.6)" }}>{v.time}</span>
                          <span style={{ width:3, height:3, borderRadius:"50%", background:"rgba(210,195,250,.2)", display:"inline-block" }}/>
                          <span style={{ fontSize:10, color:"rgba(192,132,252,.6)" }}>{v.visits}× ziyarət</span>
                        </div>
                      </div>
                      {v.vip > 0
                        ? <div style={{ background:"rgba(255,200,0,.1)", border:"1px solid rgba(255,200,0,.22)", borderRadius:8, padding:"3px 8px", fontSize:10, fontWeight:700, color:"#ffd700", flexShrink:0 }}>VIP{v.vip}</div>
                        : <div style={{ background:"rgba(160,110,245,.07)", border:"1px solid rgba(160,110,245,.12)", borderRadius:8, padding:"3px 8px", fontSize:10, color:"rgba(210,195,250,.2)", flexShrink:0 }}>VIP0</div>
                      }
                    </div>
                    {/* Blur overlay */}
                    {isBlurred && (
                      <div style={{ position:"absolute", inset:0, borderRadius:16, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(160,110,245,.3)" }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(233,226,255,.55)" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* VIP0 — alt CTA */}
              {userVip === 0 && (
                <div style={{ margin:"8px 0 0", padding:"16px", background:"linear-gradient(135deg,rgba(123,47,247,.12),rgba(255,62,165,.08))", border:"1px solid rgba(123,47,247,.2)", borderRadius:20, textAlign:"center" }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(255,200,0,.7)" strokeWidth="2" strokeLinecap="round" style={{ marginBottom:8 }}><path d="M2 8l4 8h12l4-8-5 3-5-7-5 7-5-3z"/></svg>
                  <div style={{ fontSize:14, fontWeight:700, color:"#ffffff", marginBottom:4 }}>Ziyarət edənləri görmək üçün</div>
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
        const IcUser = <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(233,226,255,.65)" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
        const IcGender = <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(233,226,255,.65)" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="8" r="4"/><path d="M20 21v-1a8 8 0 00-16 0v1"/></svg>;
        const IcAge = <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(233,226,255,.65)" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
        const IcGlobe = <span style={{fontSize:18,lineHeight:1}}>{COUNTRY_FLAGS[draft.country]||"🌍"}</span>;
        const IcMap = <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(233,226,255,.65)" strokeWidth="2" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>;
        const IcBio = <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(233,226,255,.65)" strokeWidth="2" strokeLinecap="round"><line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="17" y1="18" x2="3" y2="18"/></svg>;
        const IcImg = <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(233,226,255,.65)" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>;
        const row = (icon: JSX.Element, label: string, right: JSX.Element) => (
          <div style={{ background:"#f8f6ff", border:"1px solid rgba(160,110,245,.1)", borderRadius:16, margin:"0 18px 8px", padding:"14px 18px", display:"flex", alignItems:"center", gap:12 }}>
            {icon}
            <span style={{ fontSize:13, color:"#2a1060", fontWeight:600, flexShrink:0, minWidth:100 }}>{label}</span>
            <div style={{ flex:1, display:"flex", justifyContent:"flex-end" }}>{right}</div>
          </div>
        );
        return (
          <div style={{ position:"fixed", inset:0, zIndex:999, background:"rgba(255,255,255,.98)", backdropFilter:"blur(10px)", overflowY:"auto", WebkitOverflowScrolling:"touch" }}>
            <div style={{ maxWidth:430, margin:"0 auto", paddingBottom:40 }}>
              {/* Header */}
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"max(20px,env(safe-area-inset-top)) 20px 16px", borderBottom:"1px solid rgba(160,110,245,.1)" }}>
                <button onClick={() => setEditOpen(false)} style={{ background:"rgba(160,110,245,.08)", border:"1px solid rgba(160,110,245,.12)", borderRadius:12, width:38, height:38, color:"#4a2880", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
                <span style={{ fontSize:16, fontWeight:700, color:"#ffffff" }}>Profili Düzəlt</span>
                <button onClick={() => { saveProfile(draft); setEditOpen(false); }} style={{ background:"linear-gradient(135deg,#7b2ff7,#ff3ea5)", border:"none", borderRadius:12, padding:"8px 18px", color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer" }}>Saxla</button>
              </div>

              {/* Avatar */}
              {row(IcImg, "Şəkil",
                <div onClick={() => document.getElementById("edit-av-inp")?.click()} style={{ cursor:"pointer", position:"relative" }}>
                  <div style={{ width:52, height:52, borderRadius:"50%", background:"conic-gradient(#ffd700,#c084fc,#7b2ff7,#ffd700)", padding:2 }}>
                    <div id="edit-av-preview" style={{ width:"100%", height:"100%", borderRadius:"50%", background:"#1a0035", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, fontWeight:900, color:"#ffffff", overflow:"hidden" }}>
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
                  style={{ background:"transparent", border:"none", outline:"none", color:"#ffffff", fontSize:14, fontWeight:600, textAlign:"right", width:"100%" }} placeholder="Ad daxil edin"/>
              )}

              {/* Cins */}
              {row(IcGender, "Cins",
                <div style={{ display:"flex", gap:6 }}>
                  {[
                    {v:"Kişi", icon:<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="10" cy="14" r="6"/><line x1="16" y1="8" x2="22" y2="2"/><polyline points="18 2 22 2 22 6"/></svg>},
                    {v:"Qadın", icon:<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="8" r="6"/><line x1="12" y1="14" x2="12" y2="21"/><line x1="9" y1="18" x2="15" y2="18"/></svg>},
                    {v:"Digər", icon:<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><line x1="12" y1="2" x2="12" y2="9"/><line x1="12" y1="15" x2="12" y2="22"/><line x1="2" y1="12" x2="9" y2="12"/><line x1="15" y1="12" x2="22" y2="12"/></svg>},
                  ].map(({v, icon}) => (
                    <button key={v} onClick={() => setDraft({...draft, gender:v})} style={{ display:"flex", alignItems:"center", gap:4, padding:"5px 10px", borderRadius:9, border:`1px solid ${draft.gender===v ? "#7b2ff7" : "rgba(160,110,245,.14)"}`, background:draft.gender===v ? "rgba(123,47,247,.25)" : "transparent", color:draft.gender===v ? "#c084fc" : "rgba(210,195,250,.4)", fontSize:11, cursor:"pointer" }}>
                      {icon}{v}
                    </button>
                  ))}
                </div>
              )}

              {/* Yaş */}
              {row(IcAge, "Yaş",
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <button onClick={() => setDraft({...draft, age:Math.max(13,draft.age-1)})} style={{ width:30, height:30, borderRadius:9, border:"1px solid rgba(160,110,245,.15)", background:"rgba(160,110,245,.08)", color:"#ffffff", fontSize:17, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  </button>
                  <span style={{ fontSize:18, fontWeight:800, color:"#ffffff", minWidth:32, textAlign:"center" }}>{draft.age}</span>
                  <button onClick={() => setDraft({...draft, age:Math.min(99,draft.age+1)})} style={{ width:30, height:30, borderRadius:9, border:"1px solid rgba(160,110,245,.15)", background:"rgba(160,110,245,.08)", color:"#ffffff", fontSize:17, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
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
                  style={{ background:"#1a0035", border:"1px solid rgba(160,110,245,.14)", borderRadius:9, padding:"4px 8px", outline:"none", color:"#ffffff", fontSize:13, fontWeight:600, cursor:"pointer", maxWidth:160 }}>
                  {COUNTRIES.map(c => <option key={c} value={c} style={{ background:"#1a0035" }}>{c}</option>)}
                </select>
              )}

              {/* Bölgə — ölkəyə görə */}
              {row(IcMap, "Yaşadığın bölgə",
                <select value={draft.city} onChange={e => setDraft({...draft, city:e.target.value})}
                  style={{ background:"#1a0035", border:"1px solid rgba(160,110,245,.14)", borderRadius:9, padding:"4px 8px", outline:"none", color:"#ffffff", fontSize:13, fontWeight:600, cursor:"pointer", maxWidth:160 }}>
                  {cities.map(c => <option key={c} value={c} style={{ background:"#1a0035" }}>{c}</option>)}
                </select>
              )}

              {/* Haqqında */}
              <div style={{ background:"rgba(160,110,245,.06)", border:"1px solid rgba(160,110,245,.09)", borderRadius:16, margin:"0 18px 8px", padding:"14px 18px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
                  {IcBio}
                  <span style={{ fontSize:13, color:"rgba(233,226,255,.65)" }}>Haqqında</span>
                </div>
                <textarea value={draft.bio} onChange={e => setDraft({...draft, bio:e.target.value})}
                  rows={3} placeholder="Özün haqqında yaz..."
                  style={{ width:"100%", background:"rgba(160,110,245,.07)", border:"1px solid rgba(160,110,245,.12)", borderRadius:12, padding:"10px 12px", color:"#ffffff", fontSize:13, resize:"none", outline:"none", fontFamily:"inherit", lineHeight:1.5 }}/>
              </div>
            </div>
          </div>
        );
      })()}
    </main>
  );
}

/* ─── HƏDİYYƏ İKONLARI ─── */
const LION = <svg viewBox="0 0 64 64" width="100%" height="100%"><defs><radialGradient id="lnMane" cx="50%" cy="50%" r="50%"><stop offset="0" stopColor="#ffb13b"/><stop offset="1" stopColor="#c8561b"/></radialGradient><linearGradient id="lnFace" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffe3a3"/><stop offset="1" stopColor="#f5b84f"/></linearGradient></defs><g fill="url(#lnMane)">{Array.from({length:12}).map((_,k)=><ellipse key={k} cx="32" cy="12" rx="7" ry="11" transform={`rotate(${k*30} 32 33)`}/>)}</g><circle cx="32" cy="33" r="17" fill="url(#lnFace)"/><circle cx="19" cy="20" r="4.5" fill="#f5b84f"/><circle cx="45" cy="20" r="4.5" fill="#f5b84f"/><circle cx="19" cy="20" r="2.2" fill="#d98a3a"/><circle cx="45" cy="20" r="2.2" fill="#d98a3a"/><ellipse cx="25.5" cy="30" rx="2.6" ry="3.2" fill="#2b1a10"/><ellipse cx="38.5" cy="30" rx="2.6" ry="3.2" fill="#2b1a10"/><circle cx="26.3" cy="29" r=".9" fill="#fff"/><circle cx="39.3" cy="29" r=".9" fill="#fff"/><ellipse cx="32" cy="40" rx="8" ry="6" fill="#fff3d6"/><path d="M29 36.5h6l-3 3.2z" fill="#6b3a1f"/><path d="M32 39.7v2.3M32 42c-1.5 1.6-3.5 1.6-4.5.4M32 42c1.5 1.6 3.5 1.6 4.5.4" stroke="#6b3a1f" strokeWidth="1.2" fill="none" strokeLinecap="round"/></svg>;

/* ─── ROOM ─── */
function RoomScreen({ name, avatarUrl, session, members, muted, connected, onToggleMic, onJoinSeat, onLeaveSeat, onLeave, onOpenChat, error }: any) {
  const [sharing, setSharing] = useState(false);
  const [profile, setProfile] = useState<Member | null>(null);
  const [roomMenuOpen, setRoomMenuOpen] = useState(false);
  const myMember = session ? members.find((member: Member) => member.user_id === session.user.id) : undefined;
  const isSpeaker = myMember?.role === "speaker";
  const speakersBySeat = new Map<number, Member>();
  members.filter((member: Member) => member.role === "speaker" && member.seat_index != null).forEach((member: Member) => speakersBySeat.set(member.seat_index as number, member));
  const peopleCount = Math.max(1, members.length);

  const takeSeat = async (index: number) => {
    const occupant = speakersBySeat.get(index);
    if (occupant?.user_id === session?.user.id) return onLeaveSeat();
    if (!occupant && !isSpeaker) await onJoinSeat(index);
  };

  const shareRoom = async () => {
    setSharing(true);
    try {
      if (navigator.share) await navigator.share({ title: "Velvet odası", text: "Velvet odasına katıl", url: window.location.href });
      else await navigator.clipboard.writeText(window.location.href);
    } catch {}
    setTimeout(() => setSharing(false), 1200);
  };

  return (
    <main className="room-shell" style={{ backgroundImage: `linear-gradient(rgba(18,12,101,.12),rgba(18,8,76,.28)),url(${roomBackground})` }}>
      <style>{`
        .room-shell{position:relative;min-height:100dvh;background-size:cover;background-position:center;color:#fff;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;overflow:hidden}
        .room-shell:after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(24,15,105,.18),rgba(16,8,71,.38));pointer-events:none}
         .room-ui{position:relative;z-index:2;height:100dvh;max-width:520px;margin:0 auto;display:flex;flex-direction:column;overflow:hidden;padding:max(8px,env(safe-area-inset-top)) 12px calc(70px + env(safe-area-inset-bottom))}
         .room-top{display:grid;grid-template-columns:minmax(0,1fr) auto auto;gap:9px;align-items:center;flex-shrink:0}
        .room-id{display:flex;align-items:center;gap:8px;min-width:0}.room-avatar{width:48px;height:48px;border-radius:13px;border:3px solid rgba(255,255,255,.88);background:linear-gradient(135deg,#ffc5df,#8b72ff);display:grid;place-items:center;overflow:hidden;box-shadow:0 3px 12px rgba(0,0,0,.3)}
        .room-avatar img{width:100%;height:100%;object-fit:cover}.room-title{font-size:18px;font-weight:700;line-height:1.15;text-shadow:0 1px 3px rgba(0,0,0,.4);white-space:nowrap}.room-code{font-size:14px;color:rgba(255,255,255,.72);margin-top:3px}.room-crown{font-size:29px;filter:drop-shadow(0 2px 5px rgba(0,0,0,.35))}
        .room-actions{display:flex;align-items:center;gap:14px}.icon-clear{border:0;background:transparent;color:#fff;padding:3px;display:grid;place-items:center;cursor:pointer}.power{width:34px;height:34px;border:3px solid currentColor;border-radius:50%;font-size:20px;line-height:1}
         .room-menu-backdrop{position:fixed;inset:0;z-index:70;background:rgba(8,8,24,.38);backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px);display:flex;align-items:flex-start;justify-content:center;padding:max(70px,calc(env(safe-area-inset-top) + 60px)) 14px 20px;animation:vfadeIn .18s ease}
         .room-menu{width:min(100%,480px);display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:9px;padding:10px 2px 16px;border-bottom:1px solid rgba(255,255,255,.14)}
         .room-menu-item{border:0;background:transparent;color:#fff;display:flex;flex-direction:column;align-items:center;gap:9px;min-width:0;cursor:pointer}
         .room-menu-item:active .room-menu-icon{transform:scale(.92)}
         .room-menu-icon{position:relative;width:clamp(66px,19vw,84px);height:clamp(66px,19vw,84px);border-radius:50%;display:grid;place-items:center;color:#fff;background:rgba(255,255,255,.1);border:1.5px solid rgba(255,255,255,.5);box-shadow:0 10px 26px rgba(0,0,0,.28);transition:transform .14s ease}
         .room-menu-icon:after{content:"";position:absolute;inset:5px;border-radius:50%;border:1px solid rgba(255,255,255,.4);pointer-events:none}
         .room-menu-icon svg{position:relative;z-index:1;filter:drop-shadow(0 2px 4px rgba(0,0,0,.45))}
         .room-menu-label{font-size:clamp(11px,3.3vw,15px);line-height:1.15;text-shadow:0 2px 5px rgba(0,0,0,.6);white-space:nowrap}
         .rank-row{display:flex;gap:8px;align-items:center;margin-top:12px;flex-shrink:0}.rank-pill{height:42px;min-width:0;width:30%;border-radius:12px;background:rgba(18,8,85,.63);display:flex;align-items:center;padding:0 10px;font-size:15px;font-weight:750;color:#ffd64a;white-space:nowrap}.rank-mini{height:42px;width:48px;flex-shrink:0;border-radius:12px;background:rgba(18,8,85,.63);display:grid;place-items:center;color:#fff;font-size:11px}.ad-pill{margin-left:auto;height:42px;width:34%;min-width:0;border-radius:11px;background:linear-gradient(135deg,rgba(104,54,79,.9),rgba(188,94,47,.85));padding:5px 9px;font-size:12px;font-weight:900;color:#ffe55d;display:flex;align-items:center;justify-content:flex-end;text-align:right;line-height:1.05}
         .seats{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));grid-auto-rows:min-content;align-content:start;gap:4px 2px;margin:15px 0 10px;min-height:0;flex:0 0 auto;max-height:340px}.seat{border:0;background:transparent;color:#fff;display:flex;flex-direction:column;justify-content:flex-start;align-items:center;gap:4px;min-width:0;min-height:0;cursor:pointer}.seat-circle{width:clamp(30px,10vw,46px);height:clamp(30px,10vw,46px);flex-shrink:0;border-radius:50%;background:rgba(174,170,225,.35);border:1px solid rgba(255,255,255,.24);display:grid;place-items:center;box-shadow:inset 0 0 18px rgba(255,255,255,.08)}.seat-plus{display:grid;place-items:center;width:100%;height:100%}.seat-plus svg{width:52%;height:52%;opacity:.9}.seat-label{font-size:12px;line-height:1.1;text-shadow:0 2px 4px rgba(0,0,0,.5);flex-shrink:0}.seat-live{background:linear-gradient(145deg,#8c61ff,#e24aaa);border:3px solid rgba(255,255,255,.78);position:relative}.seat-live:after{content:"";position:absolute;inset:-4px;border:2px solid rgba(91,255,167,.8);border-radius:50%;animation:vpulse 1.4s ease-in-out infinite}.seat-muted:after{border-color:rgba(255,255,255,.35)}
         .audience{height:52px;flex-shrink:0;border-radius:14px;background:rgba(18,7,79,.68);display:flex;align-items:center;padding:0 12px;margin-top:2px}.listener{width:38px;height:38px;border-radius:50%;background:#2d831d;display:grid;place-items:center;font-size:21px}.audience-count{margin-left:auto;border-left:1px solid rgba(255,255,255,.3);padding-left:14px;text-align:center;font-size:12px}.notice{margin-top:10px;width:74%;flex:0 1 auto;min-height:40px;overflow-y:auto;overscroll-behavior:contain;border-radius:11px;background:rgba(18,7,79,.72);padding:10px 12px;color:#31ef9b;font-size:13px;line-height:1.36}.share-note{margin-top:8px;width:74%;flex-shrink:0;border-radius:11px;background:rgba(18,7,79,.58);padding:7px 11px;color:#31ef9b;font-size:13px;line-height:1.2}.share-btn{border:0;border-radius:17px;background:linear-gradient(90deg,#8f64ff,#d85cff);color:#fff;padding:4px 11px;font-size:12px;margin-left:5px}
         .room-bottom{position:fixed;z-index:4;left:50%;transform:translateX(-50%);width:calc(100% - 24px);max-width:496px;bottom:max(8px,env(safe-area-inset-bottom));height:50px;display:flex;align-items:center;gap:6px}.say{height:44px;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;border:0;border-radius:25px;background:rgba(19,17,69,.88);color:#fff;text-align:left;padding:0 12px;font-size:14px}.round-action{position:relative;width:42px;height:42px;flex-shrink:0;border:0;border-radius:50%;background:rgba(19,17,69,.9);color:#fff;display:grid;place-items:center}.gift-action{background:linear-gradient(135deg,#5be3ec,#9069ff);font-size:24px}.mic-active{background:#28a96b}.voice-status{position:fixed;z-index:5;left:50%;bottom:74px;transform:translateX(-50%);white-space:nowrap;background:rgba(9,5,54,.84);border:1px solid rgba(255,255,255,.15);padding:6px 11px;border-radius:14px;font-size:11px}
         @media(max-width:370px){.room-title{font-size:15px}.room-code{font-size:12px}.room-avatar{width:42px;height:42px}.room-actions{gap:4px}.room-crown svg{width:24px}.ad-pill{font-size:11px}.rank-pill{font-size:13px}.round-action{width:36px;height:36px}.room-bottom{gap:4px}.say{font-size:12px;padding:0 8px}.notice,.share-note{width:83%}}
         @media(max-height:700px){.rank-row{margin-top:7px}.seats{margin:8px 0 5px;gap:3px 2px}.seat-circle{width:clamp(28px,8.6vw,40px);height:clamp(28px,8.6vw,40px)}.audience{height:43px}.listener{width:32px;height:32px}.notice{margin-top:6px;padding:7px 10px;font-size:12px}.share-note{margin-top:5px;padding:5px 9px;font-size:12px}}
         @media(prefers-reduced-motion:reduce){.seat-live:after{animation:none}}
      `}</style>
      <div className="room-ui">
        <header className="room-top">
          <div className="room-id">
            <div className="room-avatar">{avatarUrl ? <img src={avatarUrl} alt="" /> : <span>V</span>}</div>
            <div><div className="room-title">Velvet odası</div><div className="room-code">ID: 10136161</div></div>
          </div>
          <span className="room-crown"><Crown size={31} fill="currentColor"/></span>
          <div className="room-actions"><button className="icon-clear" aria-label="Daha çox"><MoreHorizontal size={30}/></button><button className="icon-clear power" onClick={()=>setRoomMenuOpen(true)} aria-label="Otaq menyusu"><LogOut size={20}/></button></div>
        </header>
        <div className="rank-row"><div className="rank-pill"><Medal size={22}/>&nbsp; OP50+</div><div className="rank-mini"><Radio size={18}/><span>0%</span></div><div className="ad-pill">Sınırlı<br/>ücretsiz</div></div>
        <section className="seats" aria-label="Konuşmacı koltukları">
           {Array.from({length:24}).map((_,i)=>{const member=speakersBySeat.get(i);const mine=member?.user_id===session?.user.id;const mName=(mine?name:member?.display_name)||"Üye";const mAv=mine?avatarUrl:member?.avatar_url;return <button className="seat" key={i} onClick={()=>member?setProfile(member):takeSeat(i)} aria-label={member ? `${mName} koltuğu` : `${i+1}. koltuğa otur`}><span className={`seat-circle ${member?"seat-live":""} ${member?.is_muted?"seat-muted":""}`} style={{overflow:"visible"}}>{member?(mAv?<img src={mAv} alt={mName} style={{width:"100%",height:"100%",borderRadius:"50%",objectFit:"cover"}}/>:(mName[0]||"V").toUpperCase()):<span className="seat-plus"><Plus strokeWidth={2.4}/></span>}{member?.is_muted&&<span style={{position:"absolute",right:-2,bottom:-2,width:20,height:20,borderRadius:"50%",background:"rgba(0,0,0,.7)",fontSize:11,display:"grid",placeItems:"center"}}>🔇</span>}</span><span className="seat-label" style={{maxWidth:64,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{member?mName.split(" ")[0]:i+1}</span></button>})}
        </section>
        <section className="audience"><div className="listener">V</div><div className="audience-count"><Users size={20}/><b>{peopleCount}</b></div></section>
        <section className="notice">Sohbet odasına hoş geldiniz! Lütfen sohbetlerde saygılı olun. Reşit olmayanların yayın yapması veya onları riske atan içerikler paylaşması kesinlikle yasaktır. Cinsel içerikli açık paylaşımlar, kumar, dolandırıcılık, taciz, istismar, tehdit ve diğer kural ihlalleri cezalandırılır. Herhangi bir ihlali lütfen bildirin.</section>
        <section className="share-note">Daha fazla kişinin katılması için odayı paylaşın <button className="share-btn" onClick={shareRoom}>{sharing?"Kopyalandı":"Paylaş"}</button></section>
        {error && <div className="voice-status">{error}</div>}
        {typeof connected === "number" && connected > 0 && <div className="voice-status">🟢 {connected} kişiyle canlı ses bağlantısı</div>}
      </div>
      {roomMenuOpen && <div className="room-menu-backdrop" onClick={()=>setRoomMenuOpen(false)}>
        <div className="room-menu" role="menu" aria-label="Otaq seçimləri" onClick={event=>event.stopPropagation()}>
          <button className="room-menu-item" onClick={onLeave} role="menuitem"><span className="room-menu-icon"><Power size={38} strokeWidth={2.15}/></span><span className="room-menu-label">Çıxış et</span></button>
          <button className="room-menu-item" onClick={async()=>{await shareRoom();setRoomMenuOpen(false);}} role="menuitem"><span className="room-menu-icon"><UserPlus size={38} strokeWidth={2.15}/></span><span className="room-menu-label">Dəvət et</span></button>
          <button className="room-menu-item" onClick={onLeave} role="menuitem"><span className="room-menu-icon"><Minimize2 size={38} strokeWidth={2.15}/></span><span className="room-menu-label">Kiçilt</span></button>
          <button className="room-menu-item" onClick={onLeave} role="menuitem"><span className="room-menu-icon"><DoorOpen size={38} strokeWidth={2.15}/></span><span className="room-menu-label">Otaq dəyiş</span></button>
        </div>
      </div>}
      {profile && (()=>{const mine=profile.user_id===session?.user.id;const pn=(mine?name:profile.display_name)||"Üye";const pa=mine?avatarUrl:profile.avatar_url;return (
        <div onClick={()=>setProfile(null)} style={{position:"fixed",inset:0,zIndex:80,background:"rgba(0,0,0,.55)",display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
          <div onClick={e=>e.stopPropagation()} style={{width:"100%",maxWidth:480,background:"linear-gradient(180deg,#2a2346,#16122a)",borderRadius:"24px 24px 0 0",padding:"0 20px 28px",color:"#fff",textAlign:"center"}}>
            <div style={{width:88,height:88,borderRadius:"50%",margin:"-44px auto 10px",border:"3px solid #fff",background:"linear-gradient(145deg,#8c61ff,#e24aaa)",display:"grid",placeItems:"center",fontSize:36,fontWeight:800,overflow:"hidden"}}>{pa?<img src={pa} alt={pn} style={{width:"100%",height:"100%",objectFit:"cover"}}/>:pn[0]?.toUpperCase()}</div>
            <div style={{fontSize:20,fontWeight:700}}>{pn}</div>
            <div style={{opacity:.65,fontSize:13,margin:"4px 0 14px"}}>ID: {profile.user_id.slice(0,8)} · {profile.is_muted?"🔇 Sessiz":"🎙️ Konuşuyor"}</div>
            {mine ? <div style={{display:"flex",gap:10}}>
              <button onClick={()=>{onToggleMic();setProfile(null);}} style={{flex:1,padding:12,borderRadius:22,border:0,background:"#8c61ff",color:"#fff",fontWeight:700}}>{muted?"Mikrofonu aç":"Mikrofonu kapat"}</button>
              <button onClick={()=>{onLeaveSeat();setProfile(null);}} style={{flex:1,padding:12,borderRadius:22,border:"1px solid rgba(255,255,255,.3)",background:"transparent",color:"#fff",fontWeight:700}}>Koltuktan in</button>
            </div> : <button onClick={()=>setProfile(null)} style={{width:"100%",padding:12,borderRadius:22,border:0,background:"#8c61ff",color:"#fff",fontWeight:700}}>Kapat</button>}
          </div>
        </div>)})()}
      <footer className="room-bottom">
        <button className="say" onClick={onOpenChat}>〆&nbsp;&nbsp; Bir şey söyle...</button>
        <button className="round-action" onClick={onOpenChat} aria-label="Mesajlar"><MessageCircle size={25}/><span style={{position:"absolute",right:-2,top:-5,background:"#ff5a4f",borderRadius:14,padding:"2px 6px",fontSize:11,fontWeight:800}}>32</span></button>
        <button className="round-action" aria-label="Menü"><span style={{fontSize:24,lineHeight:1}}>⌘</span></button>
         <button className={`round-action ${!muted?"mic-active":""}`} onClick={isSpeaker?onToggleMic:()=>takeSeat(Array.from({length:24}).findIndex((_,index)=>!speakersBySeat.has(index)))} aria-label={muted?"Mikrofonu aç":"Mikrofonu kapat"}>{muted?<MicOff size={23}/>:<Mic size={23}/>}</button>
        <button className="round-action gift-action" aria-label="Hediye"><Gift size={25}/></button>
      </footer>
    </main>
  );
}

/* ─── CHAT ─── */
function ChatPanel({ session, displayName, avatarUrl, onClose }: { session: Session | null; displayName: string; avatarUrl: string | null; onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [vh, setVh] = useState<{ h: number; top: number } | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Mesajları yüklə + realtime
  useEffect(() => {
    if (!session) {
      // DEMO: mesajlar cihazda saxlanır
      try { const d = localStorage.getItem("velvet_demo_chat"); setMessages(d ? JSON.parse(d) : [
        { id:1, user_id:"bot1", display_name:"Aynur", avatar_url:null, content:"Salam, xoş gəldin! 👋", created_at:new Date().toISOString() },
        { id:2, user_id:"bot2", display_name:"Rauf", avatar_url:null, content:"Otaq çox gözəldir 🔥", created_at:new Date().toISOString() },
      ]); } catch {}
      return;
    }
    supabase.from("messages").select("*").eq("room_id", ROOM_ID).order("created_at", { ascending: true }).limit(50).then(({ data }) => { if (data) setMessages(data as Message[]); });
    const ch = supabase.channel(`chat-${ROOM_ID}`).on("postgres_changes", { event:"INSERT", schema:"public", table:"messages", filter:`room_id=eq.${ROOM_ID}` }, p => setMessages(prev => [...prev, p.new as Message])).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  // Klaviatura açılanda ekran sürüşməsin: panel görünən sahəyə (visualViewport) uyğunlaşır
  useEffect(() => {
    const vv = window.visualViewport;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onResize = () => {
      if (!vv) return;
      setVh({ h: vv.height, top: vv.offsetTop });
      window.scrollTo(0, 0);
    };
    onResize();
    vv?.addEventListener("resize", onResize);
    vv?.addEventListener("scroll", onResize);
    return () => {
      vv?.removeEventListener("resize", onResize);
      vv?.removeEventListener("scroll", onResize);
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  // Həmişə ən son mesaja sürüşdür (yalnız siyahının içində)
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, vh]);

  const send = async () => {
    const t = text.trim();
    if (!t) return;
    setText("");
    if (!session) {
      let av: string | null = avatarUrl;
      try { av = av || localStorage.getItem("profile_avatar"); } catch {}
      setMessages(prev => {
        const next = [...prev, { id: Date.now(), user_id:"demo", display_name: displayName, avatar_url: av, content: t, created_at: new Date().toISOString() }].slice(-100);
        try { localStorage.setItem("velvet_demo_chat", JSON.stringify(next)); } catch {}
        return next;
      });
      return;
    }
    await supabase.from("messages").insert({ room_id: ROOM_ID, user_id: session.user.id, display_name: displayName, avatar_url: avatarUrl, content: t });
  };

  return (
    <div style={{ position:"fixed", left:0, right:0, top: vh ? vh.top : 0, height: vh ? vh.h : "100dvh", zIndex:150, display:"flex", flexDirection:"column", background:"#fff", overscrollBehavior:"contain" }}>
      <header style={{ flexShrink:0, position:"relative", height:52, display:"flex", alignItems:"center", justifyContent:"center", borderBottom:".5px solid rgba(20,10,40,.08)", paddingTop:"env(safe-area-inset-top)" }}>
        <span style={{ fontSize:17, fontWeight:600, color:"#111" }}>Söhbət</span>
        <button onClick={onClose} aria-label="Bağla" style={{ position:"absolute", right:8, bottom:6, width:40, height:40, background:"none", border:0, display:"flex", alignItems:"center", justifyContent:"center", color:"#111", cursor:"pointer" }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </header>

      <div ref={listRef} style={{ flex:1, minHeight:0, overflowY:"auto", WebkitOverflowScrolling:"touch", overscrollBehavior:"contain", padding:"12px 14px" }}>
        {messages.length === 0 && <p style={{ textAlign:"center", color:"#8e8e93", fontSize:14, marginTop:40 }}>Hələ mesaj yoxdur.</p>}
        {messages.map(msg => {
          const isMe = msg.user_id === (session ? session.user.id : "demo");
          return (
            <div key={msg.id} style={{ display:"flex", gap:10, alignItems:"flex-start", marginBottom:14, flexDirection: isMe ? "row-reverse" : "row" }}>
              <div style={{ width:36, height:36, borderRadius:"50%", flexShrink:0, overflow:"hidden", background:"linear-gradient(135deg,#7b2ff7,#ff3ea5)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:14, fontWeight:700 }}>
                {msg.avatar_url
                  ? <img src={msg.avatar_url} alt="" referrerPolicy="no-referrer" style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
                  : (msg.display_name?.[0]?.toUpperCase() || "?")}
              </div>
              <div style={{ maxWidth:"72%", display:"flex", flexDirection:"column", alignItems: isMe ? "flex-end" : "flex-start", gap:4 }}>
                <div style={{ display:"flex", alignItems:"center", gap:4, flexDirection: isMe ? "row-reverse" : "row" }}>
                  <span style={{ fontSize:13, fontWeight:600, color:"#3a3a3c", maxWidth:140, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{msg.display_name}</span>
                  <img src="/images/images/vlogo15.png" alt="" style={{ height:16, width:"auto", objectFit:"contain", flexShrink:0 }}/>
                </div>
                <div style={{ borderRadius:18, borderTopLeftRadius: isMe ? 18 : 6, borderTopRightRadius: isMe ? 6 : 18, padding:"8px 13px", fontSize:15, lineHeight:1.4, wordBreak:"break-word", background: isMe ? "#7b2ff7" : "#f2f2f7", color: isMe ? "#fff" : "#111" }}>{msg.content}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ flexShrink:0, borderTop:".5px solid rgba(20,10,40,.08)", padding:"8px 12px max(8px,env(safe-area-inset-bottom))", display:"flex", alignItems:"center", gap:8, background:"#fff" }}>
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); send(); } }}
          placeholder="Mesaj yaz…"
          enterKeyHint="send"
          autoComplete="off"
          style={{ flex:1, minWidth:0, height:40, borderRadius:20, background:"#f4f2f8", border:0, outline:"none", padding:"0 16px", fontSize:16, color:"#111", fontFamily:"inherit" }}
        />
        <button onClick={send} disabled={!text.trim()} aria-label="Göndər" style={{ width:40, height:40, borderRadius:"50%", border:0, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", background: text.trim() ? "#7b2ff7" : "#e5e5ea", color:"#fff", cursor: text.trim() ? "pointer" : "default", transition:"background .15s" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
        </button>
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
        <filter id="vsg_shadow"><feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="rgba(100,80,160,.3)"/></filter>
        <filter id="vsg_gg"><feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="rgba(255,200,0,.5)"/></filter>
        <filter id="vsg_blur"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      <path d="M60 4 C60 4 14 18 10 22 L10 72 C10 102 60 132 60 132 C60 132 110 102 110 72 L110 22 C106 18 60 4 60 4Z" fill="url(#vsg_out)" filter="url(#vsg_shadow)"/>
      <path d="M60 12 C60 12 20 24 17 27 L17 72 C17 98 60 124 60 124 C60 124 103 98 103 72 L103 27 C100 24 60 12 60 12Z" fill="url(#vsg_body)"/>
      <path d="M60 18 C60 18 24 29 22 32 L22 72 C22 95 60 118 60 118 C60 118 98 95 98 72 L98 32 C96 29 60 18 60 18Z" fill="none" stroke="url(#vsg_out)" strokeWidth="2.5"/>
      <path d="M60 22 C60 22 26 32 24 35 L24 72 C24 93 60 114 60 114 C60 114 96 93 96 72 L96 35 C94 32 60 22 60 22Z" fill="rgba(255,220,50,.03)" opacity=".6"/>
      <path d="M50 14 L50 128" stroke="rgba(100,80,160,.07)" strokeWidth="18"/>
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
  const c = state === "done" ? "rgba(80,200,80,.8)" : state === "active" ? "#ffd700" : "rgba(80,60,140,.2)";
  const icons: Record<number, JSX.Element> = {
    0: <svg width="20" height="20" viewBox="0 0 52 52"><defs><radialGradient id={`ig0`} cx="40%" cy="30%" r="70%"><stop offset="0%" stopColor={state==="done"?"#a0e0ff":state==="active"?"#ffe080":"#888"}/><stop offset="100%" stopColor={state==="done"?"#2060b0":state==="active"?"#a06000":"#444"}/></radialGradient></defs><ellipse cx="26" cy="28" rx="14" ry="17" fill={`url(#ig0)`}/><ellipse cx="20" cy="22" rx="4" ry="2.5" fill="rgba(40,20,80,.65)" transform="rotate(-30,20,22)"/><path d="M22 20 L24 24 L21 27 L25 32" stroke="rgba(40,20,100,.5)" strokeWidth="1.2" fill="none" strokeLinecap="round"/></svg>,
    1: <svg width="20" height="20" viewBox="0 0 52 52"><defs><linearGradient id={`ig1`} x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor={state==="done"?"#e8a060":state==="active"?"#ffe080":"#888"}/><stop offset="100%" stopColor={state==="done"?"#7a3a10":state==="active"?"#a06000":"#333"}/></linearGradient></defs><path d="M26 8 L40 14 L40 26 C40 34 33 40 26 44 C19 40 12 34 12 26 L12 14 Z" fill={`url(#ig1)`}/><ellipse cx="20" cy="18" rx="5" ry="2.5" fill="rgba(60,40,120,.5)" transform="rotate(-30,20,18)"/><text x="26" y="30" textAnchor="middle" fontSize="13" fontWeight="900" fill="rgba(255,255,200,.8)" fontFamily="Arial">I</text></svg>,
    2: <svg width="20" height="20" viewBox="0 0 52 52"><defs><linearGradient id={`ig2`} x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#ffe566"/><stop offset="100%" stopColor={state==="done"?"#cc4400":"#886600"}/></linearGradient></defs><path d="M30 8 L18 26 L24 26 L22 44 L34 22 L28 22 Z" fill={`url(#ig2)`}/><path d="M28 12 L20 26 L25 26 L23 38 L31 24 L26 24 Z" fill="rgba(255,240,180,.4)"/></svg>,
    3: <svg width="20" height="20" viewBox="0 0 52 52"><defs><linearGradient id={`ig3`} x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#c0e8ff"/><stop offset="100%" stopColor="#2060b0"/></linearGradient></defs><polygon points="26,9 38,17 14,17" fill={c} opacity=".9"/><polygon points="38,17 32,43 14,17 20,43" fill={`url(#ig3)`}/><polygon points="26,11 35,17 26,17" fill="rgba(40,20,100,.5)"/></svg>,
    4: <svg width="20" height="20" viewBox="0 0 52 52"><defs><radialGradient id={`ig4`} cx="50%" cy="60%" r="50%"><stop offset="0%" stopColor="#fff060"/><stop offset="60%" stopColor="#ff8000"/><stop offset="100%" stopColor="#660000"/></radialGradient></defs><path d="M26 44 C16 38 10 28 14 18 C16 24 20 22 20 16 C22 22 18 28 22 32 C22 26 26 20 24 12 C28 18 30 26 28 32 C30 28 34 24 32 18 C36 26 36 34 30 40 C28 42 26 44 26 44Z" fill={`url(#ig4)`}/><ellipse cx="26" cy="28" rx="5" ry="6" fill="rgba(255,255,200,.25)"/></svg>,
    5: <svg width="20" height="20" viewBox="0 0 52 52"><defs><linearGradient id={`ig5`} x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#fff0a0"/><stop offset="60%" stopColor="#ffd700"/><stop offset="100%" stopColor="#886600"/></linearGradient></defs><polygon points="26,6 29.8,17.8 42,17.8 32.2,24.8 36,36.4 26,29.8 16,36.4 19.8,24.8 10,17.8 22.2,17.8" fill={`url(#ig5)`}/><polygon points="26,7 29,17 22,17" fill="rgba(255,255,200,.6)"/></svg>,
    6: <svg width="20" height="20" viewBox="0 0 52 52"><defs><radialGradient id={`ig6`} cx="35%" cy="30%" r="70%"><stop offset="0%" stopColor="#a060ff"/><stop offset="100%" stopColor="#200060"/></radialGradient></defs><ellipse cx="26" cy="28" rx="14" ry="18" fill={`url(#ig6)`}/><path d="M18 22 Q21 18 24 22 Q21 26 18 22Z" fill="rgba(180,100,255,.6)"/><path d="M24 18 Q27 14 30 18 Q27 22 24 18Z" fill="rgba(180,100,255,.6)"/><path d="M30 22 Q33 18 36 22 Q33 26 30 22Z" fill="rgba(180,100,255,.6)"/><ellipse cx="22" cy="26" rx="2" ry="2.5" fill="rgba(0,200,255,.9)"/><ellipse cx="30" cy="26" rx="2" ry="2.5" fill="rgba(0,200,255,.9)"/></svg>,
    7: <svg width="20" height="20" viewBox="0 0 52 52"><defs><linearGradient id={`ig7`} x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#fff0a0"/><stop offset="50%" stopColor="#ffd700"/><stop offset="100%" stopColor="#886600"/></linearGradient></defs><path d="M8 38 L8 24 L16 30 L26 12 L36 30 L44 24 L44 38 Z" fill={`url(#ig7)`}/><rect x="8" y="36" width="36" height="5" rx="2" fill={`url(#ig7)`}/><circle cx="26" cy="36.5" r="3" fill="#ff3060"/><circle cx="16" cy="36.5" r="2.5" fill="#4080ff"/><circle cx="36" cy="36.5" r="2.5" fill="#40c060"/><ellipse cx="16" cy="26" rx="4" ry="2" fill="rgba(255,255,200,.25)" transform="rotate(-30,16,26)"/></svg>,
    8: <svg width="20" height="20" viewBox="0 0 52 52"><defs><radialGradient id={`ig8`} cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#60ffff"/><stop offset="70%" stopColor="#0060a0"/><stop offset="100%" stopColor="#001840"/></radialGradient></defs><path d="M6 26 Q16 10 26 10 Q36 10 46 26 Q36 42 26 42 Q16 42 6 26Z" fill="#001840"/><circle cx="26" cy="26" r="12" fill={`url(#ig8)`}/><circle cx="26" cy="26" r="5" fill="rgba(0,10,30,.95)"/><circle cx="22" cy="22" r="3" fill="rgba(200,255,255,.5)"/><line x1="26" y1="26" x2="44" y2="16" stroke="rgba(0,255,255,.7)" strokeWidth="1.5" strokeLinecap="round"/></svg>,
    9: <svg width="20" height="20" viewBox="0 0 52 52"><defs><linearGradient id={`ig9a`} x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#e8f8ff"/><stop offset="100%" stopColor="#2060b8"/></linearGradient><linearGradient id={`ig9b`} x1="100%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#c0e8ff"/><stop offset="100%" stopColor="#1040a0"/></linearGradient></defs><polygon points="14,18 26,9 38,18" fill={`url(#ig9a)`}/><polygon points="14,18 9,30 26,44" fill={`url(#ig9b)`}/><polygon points="38,18 43,30 26,44" fill={`url(#ig9a)`} opacity=".7"/><polygon points="14,18 26,9 26,18" fill="rgba(40,20,80,.65)"/></svg>,
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
    @keyframes vsgGlow{0%,100%{filter:drop-shadow(0 0 6px rgba(192,132,252,.4))}50%{filter:drop-shadow(0 0 20px rgba(192,132,252,.9))}}
    @keyframes vsgShimmer{0%{background-position:-300% 0}100%{background-position:300% 0}}
    @keyframes vsgSpin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
    @keyframes vsgPulse{0%,100%{opacity:.5;transform:scale(1)}50%{opacity:1;transform:scale(1.06)}}
    @keyframes vsgBar{0%,100%{transform:scaleY(.15)}50%{transform:scaleY(1)}}
    @keyframes vsgBlink{0%,100%{opacity:.15;transform:scale(.8)}50%{opacity:.9;transform:scale(1.2)}}
    @keyframes vsgDrift{0%{transform:translate3d(0,0,0) scale(1)}50%{transform:translate3d(18px,-26px,0) scale(1.12)}100%{transform:translate3d(0,0,0) scale(1)}}
    @keyframes vsgDrift2{0%{transform:translate3d(0,0,0) scale(1)}50%{transform:translate3d(-22px,20px,0) scale(1.08)}100%{transform:translate3d(0,0,0) scale(1)}}
    @keyframes vsgGrid{from{transform:translateY(0)}to{transform:translateY(40px)}}
    @keyframes vsgSweep{0%{transform:translateX(-60%) rotate(12deg);opacity:0}25%{opacity:.5}60%{opacity:0}100%{transform:translateX(160%) rotate(12deg);opacity:0}}
    @keyframes vsgRise{0%{transform:translateY(0);opacity:0}10%{opacity:.8}90%{opacity:.15}100%{transform:translateY(-320px);opacity:0}}
    @keyframes vsgWaveY{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
    .vs-anim{position:fixed;inset:0;overflow:hidden;pointer-events:none;z-index:0}
    .vs-orb{position:absolute;border-radius:50%;filter:blur(38px)}
    .vs-orb1{width:280px;height:280px;top:-70px;right:-60px;background:radial-gradient(circle,rgba(123,47,247,.55),transparent 68%);animation:vsgDrift 16s ease-in-out infinite}
    .vs-orb2{width:240px;height:240px;top:38%;left:-80px;background:radial-gradient(circle,rgba(255,62,165,.34),transparent 68%);animation:vsgDrift2 20s ease-in-out infinite}
    .vs-orb3{width:300px;height:300px;bottom:-110px;right:-70px;background:radial-gradient(circle,rgba(0,212,255,.2),transparent 70%);animation:vsgDrift 24s ease-in-out infinite 2s}
    .vs-grid{position:absolute;inset:-40px;background-image:linear-gradient(rgba(192,132,252,.07) 1px,transparent 1px),linear-gradient(90deg,rgba(192,132,252,.07) 1px,transparent 1px);background-size:40px 40px;mask-image:radial-gradient(ellipse at 50% 20%,#000 0%,transparent 72%);-webkit-mask-image:radial-gradient(ellipse at 50% 20%,#000 0%,transparent 72%);animation:vsgGrid 9s linear infinite}
    .vs-sweep{position:absolute;top:-20%;left:0;width:45%;height:140%;background:linear-gradient(90deg,transparent,rgba(192,132,252,.09),transparent);animation:vsgSweep 11s ease-in-out infinite}
    .vs-ring-a{position:absolute;top:8%;left:50%;width:420px;height:420px;margin-left:-210px;border-radius:50%;border:1px solid rgba(192,132,252,.09);animation:vsgSpin 40s linear infinite}
    .vs-ring-b{position:absolute;top:14%;left:50%;width:300px;height:300px;margin-left:-150px;border-radius:50%;border:1px dashed rgba(255,62,165,.09);animation:vsgSpin 28s linear infinite reverse}
    .vs-spark{position:absolute;bottom:-10px;width:3px;height:3px;border-radius:50%;background:#e5c8ff;box-shadow:0 0 8px rgba(192,132,252,.9);animation:vsgRise linear infinite}
    .vs-glimmer{position:absolute;width:2px;height:2px;border-radius:50%;background:#fff;opacity:.5;animation:vsgBlink ease-in-out infinite}
    .vs-scroll{overflow-y:auto;height:100dvh;padding-bottom:40px;background:transparent;position:relative;z-index:1}
    .vs-scroll::-webkit-scrollbar{display:none}
    .vs-bg{background:radial-gradient(ellipse at 70% 0%,rgba(123,47,247,.35) 0%,transparent 55%),radial-gradient(ellipse at 20% 60%,rgba(255,62,165,.15) 0%,transparent 50%);min-height:100dvh}
    .vs-nav{display:flex;align-items:center;justify-content:space-between;padding:max(18px,env(safe-area-inset-top)) 20px 14px}
    .vs-nav-btn{width:38px;height:38px;border-radius:13px;background:rgba(123,47,247,.12);border:1px solid rgba(123,47,247,.25);display:flex;align-items:center;justify-content:center;cursor:pointer;color:#fff}
    .vs-nav-title{font-size:18px;font-weight:700;color:#fff;letter-spacing:.3px}
    .vs-user-card{margin:0 16px 20px;background:rgba(255,255,255,.05);border:1px solid rgba(123,47,247,.3);border-radius:18px;padding:16px}
    .vs-user-row{display:flex;align-items:center;gap:14px;margin-bottom:12px}
    .vs-user-av{width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,#7b2ff7,#c084fc);display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:800;color:#fff;flex-shrink:0;border:2px solid rgba(192,132,252,.4);overflow:hidden}
    .vs-user-name{font-size:19px;font-weight:700;color:#fff;flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .vs-user-vip0{font-size:26px;font-weight:900;color:rgba(192,132,252,.35);letter-spacing:2px}
    .vs-user-promo{font-size:13px;color:rgba(255,255,255,.55);line-height:1.5}
    .vs-sec-hdr{display:flex;align-items:center;gap:8px;margin:0 16px 14px}
    .vs-sec-line{flex:1;height:1px;background:rgba(192,132,252,.2)}
    .vs-sec-deco{color:#c084fc;font-size:14px}
    .vs-sec-title{font-size:13px;font-weight:700;color:#c084fc;letter-spacing:1px;white-space:nowrap}
    .vs-vcard{margin:0 16px 22px;border-radius:18px;overflow:hidden;background:linear-gradient(160deg,#1a0035,#0d001e,#200040);border:1px solid rgba(123,47,247,.4)}
    .vs-unlock-bar{padding:11px;text-align:center;background:linear-gradient(90deg,rgba(123,47,247,.3),rgba(192,132,252,.5),rgba(255,62,165,.3),rgba(192,132,252,.5),rgba(123,47,247,.3));border-bottom:1px solid rgba(192,132,252,.2);position:relative}
    .vs-unlock-bar::before,.vs-unlock-bar::after{content:"✦";position:absolute;top:50%;transform:translateY(-50%);color:#c084fc;font-size:14px}
    .vs-unlock-bar::before{left:12px}
    .vs-unlock-bar::after{right:12px}
    .vs-unlock-txt{font-size:15px;font-weight:700;color:#e0c0ff;letter-spacing:.5px}
    .vs-badges-row{display:flex;justify-content:space-around;padding:28px 16px 20px}
    .vs-badge-item{display:flex;flex-direction:column;align-items:center;gap:10px}
    .vs-badge-wrap{width:90px;height:90px;border-radius:50%;position:relative;display:flex;align-items:center;justify-content:center}
    .vs-badge-outer{background:radial-gradient(circle at 35% 30%,#2a0060,#0d0020);border:2px solid rgba(123,47,247,.6)}
    .vs-badge-outer-empty{background:radial-gradient(circle at 35% 30%,#180030,#080010);border:2px solid rgba(123,47,247,.25)}
    .vs-badge-inner{width:64px;height:64px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#7b2ff7,#3d0880);display:flex;align-items:center;justify-content:center;position:relative}
    .vs-badge-inner-empty{width:64px;height:64px;border-radius:50%;background:rgba(123,47,247,.08);border:2px dashed rgba(123,47,247,.3);display:flex;align-items:center;justify-content:center}
    .vs-badge-spin{position:absolute;inset:-2px;border-radius:50%;border:2px solid transparent;border-top-color:#c084fc;border-right-color:#ff3ea5;animation:vsgSpin 3s linear infinite}
    .vs-badge-lbl{font-size:8px;font-weight:800;color:#ffd700;letter-spacing:1px;position:absolute;bottom:7px}
    .vs-badge-name{font-size:13px;color:rgba(255,255,255,.8);text-align:center;font-weight:500;max-width:95px;line-height:1.3}
    .vs-dots{display:flex;justify-content:center;gap:6px;padding:0 0 18px}
    .vs-dot{width:7px;height:7px;border-radius:50%;background:rgba(255,255,255,.15)}
    .vs-dot.on{background:#c084fc}
    .vs-func-wrap{padding:0 16px;margin-bottom:22px}
    .vs-func-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}
    .vs-func-item{background:rgba(123,47,247,.1);border:1px solid rgba(123,47,247,.25);border-radius:14px;padding:16px 10px;display:flex;flex-direction:column;align-items:center;gap:10px}
    .vs-func-ico{width:50px;height:50px;border-radius:50%;background:radial-gradient(circle at 40% 35%,rgba(123,47,247,.5),rgba(60,0,120,.8));border:1.5px solid rgba(192,132,252,.35);display:flex;align-items:center;justify-content:center}
    .vs-func-lbl{font-size:12px;color:rgba(255,255,255,.75);text-align:center;line-height:1.35;font-weight:500}
    .vs-cta{margin:0 16px;background:linear-gradient(135deg,rgba(255,62,165,.15),rgba(123,47,247,.2));border:1px solid rgba(255,62,165,.4);border-radius:28px;padding:16px 20px;text-align:center}
    .vs-cta-txt{font-size:14px;font-weight:700;color:#ffb0d8}
    .vs-vanim{margin:0 16px 20px;border-radius:20px;overflow:hidden;position:relative;height:72px;background:#08001a;border:1px solid rgba(123,47,247,.2)}
    .vs-va-g1{position:absolute;width:160px;height:160px;top:-80px;left:15px;border-radius:50%;background:radial-gradient(circle,rgba(123,47,247,.2) 0%,transparent 70%);animation:vsgPulse 3.5s ease-in-out infinite}
    .vs-va-g2{position:absolute;width:130px;height:130px;top:-65px;right:25px;border-radius:50%;background:radial-gradient(circle,rgba(255,62,165,.14) 0%,transparent 70%);animation:vsgPulse 3.5s ease-in-out infinite .8s}
    .vs-va-center{position:absolute;inset:0;display:flex;align-items:center;justify-content:center}
    .vs-va-logo{position:relative;width:50px;height:50px;display:flex;align-items:center;justify-content:center}
    .vs-va-r1{position:absolute;inset:0;border-radius:50%;border:1.5px solid rgba(192,132,252,.2);animation:vsgSpin 9s linear infinite}
    .vs-va-r2{position:absolute;inset:6px;border-radius:50%;border:1px dashed rgba(255,62,165,.14);animation:vsgSpin 6s linear infinite reverse}
    .vs-va-v{width:30px;height:30px;border-radius:50%;background:linear-gradient(135deg,#1e003e,#320068);border:1.5px solid rgba(123,47,247,.5);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:900;color:#fff;font-style:italic}
    .vs-va-bars{position:absolute;right:22px;top:50%;transform:translateY(-50%);display:flex;align-items:flex-end;gap:2.5px;height:32px}
    .vs-va-bar{width:4px;border-radius:2px;transform-origin:bottom}
    .vs-va-stars{position:absolute;left:18px;top:50%;transform:translateY(-50%);display:flex;flex-direction:column;gap:7px}
    .vs-vstar{font-size:9px;animation:vsgBlink ease-in-out infinite}
  `;

  const displayName = (() => { try { const p = localStorage.getItem("velvet_profile"); return p ? JSON.parse(p).username : "İstifadəçi"; } catch { return "İstifadəçi"; } })();
  const avatarImg = (() => { try { return localStorage.getItem("profile_avatar"); } catch { return null; } })();
  const avatarLetter = displayName?.[0]?.toUpperCase() || "İ";

  const funcItems = [
    { label: "Otağı Kilidləmə", icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#c084fc" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/><circle cx="12" cy="16" r="1.5" fill="#c084fc" stroke="none"/></svg> },
    { label: "Ölkə Məlumatını Gizlət", icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#c084fc" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/><line x1="4" y1="20" x2="20" y2="20"/><line x1="8" y1="12" x2="8" y2="20" strokeDasharray="2,2"/></svg> },
    { label: "Onlayn Statusunu Gizlət", icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#c084fc" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/><path d="M3 12h2M19 12h2M12 3v2M12 19v2"/></svg> },
    { label: "Tab Xüsusiyyəti", icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#c084fc" strokeWidth="1.8" strokeLinecap="round"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M9 5v14M2 12h7"/></svg> },
  ];

  return (
    <main style={{ background:"#07000f", minHeight:"100dvh", fontFamily:"'Helvetica Neue',Arial,sans-serif" }}>
      <style>{CSS}</style>
      <div className="vs-anim" aria-hidden="true">
        <div className="vs-orb vs-orb1"/>
        <div className="vs-orb vs-orb2"/>
        <div className="vs-orb vs-orb3"/>
        <div className="vs-ring-a"/>
        <div className="vs-ring-b"/>
        <div className="vs-grid"/>
        <div className="vs-sweep"/>
        {[8, 22, 35, 48, 61, 74, 88].map((left, i) => (
          <span key={`sp${i}`} className="vs-spark" style={{ left: `${left}%`, animationDuration: `${9 + i * 1.6}s`, animationDelay: `${i * 1.4}s` }}/>
        ))}
        {[[14,18],[32,52],[57,26],[72,68],[86,40],[44,82]].map(([x, y], i) => (
          <span key={`gl${i}`} className="vs-glimmer" style={{ left: `${x}%`, top: `${y}%`, animationDuration: `${2.6 + i * 0.5}s`, animationDelay: `${i * 0.4}s` }}/>
        ))}
      </div>
      <div className="vs-scroll">
        <div className="vs-bg">
          <div className="vs-nav">
            <button className="vs-nav-btn" onClick={onBack} aria-label="Geri">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
            <span className="vs-nav-title">VIP</span>
            <button className="vs-nav-btn" aria-label="Kömək">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(192,132,252,.8)" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.3 2.4c-.5.2-.8.7-.8 1.2v.4"/><circle cx="12" cy="17" r=".6" fill="rgba(192,132,252,.8)" stroke="none"/></svg>
            </button>
          </div>

          <div className="vs-user-card">
            <div className="vs-user-row">
              <div className="vs-user-av">{avatarImg ? <img src={avatarImg} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }}/> : avatarLetter}</div>
              <div className="vs-user-name">{displayName}</div>
              <div className="vs-user-vip0">VIP0</div>
            </div>
            <div className="vs-user-promo">
              İstənilən məbləğdə yükləmə edərək VIP olun{" "}
              <span style={{ color:"#c084fc", fontWeight:600 }}>VIP &gt;</span>
            </div>
          </div>

          <div className="vs-sec-hdr">
            <div className="vs-sec-line"/><span className="vs-sec-deco">✦</span>
            <span className="vs-sec-title">VIP Səviyyə Üstünlükləri</span>
            <span className="vs-sec-deco">✦</span><div className="vs-sec-line"/>
          </div>

          <div className="vs-vcard">
            <div className="vs-unlock-bar"><span className="vs-unlock-txt">VIP1 Kilidini Aç</span></div>
            <div className="vs-badges-row">
              <div className="vs-badge-item">
                <div className="vs-badge-wrap vs-badge-outer">
                  <div className="vs-badge-spin"/>
                  <div className="vs-badge-inner">
                    <svg width="30" height="30" viewBox="0 0 40 40">
                      <circle cx="20" cy="20" r="13" fill="#0d0020" stroke="#c084fc" strokeWidth="1.5"/>
                      <circle cx="20" cy="20" r="7" fill="none" stroke="#ff3ea5" strokeWidth="1.5"/>
                      <circle cx="20" cy="20" r="3" fill="#c084fc"/>
                      <circle cx="13" cy="13" r="2.5" fill="#7b2ff7"/>
                      <circle cx="27" cy="13" r="2.5" fill="#7b2ff7"/>
                      <circle cx="20" cy="30" r="2.5" fill="#7b2ff7"/>
                    </svg>
                    <span className="vs-badge-lbl">VIP1</span>
                  </div>
                </div>
                <div className="vs-badge-name">VIP Nişanı</div>
              </div>
              <div className="vs-badge-item">
                <div className="vs-badge-wrap vs-badge-outer-empty">
                  <div className="vs-badge-inner-empty">
                    <svg width="32" height="32" viewBox="0 0 40 40">
                      <circle cx="20" cy="20" r="15" fill="none" stroke="rgba(123,47,247,.4)" strokeWidth="2"/>
                      <circle cx="20" cy="20" r="9" fill="none" stroke="rgba(123,47,247,.3)" strokeWidth="1.5"/>
                      <path d="M8 20 Q14 10 20 8 Q26 10 32 20" fill="none" stroke="rgba(192,132,252,.4)" strokeWidth="1.5"/>
                      <circle cx="20" cy="8" r="3" fill="rgba(192,132,252,.3)"/>
                    </svg>
                  </div>
                </div>
                <div className="vs-badge-name">VIP Profil Çərçivəsi</div>
              </div>
            </div>
            <div className="vs-dots">{[0,1,2,3,4].map(i => <div key={i} className={`vs-dot${i===0?" on":""}`}/>)}</div>
          </div>

          <div className="vs-vanim">
            <div className="vs-va-g1"/><div className="vs-va-g2"/>
            <div className="vs-va-stars">
              <span className="vs-vstar" style={{ color:"#ff3ea5", animationDuration:"1.8s" }}>✦</span>
              <span className="vs-vstar" style={{ color:"#c084fc", animationDuration:"2.3s", animationDelay:".6s", fontSize:"7px" }}>✦</span>
              <span className="vs-vstar" style={{ color:"#00d4ff", animationDuration:"1.6s", animationDelay:"1.1s" }}>✦</span>
            </div>
            <div className="vs-va-center">
              <div className="vs-va-logo">
                <div className="vs-va-r1"/><div className="vs-va-r2"/>
                {[{c:"#ff3ea5",d:"0s"},{c:"#c084fc",d:"1.2s"},{c:"#00d4ff",d:"2.4s"}].map((o,i) => (
                  <div key={i} style={{ position:"absolute", top:"50%", left:"50%", width:5, height:5, borderRadius:"50%", background:o.c, marginLeft:-2.5, marginTop:-2.5, animation:`vorbit 3.5s linear infinite ${o.d}` }}/>
                ))}
                <div className="vs-va-v">V</div>
              </div>
            </div>
            <div className="vs-va-bars">
              {["#ff6b35","#ff3ea5","#c084fc","#7b2ff7","#00d4ff","#ff3ea5","#c084fc"].map((c,i) => (
                <div key={i} className="vs-va-bar" style={{ background:c, height:32, animation:`vsgBar .75s ease-in-out infinite ${i*.1}s`, transformOrigin:"bottom" }}/>
              ))}
            </div>
          </div>

          <div className="vs-sec-hdr">
            <div className="vs-sec-line"/><span className="vs-sec-deco">✦</span>
            <span className="vs-sec-title">Funksional Üstünlüklər</span>
            <span className="vs-sec-deco">✦</span><div className="vs-sec-line"/>
          </div>

          <div className="vs-func-wrap">
            <div className="vs-func-grid">
              {funcItems.map((item, i) => (
                <div key={i} className="vs-func-item">
                  <div className="vs-func-ico">{item.icon}</div>
                  <div className="vs-func-lbl">{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="vs-cta"><div className="vs-cta-txt">İstədiyiniz məbləğdə yükləmə edin və VIP olun!</div></div>
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
      <h2 style={{ fontSize:32, fontWeight:900, color:"#1a1a2e", marginTop:8, textAlign:"center" }}>Qızıl Qapılar Açılır</h2>
      <p style={{ fontSize:13, color:"#5a3a7a", marginTop:10, textAlign:"center" }}>{name}, işıqlar sənin üçün yanır.</p>
      <div style={{ width:120, height:1, background:"rgba(123,47,247,.5)", marginTop:24 }}/>
    </div>
  );
}
