/**
 * LocationDetector
 *
 * - Gdy podano initialPosition: od razu pokazuje mapę z pinezką (zoom 15)
 * - Przycisk "Wykryj" używa GPS z maximumAge: 0 (dokładność ~5–10 m)
 * - Po wykryciu GPS: reverse geocoding → komunikat "Wykryto: [miasto]."
 * - Pinezka jest przeciągalna — onChange wywoływany przy każdej zmianie
 * - Gdy brak VITE_GOOGLE_MAPS_API_KEY: mapa nie renderuje się,
 *   GPS i koordynaty działają normalnie
 */
import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  APIProvider,
  Map,
  AdvancedMarker,
  useMap,
} from '@vis.gl/react-google-maps'
import { LocateFixed, Loader2, MapPin, AlertCircle, CheckCircle2, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { reverseGeocode } from '@/lib/geocode'

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined
const MAP_ID  = import.meta.env.VITE_GOOGLE_MAPS_MAP_ID  as string | undefined

type Status = 'idle' | 'detecting' | 'detected' | 'error'

interface Position { lat: number; lng: number }

// ─── MapController ────────────────────────────────────────────────────────────
function MapController({ position, trigger }: { position: Position; trigger: number }) {
  const map = useMap()
  const lastTrigger = useRef(-1)

  useEffect(() => {
    if (!map || trigger === lastTrigger.current) return
    map.panTo(position)
    map.setZoom(15)
    lastTrigger.current = trigger
  }, [map, position, trigger])

  return null
}

// ─── DraggablePin ─────────────────────────────────────────────────────────────
function DraggablePin({
  position,
  onDragEnd,
}: {
  position: Position
  onDragEnd: (pos: Position) => void
}) {
  const handleDragEnd = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (!e.latLng) return
      onDragEnd({ lat: e.latLng.lat(), lng: e.latLng.lng() })
    },
    [onDragEnd]
  )

  return (
    <AdvancedMarker
      position={position}
      draggable
      onDragEnd={handleDragEnd}
      title="Przeciągnij aby dokładnie ustawić lokalizację"
    >
      <div className="flex flex-col items-center select-none">
        <div className="w-10 h-10 rounded-full bg-foreground border-2 border-background shadow-lg flex items-center justify-center">
          <MapPin className="w-5 h-5 text-background" />
        </div>
        <div className="w-0.5 h-3 bg-foreground/60" />
        <div className="w-2 h-1 rounded-full bg-foreground/30" />
      </div>
    </AdvancedMarker>
  )
}

// ─── MapView — renderowane tylko gdy dostępny klucz API ───────────────────────
function MapView({
  position,
  detectTrigger,
  onDragEnd,
}: {
  position: Position
  detectTrigger: number
  onDragEnd: (pos: Position) => void
}) {
  return (
    <APIProvider apiKey={API_KEY!}>
      <AnimatePresence>
        <motion.div
          key="map"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 300 }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="rounded-xl overflow-hidden border border-border shadow-sm"
          style={{ height: 300 }}
        >
          <Map
            mapId={MAP_ID}
            defaultCenter={position}
            defaultZoom={15}
            gestureHandling="greedy"
            disableDefaultUI={false}
            style={{ width: '100%', height: '100%' }}
          >
            <MapController position={position} trigger={detectTrigger} />
            <DraggablePin position={position} onDragEnd={onDragEnd} />
          </Map>
        </motion.div>
      </AnimatePresence>
    </APIProvider>
  )
}

// ─── Public component ─────────────────────────────────────────────────────────
interface LocationDetectorProps {
  /** Wywoływane przy każdej zmianie pozycji. city podawane tylko po wykryciu GPS. */
  onChange: (lat: number, lng: number, city?: string) => void
  /** Zapisana wcześniej pozycja (z DB) — mapa startuje od razu w tym miejscu */
  initialPosition?: { lat: number; lng: number } | null
  /** Opcjonalny hint wyświetlany gdy pozycja nie jest jeszcze ustawiona */
  hint?: string
}

