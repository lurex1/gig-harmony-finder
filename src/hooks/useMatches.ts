import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

export interface MatchResult {
  user_id: string
  display_name: string
  score: number
  justification: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  profile: Record<string, any>
}

export function useMatches(role: 'musician' | 'venue') {
  const { user } = useAuth()
  const [matches, setMatches] = useState<MatchResult[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasProfile, setHasProfile] = useState<boolean | null>(null)

  const loadMatches = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(null)

    try {
      if (role === 'musician') {
        // 1. Load current user's musician profile
        const { data: myProfile } = await supabase
          .from('musician_profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle()

        setHasProfile(!!myProfile)
        if (!myProfile) { setLoading(false); return }

        // 2. Load all venue profiles (exclude self)
        const { data: venues, error: venuesErr } = await supabase
          .from('venue_profiles')
          .select('*')
          .neq('user_id', user.id)
          .limit(40)

        if (venuesErr) throw venuesErr
        if (!venues?.length) { setMatches([]); setLoading(false); return }

        // 3. Load profiles names for venues
        const { data: profileNames } = await supabase
          .from('profiles')
          .select('user_id, name')
          .in('user_id', venues.map(v => v.user_id))

        const nameMap: Record<string, string> = {}
        profileNames?.forEach(p => { nameMap[p.user_id] = p.name })

        // 4. Call batch AI matching
        const { data: fnData, error: fnErr } = await supabase.functions.invoke('ai-match', {
          body: {
            musician_profile: {
              stage_name: myProfile.stage_name,
              genres: myProfile.genres,
              instruments: myProfile.instruments,
              style: myProfile.style,
              repertoire: myProfile.repertoire,
              performance_type: myProfile.performance_type,
              hourly_rate: myProfile.hourly_rate,
            },
            venues: venues.map(v => ({
              user_id: v.user_id,
              venue_name: v.venue_name,
              venue_type: v.venue_type,
              atmosphere: v.atmosphere,
              occasion: v.occasion,
              expectations: v.expectations,
            })),
          },
        })

        if (fnErr) throw new Error(fnErr.message)

        const results: Array<{ user_id: string; score: number; justification: string }> =
          fnData?.results ?? []

        const mapped: MatchResult[] = results
          .filter(r => r.score >= 50)
          .sort((a, b) => b.score - a.score)
          .map(r => {
            const venue = venues.find(v => v.user_id === r.user_id)!
            return {
              user_id: r.user_id,
              display_name: nameMap[r.user_id] ?? venue.venue_name ?? 'Lokal',
              score: r.score,
              justification: r.justification,
              profile: venue,
            }
          })

        setMatches(mapped)

      } else {
        // VENUE role

        // 1. Load current user's venue profile
        const { data: myProfile } = await supabase
          .from('venue_profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle()

        setHasProfile(!!myProfile)
        if (!myProfile) { setLoading(false); return }

        // 2. Load all musician profiles (exclude self)
        const { data: musicians, error: musErr } = await supabase
          .from('musician_profiles')
          .select('*')
          .neq('user_id', user.id)
          .limit(40)

        if (musErr) throw musErr
        if (!musicians?.length) { setMatches([]); setLoading(false); return }

        // 3. Load profile names for musicians
        const { data: profileNames } = await supabase
          .from('profiles')
          .select('user_id, name')
          .in('user_id', musicians.map(m => m.user_id))

        const nameMap: Record<string, string> = {}
        profileNames?.forEach(p => { nameMap[p.user_id] = p.name })

        // 4. Call batch AI matching
        const { data: fnData, error: fnErr } = await supabase.functions.invoke('ai-match', {
          body: {
            venue_profile: {
              venue_name: myProfile.venue_name,
              venue_type: myProfile.venue_type,
              atmosphere: myProfile.atmosphere,
              occasion: myProfile.occasion,
              expectations: myProfile.expectations,
            },
            musicians: musicians.map(m => ({
              user_id: m.user_id,
              stage_name: m.stage_name,
              genres: m.genres,
              instruments: m.instruments,
              style: m.style,
              repertoire: m.repertoire,
              performance_type: m.performance_type,
              hourly_rate: m.hourly_rate,
            })),
          },
        })

        if (fnErr) throw new Error(fnErr.message)

        const results: Array<{ user_id: string; score: number; justification: string }> =
          fnData?.results ?? []

        const mapped: MatchResult[] = results
          .filter(r => r.score >= 50)
          .sort((a, b) => b.score - a.score)
          .map(r => {
            const musician = musicians.find(m => m.user_id === r.user_id)!
            return {
              user_id: r.user_id,
              display_name:
                nameMap[r.user_id] ?? musician.stage_name ?? 'Muzyk',
              score: r.score,
              justification: r.justification,
              profile: musician,
            }
          })

        setMatches(mapped)
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Błąd ładowania dopasowań'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [user, role])

  useEffect(() => { loadMatches() }, [loadMatches])

  return { matches, loading, error, hasProfile, refresh: loadMatches }
}
