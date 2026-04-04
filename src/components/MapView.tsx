import { useState, useEffect, useCallback } from 'react'
import {
  APIProvider,
  Map,
  AdvancedMarker,
  InfoWindow,
} from '@vis.gl/react-google-maps'
import { Slider } from '@/components/ui/slider'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import {
  MapPin,
  Music,
  Building2,
  Loader2,
  DollarSign,
  CalendarDays,
  Guitar,
  Sparkles,
} from 'lucide-react'

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
const MAP_ID = import.meta.env.VITE_GOOGLE_MAPS_MAP_ID
const DEFAULT_CENTER = { lat: 52.2297, lng: 21.0122 }

// ─── Utilities ────────────────────────────────────────────────────────────────

function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function scoreColor(score: number): string {
  if (score >= 80) return '#16a34a' // green
  if (score >= 55) return '#d97706' // amber
  return '#dc2626'                  // red
}

// ─── Types ───────────────────────────────────────────────────────────────────

interface AiResult {
  score: number
  justification: string
}

interface GigMarker {
  type: 'gig'
  id: string
  title: string
  lat: number
  lng: number
  budget: number | null
  genre: string | null
  date: string
  venueName: string
  venueId: string
  distance: number
  ai: AiResult | null
}

interface MusicianMarker {
  type: 'musician'
  userId: string
  stageName: string | null
  name: string
  genres: string[]
  instruments: string[]
  style: string | null
  repertoire: string | null
  performanceType: string | null
  lat: number
  lng: number
  hourlyRate: number | null
  distance: number
  ai: AiResult | null
}

type AnyMarker = GigMarker | MusicianMarker

// ─── Props ───────────────────────────────────────────────────────────────────

interface MapViewProps {
  role: 'musician' | 'venue'
  onAcceptGig?: (gigId: string) => void
  onSendOffer?: (musicianUserId: string) => void
}

// ─── Pin component ───────────────────────────────────────────────────────────

