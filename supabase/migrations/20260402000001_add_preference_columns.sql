-- Add preference columns to musician_profiles
ALTER TABLE public.musician_profiles
  ADD COLUMN IF NOT EXISTS style TEXT,
  ADD COLUMN IF NOT EXISTS repertoire TEXT,
  ADD COLUMN IF NOT EXISTS performance_type TEXT;

-- Add preference columns to venue_profiles
ALTER TABLE public.venue_profiles
  ADD COLUMN IF NOT EXISTS atmosphere TEXT,
  ADD COLUMN IF NOT EXISTS occasion TEXT,
  ADD COLUMN IF NOT EXISTS expectations TEXT;
