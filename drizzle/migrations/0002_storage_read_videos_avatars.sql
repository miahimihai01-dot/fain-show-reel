CREATE POLICY "Anyone can view published videos and photos" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id IN ('videos', 'avatars'));