-- Dodatkowe kolumny do musician_profiles dla rozbudowanego profilu

ALTER TABLE public.musician_profiles
  ADD COLUMN IF NOT EXISTS pro_bono       BOOLEAN      NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS hourly_rate_max NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS venue_size     TEXT,        -- małe/średnie/duże/plenerowe (CSV)
  ADD COLUMN IF NOT EXISTS venue_atmosphere TEXT;      -- kameralna/klubowa/eventowa (CSV)

-- Supabase Storage bucket na avatary (publiczny)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars', 'avatars', true,
  5242880,  -- 5 MB limit
  ARRAY['image/jpeg','image/png','image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- RLS dla storage.objects
CREATE POLICY IF NOT EXISTS "Avatars are publicly readable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY IF NOT EXISTS "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY IF NOT EXISTS "Users can update their own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY IF NOT EXISTS "Users can delete their own avatar"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
