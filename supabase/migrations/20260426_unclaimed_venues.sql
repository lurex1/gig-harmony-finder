-- ============================================================================
-- Migration: Unclaimed venues (indexed from OpenStreetMap) + claim flow
-- ----------------------------------------------------------------------------
-- Cold-start strategy: pre-seed the map with publicly-available venue data
-- (bars, restaurants, pubs, cafes, clubs etc.) so musicians never see an
-- empty map. When a musician sends a proposal to an "unclaimed" venue, we
-- email the venue with a one-click registration link that prefills the
-- venue's profile from OSM data. Inspired by Yelp / Foursquare playbook.
-- ============================================================================

-- ─── 1. Unclaimed venues (OSM index) ────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.unclaimed_venues (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,

  -- OSM identifiers — guarantee idempotent re-imports
  osm_id   TEXT NOT NULL,
  osm_type TEXT NOT NULL CHECK (osm_type IN ('node', 'way', 'relation')),

  -- Display data
  venue_name TEXT NOT NULL,
  venue_type TEXT,                    -- 'restaurant', 'bar', 'pub', 'cafe', 'nightclub', 'wedding_hall', ...
  location   TEXT,                    -- formatted human-readable address
  lat NUMERIC(9, 6) NOT NULL,
  lng NUMERIC(9, 6) NOT NULL,

  -- Public contact info (used for email/phone outreach)
  email   TEXT,
  phone   TEXT,
  website TEXT,

  -- Geographic filtering & analytics
  country_code TEXT,                  -- ISO 3166-1 alpha-2: 'PL', 'DE', 'US', ...
  city         TEXT,

  -- Claim flow (one-click registration link contains this token)
  claim_token UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  claimed_at  TIMESTAMPTZ,
  claimed_by  UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Anti-spam / opt-out
  unsubscribed_at    TIMESTAMPTZ,
  unsubscribe_reason TEXT,
  outreach_count     INT         NOT NULL DEFAULT 0,
  last_outreach_at   TIMESTAMPTZ,

  -- Bookkeeping
  imported_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (osm_type, osm_id)
);

CREATE INDEX IF NOT EXISTS idx_unclaimed_venues_active
  ON public.unclaimed_venues (lat, lng)
  WHERE claimed_at IS NULL AND unsubscribed_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_unclaimed_venues_geo
  ON public.unclaimed_venues (country_code, city)
  WHERE claimed_at IS NULL AND unsubscribed_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_unclaimed_venues_claim_token
  ON public.unclaimed_venues (claim_token);

-- ─── RLS for unclaimed_venues ───────────────────────────────────────────────
-- Public read of active rows; writes only by service_role (used by the
-- OSM import script and the notify/unsubscribe Edge Functions).
ALTER TABLE public.unclaimed_venues ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "unclaimed_venues_public_select" ON public.unclaimed_venues;
CREATE POLICY "unclaimed_venues_public_select"
  ON public.unclaimed_venues
  FOR SELECT
  USING (claimed_at IS NULL AND unsubscribed_at IS NULL);


-- ─── 2. Outreach log (audit + rate limiting) ────────────────────────────────

CREATE TABLE IF NOT EXISTS public.venue_outreach (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,

  unclaimed_venue_id UUID NOT NULL REFERENCES public.unclaimed_venues(id) ON DELETE CASCADE,
  musician_user_id   UUID NOT NULL REFERENCES auth.users(id)              ON DELETE CASCADE,

  message TEXT NOT NULL,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Email delivery tracking (provider-side)
  email_to       TEXT NOT NULL,
  email_id       TEXT,
  email_status   TEXT NOT NULL DEFAULT 'queued', -- queued|sent|delivered|bounced|complained|failed
  delivered_at   TIMESTAMPTZ,
  error_message  TEXT
);

CREATE INDEX IF NOT EXISTS idx_venue_outreach_venue
  ON public.venue_outreach (unclaimed_venue_id, sent_at DESC);

CREATE INDEX IF NOT EXISTS idx_venue_outreach_musician
  ON public.venue_outreach (musician_user_id, sent_at DESC);

