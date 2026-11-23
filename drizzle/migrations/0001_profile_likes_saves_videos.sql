
-- Profile: bio + photo, public read, own edit
ALTER TABLE public.profiles ADD COLUMN bio text NOT NULL DEFAULT '' CHECK (char_length(bio) <= 160);
ALTER TABLE public.profiles ADD COLUMN avatar_url text;
GRANT SELECT ON public.profiles TO anon;
GRANT UPDATE (display_name, bio, avatar_url) ON public.profiles TO authenticated;
CREATE POLICY "Anyone can see public profiles" ON public.profiles FOR SELECT TO anon USING (true);
CREATE POLICY "Users edit their own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());
ALTER TABLE public.profiles ADD CONSTRAINT profiles_display_name_len CHECK (char_length(btrim(display_name)) BETWEEN 1 AND 40);

-- Uploaded videos
CREATE TABLE public.videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  storage_path text NOT NULL,
  poster_path text,
  description text NOT NULL DEFAULT '' CHECK (char_length(description) <= 300),
  duration_sec numeric NOT NULL CHECK (duration_sec > 0 AND duration_sec <= 180),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX videos_user_created_idx ON public.videos(user_id, created_at DESC);
CREATE INDEX videos_created_idx ON public.videos(created_at DESC);
GRANT SELECT ON public.videos TO anon;
GRANT SELECT, INSERT, DELETE ON public.videos TO authenticated;
GRANT ALL ON public.videos TO service_role;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can watch videos" ON public.videos FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Users publish their own videos" ON public.videos
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users delete their own videos" ON public.videos
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Likes (video_id is a sample clip id or an uploaded video id)
CREATE TABLE public.video_likes (
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  video_id text NOT NULL CHECK (char_length(video_id) BETWEEN 1 AND 64),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, video_id)
);
CREATE INDEX video_likes_video_idx ON public.video_likes(video_id);
GRANT SELECT, INSERT, DELETE ON public.video_likes TO authenticated;
GRANT ALL ON public.video_likes TO service_role;
ALTER TABLE public.video_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see their own likes" ON public.video_likes FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users add their own likes" ON public.video_likes FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users remove their own likes" ON public.video_likes FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Saves (Favorite)
CREATE TABLE public.video_saves (
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  video_id text NOT NULL CHECK (char_length(video_id) BETWEEN 1 AND 64),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, video_id)
);
GRANT SELECT, INSERT, DELETE ON public.video_saves TO authenticated;
GRANT ALL ON public.video_saves TO service_role;
ALTER TABLE public.video_saves ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see their own saves" ON public.video_saves FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users add their own saves" ON public.video_saves FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users remove their own saves" ON public.video_saves FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Follows (target is a creator username)
CREATE TABLE public.follows (
  follower_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  target_username text NOT NULL CHECK (char_length(target_username) BETWEEN 1 AND 40),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (follower_id, target_username)
);
CREATE INDEX follows_target_idx ON public.follows(target_username);
GRANT SELECT, INSERT, DELETE ON public.follows TO authenticated;
GRANT ALL ON public.follows TO service_role;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see who they follow" ON public.follows FOR SELECT TO authenticated USING (follower_id = auth.uid());
CREATE POLICY "Users follow creators" ON public.follows FOR INSERT TO authenticated WITH CHECK (follower_id = auth.uid());
CREATE POLICY "Users unfollow creators" ON public.follows FOR DELETE TO authenticated USING (follower_id = auth.uid());

-- Public like totals per video
CREATE OR REPLACE FUNCTION public.video_like_counts(_ids text[])
RETURNS TABLE (video_id text, likes bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT l.video_id, count(*) FROM public.video_likes l
  WHERE l.video_id = ANY(_ids)
  GROUP BY l.video_id
$$;
REVOKE EXECUTE ON FUNCTION public.video_like_counts(text[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.video_like_counts(text[]) TO anon, authenticated;

-- Profile totals
CREATE OR REPLACE FUNCTION public.profile_stats(_user uuid)
RETURNS TABLE (followers bigint, following bigint, likes bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT
    (SELECT count(*) FROM public.follows f JOIN public.profiles p ON p.username = f.target_username WHERE p.id = _user),
    (SELECT count(*) FROM public.follows f WHERE f.follower_id = _user),
    (SELECT count(*) FROM public.video_likes l JOIN public.videos v ON v.id::text = l.video_id WHERE v.user_id = _user)
$$;
REVOKE EXECUTE ON FUNCTION public.profile_stats(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.profile_stats(uuid) TO authenticated;

-- Storage: each user uploads only into their own folder
CREATE POLICY "Users upload into their own folder" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id IN ('videos', 'avatars') AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users replace files in their own folder" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id IN ('videos', 'avatars') AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id IN ('videos', 'avatars') AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users delete files in their own folder" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id IN ('videos', 'avatars') AND (storage.foldername(name))[1] = auth.uid()::text);
