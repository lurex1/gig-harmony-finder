-- Add missing venue profile columns needed for onboarding form
ALTER TABLE public.venue_profiles
  ADD COLUMN IF NOT EXISTS budget_per_gig NUMERIC(10, 2),
  ADD COLUMN IF NOT EXISTS preferred_genres TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS event_days TEXT[] NOT NULL DEFAULT '{}';
