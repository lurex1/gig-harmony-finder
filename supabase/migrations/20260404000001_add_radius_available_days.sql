-- Add radius and available_days to musician_profiles
ALTER TABLE public.musician_profiles
  ADD COLUMN IF NOT EXISTS radius INTEGER DEFAULT 50,
  ADD COLUMN IF NOT EXISTS available_days TEXT[] NOT NULL DEFAULT '{}';
