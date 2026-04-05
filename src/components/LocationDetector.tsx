/**
 * LocationDetector
 *
 * Wykrywa lokalizację przez navigator.geolocation.getCurrentPosition,
 * pokazuje mapę Google z przeciągalną pinezką do dokładnego ustawienia.
 * Zwraca lat/lng — zero wywołań Geocoding API.
 */
import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  APIProvider,
  Map,
  AdvancedMarker,
  useMap,
} from '@vis.gl/react-google-maps'
import { LocateFixed, Loader2, MapPin, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string
const MAP_ID  = import.meta.env.VITE_GOOGLE_MAPS_MAP_ID  as string
const WARSAW  = { lat: 52.2297, lng: 21.0122 }

type Status = 'idle' | 'detecting' | 'detected' | 'error'

interface Position { lat: number; lng: number }

// ─── MapController ────────────────────────────────────────────────────────────
// Panuje do nowej pozycji tylko gdy zmieni się "trigger" (nowe kliknięcie Wykryj).
// Drag pinu NIE resetuje widoku mapy.
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
      {/* Custom pin */}
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

// ─── Public component ─────────────────────────────────────────────────────────
interface LocationDetectorProps {
  /** Wywoływane przy każdej zmianie pozycji (wykrycie + drag) */
  onChange: (lat: number, lng: number) => void
  /** Opcjonalny label nad przyciskiem (do rozróżnienia muzyk / lokal) */
  hint?: string
}

export function LocationDetector({ onChange, hint }: LocationDetectorProps) {
  const [status, setStatus]             = useState<Status>('idle')
  const [position, setPosition]         = useState<Position | null>(null)
  const [errorMsg, setErrorMsg]         = useState('')
  const [detectTrigger, setDetectTrigger] = useState(0)

  const detect = () => {
    if (!navigator.geolocation) {
      setErrorMsg('Twoja przeglądarka nie obsługuje geolokalizacji.')
      setStatus('error')
      return
    }

    setStatus('detecting')
    setErrorMsg('')

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const pos: Position = { lat: coords.latitude, lng: coords.longitude }
        setPosition(pos)
        setDetectTrigger(t => t + 1)   // sygnał dla MapController: pan tu
        setStatus('detected')
        onChange(pos.lat, pos.lng)
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
      { timeout: 10_000, enableHighAccuracy: true, maximumAge: 60_000 }
    )
  }

  const handleDragEnd = useCallback(
    (pos: Position) => {
      setPosition(pos)
      onChange(pos.lat, pos.lng)
    },
    [onChange]
  )

  return (
    <APIProvider apiKey={API_KEY}>
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
              : status === 'detected'
              ? 'Wykryj ponownie'
              : 'Wykryj moją lokalizację'}
          </Button>

          {status === 'detected' && position && (
            <span className="flex items-center gap-1 text-xs text-green-600">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Lokalizacja ustawiona
            </span>
          )}
        </div>

        {/* Hint */}
        {hint && status === 'idle' && (
          <p className="text-xs text-muted-foreground">{hint}</p>
        )}

        {/* Błąd */}
        {status === 'error' && (
          <div className="flex items-start gap-2 text-xs text-destructive">
            <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Mapa z pinezką */}
        <AnimatePresence>
          {status === 'detected' && position && (
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
                <DraggablePin position={position} onDragEnd={handleDragEnd} />
              </Map>
            </motion.div>
          )}
        </AnimatePresence>

        {status === 'detected' && (
          <p className="text-xs text-muted-foreground">
            Przeciągnij pinezkę, aby doprecyzować lokalizację.
          </p>
        )}
      </div>
    </APIProvider>
  )
}