function ScorePin({
  score,
  isGig,
  isSelected,
  isScoring,
}: {
  score: number | null
  isGig: boolean
  isSelected: boolean
  isScoring: boolean
}) {
  const bg = score !== null ? scoreColor(score) : isGig ? '#3b82f6' : '#7c3aed'
  const ring = isSelected ? '3px solid white' : '2px solid rgba(255,255,255,0.6)'

  return (
    <div
      style={{
        background: bg,
        border: ring,
        boxShadow: isSelected ? '0 0 0 3px rgba(0,0,0,0.3)' : '0 2px 6px rgba(0,0,0,0.25)',
        transform: isSelected ? 'scale(1.15)' : 'scale(1)',
        transition: 'all 0.15s ease',
      }}
      className="flex items-center gap-1 px-2 py-1 rounded-full cursor-pointer"
    >
      {isScoring ? (
        <Loader2 className="w-3 h-3 animate-spin text-white" />
      ) : (
        <span className="text-white text-[11px] font-bold leading-none">
          {score !== null ? `${score}%` : isGig ? '🎵' : '🎸'}
        </span>
      )}
    </div>
  )
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function MapView({ role, onAcceptGig, onSendOffer }: MapViewProps) {
  const { user } = useAuth()
  const [userPos, setUserPos] = useState(DEFAULT_CENTER)
  const [range, setRange] = useState(50)
  const [markers, setMarkers] = useState<AnyMarker[]>([])
  const [selected, setSelected] = useState<AnyMarker | null>(null)
  const [loading, setLoading] = useState(false)
  const [scoring, setScoring] = useState(false)
  const [geoError, setGeoError] = useState(false)

  // ── Geolocation ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!navigator.geolocation) { setGeoError(true); return }
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setGeoError(true),
      { timeout: 8000 }
    )
  }, [])

  // ── AI scoring (batched, parallel, max 15 markers) ───────────────────────
  const scoreMarkers = useCallback(async (raw: AnyMarker[]): Promise<AnyMarker[]> => {
    if (!user || raw.length === 0) return raw

    // Fetch current user's own profile for comparison
    const { data: myProfile } = await supabase
      .from(role === 'musician' ? 'musician_profiles' : 'venue_profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()

    // Separately fetch venue_profiles for gig markers (musician view)
    let venueProfilesMap: Record<string, { atmosphere: string | null; occasion: string | null; expectations: string | null }> = {}
    if (role === 'musician') {
      const venueIds = [...new Set((raw as GigMarker[]).map((m) => m.venueId))]
      const { data: vProfiles } = await supabase
        .from('venue_profiles')
        .select('user_id, atmosphere, occasion, expectations')
        .in('user_id', venueIds)
      for (const vp of vProfiles ?? []) {
        venueProfilesMap[vp.user_id] = vp
      }
    }

    const toScore = raw.slice(0, 15)

    const scored = await Promise.all(
      toScore.map(async (marker): Promise<AnyMarker> => {
        try {
          let body: Record<string, unknown>

          if (role === 'musician') {
            const gig = marker as GigMarker
            const vp = venueProfilesMap[gig.venueId] ?? {}
            body = {
              musician_profile: myProfile ?? {},
              venue_profile: {
                venue_name: gig.venueName,
                atmosphere: vp.atmosphere ?? null,
                occasion: vp.occasion ?? null,
                expectations: vp.expectations ?? null,
              },
              gig: { title: gig.title, genre: gig.genre },
            }
          } else {
            const m = marker as MusicianMarker
            body = {
              musician_profile: {
                stage_name: m.stageName,
                genres: m.genres,
                instruments: m.instruments,
                style: m.style,
                repertoire: m.repertoire,
                performance_type: m.performanceType,
              },
              venue_profile: myProfile ?? {},
            }
          }

          const { data, error } = await supabase.functions.invoke('ai-match', { body })
          if (error || !data) return { ...marker, ai: null }

          return {
            ...marker,
            ai: { score: data.score ?? 0, justification: data.justification ?? '' },
          }
        } catch {
          return { ...marker, ai: null }
        }
      })
    )

    // Markers beyond limit stay without AI score
    const rest = raw.slice(15).map((m) => ({ ...m, ai: null }))
    const all = [...scored, ...rest]

    // Sort: scored markers by score desc, unscored at end
    return all.sort((a, b) => {
      if (a.ai === null && b.ai === null) return 0
      if (a.ai === null) return 1
      if (b.ai === null) return -1
      return b.ai.score - a.ai.score
    })
  }, [user, role])

  // ── Data fetch ───────────────────────────────────────────────────────────
  const fetchMarkers = useCallback(async () => {
    setLoading(true)
    setSelected(null)

    const degLat = range / 111
    const degLng = range / (111 * Math.cos((userPos.lat * Math.PI) / 180))
    const latMin = userPos.lat - degLat
    const latMax = userPos.lat + degLat
    const lngMin = userPos.lng - degLng
    const lngMax = userPos.lng + degLng

    let rawMarkers: AnyMarker[] = []

    if (role === 'musician') {
      const { data: gigs } = await supabase
        .from('gigs')
        .select('id, title, date, budget, genre, venue_id')
        .eq('status', 'open')

      if (gigs && gigs.length > 0) {
        const venueIds = [...new Set(gigs.map((g) => g.venue_id))]
        const { data: venues } = await supabase
          .from('venue_profiles')
          .select('user_id, venue_name, lat, lng')
          .in('user_id', venueIds)
          .gte('lat', latMin).lte('lat', latMax)
          .gte('lng', lngMin).lte('lng', lngMax)

        const venueMap = Object.fromEntries((venues ?? []).map((v) => [v.user_id, v]))

        rawMarkers = gigs
          .map((gig): GigMarker | null => {
            const venue = venueMap[gig.venue_id]
            if (!venue?.lat || !venue?.lng) return null
            const dist = haversine(userPos.lat, userPos.lng, venue.lat, venue.lng)
            if (dist > range) return null
            return {
              type: 'gig',
              id: gig.id,
              title: gig.title,
              lat: venue.lat,
              lng: venue.lng,
              budget: gig.budget,
              genre: gig.genre,
              date: new Date(gig.date).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short', year: 'numeric' }),
              venueName: venue.venue_name,
              venueId: gig.venue_id,
              distance: Math.round(dist),
              ai: null,
            }
          })
          .filter(Boolean) as GigMarker[]
      }
    } else {
      const { data: musicianProfiles } = await supabase
        .from('musician_profiles')
        .select('user_id, stage_name, genres, instruments, style, repertoire, performance_type, lat, lng, hourly_rate')
        .eq('available', true)
        .neq('user_id', user?.id ?? '')
        .gte('lat', latMin).lte('lat', latMax)
        .gte('lng', lngMin).lte('lng', lngMax)

      if (musicianProfiles && musicianProfiles.length > 0) {
        const userIds = musicianProfiles.map((m) => m.user_id)
        const { data: profileNames } = await supabase
          .from('profiles')
          .select('user_id, name')
          .in('user_id', userIds)

        const nameMap = Object.fromEntries((profileNames ?? []).map((p) => [p.user_id, p.name]))

        rawMarkers = musicianProfiles
          .map((mp): MusicianMarker | null => {
            if (!mp.lat || !mp.lng) return null
            const dist = haversine(userPos.lat, userPos.lng, mp.lat, mp.lng)
            if (dist > range) return null
            return {
              type: 'musician',
              userId: mp.user_id,
              stageName: mp.stage_name,
              name: nameMap[mp.user_id] ?? '—',
              genres: mp.genres ?? [],
              instruments: mp.instruments ?? [],
              style: mp.style ?? null,
              repertoire: mp.repertoire ?? null,
              performanceType: mp.performance_type ?? null,
              lat: mp.lat,
              lng: mp.lng,
              hourlyRate: mp.hourly_rate,
              distance: Math.round(dist),
              ai: null,
            }
          })
          .filter(Boolean) as MusicianMarker[]
      }
    }

    setLoading(false)

    // Show markers immediately, then score them
    setMarkers(rawMarkers)

    if (rawMarkers.length > 0) {
      setScoring(true)
      const scored = await scoreMarkers(rawMarkers)
      setMarkers(scored)
      setScoring(false)
    }
  }, [userPos, range, role, scoreMarkers])

  useEffect(() => { fetchMarkers() }, [fetchMarkers])

  // ── InfoWindow content ───────────────────────────────────────────────────
  const renderInfo = (item: AnyMarker) => {
    const aiBlock = item.ai && (
      <div className="mt-2 mb-3 p-2 rounded-lg bg-gray-50 border border-gray-100">
        <div className="flex items-center gap-1.5 mb-1">
          <Sparkles className="w-3 h-3 text-amber-500" />
          <span className="text-[11px] font-semibold text-gray-700">
            Dopasowanie AI: {item.ai.score}%
          </span>
        </div>
        <p className="text-[11px] text-gray-600 leading-relaxed">{item.ai.justification}</p>
      </div>
    )

    if (item.type === 'gig') {
      return (
        <div className="p-1 min-w-[210px] max-w-[250px]">
          <div className="flex items-center gap-1.5 mb-0.5">
            <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span className="font-semibold text-sm text-gray-900 leading-tight">{item.title}</span>
          </div>
          <p className="text-xs text-gray-500 mb-2">{item.venueName}</p>

          {aiBlock}

          <div className="space-y-1 mb-3">
            {item.genre && (
              <div className="flex items-center gap-1.5 text-xs text-gray-600">
                <Music className="w-3 h-3" />{item.genre}
              </div>
            )}
            <div className="flex items-center gap-1.5 text-xs text-gray-600">
              <CalendarDays className="w-3 h-3" />{item.date}
            </div>
            {item.budget && (
              <div className="flex items-center gap-1.5 text-xs text-gray-600">
                <DollarSign className="w-3 h-3" />${item.budget}
              </div>
            )}
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <MapPin className="w-3 h-3" />{item.distance} km
            </div>
          </div>

          <button
            onClick={() => onAcceptGig?.(item.id)}
            className="w-full px-3 py-1.5 bg-black text-white text-xs font-medium rounded-full hover:bg-gray-800 transition-colors"
          >
            Aplikuj na gig
          </button>
        </div>
      )
    }

    const displayName = item.stageName ?? item.name
    return (
      <div className="p-1 min-w-[210px] max-w-[250px]">
        <div className="flex items-center gap-1.5 mb-0.5">
          <Guitar className="w-3.5 h-3.5 text-purple-600 shrink-0" />
          <span className="font-semibold text-sm text-gray-900 leading-tight">{displayName}</span>
        </div>

        {aiBlock}

        <div className="space-y-1 mb-3">
          {item.genres.length > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-gray-600">
              <Music className="w-3 h-3" />{item.genres.join(', ')}
            </div>
          )}
          {item.style && (
            <p className="text-xs text-gray-500 italic">"{item.style}"</p>
          )}
          {item.instruments.length > 0 && (
            <p className="text-xs text-gray-500">{item.instruments.join(', ')}</p>
          )}
          {item.hourlyRate && (
            <div className="flex items-center gap-1.5 text-xs text-gray-600">
              <DollarSign className="w-3 h-3" />${item.hourlyRate}/godz.
            </div>
          )}
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <MapPin className="w-3 h-3" />{item.distance} km
          </div>
        </div>

        <button
          onClick={() => onSendOffer?.(item.userId)}
          className="w-full px-3 py-1.5 bg-black text-white text-xs font-medium rounded-full hover:bg-gray-800 transition-colors"
        >
          Wyślij ofertę
        </button>
      </div>
    )
  }

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-3">
      {/* Range slider */}
      <div className="flex items-center gap-4 px-1">
        <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
        <div className="flex-1">
          <Slider
            min={10} max={200} step={5}
            value={[range]}
            onValueChange={([v]) => setRange(v)}
          />
        </div>
        <span className="text-sm font-medium text-foreground w-16 text-right">{range} km</span>
        {(loading || scoring) && (
          <div className="flex items-center gap-1.5 shrink-0">
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            {scoring && !loading && (
              <span className="text-xs text-muted-foreground hidden sm:inline">AI scoring…</span>
            )}
          </div>
        )}
      </div>

      {geoError && (
        <p className="text-xs text-muted-foreground px-1">
          Brak dostępu do lokalizacji — mapa wycentrowana na Warszawie.
        </p>
      )}

      {/* Map */}
      <APIProvider apiKey={API_KEY}>
        <div className="rounded-xl overflow-hidden border border-border" style={{ height: 420 }}>
          <Map
            mapId={MAP_ID}
            defaultCenter={userPos}
            center={userPos}
            defaultZoom={10}
            gestureHandling="greedy"
            disableDefaultUI={false}
          >
            {/* User position dot */}
            <AdvancedMarker position={userPos} title="Twoja lokalizacja" zIndex={100}>
              <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-lg" />
            </AdvancedMarker>

            {/* Data markers */}
            {markers.map((marker) => {
              const key = marker.type === 'gig' ? marker.id : marker.userId
              const isGig = marker.type === 'gig'
              const isSelected = selected
                ? isGig
                  ? (selected as GigMarker).id === (marker as GigMarker).id
                  : (selected as MusicianMarker).userId === (marker as MusicianMarker).userId
                : false

              return (
                <AdvancedMarker
                  key={key}
                  position={{ lat: marker.lat, lng: marker.lng }}
                  zIndex={isSelected ? 50 : marker.ai ? marker.ai.score : 1}
                  onClick={() => setSelected(marker)}
                >
                  <ScorePin
                    score={marker.ai?.score ?? null}
                    isGig={isGig}
                    isSelected={isSelected}
                    isScoring={scoring && marker.ai === null}
                  />
                </AdvancedMarker>
              )
            })}

            {/* InfoWindow */}
            {selected && (
              <InfoWindow
                position={{ lat: selected.lat, lng: selected.lng }}
                onCloseClick={() => setSelected(null)}
                pixelOffset={[0, -16]}
              >
                {renderInfo(selected)}
              </InfoWindow>
            )}
          </Map>
        </div>
      </APIProvider>

      {/* Summary row */}
      <div className="flex items-center justify-between px-1">
        <p className="text-xs text-muted-foreground">
          {markers.length === 0
            ? role === 'musician'
              ? 'Brak otwartych gigów w tym zasięgu.'
              : 'Brak dostępnych muzyków w tym zasięgu.'
            : role === 'musician'
            ? `${markers.length} ${markers.length === 1 ? 'gig' : 'gigów'} w zasięgu ${range} km`
            : `${markers.length} ${markers.length === 1 ? 'muzyk' : 'muzyków'} w zasięgu ${range} km`}
        </p>
        {markers.some((m) => m.ai !== null) && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Sparkles className="w-3 h-3 text-amber-500" />
            sortowanie AI
          </div>
        )}
      </div>
    </div>
  )
}
