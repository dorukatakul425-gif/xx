CREATE TABLE public.voice_signals (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  room_id uuid NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL,
  target_id uuid NOT NULL,
  signal_type text NOT NULL CHECK (signal_type IN ('offer', 'answer', 'ice')),
  payload jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.voice_signals TO authenticated;
GRANT ALL ON public.voice_signals TO service_role;
ALTER TABLE public.voice_signals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can view room voice signals" ON public.voice_signals FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.room_members rm WHERE rm.room_id = voice_signals.room_id AND rm.user_id = auth.uid()));
CREATE POLICY "Users can send voice signals" ON public.voice_signals FOR INSERT TO authenticated WITH CHECK (auth.uid() = sender_id AND EXISTS (SELECT 1 FROM public.room_members rm WHERE rm.room_id = voice_signals.room_id AND rm.user_id = auth.uid()));
CREATE POLICY "Users can remove received voice signals" ON public.voice_signals FOR DELETE TO authenticated USING (auth.uid() = target_id OR auth.uid() = sender_id);
CREATE INDEX voice_signals_target_idx ON public.voice_signals (target_id, created_at);
ALTER PUBLICATION supabase_realtime ADD TABLE public.voice_signals;