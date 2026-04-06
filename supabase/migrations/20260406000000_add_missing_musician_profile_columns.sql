ALTER TABLE public.musician_profiles
  ADD COLUMN IF NOT EXISTS performance_type TEXT,
  ADD COLUMN IF NOT EXISTS style TEXT,
  ADD COLUMN IF NOT EXISTS repertoire TEXT;
