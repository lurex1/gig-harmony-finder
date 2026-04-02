-- application_status enum
CREATE TYPE public.application_status AS ENUM ('pending', 'accepted', 'rejected');

-- Musician profiles table
CREATE TABLE public.musician_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  stage_name TEXT,
  genres TEXT[] NOT NULL DEFAULT '{}',
  instruments TEXT[] NOT NULL DEFAULT '{}',
  bio TEXT,
  location TEXT,
  lat NUMERIC(9, 6),
  lng NUMERIC(9, 6),
  hourly_rate NUMERIC(10, 2),
  available BOOLEAN NOT NULL DEFAULT false,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.musician_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Musician profiles are viewable by everyone" ON public.musician_profiles FOR SELECT USING (true);
CREATE POLICY "Musicians can insert their own profile" ON public.musician_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Musicians can update their own profile" ON public.musician_profiles FOR UPDATE USING (auth.uid() = user_id);

-- Venue profiles table
CREATE TABLE public.venue_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  venue_name TEXT NOT NULL,
  venue_type TEXT,
  location TEXT,
  lat NUMERIC(9, 6),
  lng NUMERIC(9, 6),
  capacity INTEGER,
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.venue_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Venue profiles are viewable by everyone" ON public.venue_profiles FOR SELECT USING (true);
CREATE POLICY "Venues can insert their own profile" ON public.venue_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Venues can update their own profile" ON public.venue_profiles FOR UPDATE USING (auth.uid() = user_id);

-- Gig applications table
CREATE TABLE public.gig_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  gig_id UUID NOT NULL REFERENCES public.gigs(id) ON DELETE CASCADE,
  musician_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status application_status NOT NULL DEFAULT 'pending',
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (gig_id, musician_id)
);

ALTER TABLE public.gig_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Venues can view applications for their gigs" ON public.gig_applications
  FOR SELECT USING (
    auth.uid() IN (SELECT venue_id FROM public.gigs WHERE id = gig_id)
    OR auth.uid() = musician_id
  );
CREATE POLICY "Musicians can apply to gigs" ON public.gig_applications
  FOR INSERT WITH CHECK (auth.uid() = musician_id);
CREATE POLICY "Venues can update application status" ON public.gig_applications
  FOR UPDATE USING (
    auth.uid() IN (SELECT venue_id FROM public.gigs WHERE id = gig_id)
  );