export function LocationDetector({ onChange, initialPosition, hint }: LocationDetectorProps) {
  const hasInitial = !!(initialPosition?.lat && initialPosition?.lng)
  const hasMapKey  = !!API_KEY

  const [status,        setStatus]        = useState<Status>(hasInitial ? 'detected' : 'idle')
  const [position,      setPosition]      = useState<Position | null>(initialPosition ?? null)
  const [errorMsg,      setErrorMsg]      = useState('')
  const [detectTrigger, setDetectTrigger] = useState(0)
  const [gpsCity,       setGpsCity]       = useState<string | null>(null)

  // Gdy initialPosition ładuje się asynchronicznie (po powrocie do zakładki)
  useEffect(() => {
    if (initialPosition?.lat && initialPosition?.lng && status === 'idle') {
      setPosition({ lat: initialPosition.lat, lng: initialPosition.lng })
      setStatus('detected')
    }
  }, [initialPosition?.lat, initialPosition?.lng])

  const detect = () => {
    if (!navigator.geolocation) {
      setErrorMsg('Twoja przeglądarka nie obsługuje geolokalizacji.')
      setStatus('error')
      return
    }

    setStatus('detecting')
    setErrorMsg('')
    setGpsCity(null)

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const pos: Position = { lat: coords.latitude, lng: coords.longitude }
        setPosition(pos)
        setDetectTrigger(t => t + 1)
        setStatus('detected')

        // Reverse geocoding — pokazuje komunikat po GPS
        const city = await reverseGeocode(pos.lat, pos.lng)
        setGpsCity(city)
        onChange(pos.lat, pos.lng, city)
      },
      (err) => {
        const msgs: Record<number, string> = {
          1: 'Brak zgody na lokalizację — zmień ustawienia przeglądarki i spróbuj ponownie.',
          2: 'Nie udało się określić lokalizacji. Sprawdź połączenie.',
          3: 'Przekroczono czas oczekiwania. Spróbuj ponownie.',
        }
        setErrorMsg(msgs[err.code] ?? 'Nieznany błąd geolokalizacji.')
        setStatus('error')
      },
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 0 }
    )
  }

  const handleDragEnd = useCallback(
    (pos: Position) => {
      setPosition(pos)
      setGpsCity(null)   // po ręcznym przesunięciu chowamy komunikat GPS
      onChange(pos.lat, pos.lng)
    },
    [onChange]
  )

  return (
    <div className="space-y-3">

      {/* Przycisk + status */}
      <div className="flex items-center gap-3 flex-wrap">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={detect}
          disabled={status === 'detecting'}
          className="gap-2 shrink-0"
        >
          {status === 'detecting' ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <LocateFixed className="w-4 h-4" />
          )}
          {status === 'detecting'
            ? 'Wykrywanie…'
            : hasInitial || status === 'detected'
            ? 'Wykryj ponownie'
            : 'Wykryj moją lokalizację'}
        </Button>

        {status === 'detected' && !gpsCity && (
          <span className="flex items-center gap-1 text-xs text-green-600">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Lokalizacja ustawiona
          </span>
        )}
      </div>

      {/* Hint */}
      {hint && status === 'idle' && !hasInitial && (
        <p className="text-xs text-muted-foreground">{hint}</p>
      )}

      {/* Błąd */}
      {status === 'error' && (
        <div className="flex items-start gap-2 text-xs text-destructive">
          <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Komunikat po GPS */}
      {gpsCity && (
        <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 text-xs text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
          <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          <span>
            Wykryto: <strong>{gpsCity}</strong>.{hasMapKey ? ' Przesuń znacznik jeśli potrzeba i zapisz.' : ''}
          </span>
        </div>
      )}

      {/* Mapa — tylko gdy dostępny klucz API */}
      {status === 'detected' && position && (
        hasMapKey ? (
          <>
            <MapView
              position={position}
              detectTrigger={detectTrigger}
              onDragEnd={handleDragEnd}
            />
            <p className="text-xs text-muted-foreground">
              Przeciągnij pinezkę, aby doprecyzować lokalizację.
            </p>
          </>
        ) : (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-muted text-xs text-muted-foreground">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span>
              Pozycja: {position.lat.toFixed(5)}, {position.lng.toFixed(5)}
            </span>
          </div>
        )
      )}

    </div>
  )
}
