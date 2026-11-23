
-- Profiles
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text NOT NULL UNIQUE,
  display_name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Signed-in users can see profiles" ON public.profiles
  FOR SELECT TO authenticated USING (true);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  base text;
  candidate text;
  n int := 0;
BEGIN
  base := lower(regexp_replace(
    coalesce(nullif(new.raw_user_meta_data->>'username', ''), split_part(coalesce(new.email, ''), '@', 1), ''),
    '[^a-zA-Z0-9._]', '', 'g'));
  IF length(base) < 3 THEN base := 'fan' || base; END IF;
  base := left(base, 20);
  candidate := base;
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = candidate) LOOP
    n := n + 1;
    candidate := base || n::text;
  END LOOP;
  INSERT INTO public.profiles (id, username, display_name)
  VALUES (
    new.id,
    candidate,
    left(coalesce(
      nullif(btrim(new.raw_user_meta_data->>'display_name'), ''),
      nullif(btrim(new.raw_user_meta_data->>'full_name'), ''),
      nullif(btrim(new.raw_user_meta_data->>'name'), ''),
      candidate), 40)
  );
  RETURN new;
END $$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Conversations
CREATE TABLE public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  last_message_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.conversations TO authenticated;
GRANT ALL ON public.conversations TO service_role;

CREATE TABLE public.conversation_participants (
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  last_read_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (conversation_id, user_id)
);
CREATE INDEX conversation_participants_user_idx ON public.conversation_participants(user_id);
GRANT SELECT ON public.conversation_participants TO authenticated;
GRANT UPDATE (last_read_at) ON public.conversation_participants TO authenticated;
GRANT ALL ON public.conversation_participants TO service_role;

CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  body text NOT NULL CHECK (char_length(btrim(body)) BETWEEN 1 AND 2000),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX messages_conversation_created_idx ON public.messages(conversation_id, created_at);
GRANT SELECT, INSERT ON public.messages TO authenticated;
GRANT ALL ON public.messages TO service_role;

CREATE OR REPLACE FUNCTION public.is_participant(_conversation_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.conversation_participants
    WHERE conversation_id = _conversation_id AND user_id = auth.uid()
  )
$$;
REVOKE EXECUTE ON FUNCTION public.is_participant(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_participant(uuid) TO authenticated;

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants see their conversations" ON public.conversations
  FOR SELECT TO authenticated USING (public.is_participant(id));
CREATE POLICY "Participants see who is in the conversation" ON public.conversation_participants
  FOR SELECT TO authenticated USING (public.is_participant(conversation_id));
CREATE POLICY "Users mark their own conversations read" ON public.conversation_participants
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Participants read messages" ON public.messages
  FOR SELECT TO authenticated USING (public.is_participant(conversation_id));
CREATE POLICY "Participants send their own messages" ON public.messages
  FOR INSERT TO authenticated WITH CHECK (sender_id = auth.uid() AND public.is_participant(conversation_id));

-- Start (or reuse) a one-to-one conversation
CREATE OR REPLACE FUNCTION public.start_conversation(_other_user uuid)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  me uuid := auth.uid();
  conv uuid;
BEGIN
  IF me IS NULL THEN RAISE EXCEPTION 'not signed in'; END IF;
  IF _other_user IS NULL OR _other_user = me THEN RAISE EXCEPTION 'invalid recipient'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = _other_user) THEN
    RAISE EXCEPTION 'user not found';
  END IF;
  SELECT a.conversation_id INTO conv
  FROM public.conversation_participants a
  JOIN public.conversation_participants b
    ON b.conversation_id = a.conversation_id AND b.user_id = _other_user
  WHERE a.user_id = me
  LIMIT 1;
  IF conv IS NOT NULL THEN RETURN conv; END IF;
  INSERT INTO public.conversations DEFAULT VALUES RETURNING id INTO conv;
  INSERT INTO public.conversation_participants (conversation_id, user_id)
  VALUES (conv, me), (conv, _other_user);
  RETURN conv;
END $$;
REVOKE EXECUTE ON FUNCTION public.start_conversation(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.start_conversation(uuid) TO authenticated;

-- Conversation list for the signed-in user
CREATE OR REPLACE FUNCTION public.list_my_conversations()
RETURNS TABLE (
  conversation_id uuid,
  other_user_id uuid,
  other_username text,
  other_display_name text,
  last_message text,
  last_sender_id uuid,
  last_message_at timestamptz,
  unread_count bigint
) LANGUAGE sql STABLE SECURITY INVOKER SET search_path = '' AS $$
  SELECT
    c.id,
    op.id,
    op.username,
    op.display_name,
    lm.body,
    lm.sender_id,
    c.last_message_at,
    (SELECT count(*) FROM public.messages m
      WHERE m.conversation_id = c.id AND m.sender_id <> auth.uid() AND m.created_at > me.last_read_at)
  FROM public.conversation_participants me
  JOIN public.conversations c ON c.id = me.conversation_id
  JOIN public.conversation_participants o ON o.conversation_id = c.id AND o.user_id <> me.user_id
  JOIN public.profiles op ON op.id = o.user_id
  LEFT JOIN LATERAL (
    SELECT m.body, m.sender_id FROM public.messages m
    WHERE m.conversation_id = c.id ORDER BY m.created_at DESC LIMIT 1
  ) lm ON true
  WHERE me.user_id = auth.uid()
  ORDER BY c.last_message_at DESC
$$;
REVOKE EXECUTE ON FUNCTION public.list_my_conversations() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.list_my_conversations() TO authenticated;

-- On new message: bump conversation time and ring each participant's private doorbell
CREATE OR REPLACE FUNCTION public.on_message_inserted()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  p record;
BEGIN
  UPDATE public.conversations SET last_message_at = new.created_at WHERE id = new.conversation_id;
  FOR p IN SELECT user_id FROM public.conversation_participants WHERE conversation_id = new.conversation_id LOOP
    PERFORM realtime.send(
      jsonb_build_object('conversation_id', new.conversation_id),
      'new_message',
      'user:' || p.user_id::text,
      true
    );
  END LOOP;
  RETURN new;
END $$;

CREATE TRIGGER messages_after_insert
  AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.on_message_inserted();

CREATE POLICY "Users listen to their own message doorbell" ON realtime.messages
  FOR SELECT TO authenticated
  USING (realtime.topic() = 'user:' || auth.uid()::text);
