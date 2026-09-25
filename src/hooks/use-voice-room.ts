import { useCallback, useEffect, useRef, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type Signal = { id: number; sender_id: string; target_id: string; signal_type: "offer" | "answer" | "ice"; payload: unknown };

export function useVoiceRoom(roomId: string, session: Session | null, active: boolean) {
  const [muted, setMuted] = useState(true);
  const [error, setError] = useState("");
  const streamRef = useRef<MediaStream | null>(null);
  const peersRef = useRef(new Map<string, RTCPeerConnection>());
  const audioRef = useRef(new Map<string, HTMLAudioElement>());

  const sendSignal = useCallback(async (targetId: string, signalType: Signal["signal_type"], payload: unknown) => {
    if (!session) return;
    await supabase.from("voice_signals").insert({ room_id: roomId, sender_id: session.user.id, target_id: targetId, signal_type: signalType, payload: JSON.parse(JSON.stringify(payload)) });
  }, [roomId, session]);

  const getPeer = useCallback((otherId: string) => {
    const existing = peersRef.current.get(otherId);
    if (existing) return existing;
    const peer = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
    streamRef.current?.getTracks().forEach((track) => streamRef.current && peer.addTrack(track, streamRef.current));
    peer.onicecandidate = (event) => { if (event.candidate) void sendSignal(otherId, "ice", event.candidate.toJSON()); };
    peer.ontrack = (event) => {
      const audio = audioRef.current.get(otherId) ?? new Audio();
      audio.autoplay = true;
      audio.srcObject = event.streams[0] ?? new MediaStream([event.track]);
      audioRef.current.set(otherId, audio);
      void audio.play().catch(() => undefined);
    };
    peersRef.current.set(otherId, peer);
    return peer;
  }, [sendSignal]);

  useEffect(() => {
    if (!active || !session) return;
    const me = session.user.id;
    const handleSignal = async (signal: Signal) => {
      if (signal.target_id !== me) return;
      const peer = getPeer(signal.sender_id);
      if (signal.signal_type === "offer") {
        await peer.setRemoteDescription(signal.payload as RTCSessionDescriptionInit);
        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);
        await sendSignal(signal.sender_id, "answer", answer);
      } else if (signal.signal_type === "answer") {
        await peer.setRemoteDescription(signal.payload as RTCSessionDescriptionInit);
      } else if (peer.remoteDescription) {
        await peer.addIceCandidate(signal.payload as RTCIceCandidateInit);
      }
      await supabase.from("voice_signals").delete().eq("id", signal.id);
    };
    const channel = supabase.channel(`voice-${roomId}-${me}`).on("postgres_changes", { event: "INSERT", schema: "public", table: "voice_signals", filter: `target_id=eq.${me}` }, (event) => void handleSignal(event.new as Signal)).subscribe();
    return () => { supabase.removeChannel(channel); peersRef.current.forEach((peer) => peer.close()); peersRef.current.clear(); audioRef.current.forEach((audio) => { audio.pause(); audio.srcObject = null; }); audioRef.current.clear(); };
  }, [active, getPeer, roomId, sendSignal, session]);

  const toggleMic = useCallback(async () => {
    if (!session) { setError("Canlı konuşmak için giriş yapmalısın."); return; }
    if (muted) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
        streamRef.current = stream;
        const { data: members } = await supabase.from("room_members").select("user_id").eq("room_id", roomId).neq("user_id", session.user.id);
        for (const member of members ?? []) {
          const peer = getPeer(member.user_id);
          stream.getTracks().forEach((track) => peer.addTrack(track, stream));
          const offer = await peer.createOffer();
          await peer.setLocalDescription(offer);
          await sendSignal(member.user_id, "offer", offer);
        }
        setMuted(false);
        await supabase.from("room_members").update({ is_muted: false }).eq("room_id", roomId).eq("user_id", session.user.id);
      } catch { setError("Mikrofon izni verilmedi."); }
    } else {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setMuted(true);
      await supabase.from("room_members").update({ is_muted: true }).eq("room_id", roomId).eq("user_id", session.user.id);
    }
  }, [getPeer, muted, roomId, sendSignal, session]);

  return { muted, error, toggleMic };
}
