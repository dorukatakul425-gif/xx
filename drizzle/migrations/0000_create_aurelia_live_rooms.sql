CREATE TABLE public.room_members (
  room_id uuid NOT NULL,
  user_id uuid NOT NULL,
  role text NOT NULL DEFAULT 'listener' CHECK (role IN ('listener', 'speaker')),
  is_muted boolean NOT NULL DEFAULT true,
  joined_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (room_id, user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.room_members TO authenticated;
GRANT ALL ON public.room_members TO service_role;
ALTER TABLE public.room_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Signed-in users can see room members" ON public.room_members FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can join rooms as themselves" ON public.room_members FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own seat" ON public.room_members FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave their own room" ON public.room_members FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.enforce_room_speaker_limit()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.role = 'speaker' AND (TG_OP = 'INSERT' OR OLD.role IS DISTINCT FROM 'speaker') THEN
    PERFORM pg_advisory_xact_lock(hashtext(NEW.room_id::text));
    IF (SELECT count(*) FROM public.room_members WHERE room_id = NEW.room_id AND role = 'speaker') >= 6 THEN
      RAISE EXCEPTION 'Bu odadaki konuşmacı koltukları dolu';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER room_speaker_limit
BEFORE INSERT OR UPDATE OF role ON public.room_members
FOR EACH ROW EXECUTE FUNCTION public.enforce_room_speaker_limit();

CREATE TABLE public.messages (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  room_id uuid NOT NULL,
  user_id uuid NOT NULL,
  display_name text NOT NULL CHECK (char_length(display_name) BETWEEN 1 AND 80),
  avatar_url text,
  content text NOT NULL CHECK (char_length(content) BETWEEN 1 AND 500),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.messages TO authenticated;
GRANT ALL ON public.messages TO service_role;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Signed-in users can read room messages" ON public.messages FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can send their own messages" ON public.messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE INDEX messages_room_created_idx ON public.messages (room_id, created_at DESC);

ALTER PUBLICATION supabase_realtime ADD TABLE public.room_members;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;