ALTER TABLE public.venue_outreach ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "venue_outreach_own_select" ON public.venue_outreach;
CREATE POLICY "venue_outreach_own_select"
  ON public.venue_outreach
  FOR SELECT
  USING (auth.uid() = musician_user_id);

-- INSERT/UPDATE only via Edge Function (service_role key) — no policy = no access.


-- ─── 3. Unified view: registered + indexed venues for the map ───────────────
-- Frontend reads from venues_for_map and uses `source` to render different
-- pin styles (claimed = full color, unclaimed = washed-out).

CREATE OR REPLACE VIEW public.venues_for_map AS
SELECT
  vp.id,
  'claimed'::TEXT AS source,
  vp.user_id,
  NULL::UUID      AS unclaimed_id,
  vp.venue_name,
  vp.venue_type,
  vp.location,
  vp.lat,
  vp.lng,
  vp.preferred_genres,
  NULL::TEXT      AS email,
  NULL::TEXT      AS phone,
  NULL::TEXT      AS website,
  NULL::UUID      AS claim_token,
  vp.created_at   AS available_since
FROM public.venue_profiles vp
WHERE vp.lat IS NOT NULL AND vp.lng IS NOT NULL

UNION ALL

SELECT
  uv.id,
  'unclaimed'::TEXT AS source,
  NULL::UUID        AS user_id,
  uv.id             AS unclaimed_id,
  uv.venue_name,
  uv.venue_type,
  uv.location,
  uv.lat,
  uv.lng,
  '{}'::TEXT[]      AS preferred_genres,
  uv.email,
  uv.phone,
  uv.website,
  uv.claim_token,
  uv.imported_at    AS available_since
FROM public.unclaimed_venues uv
WHERE uv.claimed_at IS NULL
  AND uv.unsubscribed_at IS NULL;

COMMENT ON VIEW public.venues_for_map IS
  'Unified view of registered (venue_profiles) + indexed (unclaimed_venues) venues for the map. '
  'Use source=claimed|unclaimed to render different pin styles.';


-- ─── 4. claim_venue() — converts unclaimed → claimed ────────────────────────
-- Called from the registration flow when user lands on /register?claim=TOKEN.
-- Creates a venue_profile prefilled with OSM data and marks the unclaimed row.

CREATE OR REPLACE FUNCTION public.claim_venue(p_claim_token UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_unclaimed   RECORD;
  v_new_venue_id UUID;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required to claim venue';
  END IF;

  SELECT * INTO v_unclaimed
  FROM public.unclaimed_venues
  WHERE claim_token = p_claim_token
    AND claimed_at IS NULL
    AND unsubscribed_at IS NULL
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid, already-used or unsubscribed claim token';
  END IF;

  -- Make sure the user doesn't already have a venue profile
  IF EXISTS (SELECT 1 FROM public.venue_profiles WHERE user_id = auth.uid()) THEN
    RAISE EXCEPTION 'You already have a venue profile';
  END IF;

  INSERT INTO public.venue_profiles (
    user_id, venue_name, venue_type, location, lat, lng
  ) VALUES (
    auth.uid(),
    v_unclaimed.venue_name,
    v_unclaimed.venue_type,
    v_unclaimed.location,
    v_unclaimed.lat,
    v_unclaimed.lng
  )
  RETURNING id INTO v_new_venue_id;

  UPDATE public.unclaimed_venues
  SET claimed_at = now(),
      claimed_by = auth.uid(),
      updated_at = now()
  WHERE id = v_unclaimed.id;

  RETURN v_new_venue_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.claim_venue(UUID) TO authenticated;

COMMENT ON FUNCTION public.claim_venue IS
  'Called from /register?claim=TOKEN — creates venue_profile prefilled with OSM data, '
  'marks unclaimed row as claimed. Errors if token invalid, used, or user already has a venue.';


-- ─── 5. Touch updated_at trigger for unclaimed_venues ───────────────────────

CREATE OR REPLACE FUNCTION public.touch_unclaimed_venues_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_unclaimed_venues_updated_at ON public.unclaimed_venues;
CREATE TRIGGER trg_unclaimed_venues_updated_at
  BEFORE UPDATE ON public.unclaimed_venues
  FOR EACH ROW
  EXECUTE FUNCTION public.touch_unclaimed_venues_updated_at();
